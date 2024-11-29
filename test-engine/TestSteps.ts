import { TestData } from "../types.ts";
import { PromptTest } from "./PromptTest.ts";
import { getToolImplementationPrompt } from "./shinkai-prompts.ts";
import { Paths } from "../paths.ts";
import { save_tool } from "./shinak-api.ts";
import { writeToFile } from "./test-helpers.ts";
import { appendAditionalCode, checkIfHeadersPresent } from "./test-exec.ts";
import { BaseEngine } from "../llm-engine/BaseEngine.ts";
import { checkCode, executeTest, tryToFixCode } from "./test-exec.ts";
import { createDir } from "./test-helpers.ts";
import { report } from "../report.ts";

export class TestSteps {
  static current = 1;
  public static total = 0;
  private score = 0;
  private maxScore = 0;

  constructor(
    private test: TestData,
    private model: BaseEngine,
    private run_shinkai: boolean,
    private run_llm: boolean,
    private run_exec: boolean,
  ) {
    console.log("--------------------------------");
    console.log(
      `[Testing] ${TestSteps.current}/${TestSteps.total} ${this.test.code} @ ${this.model.path}`,
    );
    TestSteps.current += 1;
  }

  // Step 1:
  // - Initial setup and Shinkai execution
  // - Create directory
  // - Fetch other shinkai-tools
  // - Fetch Raw Prompts from node
  async step_1() {
    if (!this.run_shinkai) return;

    console.log(
      `    [Prompt] ${
        this.test.prompt.substring(0, 100).replaceAll("\n", " ")
      }...`,
    );
    await createDir(this.test, this.model);
    await getToolImplementationPrompt(this.test, this.model);
  }

  // Step 2: 
  // - Generate Code
  // - Check for syntax errors
  // - Try to fix errors?
  // - Write final code
  async step_2() {
    if (!this.run_llm) return;

    const start = Date.now();
    console.log(`    [LLM] Started execution`);
    const data = await new PromptTest(
      this.test,
      this.model,
    ).startCodeGeneration();
    console.log(
      `    [LLM] ${this.model.path} - Execution Time: ${Date.now() - start}ms`,
    );

    // Write Code
    await writeToFile(this.test, this.model, "code", data.code);

    // Try to fix errors
    const errorPath = await checkCode(this.test, this.model);
    const errors = await Deno.readTextFile(errorPath);
    if (errors.length > 0) {
      if (errors.match(/^Check file:\/\/\/.+?\.ts\n$/)) {
        console.log(`    [No Errors]`);
        await Deno.writeTextFile(
          Paths.finalSrcCode(this.test, this.model),
          await Deno.readTextFile(Paths.srcCode(this.test, this.model)),
        );
      } else {
        console.log(
          `    [Error] ${
            errors.replace(/\n/g, " ").replace(/\s+/g, " ").substring(0, 100)
          }...`,
        );
        await tryToFixCode(this.test, this.model, errors);
      }
    } else {
      await Deno.writeTextFile(
        Paths.finalSrcCode(this.test, this.model),
        await Deno.readTextFile(Paths.srcCode(this.test, this.model)),
      );
    }
  }

  // Step 3:
  // - Generate Metadata with LLM
  async step_3() {
    if (!this.run_llm) return;

    const metadata = await new PromptTest(
      this.test,
      this.model,
    ).startMetadataGeneration(
      await Deno.readTextFile(Paths.finalSrcCode(this.test, this.model)),
    );

    await writeToFile(
      this.test,
      this.model,
      "metadata",
      metadata.metadata ?? { prompt: "", raw: "", src: null },
    );
  }

  // Step 4:
  // - Patch code (add env)
  // - Run code with Deno
  // - Save tool in node
  // - Report results
  async step_4() {
    if (!this.run_exec) return;

    const code = await Deno.readTextFile(Paths.finalSrcCode(this.test, this.model));
    if (!checkIfHeadersPresent(code)) {
      const updated_code = appendAditionalCode(code, this.test, this.model);
      await Deno.writeTextFile(
        Paths.finalSrcCode(this.test, this.model),
        updated_code,
      );
    }

    await executeTest(this.test, this.model);

    if (this.test.save) {
      console.log("    [Save]", await save_tool(this.test, this.model));
    }

    const { score: s, max } = await report(this.test, this.model);
    this.score += s;
    this.maxScore += max;
  }

  async prepareEditor() {
    await Deno.writeTextFile(
      Paths.launchCode(this.test, this.model),
      await Deno.readTextFile(Paths.staticLaunchCodeFile()),
    );
    console.log(`    [Editor] run > \`code ${Paths.editorBasePath(this.test, this.model)}\``);
  }

  getScores() { 
    return {
      score: this.score,
      maxScore: this.maxScore,
    };
  }
}