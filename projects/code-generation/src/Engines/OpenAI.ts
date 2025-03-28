import axios from "npm:axios";
import { FileManager } from "../ShinkaiPipeline/FileManager.ts";
import { BaseEngine } from "./BaseEngine.ts";
import { countTokensFromMessageLlama3, hashString } from "./index.ts";
const OPEN_AI_KEY = Deno.env.get("OPEN_AI_KEY");

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: {
    type: "text";
    text: string;
  }[];
}

export interface OpenAIPayload {
  model: string;
  messages: OpenAIMessage[];
  // stream: boolean;
  reasoning_effort?: string;
}
interface OpenAIResponse {
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

export class OpenAI extends BaseEngine {
  override async run(
    prompt: string,
    logger: FileManager | undefined,
    payloadHistory: OpenAIPayload | undefined,
    thinkingAbout?: string
  ): Promise<{ message: string; metadata: OpenAIPayload }> {
    const start = Date.now();
    let payload = payloadHistory
      ? this.addToOpenAIPayload(prompt, "user", payloadHistory)
      : this.newOpenAIPayload(prompt);
    if (!OPEN_AI_KEY) {
      throw new Error("OPEN_AI_KEY is not set");
    }

    if (this.name === "o3-mini") {
      payload.reasoning_effort = "low";
    }

    const tokenCount = countTokensFromMessageLlama3(JSON.stringify(payload));
    const contextMessage = thinkingAbout || "Processing";
    logger?.log(
      `[Thinking] AI Thinking About ${contextMessage} ${tokenCount}[tokens]`
    );
    const data = {
      url: `https://api.openai.com/v1/chat/completions`,
      method: "POST",
      data: payload,
      headers: {
        Authorization: `Bearer ${OPEN_AI_KEY}`,
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
    let responseData: OpenAIResponse | null = null;
    if (cachedPayload) {
      logger?.log(`[Cache] Found cached payload ${hashedFilename}`);
      responseData = JSON.parse(cachedPayload);
      await this.addFreeCost(
        logger,
        payloadString,
        responseData!.choices[0].message.content
      );
    } else {
      const response = await axios<OpenAIResponse>(data);
      responseData = response.data;
      logger?.saveCache(hashedFilename, JSON.stringify(responseData, null, 2));
      await this.addCost(
        logger,
        payloadString,
        responseData!.choices[0].message.content
      );
    }

    const end = Date.now();
    const time = end - start;
    // const prompt_short = prompt.substring(0, 50) + "..." + prompt.substring(prompt.length - 50);
    logger?.log(`[Thinking] AI took ${time}[ms] to process ${contextMessage}`);
    payload = this.addToOpenAIPayload(
      responseData!.choices[0].message.content,
      "assistant",
      payload
    );
    return {
      message: responseData!.choices[0].message.content,
      metadata: payload,
    };
  }

  private addToOpenAIPayload(
    prompt: string,
    role: OpenAIMessage["role"],
    payload: OpenAIPayload
  ): OpenAIPayload {
    payload.messages.push({
      role: role,
      content: [{ type: "text", text: prompt }],
      // content: prompt
    });
    return payload;
  }

  private newOpenAIPayload(prompt: string): OpenAIPayload {
    const payload: OpenAIPayload = {
      model: this.name,
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: "You are a very helpful assistant. You may be provided with documents or content to analyze and answer questions about them, in that case refer to the content provided in the user message for your responses.",
            },
          ],
        },
      ],
      // stream: false,
    };
    return this.addToOpenAIPayload(prompt, "user", payload);
  }
}
