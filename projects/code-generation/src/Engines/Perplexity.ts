import axios from "npm:axios";
import { FileManager } from "../ShinkaiPipeline/FileManager.ts";
import { BaseEngine } from "./BaseEngine.ts";
import { countTokensFromMessageLlama3, hashString } from "./index.ts";
import { OllamaMessage, OllamaPayload } from "./Ollama.ts";

const ollamaApiUrl = Deno.env.get("OLLAMA_API_URL");

type PerplexityResponse = any;
export type PerplexityPayload = any;

export interface PerplexityMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");

export class PerplexityEngine extends BaseEngine {
  override async run(
    prompt: string,
    logger: FileManager | undefined = undefined,
    payloadHistory: PerplexityPayload | undefined = undefined,
    thinkingAbout?: string
  ): Promise<{ message: string; metadata: PerplexityPayload }> {
    const start = Date.now();

    if (!perplexityApiKey) throw new Error("Missing PERPLEXITY_API_KEY");

    const payload = {
      model: this.name,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      return_related_questions: false,
      web_search_options: {
        search_context_size: "medium",
      },
      stream: false,
      return_images: false,
    };
    const payloadString = JSON.stringify(payload);
    const tokenCount = countTokensFromMessageLlama3(payloadString);
    const contextMessage = thinkingAbout || "Processing";
    logger?.log(
      `[Thinking] AI Thinking About ${contextMessage} ${tokenCount}[tokens]`
    );
    logger?.save(
      1000,
      `${new Date().getTime()}-${tokenCount}`,
      JSON.stringify(payload, null, 2),
      "json"
    );

    const hashedFilename =
      (await hashString(payloadString)) + "-" + tokenCount + ".json";
    const cachedPayload = await logger?.loadCache(hashedFilename);

    let responseData: PerplexityResponse | null = null;
    if (cachedPayload) {
      logger?.log(`[Cache] Found cached payload ${hashedFilename}`);
      responseData = JSON.parse(cachedPayload);
      await this.addFreeCost(
        logger,
        payloadString,
        responseData.choices[0].message.content
      );
    } else {
      // NOTE: Chat history not implemented.
      if (payloadHistory) throw new Error("payloadHistory NYI");
      const data = {
        url: `https://api.perplexity.ai/chat/completions`,
        method: "POST",
        data: payload,
        headers: {
          Authorization: `Bearer ${perplexityApiKey}`,
        },
      };
      const response = await axios<PerplexityResponse>(data);
      responseData = response.data;
      logger?.saveCache(hashedFilename, JSON.stringify(responseData, null, 2));
      await this.addCost(
        logger,
        payloadString,
        responseData.choices[0].message.content
      );
    }

    const end = Date.now();
    const time = end - start;
    logger?.log(
      `[Thinking] Ollama took ${time}ms to process ${contextMessage}`.replace(
        /\n/g,
        " "
      )
    );

    return {
      message: responseData.choices[0].message.content,
      metadata: responseData,
    };
  }

  public static async fetchModels(): Promise<string[]> {
    const response = await axios<{ models: { model: string }[] }>({
      url: `${ollamaApiUrl}/api/tags`,
      method: "GET",
    });
    return response.data.models
      .filter((m) => !m.model.startsWith("snowflake-arctic"))
      .map((m) => m.model);
  }

  // Ollama specific methods\
  private addToOllamaPayload(
    prompt: string,
    role: OllamaMessage["role"],
    payload: OllamaPayload
  ): OllamaPayload {
    payload.messages.push({
      role: role,
      content: prompt,
    });
    return payload;
  }

  private newOllamaPayload(prompt: string): OllamaPayload {
    const payload: OllamaPayload = {
      model: this.name,
      messages: [
        {
          role: "system",
          content:
            "You are a very helpful assistant. You may be provided with documents or content to analyze and answer questions about them, in that case refer to the content provided in the user message for your responses.",
        },
      ],
      options: {
        num_ctx: 26000,
      },
      stream: false,
    };
    return this.addToOllamaPayload(prompt, "user", payload);
  }
}
