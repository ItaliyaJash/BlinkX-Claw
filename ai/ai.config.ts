import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const DEFAULT_MODEL = "openai/gpt-oss-20b:free";

export function getAgentModel() {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();

    if (!apiKey) {
        throw new Error("Missing OPENROUTER_API_KEY. Add it to your .env file before using AI modes.");
    }

    const provider = createOpenRouter({
        apiKey,
    });

    const modelId = process.env.OPENROUTER_DEFAULT_MODEL?.trim() || DEFAULT_MODEL;

    return provider(modelId);
}
