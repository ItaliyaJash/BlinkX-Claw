import {select , isCancel} from "@clack/prompts";
import chalk from "chalk";
import figlet from "figlet";
import { runCliMode } from "../modes/cli";

const BANNER_FONT = 'ANSI Shadow';
const SHADOW = chalk.hex('#5b4d9e');
const FACE = chalk.hex('#e8dcf8').bold;

function printBannerWithShadow(ascii: string) {

  const bannerLines = ascii.replace(/\s+$/, '').split('\n');
  const maxLen = Math.max(...bannerLines.map((l) => l.length), 0);
  const rowWidth = maxLen + 2;

  for (const line of bannerLines) {
    console.log(SHADOW(('  ' + line).padEnd(rowWidth)));
  }
  process.stdout.write(`\x1b[${bannerLines.length}A`);
  for (const line of bannerLines) {
    console.log(FACE(line.padEnd(rowWidth)));
  }
  console.log();
}


export async function runWakeup() {
    let  ascii: string;
    try {
        ascii = figlet.textSync('BlinkX Claw', { font: BANNER_FONT });
    } catch (error) {
        ascii = figlet.textSync('BlinkX Claw', { font: "Standard" });
        console.error("Error generating ASCII art:", error);
        return;
    }

    printBannerWithShadow(ascii);

    const mode = await select({
        message: "Which mode do you want to use?",
        options: [
            { value: "cli", label: "CLI Mode" },
            { value: "telegram", label: "Telegram Mode" },
            { value: "exit", label: "Exit" },
        ],
    });

    if(isCancel(mode)) {
        console.log(chalk.yellow("No mode selected. Exiting..."));
        process.exit(0);
    }

    if(mode === "cli") {
        console.log(chalk.dim("Starting CLI Mode..."));
        await runCliMode();
    } else if(mode === "telegram") {
        console.log(chalk.dim("Starting Telegram Mode..."));
        // Here you can add the logic to start the Telegram mode
    } else if(mode === "exit") {
        console.log(chalk.yellow("Exiting..."));
        process.exit(0);
    }
}