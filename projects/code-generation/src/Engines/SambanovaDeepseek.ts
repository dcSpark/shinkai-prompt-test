import axios, { AxiosError } from "npm:axios";
import { FileManager } from "../ShinkaiPipeline/FileManager.ts";
import { BaseEngine } from "./BaseEngine.ts";
import { countTokensFromMessageLlama3, hashString, Payload } from "./index.ts";

export interface DeepseekConfig {
  apiKey: string | undefined;
  model?: string;
  systemPrompt?: string;
  apiUrl?: string;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface SambanovaDeepseekPayload {
  model: string;
  messages: Message[];
  temperature: number;
  // stream: boolean;
  reasoning_effort?: string;
}
interface SambanovaDeepseekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
      refusal: null;
      reasoning_content?: string;
    };
    logprobs: null;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details: {
      cached_tokens: number;
      audio_tokens: number;
    };
    completion_tokens_details: {
      reasoning_tokens: number;
      audio_tokens: number;
      accepted_prediction_tokens: number;
      rejected_prediction_tokens: number;
    };
  };
  service_tier: string;
  system_fingerprint: string;
}

export class SambanovaDeepseekService extends BaseEngine {
  private apiKey: string;
  private systemPrompt: string;
  private apiUrl: string;
  private lastRequestBody: any;

  constructor(
    config: { model: string; apiUrl?: string; systemPrompt?: string },
    priceInputTokens: number,
    priceOutputTokens: number
  ) {
    super(
      config.model || "DeepSeek-V3-0324",
      priceInputTokens,
      priceOutputTokens
    );
    if (!Deno.env.get("SAMBANOVA_API_KEY")) {
      throw new Error("Sambanova API key is not configured");
    }
    this.apiKey = Deno.env.get("SAMBANOVA_API_KEY") || "";
    this.systemPrompt =
      config.systemPrompt ||
      "You are a helpful code generator. Provide only code without explanation unless requested.";
    this.apiUrl =
      config.apiUrl || "https://api.sambanova.ai/v1/chat/completions";
  }

  getLastRequestBody(): any {
    return this.lastRequestBody;
  }

  async run(
    prompt: string,
    logger: FileManager | undefined,
    payloadHistory: Payload | undefined,
    thinkingAbout?: string
  ): Promise<{ message: string; metadata: Payload }> {
    try {
      const start = Date.now();
      let payload = payloadHistory
        ? this.addToDeepseekPayload(prompt, "user", payloadHistory)
        : this.newDeepseekPayload(prompt);

      const tokenCount = countTokensFromMessageLlama3(JSON.stringify(payload));

      const contextMessage = thinkingAbout || "Processing";
      logger?.log(
        `[Thinking] AI Thinking About ${contextMessage} ${tokenCount}[tokens]`
      );
      const data = {
        url: this.apiUrl,
        method: "POST",
        data: payload,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      };
      logger?.save(
        1000,
        `${new Date().getTime()}-${tokenCount}`,
        JSON.stringify(payload, null, 2),
        "json"
      );
      // logger?.save(999, 'payload-' + new Date().toISOString(), JSON.stringify(payload, null, 2), 'json');
      const payloadString = JSON.stringify(payload, null, 2);
      const hashedFilename =
        (await hashString(payloadString)) + "-" + tokenCount + ".json";
      const cachedPayload = await logger?.loadCache(hashedFilename);
      let responseData: SambanovaDeepseekResponse | null = null;
      if (cachedPayload) {
        logger?.log(`[Cache] Found cached payload ${hashedFilename}`);
        responseData = JSON.parse(cachedPayload);
        const allOutput =
          responseData!.choices[0].message.content +
          (responseData!.choices[0].message.reasoning_content || "");
        await this.addFreeCost(logger, payloadString, allOutput);
      } else {
        const response = await axios<SambanovaDeepseekResponse>(data);
        responseData = response.data;
        logger?.saveCache(
          hashedFilename,
          JSON.stringify(responseData, null, 2)
        );
        const allOutput =
          responseData!.choices[0].message.content +
          (responseData!.choices[0].message.reasoning_content || "");
        await this.addCost(logger, payloadString, allOutput);
      }

      const end = Date.now();
      const time = end - start;
      // const prompt_short = prompt.substring(0, 50) + "..." + prompt.substring(prompt.length - 50);
      logger?.log(
        `[Thinking] AI took ${time}[ms] to process ${contextMessage}`
      );
      payload = this.addToDeepseekPayload(
        responseData!.choices[0].message.content,
        "assistant",
        payload
      );

      const message = responseData!.choices[0].message.content?.replace(
        /<think>[\s\S]*?<\/think>/g,
        ""
      );
      return {
        message,
        metadata: payload,
      };
    } catch (error) {
      console.error("Error generating code with Deepseek:", error);

      // Handle Deepseek API errors
      if (error instanceof Error) {
        // Handle axios errors
        if (error instanceof AxiosError && error.response) {
          const status = error.response.status;
          const data = error.response.data as { error?: string };

          // Handle specific HTTP status codes
          switch (status) {
            case 401:
              throw new Error(
                "Deepseek authentication failed. Please check your API key configuration."
              );
            case 429:
              throw new Error(
                "Deepseek API rate limit exceeded. Please try again later."
              );
            case 400:
              throw new Error(
                `Deepseek API request error: ${data?.error || error.message}`
              );
            case 500:
              throw new Error(
                "Deepseek API server error. Please try again later."
              );
            default:
              throw new Error(
                `Deepseek API error (${status}): ${
                  data?.error || error.message
                }`
              );
          }
        }

        // Handle network errors
        if (
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("ENOTFOUND")
        ) {
          throw new Error(
            "Could not connect to Deepseek API. Please check your network connection and API URL configuration."
          );
        }

        // Pass through the original error message for other cases
        throw new Error(`Deepseek API error: ${error.message}`);
      }

      // Handle unknown errors
      throw new Error(
        "An unexpected error occurred while generating code with Deepseek"
      );
    }
  }

  private addToDeepseekPayload(
    prompt: string,
    role: Message["role"],
    payload: SambanovaDeepseekPayload
  ): SambanovaDeepseekPayload {
    payload.messages.push({
      role: role,
      content: prompt,
    });
    return payload;
  }

  private newDeepseekPayload(prompt: string): SambanovaDeepseekPayload {
    const payload: SambanovaDeepseekPayload = {
      model: this.name,
      temperature: 0.5, // default is 1.0
      messages: [
        {
          role: "system",
          content: this.systemPrompt,
        },
      ],
      // stream: false,
    };
    return this.addToDeepseekPayload(prompt, "user", payload);
  }
}
