#!/usr/bin/env bun

import { Command } from "commander";
import { runWakeup } from "./tui/wakeup";

const program = new Command();

program
    .name("blinkx-claw")
    .description("A simple CLI tool for BlinkX Claw")
    .version("1.0.0");

program
    .command("wakeup")
    .description("Show the banner and pick cli or telegram mode")
    .action(async () => {
        await runWakeup();
    })

await program.parseAsync(process.argv);