import { BaseEngine } from "../Engines/BaseEngine.ts";
import { FileManager } from "./FileManager.ts";
import { LLMFormatter } from "./LLMFormatter.ts";
import { Requirement } from "./Requirement.ts";
import { getHeaders } from "./support.ts";
import { Language } from "./types.ts";

export class ShinkaiPipelineMetadata {
  // Setup in constructor
  private fileManager: FileManager;
  private llmFormatter: LLMFormatter;

  // State machine step
  private step: number = 14000;

  // Internal tools
  // TODO: Workardoun to get the tool list.
  // We should get this from the node.
  private internalToolsJSON: string[] = [
    "local:::__official_shinkai:::shinkai_typescript_unsafe_processor",
    "local:::__official_shinkai:::shinkai_llm_map_reduce_processor",
    "local:::__official_shinkai:::shinkai_llm_prompt_processor",
    "local:::__official_shinkai:::shinkai_sqlite_query_executor",
    "local:::__official_shinkai:::shinkai_process_embeddings",
    "local:::__official_shinkai:::shinkai_tool_config_updater",
    "local:::__official_shinkai:::coinbase_balance_getter",
    "local:::__official_shinkai:::x_twitter_post",
    "local:::__official_shinkai:::math_expression_evaluator",
    "local:::__official_shinkai:::duckduckgo_search",
    "local:::__official_shinkai:::memory_management",
    "local:::__official_shinkai:::write_file_contents",
    "local:::__official_shinkai:::email_answerer",
    "local:::__official_shinkai:::meme_generator",
    "local:::__official_shinkai:::coinbase_wallet_creator",
    "local:::__official_shinkai:::perplexity",
    "local:::__official_shinkai:::update_file_with_prompt",
    "local:::__official_shinkai:::youtube_transcript_summarizer",
    "local:::__official_shinkai:::smart_search_engine",
    "local:::__official_shinkai:::email_fetcher",
    "local:::__official_shinkai:::x_twitter_search",
    "local:::__official_shinkai:::read_file_contents",
    "local:::__official_shinkai:::coinbase_my_address_getter",
    "local:::__official_shinkai:::coinbase_transaction_sender",
    "local:::__official_shinkai:::coinbase_transactions_getter",
    "local:::__official_shinkai:::send_email",
    "local:::__official_shinkai:::download_pages",
    "local:::__official_shinkai:::coinbase_faucet_caller",
    "local:::__official_shinkai:::google_search",
    "local:::__official_shinkai:::perplexity_api",
  ];

  // Generated code
  private metadata: string = "";

  // Start time
  private startTime: number;

  private headers_found: boolean = false;
  private shinkaiLocalTools_headers: string = "";
  private shinkaiLocalTools_libraryCode: string = "";
  private shinkaiLocalTools_toolRouterKeys: {
    functionName: string;
    toolRouterKey: string;
    code: string;
  }[] = [];
  private shinkaiLocalSupport_headers: string = "";

  constructor(
    private code: string,
    private language: Language,
    private test: Requirement,
    private llmModel: BaseEngine,
    private stream: boolean
  ) {
    this.fileManager = new FileManager(language, test.code, stream);
    this.llmFormatter = new LLMFormatter(this.fileManager);
    this.startTime = Date.now();
  }

  private async initialize() {
    const completeShinkaiPrompts = getHeaders();

    if (this.language === "typescript") {
      this.shinkaiLocalSupport_headers =
        completeShinkaiPrompts.typescript.headers["shinkai-local-support"];
      if (
        await this.fileManager.exists(20001, "tool_headers", "tool_headers.ts")
      ) {
        this.headers_found = true;
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
        this.headers_found = true;
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
      `🔨 Starting Code Generation for #[${this.test.id}] ${this.test.code} @ ${this.language}`,
      true
    );
  }

  private async generateMetadata() {
    // Check if output file exists
    if (await this.fileManager.exists(this.step, "c", "metadata.json")) {
      await this.fileManager.log(` Step ${this.step} - Metadata `, true);
      const m = await this.fileManager.load(this.step, "c", "metadata.json");
      this.metadata = m;
      this.step++;
      return;
    }

    const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(
      async () => {
        this.fileManager.log(
          `[Planning Step ${this.step}] Generate the metadata`,
          true
        );

        let metadataPrompt = Deno.readTextFileSync(
          Deno.cwd() + "/prompts/9-metadata.md"
        );

        if (!this.headers_found) {
          metadataPrompt = metadataPrompt.replace(
            /<available_tools>\n\n<\/available_tools>/,
            `<available_tools>${this.internalToolsJSON.join(
              "\n"
            )}</available_tools>`
          );
        } else {
          const trks: string[] = this.shinkaiLocalTools_toolRouterKeys.map(
            (t) => t.toolRouterKey
          );
          if (Deno.env.get("DEBUG") === "true") {
            console.log({
              message: "[DEBUG] Found tool router keys",
              trks: trks.join(","),
            });
          }
          metadataPrompt = metadataPrompt.replace(
            /<available_tools>\n\n<\/available_tools>/,
            `<available_tools>${trks.join("\n")}</available_tools>`
          );
        }

        metadataPrompt = metadataPrompt.replace(
          /<input_command>\n\n<\/input_command>/,
          `<input_command>${this.code}</input_command>`
        );

        const llmResponse = await this.llmModel.run(
          metadataPrompt,
          this.fileManager,
          undefined,
          "Generating Tool Metadata"
        );
        const promptResponse = llmResponse.message;
        await this.fileManager.save(
          this.step,
          "a",
          metadataPrompt,
          "metadata.md"
        );
        await this.fileManager.save(
          this.step,
          "b",
          promptResponse,
          "raw-metadata-response.md"
        );
        return promptResponse;
      },
      "json",
      {
        regex: [
          new RegExp("name"),
          new RegExp("configurations"),
          new RegExp("parameters"),
          new RegExp("result"),
        ],
      }
    );
    this.metadata = parsedLLMResponse;
    await this.fileManager.save(this.step, "c", this.metadata, "metadata.json");
    this.step++;
  }

  public async run() {
    if (!this.code) {
      return {
        status: "ERROR: Missing code",
        code: "",
        metadata: "",
      };
    }
    try {
      await this.generateMetadata();
      await this.fileManager.saveFinal(undefined, this.metadata);

      return { metadata: this.metadata };
    } catch (e) {
      console.log(String(e));
      return {
        status: "ERROR",
        code: "",
        metadata: "",
      };
    }
  }
}
