import { DeepseekPayload, DeepseekService } from "./Deepseek.ts";
import { OllamaEngine, OllamaPayload } from "./Ollama.ts";
import { OpenAI, OpenAIPayload } from "./OpenAI.ts";
import { PerplexityEngine, PerplexityPayload } from "./Perplexity.ts";
import {
  SambanovaDeepseekPayload,
  SambanovaDeepseekService,
} from "./SambanovaDeepseek.ts";

export type Payload =
  | OllamaPayload
  | OpenAIPayload
  | PerplexityPayload
  | DeepseekPayload
  | SambanovaDeepseekPayload;

function getModel(model: string | undefined) {
  switch (model) {
    case "deepseek-reasoner":
      return getDeepSeekReasoner();
    case "deepseek-chat":
      return getDeepSeekChat();
    case "o3-mini":
      return getOpenAIO3Mini();
    case "gpt-4o-mini":
      return getOpenAI4OMini();
    case "gpt-4o":
      return getOpenAIO4();
    case "llama3.1":
      return getLlama318bInstruct();
    case "DeepSeek-R1":
      return getSambanovaDeepSeekR1();
    case "DeepSeek-V3-0324":
      return getSambanovaDeepSeekV3();
    default:
      throw new Error(`Unknown model: ${model}`);
  }
}

export function getModelSmall() {
  const model = Deno.env.get("MODEL_SMALL");
  if (!model) {
    throw new Error("MODEL_SMALL is not set");
  }
  return getModel(model);
}

export function getModelLarge() {
  const model = Deno.env.get("MODEL_LARGE");
  if (!model) {
    throw new Error("MODEL_LARGE is not set");
  }
  return getModel(model);
}

export function getPerplexity() {
  return new PerplexityEngine("sonar-reasoning", 1, 5);
}

function getLlama318bInstruct() {
  return new OllamaEngine("llama3.1:8b-instruct-q4_1", 0, 0);
}

function getDeepSeekReasoner() {
  return new DeepseekService({ model: "deepseek-reasoner" }, 0.55, 2.19);
}

function getDeepSeekChat() {
  return new DeepseekService({ model: "deepseek-chat" }, 0.27, 1.1);
}

function getSambanovaDeepSeekR1() {
  return new SambanovaDeepseekService({ model: "DeepSeek-R1" }, 5, 7);
}

function getSambanovaDeepSeekV3() {
  return new SambanovaDeepseekService({ model: "DeepSeek-V3-0324" }, 1, 1.5);
}

function getOpenAIO3Mini() {
  return new OpenAI("o3-mini", 1.1, 4.4);
}

function getOpenAI4OMini() {
  return new OpenAI("gpt-4o-mini", 0.15, 0.6);
}

function getOpenAIO4() {
  return new OpenAI("gpt-4o", 2.5, 10.0);
}

export function countTokensFromMessageLlama3(message: string): number {
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

// SHA-256 hash function using Web Crypto API
export async function hashString(str: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
