import { FileManager } from "./FileManager.ts";

type Extractor = "markdown" | "json" | "typescript" | "python" | "none";
type Rules = {
  regex?: RegExp[];
  isJSONArray?: boolean;
  isJSONObject?: boolean;
};

export class LLMFormatter {
  constructor(private logger: FileManager | undefined) {}

  public async retryUntilSuccess(
    fn: () => Promise<string>,
    extractor: Extractor,
    expected: Rules
  ): Promise<string> {
    let retries = 3;
    let lastFile = "";
    while (retries > 0) {
      try {
        lastFile = await fn();
        let extractIndex = 0;
        while (true) {
          const partialResult = this.extract(extractor, lastFile, extractIndex);
          if (!partialResult) {
            throw new Error("Failed to extract. Rerun LLM Prompt.");
          }
          try {
            const finalResult = await this.checkExtracted(
              partialResult,
              expected
            );
            return finalResult;
          } catch (e) {
            await this.logger?.save(
              10000 + retries,
              `extraction_${extractIndex}`,
              `Failed extraction ${extractIndex} : ${String(
                e
              )}\n\nOriginal Content:\n${
                lastFile || "No last file"
              }\n\nExtracted Content:\n${partialResult}\n\nFunction Code:\n${fn.toString()}`,
              "error.txt"
            );
            extractIndex++;
          }
        }
      } catch (e) {
        await this.logger?.save(
          10000 + retries,
          "retry",
          JSON.stringify(
            {
              error: String(e),
              file: lastFile || "No file",
              rules: extractor,
              expected,
              functionCode: fn.toString(),
            },
            null,
            2
          ),
          "error.json"
        );
        retries--;
      }
    }
    await this.logger?.save(
      10000 + retries,
      "final",
      JSON.stringify(
        {
          file: lastFile || "No file",
          rules: extractor,
          expected,
          functionCode: fn.toString(),
          extractorType: extractor,
        },
        null,
        2
      ),
      "failed_after_retries.json"
    );
    throw new Error(
      `Failed to extract content after 3 retries.\nExtractor type: ${extractor}\nLast attempt content length: ${
        lastFile?.length || 0
      } chars\nExpected format rules: ${JSON.stringify(
        expected
      )}\nCheck logs for detailed error information in failed_after_retries.json`
    );
  }

  private async checkExtracted(result: string, expected: Rules) {
    if (!result) {
      throw new Error("Empty result");
    }
    // Do checks
    if (expected.regex && !expected.isJSONArray) {
      for (const r of expected.regex) {
        if (!r.test(result)) {
          await this.logger?.save(
            10000,
            "regex_check",
            JSON.stringify(
              {
                regex: String(r),
                result,
                expectedRules: expected,
              },
              null,
              2
            ),
            "format_mismatch.json"
          );
          throw new Error("Does not match format:" + String(r));
        }
      }
    }

    if (expected.isJSONArray) {
      const json = JSON.parse(result);
      if (!Array.isArray(json)) {
        throw new Error("Does not match format");
      }
      if (expected.regex) {
        for (const item of json) {
          for (const r of expected.regex) {
            if (!r.test(item)) {
              throw new Error("Does not match format:" + String(r));
            }
          }
        }
      }
    }

    if (expected.isJSONObject) {
      const json = JSON.parse(result);
      if (typeof json !== "object") {
        throw new Error("Does not match format");
      }
    }
    // All good, finish.
    return result;
  }

  private extract(extractor: Extractor, result: string, index = 0) {
    switch (extractor) {
      case "markdown":
        return this.tryToExtractMarkdown(result, index);
      case "json":
        return this.tryToExtractJSON(result, index);
      case "typescript":
        return this.tryToExtractTS(result, index);
      case "python":
        return this.tryToExtractPython(result, index);
      case "none":
        return result;
    }
  }

  private extractStateMachine(text: string): {
    type: "markdown" | "json" | "typescript" | "python";
    content: string;
  }[] {
    const result: {
      type: "markdown" | "json" | "typescript" | "python";
      content: string;
    }[] = [];
    const lines = text.split("\n");

    let currentBlock: {
      type: "markdown" | "json" | "typescript" | "python";
      content: string[];
      startLine: number;
    } | null = null;
    let nestedLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for opening fence with language specification
      const openMatch = line.match(
        /^```(markdown|json|typescript|python|javascript|html)?$/
      );

      // Check for closing fence
      const closeMatch = line.match(/^```$/);

      if (openMatch && currentBlock === null) {
        // Start a new block
        let type: "markdown" | "json" | "typescript" | "python";

        switch (openMatch[1]) {
          case "markdown":
            type = "markdown";
            break;
          case "json":
            type = "json";
            break;
          case "typescript":
            type = "typescript";
            break;
          case "python":
            type = "python";
            break;
          case "javascript":
          case "html":
            // These are handled as nested blocks
            type = "markdown";
            break;
          default:
            // Default to markdown if no type specified
            type = "markdown";
        }

        currentBlock = {
          type,
          content: [],
          startLine: i,
        };
      } else if (currentBlock !== null && line.includes("```") && !closeMatch) {
        // Line contains backticks but is not a closing fence - could be nested or inline
        currentBlock.content.push(line);

        // Check if this is a nested opening fence
        if (line.trim().startsWith("```") && !line.trim().endsWith("```")) {
          nestedLevel++;
        }
        // Check if this is both opening and closing on same line (inline code)
        else if (
          line.trim().startsWith("```") &&
          line.trim().endsWith("```") &&
          line.trim().length > 6
        ) {
          // This is an inline code block, don't change nesting level
        }
      } else if (closeMatch && currentBlock !== null && nestedLevel > 0) {
        // Closing a nested fence
        nestedLevel--;
        currentBlock.content.push(line);
      } else if (closeMatch && currentBlock !== null && nestedLevel === 0) {
        // Closing the main fence - finalize the block
        result.push({
          type: currentBlock.type,
          content: currentBlock.content.join("\n"),
        });
        currentBlock = null;
      } else if (currentBlock !== null) {
        // Inside a block - add to content
        currentBlock.content.push(line);
      }
    }

    // Handle unclosed blocks (if any)
    if (currentBlock !== null) {
      result.push({
        type: currentBlock.type,
        content: currentBlock.content.join("\n"),
      });
    }

    return result;
  }

  private tryToExtractTS(text: string, index: number): string | undefined {
    // Capture outer block
    const regex = text.match(/```typescript/)
      ? /```typescript\n([\s\S]+?)\n```/g
      : /```(?:typescript)?\n([\s\S]+?)\n```/g;
    const match = text.match(regex);
    if (match && match[index]) {
      // Capture internal block
      const regex2 = text.match(/```typescript/)
        ? /```typescript\n([\s\S]+?)\n```/
        : /```(?:typescript)?\n([\s\S]+?)\n```/;
      return match[index]?.match(regex2)?.[1];
    }
    // If no code blocks found and extraction is empty, return the entire text
    if (!text.includes("```") && index === (match?.length || 0)) {
      return text;
    }
    return;
  }

  private tryToExtractPython(text: string, index: number): string | undefined {
    const regex = text.match(/```python/)
      ? /```python\n([\s\S]+?)\n```/g
      : /```(?:python)?\n([\s\S]+?)\n```/g;
    const match = text.match(regex);
    if (match && match[index]) {
      const regex2 = text.match(/```python/)
        ? /```python\n([\s\S]+?)\n```/
        : /```(?:python)?\n([\s\S]+?)\n```/;
      return match[index]?.match(regex2)?.[1];
    }
    // If no code blocks found and extraction is empty, return the entire text
    if (!text.includes("```") && index === (match?.length || 0)) {
      return text;
    }
    return;
  }

  private tryToExtractJSON(text: string, index: number): string | undefined {
    const regex = text.match(/```json/)
      ? /```json\n([\s\S]+?)\n```/g
      : /```(?:json)?\n([\s\S]+?)\n```/g;
    const match = text.match(regex);
    if (match && match[index]) {
      const regex2 = text.match(/```json/)
        ? /```json\n([\s\S]+?)\n```/
        : /```(?:json)?\n([\s\S]+?)\n```/;
      return match[index]?.match(regex2)?.[1];
    }
    return;
  }

  private tryToExtractMarkdown(
    text: string,
    index: number
  ): string | undefined {
    const regex = text.match(/```markdown/)
      ? /```markdown\n([\s\S]+?)\n```/g
      : /```(?:markdown)?\n([\s\S]+?)\n```/g;
    const match = text.match(regex);
    if (match && match[index]) {
      const regex2 = text.match(/```markdown/)
        ? /```markdown\n([\s\S]+?)\n```/
        : /```(?:markdown)?\n([\s\S]+?)\n```/;
      return match[index]?.match(regex2)?.[1];
    }
    const r = this.extractStateMachine(text);
    const x = r.filter((x) => x.type === "markdown");
    return x[index - (match?.length || 0)]?.content;
  }
}
