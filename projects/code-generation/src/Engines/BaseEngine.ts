import { FileManager } from "../ShinkaiPipeline/FileManager.ts";
import { Payload } from "./index.ts";

export abstract class BaseEngine {
  public readonly path: string;
  public readonly shinkaiName: string;

  constructor(
    public readonly name: string,
    public priceInputTokens: number,
    public priceOutputTokens: number
  ) {
    this.path = name.replaceAll(/[^a-zA-Z0-9]/g, "-");
    // TODO how to generate names correctly for shinkai?
    this.shinkaiName = `o_${name.replaceAll(/[^a-zA-Z0-9]/g, "_")}`;
  }

  abstract run(
    prompt: string,
    logger: FileManager | undefined,
    payloadHistory: Payload | undefined,
    thinkingAbout?: string
  ): Promise<{ message: string; metadata: Payload }>;

  protected countTokensFromMessageLlama3(message: string): number {
    let tokenCount = 0;
    let alphabeticCount = 0;
    let spaceCount = 0;

    // First pass: count alphabetic characters and spaces
    for (const c of message) {
      if (/[a-zA-Z]/.test(c)) {
        alphabeticCount++;
      } else if (/\s/.test(c)) {
        spaceCount++;
      }
    }

    // Calculate how many spaces can be ignored
    const spacesToIgnore = Math.floor(alphabeticCount / 3);

    // Determine the alphabetic token weight based on the number of alphabetic characters
    const alphabeticTokenWeight = alphabeticCount > 500 ? 8 : 10;

    // Second pass: count tokens, adjusting for spaces that can be ignored
    let remainingSpacesToIgnore = spacesToIgnore;
    for (const c of message) {
      if (/[a-zA-Z]/.test(c)) {
        tokenCount += alphabeticTokenWeight;
      } else if (/\s/.test(c)) {
        if (remainingSpacesToIgnore > 0) {
          remainingSpacesToIgnore--;
          spaceCount -= 10;
        } else {
          tokenCount += 30;
        }
      } else {
        tokenCount += 30; // Non-alphabetic characters count as a full token
      }
    }

    return Math.floor(tokenCount / 30) + 1;
  }

  protected async addSpending(
    isFree: boolean,
    logger: FileManager | undefined,
    inputString: string,
    outputString: string
  ) {
    const inputTokens = this.countTokensFromMessageLlama3(inputString);
    const outputTokens = this.countTokensFromMessageLlama3(outputString);
    const pricePerTokenInput = this.priceInputTokens / 1_000_000;
    const pricePerTokenOutput = this.priceOutputTokens / 1_000_000;
    await logger?.addSpending(
      isFree,
      this.name,
      "input",
      inputTokens,
      inputTokens * pricePerTokenInput
    );
    await logger?.addSpending(
      isFree,
      this.name,
      "output",
      outputTokens,
      outputTokens * pricePerTokenOutput
    );
  }

  protected async addFreeCost(
    logger: FileManager | undefined,
    inputString: string,
    outputString: string
  ) {
    await this.addSpending(true, logger, inputString, outputString);
  }

  protected async addCost(
    logger: FileManager | undefined,
    inputString: string,
    outputString: string
  ) {
    await this.addSpending(false, logger, inputString, outputString);
  }
}
