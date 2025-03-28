import axios from "npm:axios";
import { Language } from "../../code-generation/src/ShinkaiPipeline/types.ts";

const shinkaiApiUrl = Deno.env.get("SHINKAI_API_URL");
const bearerToken = Deno.env.get("SHINKAI_BEARER_TOKEN");

if (!shinkaiApiUrl) {
  throw new Error("SHINKAI_API_URL is not set");
}
if (!bearerToken) {
  throw new Error("SHINKAI_BEARER_TOKEN is not set");
}

export type CheckCodeResponse = {
  success: boolean;
  warnings: string[];
};

export type CodeExecutionResponse = {
  // Define the response structure based on your API
  // This is a placeholder and should be updated with actual response fields
  success: boolean;
  result?: any;
  error?: string;
};

export type CodeExecutionConfig = {
  // Any additional configuration options
  [key: string]: any;
};

export class ShinkaiAPI {
  private shinkaiApiUrl: string;
  private bearerToken: string;
  constructor() {
    this.shinkaiApiUrl = shinkaiApiUrl!;
    this.bearerToken = bearerToken!;
  }

  public async executeCode(
    code: string,
    tools: string[] = [],
    tool_type: "pythondynamic" | "denodynamic",
    parameters: any = {},
    config: CodeExecutionConfig = {},
    llmProvider: string = "GET_FROM_CODE"
  ): Promise<CodeExecutionResponse> {
    const payload = {
      code,
      tools,
      tool_type,
      llm_provider: llmProvider,
      extra_config: config,
      parameters,
    };
    // console.log('[run payload]', payload);
    try {
      const response = await axios<CodeExecutionResponse>({
        method: "POST",
        url: `${this.shinkaiApiUrl}/v2/code_execution`,
        data: payload,
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
          "x-shinkai-tool-id": "no-name",
          "x-shinkai-app-id": "asset-test",
          "x-shinkai-llm-provider": llmProvider,
          "Content-Type": "application/json; charset=utf-8",
        },
      });

      return response.data;
    } catch (error: any) {
      const statusCode = error?.response?.status;
      const errorMessage = error?.response?.data?.message || error?.message;
      const errorDetails =
        error?.response?.data?.details || error?.response?.data;

      console.error("Code execution failed:", {
        status: statusCode,
        message: errorMessage,
        details: errorDetails,
      });

      return {
        success: false,
        error: JSON.stringify({
          status: statusCode,
          message: errorMessage,
          details: errorDetails,
        }),
      };
    }
  }

  public async checkCode(
    language: Language,
    code: string,
    additional_headers: Record<string, string> = {}
  ): Promise<CheckCodeResponse> {
    const response = await axios<CheckCodeResponse>({
      method: "POST",
      url: `${this.shinkaiApiUrl}/v2/tool_check`,
      data: {
        language,
        code,
        additional_headers,
      },
      headers: {
        Authorization: `Bearer ${this.bearerToken}`,
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    // TODO: THIS ONLY WORKS FOR MACOS PATHS
    // To make this deterministic, we clean up the path
    // Users/edwardalvarado/shinkai-node-5/shinkai-tools-runner-execution-storage/QcpZYci8uR1TQKPn_03fV/code/UOYXdGAGCx7q1xeZ0LDsZ-tk0pO4Y0rcvFPb7pYdYTc/index.ts:4:25
    // We want to only leave the ./index.ts:4:25
    response.data.warnings = response.data.warnings.map((warning) =>
      warning.replace(
        /Users\/[a-zA-Z0-9_\/-]+?\/code\/[a-zA-Z0-9_-]+?\//g,
        "./"
      )
    );

    return response.data;
  }
}
