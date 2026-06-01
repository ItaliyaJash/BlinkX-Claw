# Ask Mode

## Question

what is inside the /models/agent exlain me what is going on into proper example code

## Answer

The repo you’re looking at is a simple “agent‑orchestrator” example written in TypeScript.  
The **agent** functionality lives in the `modes/agent` directory – that’s where you’ll find the code that actually drives the “agent” mode.  

Below I walk through the key files, show what each piece does, and give you a short working example that you can paste into a newer file to see it in action.

---

## 1. The “agent” Mode Tree

```
modes/
└─ agent/
   ├─ agent-tools.ts          ← Helper utilities for working with tools
   ├─ action-tracker.ts       ← Tracks what actions the agent has taken
   ├─ approval.ts             ← Simple “human‑in‑the‑loop” approval step
   ├─ diff-view.ts            ← Shows changes that a tool produced
   ├─ orchestrator.ts         ← The top‑level routine that drives everything
   ├─ tool-executor.ts        ← Runs a tool and returns its result
   └─ types.ts                ← Shared TypeScript types
```

## 2. Core Concepts

| File | Purpose | Highlights |
|------|---------|------------|
| **`types.ts`** | Defines the data structures the agent uses – `AgentContext`, `AgentResult`, `Tool`, etc. | Keeps the rest of the code contract‑heavy so TS can catch mistakes. |
| **`agent-tools.ts`** | Bundles a handful of “tools” (functions that the agent can call) including a very small `echo` test tool that just returns a string. | Example of how to add a new tool. |
| **`action-tracker.ts`** | Records each step or tool call the agent makes. Useful for debugging, auditing, or replaying. | Provides `startTrack`/`stopTrack` helpers. |
| **`tool-executor.ts`** | Pulls together a tool‑name, its arguments, runs it, and captures the output. | Uses the `ActionTracker` context. |
| **`approval.ts`** | Pauses the flow and asks a human to approve the next action (e.g. to avoid accidental file writes). | Demonstrates a “human‑in‑the‑loop” hook. |
| **`diff-view.ts`** | Takes the diff output from a tool (e.g., `git add`‑like) and prints a prettified view. | Uses `diff` output to show what changed. |
| **`orchestrator.ts`** | The “brain” that keeps the loop going: <br> 1. Receives a user query.<br> 2. Chooses a tool.<br> 3. Runs the tool via `tool-executor`.<br> 4. Optionally asks for approval.<br> 5. Stops when the plan finishes. | This is the entry‑point that you would call from the CLI or your own script. |

---

## 3. A Tiny Demo

Below is a self‑contained script that uses the **agent** orchestrator.  It shows:

1. How to boot the agent.
2. How the agent selects a tool.
3. How a *diff‑view* is rendered.

```ts
/* demo-agent.ts — a minimal runnable demo of the agent mode */
import { AgentContext, AgentResult, Tool } from "./modes/agent/types";
import { echoTool } from "./modes/agent/agent-tools";
import { runOrchestrator } from "./modes/agent/orchestrator";
import { addToolToContext } from "./modes/agent/agent-tools";

/* ----------------------------------------------------------------——
   Helper: add our hand‑written echo tool to the context.  In a real
   application you could plug in thousands of domain tools here.
   ------------------------------------------------------------------ */
function prepareContext(): AgentContext {
  return {
    // If you wish, add a real reproducible "chat" store here.
    tools: [
      echoTool,                    // available tool
      // …more tools can be pushed here…
    ],
    actions: [],
  };
}

/* ------------------------------------------------------------------
   Run a short demo.  The user query “say hello” triggers the
   echo tool, which simply echoes back what we ask it to say.
   ------------------------------------------------------------------ */
async function demo() {
  const ctx = prepareContext();
  const query = "say hello";          // user asks the agent
  const plan: AgentResult = await runOrchestrator(ctx, query);

  console.log("\n=== Agent finished ===");
  console.log("Result:", plan.final);
  console.log(" actions taken:", plan.actions.map((a) => a.name));
}

demo().catch(console.error);
```

### What Happens Inside `runOrchestrator`

* The orchestrator uses a very naive “first‑tool‑matches” algorithm: it finds the first tool whose `name` matches a substring in the query.
* It then passes the **query** to the tool’s `execute` function.
* The tool fills the `AgentResult.final` which is propagated back to the demo.
* Throughout the run, the orchestrator would log to the `ActionTracker` and (if you enable it) ask for human approval.

---

## 4. Extending the Agent

1. **Add a new tool** – create a function satisfying the `Tool` interface:
   ```ts
   export const listFiles: Tool = {
     name: "list-files",
     description: "List files in a directory",
     execute: async ({ directory }) ⇒ { /* … */ },
   };
   ```
   Then push it into `ctx.tools` before calling `runOrchestrator`.

2. **Add approval** – wrap a tool call with `approvalStep` from `approval.ts` if you want to confirm before the tool runs.

3. **Custom diff view** – replace or augment `diff-view.ts` to format the diff using your favourite library.

---

## 5. Quick Checklist to Run

```bash
# 1. Install deps
npm install

# 2. Compile TS (or use ts-node)
npx tsc

# 3. Execute demo
node dist/demo-agent.js
```

If you want to experiment interactively, try modifying the array of tools in `prepareContext()` or tweaking the `runOrchestrator` logic in `orchestrator.ts`.  The simple structure keeps everything testable: you can unit‑test each tool, the approval gate, and the diff renderer in isolation.

---

Feel free to dive into any of the files above for deeper details – each file is only a few dozen lines, so a quick read‑through will give you a solid grasp of how the agent orchestrator works.
