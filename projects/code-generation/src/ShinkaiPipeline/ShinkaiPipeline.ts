import { parseArgs } from "jsr:@std/cli/parse-args";
import "jsr:@std/dotenv/load";
import * as path from "jsr:@std/path";
// import { DependencyDoc } from "../DocumentationGenrator/index.ts";
import { CheckCodeResponse, ShinkaiAPI } from "@scope/shinkai-api";
import * as TurndownService from "npm:turndown";
import { DependencyDoc } from "../DocumentationGenrator/index.ts";
import { BaseEngine } from "../Engines/BaseEngine.ts";
import { getPerplexity, Payload } from "../Engines/index.ts";
import { FileManager } from "./FileManager.ts";
import { LLMFormatter } from "./LLMFormatter.ts";
import { PromptGenerator } from "./PromptGenerator.ts";
import { Requirement } from "./Requirement.ts";
import { ShinkaiPipelineMetadata } from "./ShinkaiPipelineMeta.ts";
import { getHeaders } from "./support.ts";
import { Language } from "./types.ts";

const flags = parseArgs(Deno.args, {
  boolean: ["keepcache", "force-docs"],
});
const KEEP_CACHE = flags.keepcache || flags["force-docs"];
const FORCE_DOCS_GENERATION = flags["force-docs"];

export class ShinkaiPipeline {
  // Setup in constructor
  private fileManager: FileManager;
  private llmFormatter: LLMFormatter;

  // State machine step
  private step: number = 0;

  // "Requirements"
  private requirements: string = "";

  // Used to pass the prompt history from requirements to feedback
  private promptHistory: Payload | undefined;
  // Used to pass the prompt history from plan to feedback
  private promptHistory2: Payload | undefined;

  // Feedback analysis result
  private feedbackAnalysisResult: string = "";

  // External libraries docs
  private docs: Record<string, string> = {};

  // Perplexity search results
  private perplexityResults: string = "";

  // Internal tools
  private internalToolsJSON: string[] = [];

  // Generated plan
  private plan: string = "";

  // Generated code
  private code: string = "";
  private metadata: string = "";

  // Start time
  private startTime: number;

  // Tool type
  private toolType: "shinkai" | "mcp";

  // Tests
  private tests: {
    input: Record<string, any>;
    config: Record<string, any>;
    output: Record<string, any>;
  }[] = [];

  private shinkaiLocalTools_headers: string = "";
  private shinkaiLocalTools_libraryCode: string = "";
  private shinkaiLocalTools_toolRouterKeys: {
    functionName: string;
    toolRouterKey: string;
    code: string;
  }[] = [];
  private shinkaiLocalSupport_headers: string = "";

  constructor(
    private skipFeedback: boolean,
    private language: Language,
    private test: Requirement,
    private llmModel: BaseEngine,
    private advancedLlmModel: BaseEngine,
    private stream: boolean,
    toolType: "shinkai" | "mcp" = "shinkai"
  ) {
    this.fileManager = new FileManager(language, test.code, stream);
    this.llmFormatter = new LLMFormatter(this.fileManager);
    this.startTime = Date.now();
    this.toolType = toolType;
  }

  private async initialize() {
    const completeShinkaiPrompts = getHeaders();

    if (this.language === "typescript") {
      this.shinkaiLocalSupport_headers =
        completeShinkaiPrompts.typescript.headers["shinkai-local-support"];
      if (
        await this.fileManager.exists(20001, "tool_headers", "tool_headers.ts")
      ) {
        this.shinkaiLocalTools_headers = await this.fileManager.load(
          20000,
          "tool_headers",
          "tool_headers.ts"
        );
        this.shinkaiLocalTools_libraryCode = await this.fileManager.load(
          20001,
          "tool_headers",
          "tool_headers.ts"
        );
        this.shinkaiLocalTools_toolRouterKeys = JSON.parse(
          await this.fileManager.load(
            20002,
            "tool_headers",
            "tool_headers.json"
          )
        );
      }
    } else if (this.language === "python") {
      this.shinkaiLocalSupport_headers =
        completeShinkaiPrompts.python.headers["shinkai_local_support"];
      if (
        await this.fileManager.exists(20001, "tool_headers", "tool_headers.py")
      ) {
        this.shinkaiLocalTools_headers = await this.fileManager.load(
          20000,
          "tool_headers",
          "tool_headers.py"
        );
        this.shinkaiLocalTools_libraryCode = await this.fileManager.load(
          20001,
          "tool_headers",
          "tool_headers.py"
        );
        this.shinkaiLocalTools_toolRouterKeys = JSON.parse(
          await this.fileManager.load(
            20002,
            "tool_headers",
            "tool_headers.json"
          )
        );
      }
    }

    // this.shinkaiPrompts = completeShinkaiPrompts[this.language];
    // this.availableTools = completeShinkaiPrompts.availableTools;
    // await this.fileManager.log(`=========================================================`, true);
    await this.fileManager.log(
      `🔨 Starting Code Generation for #[${this.test.id}] ${this.test.code} @ ${this.language} (Tool Type: ${this.toolType})`,
      true
    );
  }

  private async generateRequirements() {
    // Check if output file exists
    if (
      (await this.fileManager.exists(this.step, "c", "requirements.md")) &&
      (await this.fileManager.exists(this.step, "x", "promptHistory.json"))
    ) {
      // If skipping this was processed before, just adding into the prompt history
      await this.fileManager.log(
        ` Step ${this.step} - Requirements & Feedback `,
        true
      );
      const existingFile = await this.fileManager.load(
        this.step,
        "c",
        "requirements.md"
      );
      this.requirements = existingFile;
      const promptHistory = await this.fileManager.load(
        this.step,
        "x",
        "promptHistory.json"
      );
      this.promptHistory = JSON.parse(promptHistory);
      this.step++;
      return;
    }

    const prompt = await (async () => {
      let headers: string = "";
      if (this.toolType === "shinkai") {
        headers =
          this.shinkaiLocalTools_headers +
          "\n" +
          this.shinkaiLocalSupport_headers;
      } else {
        headers = "NONE";
      }

      let user_prompt = this.test.prompt;
      if (this.toolType === "mcp") {
        user_prompt +=
          '\n\nNo matter what was said before, the "Internal Libraries" section is always NONE.';
      }

      const promptGenerator = new PromptGenerator(
        Deno.cwd() + "/prompts/1-initial-requirements.md",
        [
          [
            "{{INPUT_COMMAND}}",
            `<input_command>\n${user_prompt}\n\n</input_command>`,
          ],
          [/\{LANGUAGE\}/g, this.language],
          [/\{RUNTIME\}/g, this.language === "typescript" ? "Deno" : "Python"],
          [
            "{{INTERNAL_LIBRARIES}}",
            `<internal-libraries>\n${headers}\n</internal-libraries>`,
          ],
        ]
      );
      return await promptGenerator.generatePrompt();
    })();

    const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(
      async () => {
        this.fileManager.log(
          `[Planning Step ${this.step}] System Requirements & Feedback Prompt`,
          true
        );
        await this.fileManager.save(
          this.step,
          "a",
          prompt,
          "requirements-prompt.md"
        );
        const llmResponse = await this.llmModel.run(
          prompt,
          this.fileManager,
          undefined,
          "Analyzing Requirements & Generating Feedback"
        );
        await this.fileManager.save(
          this.step,
          "x",
          JSON.stringify(llmResponse.metadata),
          "promptHistory.json"
        );
        this.promptHistory = llmResponse.metadata;
        await this.fileManager.save(
          this.step,
          "b",
          llmResponse.message,
          "raw-requirements-response.md"
        );
        return llmResponse.message;
      },
      "markdown",
      {
        regex: [
          new RegExp("# Requirements"),
          new RegExp("# Standard Libraries"),
          new RegExp("# Internal Libraries"),
          new RegExp("# External Libraries"),
          new RegExp("# Example Input and Output"),
        ],
      }
    );
    this.requirements = parsedLLMResponse;
    await this.fileManager.save(
      this.step,
      "c",
      this.requirements,
      "requirements.md"
    );

    this.step++;

    if (!this.skipFeedback) {
      // let's terminate the pipeline if the user feedback is not provided
      const req = this.requirements.replace(
        /# External Libraries[\s\S]*?# Example Input and Output/,
        "# Example Input and Output"
      );
      console.log(JSON.stringify({ markdown: req }));
      await new Promise((resolve) => setTimeout(resolve, 200));
      throw new Error("REQUEST_FEEDBACK");
    }
  }

  private async processUserFeedback() {
    const user_feedback = this.test.feedback;
    if (!user_feedback) {
      throw new Error("missing feedback");
    }

    let moreFeedback = true;

    while (moreFeedback) {
      // Check if output file exists
      if (await this.fileManager.exists(this.step, "c", "feedback.md")) {
        await this.fileManager.log(
          ` Step ${this.step} - User Requirements & Feedback `,
          true
        );
        this.requirements = await this.fileManager.load(
          this.step,
          "c",
          "feedback.md"
        );
        this.promptHistory = JSON.parse(
          await this.fileManager.load(this.step, "x", "promptHistory.json")
        );
        this.step++;
        moreFeedback = true;
      } else {
        moreFeedback = false;
      }
    }

    const prompt = await (async () => {
      const promptGenerator = new PromptGenerator(
        Deno.cwd() + "/prompts/2-feedback.md",
        [
          [
            "{{INPUT_COMMAND}}",
            `<input_command>\n${user_feedback}\n\n</input_command>`,
          ],
        ]
      );
      return await promptGenerator.generatePrompt();
    })();

    const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(
      async () => {
        this.fileManager.log(
          `[Planning Step ${this.step}] User Requirements & Feedback Prompt`,
          true
        );
        await this.fileManager.save(
          this.step,
          "a",
          prompt,
          "feedback-prompt.md"
        );
        const llmResponse = await this.llmModel.run(
          prompt,
          this.fileManager,
          this.promptHistory,
          "Processing User Feedback"
        );
        await this.fileManager.save(
          this.step,
          "b",
          llmResponse.message,
          "raw-feedback-response.md"
        );

        this.promptHistory = llmResponse.metadata;
        await this.fileManager.save(
          this.step,
          "x",
          JSON.stringify(this.promptHistory, null, 2),
          "promptHistory.json"
        );

        return llmResponse.message;
      },
      "markdown",
      {
        regex: [
          new RegExp("# Requirements"),
          new RegExp("# Standard Libraries"),
          new RegExp("# Internal Libraries"),
          new RegExp("# External Libraries"),
          new RegExp("# Example Input and Output"),
        ],
      }
    );

    this.requirements = parsedLLMResponse;
    await this.fileManager.save(
      this.step,
      "c",
      this.requirements,
      "feedback.md"
    );
    this.step++;
  }

  private async processUserPlanFeedback() {
    const user_feedback = this.test.plan_feedback;
    if (!user_feedback) {
      throw new Error("missing feedback");
    }

    let moreFeedback = true;

    while (moreFeedback) {
      // Check if output file exists
      if (await this.fileManager.exists(this.step, "c", "plan-feedback.md")) {
        await this.fileManager.log(
          ` Step ${this.step} - User Plan Feedback `,
          true
        );
        this.requirements = await this.fileManager.load(
          this.step,
          "c",
          "plan-feedback.md"
        );
        this.promptHistory2 = JSON.parse(
          await this.fileManager.load(this.step, "x", "promptHistory.json")
        );
        this.step++;
        moreFeedback = true;
      } else {
        moreFeedback = false;
      }
    }

    let promptHistory2: Payload | undefined;

    const prompt = await (async () => {
      const promptGenerator = new PromptGenerator(
        Deno.cwd() + "/prompts/2-feedback.md",
        [
          [
            "{{INPUT_COMMAND}}",
            `<input_command>\n${user_feedback}\n\n</input_command>`,
          ],
        ]
      );
      return await promptGenerator.generatePrompt();
    })();

    const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(
      async () => {
        this.fileManager.log(
          `[Planning Step ${this.step}] User Plan & Feedback Prompt`,
          true
        );

        await this.fileManager.save(
          this.step,
          "a",
          prompt,
          "plan-feedback-prompt.md"
        );
        const llmResponse = await this.llmModel.run(
          prompt,
          this.fileManager,
          this.promptHistory2,
          "Processing User Plan Feedback"
        );
        await this.fileManager.save(
          this.step,
          "b",
          llmResponse.message,
          "raw-plan-feedback-response.md"
        );

        promptHistory2 = llmResponse.metadata;

        return llmResponse.message;
      },
      "markdown",
      {
        regex: [
          new RegExp("# Development Plan"),
          new RegExp("# Example Input and Output"),
          new RegExp("# Config"),
        ],
      }
    );

    this.requirements = parsedLLMResponse;
    await this.fileManager.save(
      this.step,
      "c",
      this.requirements,
      "plan-feedback.md"
    );

    this.promptHistory2 = promptHistory2;
    await this.fileManager.save(
      this.step,
      "x",
      JSON.stringify(this.promptHistory2, null, 2),
      "promptHistory.json"
    );

    this.step++;
  }

  private async processLibrarySearch() {
    const codes = "defghijklmnopqrstuvwxyz";
    {
      let parsedLLMResponse = "";
      if (await this.fileManager.exists(this.step, "c", "library.json")) {
        await this.fileManager.log(
          ` Step ${this.step} - Library Search `,
          true
        );
        const existingLibraryJson = await this.fileManager.load(
          this.step,
          "c",
          "library.json"
        );
        parsedLLMResponse = existingLibraryJson;
        // Load existing dependency docs
      } else {
        parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(
          async () => {
            this.fileManager.log(
              `[Planning Step ${this.step}] Library Search Prompt`,
              true
            );
            const prompt = (
              await Deno.readTextFile(Deno.cwd() + "/prompts/3-library.md")
            ).replace(
              "{{INPUT_COMMAND}}",
              `<input_command>\n${this.requirements}\n\n</input_command>`
            );
            await this.fileManager.save(
              this.step,
              "a",
              prompt,
              "library-prompt.md"
            );
            const llmResponse = await this.llmModel.run(
              prompt,
              this.fileManager,
              undefined,
              "Searching for Required Libraries"
            );
            const promptResponse = llmResponse.message;
            await this.fileManager.save(
              this.step,
              "b",
              promptResponse,
              "raw-library-response.md"
            );
            return promptResponse;
          },
          "json",
          {
            isJSONArray: true,
          }
        );

        await this.fileManager.save(
          this.step,
          "c",
          parsedLLMResponse,
          "library.json"
        );
      }

      const libQueries = JSON.parse(parsedLLMResponse) as string[];

      const docManager = new DependencyDoc(this.llmModel, this.fileManager);
      for (const [index, library] of libQueries.entries()) {
        const safeLibraryName = library
          .replace(/[^a-zA-Z0-9]/g, "_")
          .toLocaleLowerCase();
        if (
          !FORCE_DOCS_GENERATION &&
          (await this.fileManager.exists(
            this.step,
            codes[index % codes.length],
            safeLibraryName + "-dependency-doc.md"
          ))
        ) {
          await this.fileManager.log(
            ` Step ${this.step} - Dependency Doc `,
            true
          );
          const existingFile = await this.fileManager.load(
            this.step,
            codes[index % codes.length],
            safeLibraryName + "-dependency-doc.md"
          );
          this.docs[library] = existingFile;
        } else {
          this.fileManager.log(
            `[Planning Step ${this.step}] Dependency Doc Prompt : ${library}`,
            true
          );
          const dependencyDoc = await docManager.getDependencyDocumentation(
            library,
            this.language
          );
          this.docs[library] = dependencyDoc;
          await this.fileManager.save(
            this.step,
            codes[index % codes.length],
            dependencyDoc,
            safeLibraryName + "-dependency-doc.md"
          );
        }
      }

      this.step++;
    }

    const KB_PHASE = Deno.env.get("KB_PHASE");
    if (KB_PHASE === "true") {
      const documentationURL =
        "https://shinkai-agent-knowledge-base.pages.dev/";
      let parsedLLMResponse = "";
      if (await this.fileManager.exists(this.step, "c", "kb-library.jsonn")) {
        await this.fileManager.log(
          ` Step ${this.step} - KB Library Search `,
          true
        );
        const existingLibraryJson = await this.fileManager.load(
          this.step,
          "c",
          "kb-library.json"
        );
        parsedLLMResponse = existingLibraryJson;
        // Load existing dependency docs
      } else {
        const documentation = await fetch(documentationURL);
        const documentationHTML = await documentation.text();
        const turndownService = new TurndownService.default();
        const documentationMarkdown =
          turndownService.turndown(documentationHTML);

        const prompt = await (async () => {
          const promptGenerator = new PromptGenerator(
            Deno.cwd() + "/prompts/3a-fetch-library.md",
            [
              ["{{WEB_PAGE}}", `<web>\n${documentationMarkdown}\n</web>`],
              [
                "{{REQUIREMENTS}}",
                `<requirements>\n${this.requirements}\n</requirements>`,
              ],
            ]
          );
          return await promptGenerator.generatePrompt();
        })();

        parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(
          async () => {
            await this.fileManager.save(
              this.step,
              "a",
              prompt,
              "kb-library-prompt.md"
            );
            const llmResponse = await this.llmModel.run(
              prompt,
              this.fileManager,
              undefined,
              "Fetching Documentation"
            );
            await this.fileManager.save(
              this.step,
              "b",
              llmResponse.message,
              "raw-kb-library-response.md"
            );

            return llmResponse.message;
          },
          "json",
          {
            isJSONArray: true,
          }
        );
        await this.fileManager.save(
          this.step,
          "c",
          parsedLLMResponse,
          "kb-library.json"
        );
      }
      const documentationJSON: string[] = JSON.parse(parsedLLMResponse);

      for (const [index, url] of documentationJSON.entries()) {
        const safeLibraryName = url
          .replace(/[^a-zA-Z0-9]/g, "_")
          .toLocaleLowerCase();
        if (
          await this.fileManager.exists(
            this.step,
            codes[index % codes.length],
            safeLibraryName + "-kb-dependency-doc.md"
          )
        ) {
          await this.fileManager.log(` Step ${this.step} - KB Library `, true);
          const existingFile = await this.fileManager.load(
            this.step,
            codes[index % codes.length],
            safeLibraryName + "-kb-dependency-doc.md"
          );
          this.docs[safeLibraryName] = existingFile;
        } else {
          this.fileManager.log(
            `[Planning Step ${this.step}] KB Library : ${safeLibraryName}`,
            true
          );
          const documentation = await fetch(url);
          const documentationHTML = await documentation.text();
          const turndownService = new TurndownService.default();
          const markdown = turndownService.turndown(documentationHTML);
          this.docs[safeLibraryName] = markdown;
          await this.fileManager.save(
            this.step,
            codes[index % codes.length],
            markdown,
            safeLibraryName + "-kb-dependency-doc.md"
          );
        }
      }

      this.step++;
    }
  }

  private async processPerplexitySearch() {
    // Skip if PERPLEXITY_API_KEY is not set
    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!perplexityApiKey) {
      await this.fileManager.log(
        `[Planning Step ${this.step}] Skipping Perplexity search - API key not found`,
        true
      );
      this.step++;
      return;
    }

    // Check if output file exists
    if (await this.fileManager.exists(this.step, "c", "perplexity.md")) {
      await this.fileManager.log(
        ` Step ${this.step} - Searching Perplexity for additional context `,
        true
      );
      this.perplexityResults = await this.fileManager.load(
        this.step,
        "c",
        "perplexity.md"
      );
      this.step++;
      return;
    }

    this.fileManager.log(
      `[Planning Step ${this.step}] Searching Perplexity for additional context`,
      true
    );

    const perplexity = getPerplexity();

    const prompt = await (async () => {
      const usedInternalTools = this.shinkaiLocalTools_toolRouterKeys
        .filter((trk) => this.internalToolsJSON.includes(trk.toolRouterKey))
        .map((trk) => trk.code)
        .join("\n");

      const libraryDocsString = Object.entries(this.docs)
        .map(([library, doc]) => `\n# ${library}\n\n${doc}\n`)
        .join("\n\n");

      const r: [string | RegExp, string][] = [];
      if (this.language === "typescript") {
        r.push(
          ["{{prompt}}", this.requirements],
          [
            "{{FILE_SHINKAI_LOCAL_TOOLS}}",
            `
                        <external-references>${libraryDocsString}</external-references>
                        
                        <file-name=shinkai-local-tools>\n${usedInternalTools}\n</file-name=shinkai-local-tools>`,
          ]
        );
      } else if (this.language === "python") {
        r.push(
          ["{{prompt}}", this.requirements],
          [
            "{{FILE_SHINKAI_LOCAL_TOOLS}}",
            `
                        <external-references>${libraryDocsString}</external-references>

                        <file-name=shinkai_local_tools>\n${usedInternalTools}\n</file-name=shinkai_local_tools>`,
          ]
        );
      }

      const file =
        this.language === "typescript"
          ? "/prompts/3b-perplexity-ts.md"
          : "/prompts/3b-perplexity-py.md";
      const promptGenerator = new PromptGenerator(Deno.cwd() + file, r);

      const r2: [string | RegExp, string][] = [];
      r2.push([
        /# External Libraries[\s\S]*?# Example Input and Output/,
        `# External Libraries
    * Search for ${
      this.language === "typescript" ? "npmjs.com/" : "pypi.org"
    } libraries.
                
    # Example Input and Output`,
      ]);

      let partialPrompt = await promptGenerator.generatePrompt();

      // This replacement exists post initial replacements.
      partialPrompt = promptGenerator.postProcessPrompt(partialPrompt, r2);

      // There might be some 'deno' in the prompt, replace it with 'typescript'
      // So that perplexity writes code for node.
      if (this.language === "typescript") {
        partialPrompt = partialPrompt.replace(/deno/gi, "typescript");
      }
      return partialPrompt;
    })();

    await this.fileManager.save(this.step, "a", prompt, "perplexity-prompt.md");

    const response = await perplexity.run(
      prompt,
      this.fileManager,
      undefined,
      "Searching..."
    );

    this.perplexityResults = response.message;
    this.perplexityResults = this.perplexityResults.replace(
      /<think>[\s\S]*?<\/think>/g,
      ""
    );

    await this.fileManager.save(
      this.step,
      "c",
      this.perplexityResults,
      "perplexity.md"
    );
    this.step++;
  }

  private async processInternalTools() {
    // Check if output file exists
    if (await this.fileManager.exists(this.step, "c", "internal-tools.json")) {
      await this.fileManager.log(` Step ${this.step} - Internal Tools `, true);
      const existingFile = await this.fileManager.load(
        this.step,
        "c",
        "internal-tools.json"
      );
      this.internalToolsJSON = JSON.parse(existingFile) as string[];
      this.step++;
      return;
    }

    const prompt = await (async () => {
      const availableTools: string[] =
        this.shinkaiLocalTools_toolRouterKeys.map(
          (key) => `${key.toolRouterKey} ${key.functionName}`
        );

      if (this.language === "typescript") {
        availableTools.push(`
NOTE: The following 5 functions do not have a tool-router-key, if you need their tool-router-key skip them and do not add them to the final output.
getMountPaths
getAssetPaths
getHomePath
getShinkaiNodeLocation
getAccessToken
`);
      } else if (this.language === "python") {
        availableTools.push(`
NOTE: The following 5 functions do not have a tool-router-key, if you need their tool-router-key skip them and do not add them to the final output.
get_mount_paths
get_asset_paths
get_home_path
get_shinkai_node_location
get_access_token
`);
      }

      const r: [string | RegExp, string][] = [
        [
          "{{INPUT_COMMAND}}",
          `<input_command>\n${this.requirements}\n\n </input_command>`,
        ],
        [
          "{{TOOL_ROUTER_KEY}}",
          `<tool_router_key>\n${availableTools.join("\n")}\n</tool_router_key>`,
        ],
      ];

      const promptGenerator = new PromptGenerator(
        Deno.cwd() + "/prompts/4-internal-tools.md",
        r
      );
      return await promptGenerator.generatePrompt();
    })();

    const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(
      async () => {
        this.fileManager.log(
          `[Planning Step ${this.step}]Internal Libraries Prompt`,
          true
        );
        await this.fileManager.save(
          this.step,
          "a",
          prompt,
          "internal-tools-prompt.md"
        );
        const llmResponse = await this.llmModel.run(
          prompt,
          this.fileManager,
          undefined,
          "Identifying Required Internal Tools"
        );
        await this.fileManager.save(
          this.step,
          "b",
          llmResponse.message,
          "raw-internal-tools-response.md"
        );
        return llmResponse.message;
      },
      "json",
      {
        regex: [new RegExp(".+?:::.+?:::.+?")],
        isJSONArray: true,
      }
    );

    await this.fileManager.save(
      this.step,
      "c",
      parsedLLMResponse,
      "internal-tools.json"
    );
    this.internalToolsJSON = JSON.parse(parsedLLMResponse) as string[];
    this.step++;
  }

  //     private async generatePlan() {
  //         // Check if output file exists
  //         if (await this.fileManager.exists(this.step, 'c', 'plan.md')) {
  //             await this.fileManager.log(` Step ${this.step} - Development Plan `, true);
  //             const existingFile = await this.fileManager.load(this.step, 'c', 'plan.md');
  //             this.plan = existingFile;
  //             this.promptHistory2 = JSON.parse(await this.fileManager.load(this.step, 'x', 'promptHistory.json'));
  //             this.step++;
  //             return;
  //         }

  //         // Generate the internal tools headers that is
  //         // 1. The internal tools that are **used** in the code
  //         // 2. All support functions.
  //         const usedInternalTools = this.shinkaiLocalTools_toolRouterKeys
  //             .filter(trk => this.internalToolsJSON.includes(trk.toolRouterKey))
  //             .map(trk => trk.code)
  //             .join('\n');

  //         const internalTools_Tools = usedInternalTools + '\n\n' + this.shinkaiLocalSupport_headers;
  //         let promptHistory2: Payload | undefined;

  //         const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(async () => {
  //             this.fileManager.log(`[Planning Step ${this.step}] Generate Development Plan`, true);

  //             // Create a documentation string from all the library docs
  //             const libraryDocsString = Object.entries(this.docs).map(([library, doc]) => `
  // # ${library}
  // ${doc}
  // `).join('\n\n');

  //             // Add Perplexity search results if available
  //             const perplexityDocsString = this.perplexityResults ? `
  // # Perplexity Search Results
  // ${this.perplexityResults}
  // ` : '';

  //             const req = this.requirements.replace(/# External Libraries[\s\S]*?# Example Input and Output/, '# Example Input and Output');
  //             // TODO Refetch only used libaries
  //             const prompt = (await Deno.readTextFile(Deno.cwd() + '/prompts/5-plan.md')).replace(
  //                 '{{INITIAL_REQUIREMENTS}}',
  //                 `<initial_requirements>\n${req}\n\n</initial_requirements>`
  //             ).replace(
  //                 '{{LIBRARIES_DOCUMENTATION}}',
  //                 `<libraries_documentation>\n${libraryDocsString}\n${perplexityDocsString}\n</libraries_documentation>`
  //             ).replace(
  //                 '{{INTERNAL_LIBRARIES}}',
  //                 `<internal_libraries>\n${internalTools_Tools}\n</internal_libraries>`
  //             ).replace('{{RUNTIME}}', this.language === 'typescript' ? 'Deno' : 'Python');

  //             await this.fileManager.save(this.step, 'a', prompt, 'plan-prompt.md');
  //             const llmResponse = await this.llmModel.run(prompt, this.fileManager, undefined, "Creating Development Plan");
  //             await this.fileManager.save(this.step, 'b', llmResponse.message, 'raw-plan-response.md');
  //             promptHistory2 = llmResponse.metadata;
  //             return llmResponse.message;
  //         }, 'markdown', {
  //             regex: [
  //                 new RegExp("# Development Plan"),
  //                 new RegExp("# Example Input and Output"),
  //                 new RegExp("# Config"),
  //             ]
  //         });

  //         this.plan = parsedLLMResponse;
  //         console.log(JSON.stringify({ markdown: this.plan }));
  //         await this.fileManager.save(this.step, 'c', this.plan, 'plan.md');

  //         this.promptHistory2 = promptHistory2;
  //         await this.fileManager.save(this.step, 'x', JSON.stringify(this.promptHistory2, null, 2), 'promptHistory.json');

  //         this.step++;
  //         // First time the plan is generated, request feedback
  //         throw new Error('REQUEST_PLAN_FEEDBACK');
  //     }

  private async generateCode() {
    // Check if output file exists
    if (
      this.language === "typescript" &&
      (await this.fileManager.exists(this.step, "c", "tool.ts"))
    ) {
      await this.fileManager.log(` Step ${this.step} - Tool code `, true);
      const existingFile = await this.fileManager.load(
        this.step,
        "c",
        "tool.ts"
      );
      this.code = existingFile;
      this.step++;
      return;
    }
    if (
      this.language === "python" &&
      (await this.fileManager.exists(this.step, "c", "tool.py"))
    ) {
      await this.fileManager.log(` Step ${this.step} - Tool code `, true);
      const existingFile = await this.fileManager.load(
        this.step,
        "c",
        "tool.py"
      );
      this.code = existingFile;
      this.step++;
      return;
    }

    const prompt = await (async () => {
      const usedInternalTools = this.shinkaiLocalTools_toolRouterKeys
        .filter((trk) => this.internalToolsJSON.includes(trk.toolRouterKey))
        .map((trk) => trk.code)
        .join("\n");

      const r: [string | RegExp, string][] = [];
      const file =
        this.language === "typescript"
          ? "/prompts/6-code-ts.md"
          : "/prompts/6-code-py.md";
      const promptGenerator = new PromptGenerator(Deno.cwd() + file, r);

      if (this.language === "typescript") {
        r.push([
          "{{FILE_NAME_SHINKAI_LOCAL_TOOL}}",
          `<file-name=shinkai-local-tools>\n${usedInternalTools}\n</file-name=shinkai-local-tools>`,
        ]);
      } else if (this.language === "python") {
        r.push([
          "{{FILE_NAME_SHINKAI_LOCAL_TOOL}}",
          `<file-name=shinkai_local_tools>\n${usedInternalTools}\n</file-name=shinkai_local_tools>`,
        ]);
      }

      // TODO remove this false when possible.
      const toolPrompt = await promptGenerator.generatePrompt(false);

      const req = this.requirements.replace(
        /# External Libraries[\s\S]*?# Example Input and Output/,
        "# Example Input and Output"
      );
      // This used to use the plan.
      const toolCode_1 = toolPrompt.replace(
        "{{INPUT_COMMAND}}",
        `<input_command>\n${req}\n\n</input_command>`
      );

      let alternativeHeaders = "";
      if (this.language === "typescript") {
        if (
          await this.fileManager.exists(
            20001,
            "tool_headers",
            "tool_headers.ts"
          )
        ) {
          alternativeHeaders = await this.fileManager.load(
            20001,
            "tool_headers",
            "tool_headers.ts"
          );
        }
      } else if (this.language === "python") {
        if (
          await this.fileManager.exists(
            20001,
            "tool_headers",
            "tool_headers.py"
          )
        ) {
          alternativeHeaders = await this.fileManager.load(
            20001,
            "tool_headers",
            "tool_headers.py"
          );
        }
      }

      let toolCode_2 = "";
      if (this.language === "typescript") {
        toolCode_2 = toolCode_1
          .replace(
            "Import these functions with the format: `import { xx } from './shinkai-local-tools.ts'",
            ""
          )
          .replace(
            /<file-name=shinkai-local-tools>[\s\S]*?<\/file-name=shinkai-local-tools>/g,
            ""
          )
          .replace(
            /<\/file-name=shinkai-local-support>/,
            `</file-name=shinkai-local-support>

Import these functions with the format: \`import { xx } from './shinkai-local-tools.ts'\`
<file-name=shinkai-local-tools>
${alternativeHeaders}
</file-name=shinkai-local-tools>
`
          );
      } else if (this.language === "python") {
        toolCode_2 = toolCode_1
          .replace(
            "Import these functions with the format: `from shinkai_local_tools import xx`",
            ""
          )
          .replace(
            /<file-name=shinkai_local_tools>[\s\S]*?<\/file-name=shinkai_local_tools>/g,
            ""
          )
          .replace(
            /<\/file-name=shinkai_local_support>/,
            `</file-name=shinkai_local_support>

Import these functions with the format: \`from shinkai_local_tools import xx\`
<file-name=shinkai_local_tools>
${alternativeHeaders}
</file-name=shinkai_local_tools>
`
          );
      }

      //             const perplexityCode = `
      // The reference-implementation tag section is an example on a alternative implementation, it might not be correct.
      // <reference-implementation>
      // ${this.perplexityResults}
      // </reference-implementation>
      // `;

      const additionalRules =
        this.language === "typescript"
          ? `
    * Use "Internal Libraries" with \`import { xx } from './shinkai-local-support.ts\`; 
    * Use "External Libraries" with \`import { xx } from 'npm:xx'\`;
        `
          : "";
      const toolCode =
        `

<libraries_documentation>
${Object.entries(this.docs)
  .map(
    ([library, doc]) => `
    The folling libraries_documentation tags are just for reference on how to use the libraries, and do not imply how to implement the rules below.
    <library_documentation=${library}>
    # ${library}
    ${doc}
    </library_documentation=${library}>
    The libraries_documentation ended, everything before if for reference only.
    Now, the prompt begins:
`
  )
  .join("\n")}
</libraries_documentation>
        ` +
        toolCode_2.replace(
          "* Prefer libraries in the following order:",
          `
    * As first preference use the libraries described in the "Internal Libraries" and "External Libraries" sections.
${additionalRules}
    * For missing and additional required libraries, prefer the following order:`
        );

      const toolCodeWithReferenceImplementation = toolCode.replace(
        "{{EXAMPLE_IMPLEMENTATION}}",
        `<example_implementation>\n${this.perplexityResults}\n</example_implementation>`
      );
      // TODO: Implement this with the prompt generator
      // return await promptGenerator.generatePrompt();
      return toolCodeWithReferenceImplementation;
    })();

    const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(
      async () => {
        this.fileManager.log(
          `[Planning Step ${this.step}] Generate the tool code`,
          true
        );

        await this.fileManager.save(this.step, "a", prompt, "code-prompt.md");
        const llmResponse = await this.advancedLlmModel.run(
          prompt,
          this.fileManager,
          undefined,
          "Generating Tool Code"
        );
        const promptResponse = llmResponse.message;

        await this.fileManager.save(
          this.step,
          "b",
          promptResponse,
          "raw-code-response.md"
        );
        return promptResponse;
      },
      this.language,
      {
        regex: [
          this.language === "typescript"
            ? new RegExp("function run")
            : new RegExp("def run"),
        ],
      }
    );

    this.code = parsedLLMResponse;
    if (this.language === "typescript") {
      await this.fileManager.save(
        this.step,
        "c",
        parsedLLMResponse || "",
        "tool.ts"
      );
    } else {
      await this.fileManager.save(
        this.step,
        "c",
        parsedLLMResponse || "",
        "tool.py"
      );
    }
    this.step++;
  }

  private async checkGeneratedCode(): Promise<{ warnings: boolean }> {
    const shinkaiAPI = new ShinkaiAPI();
    let checkResult: CheckCodeResponse;
    if (
      await this.fileManager.exists(this.step, "a", "code-check-results.json")
    ) {
      const existingFile = await this.fileManager.load(
        this.step,
        "a",
        "code-check-results.json"
      );
      checkResult = JSON.parse(existingFile) as CheckCodeResponse;
    } else {
      const additional_headers: Record<string, string> = {};
      if (this.language === "typescript") {
        if (
          await this.fileManager.exists(
            20001,
            "tool_headers",
            "tool_headers.ts"
          )
        ) {
          additional_headers["shinkai-local-tools"] =
            await this.fileManager.load(
              20001,
              "tool_headers",
              "tool_headers.ts"
            );
        } else {
          console.log("[Warning] Not using local tools.");
        }
      } else {
        if (
          await this.fileManager.exists(
            20001,
            "tool_headers",
            "tool_headers.py"
          )
        ) {
          additional_headers["shinkai_local_tools"] =
            await this.fileManager.load(
              20001,
              "tool_headers",
              "tool_headers.py"
            );
        } else {
          console.log("[Warning] Not using local tools.");
        }
      }

      checkResult = await shinkaiAPI.checkCode(
        this.language,
        this.code,
        additional_headers
      );

      this.fileManager.log(
        `[Planning Step ${this.step}] Code check results ${checkResult.warnings.length} warnings`,
        true
      );
      await this.fileManager.save(
        this.step,
        "a",
        JSON.stringify(checkResult, null, 2),
        "code-check-results.json"
      );
    }

    if (checkResult.warnings.length > 0) {
      if (
        this.language === "typescript" &&
        (await this.fileManager.exists(this.step, "d", "fixed-tool.ts"))
      ) {
        await this.fileManager.log(` Step ${this.step} - Fixed code `, true);
        const existingFile = await this.fileManager.load(
          this.step,
          "d",
          "fixed-tool.ts"
        );
        this.code = existingFile;
        this.step++;
        return { warnings: true };
      }
      if (
        this.language === "python" &&
        (await this.fileManager.exists(this.step, "d", "fixed-tool.py"))
      ) {
        await this.fileManager.log(` Step ${this.step} - Fixed code `, true);
        const existingFile = await this.fileManager.load(
          this.step,
          "d",
          "fixed-tool.py"
        );
        this.code = existingFile;
        this.step++;
        return { warnings: true };
      }
      this.fileManager.log(
        `[Planning Step ${this.step}] Check generated code`,
        true
      );

      const prompt = await (async () => {
        // TODO: implement this with the prompt generator
        //
        // const r: [(string | RegExp), string][] = [];
        // const file = this.language === 'typescript' ? '/prompts/7-fix-code.md' : '/prompts/7-fix-code-py.md';
        // const promptGenerator = new PromptGenerator(Deno.cwd() + file, r);
        // return await promptGenerator.generatePrompt();

        let warningString = checkResult.warnings
          .join("\n")
          .replace(
            /file:\/\/\/[a-zA-Z0-9_\/-]+?\/code\/[a-zA-Z0-9_-]+?\//g,
            "/"
          )
          .replace(/Stack backtrace:[\s\S]*/, "");
        if (this.language === "typescript") {
          warningString = warningString.replace(/^Download [^ ]+$/g, "");
        }
        // Read the fix-code prompt
        const fixCodePrompt = (
          await Deno.readTextFile(Deno.cwd() + "/prompts/7-fix-code.md")
        )
          .replace("{{WARNINGS}}", `<warnings>\n${warningString}\n</warnings>`)
          .replace("{{CODE}}", `<code>\n${this.code}\n</code>`)
          .replace(
            "{{RUNTIME}}",
            this.language === "typescript" ? "Deno" : "Python"
          )
          .replace(
            "{{LANG_RULES}}",
            this.language === "typescript"
              ? `
All libraries must be imported at the start of the code as either:
\`import { xx } from './shinkai-local-support.ts\`; 
\`import { xx } from 'npm:yyy'\`;
\`import { xx } from 'jsr:@std/yyy'\`;
\`import { xx } from 'node:yyy'\`;
`
              : `

If the warning suggestes to use either JSR or NPM, then first try using NPM with "npm:xxx"

At the start of the file add a commented toml code block with the dependencies used and required to be downloaded by pip.
Only add the dependencies that are required to be downloaded by pip, do not add the dependencies that are already available in the Python environment.

In the next example tag is an example of the commented script block that MUST be present before any python code or imports, where the exact list of dependencies depends on the source code.
<example>
# /// script
# requires-python = ">=3.10,<3.12"
# dependencies = [
#   "requests",
#   "ruff >=0.3.0",
#   "torch ==2.2.2",
#   "other_dependency",
#   "other_dependency_2",
# ]
# ///
</example>

  * Do not implement __init__ or __new__ methods for CONFIG, INPUTS or OUTPUT. So OUTPUT should be set with dot notation.
`
          );
        return fixCodePrompt;
      })();

      const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(
        async () => {
          await this.fileManager.save(
            this.step,
            "b",
            prompt,
            "fix-code-prompt.md"
          );

          // Run the fix prompt
          const llmResponse = await this.llmModel.run(
            prompt,
            this.fileManager,
            undefined,
            "Fixing Code Warnings"
          );
          await this.fileManager.save(
            this.step,
            "c",
            llmResponse.message,
            "raw-fix-code-response.md"
          );
          return llmResponse.message;
        },
        this.language,
        {
          regex: [
            this.language === "typescript"
              ? new RegExp("function run")
              : new RegExp("def run"),
          ],
        }
      );

      // Extract and save the fixed code
      this.code = parsedLLMResponse;
      if (this.language === "typescript") {
        await this.fileManager.save(
          this.step,
          "d",
          parsedLLMResponse || "",
          "fixed-tool.ts"
        );
      } else {
        await this.fileManager.save(
          this.step,
          "d",
          parsedLLMResponse || "",
          "fixed-tool.py"
        );
      }
      this.step++;
      return { warnings: true };
    } else {
      // Nothing to fix
      this.fileManager.log(
        `[Planning Step ${this.step}] No warnings found`,
        true
      );

      this.step++;
      return { warnings: false };
    }
  }

  private async generateTests() {
    // Check if output file exists
    if (await this.fileManager.exists(this.step, "c", "tests.json")) {
      await this.fileManager.log(` Step ${this.step} - Tests `, true);
      const existingFile = await this.fileManager.load(
        this.step,
        "c",
        "tests.json"
      );
      console.log(`EVENT: tests\n${JSON.stringify(JSON.parse(existingFile))}`);
      this.step++;
      return;
    }

    const prompt = await (async () => {
      // Create a documentation string from all the library docs
      const libraryDocsString = Object.entries(this.docs)
        .map(
          ([library, doc]) => `
# ${library}
${doc}

`
        )
        .join("\n\n");

      const r: [string | RegExp, string][] = [];
      r.push([
        /{{REQUIREMENT}}/,
        `<requirement>\n${this.requirements}\n</requirement>`,
      ]);
      r.push([/{{CODE}}/, `<code>\n${this.code}\n</code>`]);
      r.push([
        /{{EXTERNAL_LIBRARIES}}/,
        `<external-libraries>\n${libraryDocsString}\n</external-libraries>`,
      ]);
      const file = "/prompts/8-test.md";
      const promptGenerator = new PromptGenerator(Deno.cwd() + file, r);
      return await promptGenerator.generatePrompt();
    })();

    const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(
      async () => {
        this.fileManager.log(
          `[Planning Step ${this.step}] Generate test cases`,
          true
        );

        await this.fileManager.save(this.step, "a", prompt, "test-prompt.md");
        const llmResponse = await this.llmModel.run(
          prompt,
          this.fileManager,
          undefined,
          "Generating Test Cases"
        );
        const promptResponse = llmResponse.message;
        await this.fileManager.save(
          this.step,
          "b",
          promptResponse,
          "raw-test-response.md"
        );

        return promptResponse.replace("undefined,", "null,");
      },
      "json",
      {
        isJSONArray: true,
        // Regex asumes its a string...
        // regex: [
        //     new RegExp("input"),
        //     new RegExp("output"),
        //     new RegExp("config"),
        // ]
      }
    );

    await this.fileManager.save(
      this.step,
      "c",
      parsedLLMResponse,
      "tests.json"
    );
    this.tests = JSON.parse(parsedLLMResponse);
    console.log(
      `EVENT: tests\n${JSON.stringify({
        tests: JSON.parse(parsedLLMResponse),
      })}`
    );
    this.step++;
  }

  private async logCompletion() {
    const end = Date.now();
    const time = end - this.startTime;
    await this.fileManager.log(
      `[Done] took ${time}ms (Tool Type: ${this.toolType})`,
      true
    );
    // await this.fileManager.log(`code available at ${this.fileManager.toolDir}/src`, true);
  }

  private async processFeedbackAnalysis(): Promise<
    "changes-requested" | "no-changes"
  > {
    const user_prompt = this.test.prompt;
    if (user_prompt === "") return "no-changes";
    if (!user_prompt) return "no-changes";

    const positive_responses = [
      "",
      "yes",
      "sure",
      "si",
      "Continue",
      "Cont",
      "C",
      "Go on",
      "Proceed",
      "Carry on",
      "Keep going",
      "Next",
      "N",
      "Yes",
      "OK",
      "Affirm",
      "Go ahead",
      "Press on",
      "Alright",
      "Affirm",
      "Go ahead",
      "Press on",
      "Resume",
      "Move forward",
      "All good",
    ].map((r) => r.toLowerCase());
    if (positive_responses.includes(user_prompt.toLowerCase())) {
      return "no-changes";
    }

    const prompt = await (async () => {
      const r: [string | RegExp, string][] = [];
      r.push([/{{FEEDBACK}}/, `<feedback>\n${user_prompt}\n</feedback>`]);
      const file =
        this.language === "typescript"
          ? "/prompts/3-feedback_analysis.md"
          : "/prompts/3-feedback_analysis-py.md";
      const promptGenerator = new PromptGenerator(Deno.cwd() + file, r);
      return await promptGenerator.generatePrompt();
    })();

    const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(
      async () => {
        this.fileManager.log(
          `[Planning Step ${this.step}] Feedback Analysis Prompt`,
          true
        );
        await this.fileManager.save(
          this.step,
          "a",
          prompt,
          "feedback-analysis-prompt.md"
        );
        const llmResponse = await this.llmModel.run(
          prompt,
          this.fileManager,
          undefined,
          "Analyzing User Feedback"
        );
        await this.fileManager.save(
          this.step,
          "b",
          llmResponse.message,
          "raw-feedback-analysis-response.md"
        );
        return llmResponse.message;
      },
      "json",
      {
        regex: [/"result"/],
      }
    );
    const analysisResult = JSON.parse(parsedLLMResponse);
    if (analysisResult.result === "changes-requested") {
      return "changes-requested";
    } else {
      return "no-changes";
    }
  }

  public async generateMCP() {
    // Only generate MCP config if toolType is 'mcp'
    if (this.toolType !== "mcp") {
      console.log("Skipping MCP generation as tool type is not MCP");
      return;
    }

    const srcPath = path.join(this.fileManager.toolDir, `src`);
    const mcp = await Deno.readTextFile(Deno.cwd() + "/templates/mcp.ts");
    const denojson = await Deno.readTextFile(
      Deno.cwd() + "/templates/deno.json"
    );
    Deno.writeTextFileSync(path.join(srcPath, "mcp.ts"), mcp);
    Deno.writeTextFileSync(path.join(srcPath, "deno.json"), denojson);
    const mcp_name = JSON.parse(this.metadata)
      .name.toLocaleLowerCase()
      .replace(/[^a-z0-9_]/g, "_");
    const markdown = `
# MCP Config
## CURSOR
deno -A ${path.normalize(srcPath)}/src/mcp.ts

## CLAUDE
"mcpServers": {
    "${mcp_name}": {
        "args": [
            "-A",
            "${path.normalize(srcPath)}/src/mcp.ts"
        ],
        "command": "deno"
    }
}
    `;
    console.log(JSON.stringify({ markdown }));
  }

  public async run(): Promise<{
    status: "COMPLETED" | "REQUEST_FEEDBACK" | "ERROR";
    code: string;
    metadata: string;
  }> {
    try {
      this.language = await this.fileManager.setLanguageIfNotSet(this.language);

      const state = await this.fileManager.loadState();
      if (state.exists && state.completed) {
        console.log(
          "EVENT: progress\n",
          JSON.stringify({ message: "Already completed" })
        );
        return {
          status: "COMPLETED",
          code: "",
          metadata: "",
        };
      }
      if (state.exists && state.feedback_expected === "requirements") {
        // Probably feedback. Let's check the current step.
        const feedbackAnalysis = await this.processFeedbackAnalysis();
        await this.fileManager.writeState({
          // completed: false,
          date: new Date().toISOString(),
          feedback_expected: "no",
        });
        this.test.plan_feedback = undefined;
        if (feedbackAnalysis === "changes-requested") {
          this.test.feedback = this.test.prompt;
        } else {
          this.test.feedback = undefined;
        }
      }

      if (state.exists && state.feedback_expected === "plan") {
        const feedbackAnalysis = await this.processFeedbackAnalysis();
        await this.fileManager.writeState({
          // completed: false,
          date: new Date().toISOString(),
          feedback_expected: "no",
        });
        this.test.feedback = undefined;
        if (feedbackAnalysis === "changes-requested") {
          this.test.plan_feedback = this.test.prompt;
        } else {
          this.test.plan_feedback = undefined;
        }
      }

      await this.initialize();
      await this.generateRequirements();

      if (this.test.feedback) {
        await this.processUserFeedback();
        if (!this.skipFeedback) {
          const req = this.requirements.replace(
            /# External Libraries[\s\S]*?# Example Input and Output/,
            "# Example Input and Output"
          );
          console.log(JSON.stringify({ markdown: req }));
          await new Promise((resolve) => setTimeout(resolve, 200));
          throw new Error("REQUEST_FEEDBACK");
        }
      } else {
        while (await this.fileManager.exists(this.step, "c", "feedback.md")) {
          this.requirements = await this.fileManager.load(
            this.step,
            "c",
            "feedback.md"
          );

          console.log(
            "EVENT: feedback\n",
            JSON.stringify({
              message: "Step " + this.step + " - Processing feedback",
            })
          );
          this.step++;
        }
      }
      await this.processInternalTools();

      await this.processLibrarySearch();
      await this.processPerplexitySearch();
      // await this.generatePlan();

      // if (this.test.plan_feedback) {
      //     await this.processUserPlanFeedback();
      //     const req = this.requirements.replace(/# External Libraries[\s\S]*?# Example Input and Output/, '# Example Input and Output');
      //     console.log(JSON.stringify({ markdown: req }));
      //     throw new Error('REQUEST_PLAN_FEEDBACK');
      // } else {
      //     while (await this.fileManager.exists(this.step, 'c', 'plan-feedback.md')) {
      //         this.plan = await this.fileManager.load(this.step, 'c', 'plan-feedback.md');

      //         console.log('EVENT: plan-feedback\n', JSON.stringify({ message: 'Step ' + this.step + ' - Processing plan feedback' }));
      //         this.step++;
      //     }
      // }

      await this.generateCode();
      let retries = 5;
      while (retries > 0) {
        const { warnings } = await this.checkGeneratedCode();
        if (!warnings) break;
        retries--;
      }
      console.log(`EVENT: code\n${JSON.stringify({ code: this.code })}`);

      const runMetadata = Deno.env.get("GENERATE_METADATA") === "true";
      if (runMetadata) {
        const metadataPipeline = new ShinkaiPipelineMetadata(
          this.code,
          this.language,
          this.test,
          this.llmModel,
          this.stream
        );
        const metadataResult = await metadataPipeline.run();
        this.metadata = metadataResult.metadata;
      }

      const runTests = Deno.env.get("GENERATE_TESTS") === "true";
      if (runTests) {
        await this.generateTests();
      }
      await this.fileManager.saveFinal(this.code, undefined);

      // await this.generateMCP();
      await this.logCompletion();

      return {
        code: this.code,
        status: "COMPLETED",
        metadata: this.metadata,
      };
    } catch (e) {
      if (
        e instanceof Error &&
        (e.message === "REQUEST_FEEDBACK" ||
          e.message === "REQUEST_PLAN_FEEDBACK")
      ) {
        await this.fileManager.writeState({
          date: new Date().toISOString(),
          feedback_expected:
            e.message === "REQUEST_FEEDBACK" ? "requirements" : "plan",
        });
        console.log("EVENT: request-feedback");
        // console.log(`EVENT: feedback\n${ JSON.stringify({ feedback: this.feedback }) }`);
        await new Promise((resolve) => setTimeout(resolve, 250));
        return {
          status: "REQUEST_FEEDBACK",
          code: "",
          metadata: "",
        };
      } else {
        console.log(String(e));
        await new Promise((resolve) => setTimeout(resolve, 250));
        return {
          status: "ERROR",
          code: "",
          metadata: "",
        };
      }
    }
  }
}
