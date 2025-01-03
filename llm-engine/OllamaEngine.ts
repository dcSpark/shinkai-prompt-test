import axios from "npm:axios";
import { BaseEngine } from "./BaseEngine.ts";

const ollamaApiUrl = Deno.env.get("OLLAMA_API_URL") ?? "http://localhost:11434";

export class OllamaEngine extends BaseEngine {
  override async run(prompt: string): Promise<string> {
    const start = Date.now();
    const payload = this.payload(prompt);
    const response = await axios({
      url: `${ollamaApiUrl}/api/chat`,
      method: "POST",
      data: JSON.stringify(payload),
    });
    const end = Date.now();
    console.log(
      `    [Benchmark] Ollama took ${end - start}ms for ${
        prompt.substring(0, 100)
      } ... ${prompt.substring(prompt.length - 100)}`.replace(/\n/g, " "),
    );
    return response.data.message.content;
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

  static override async getInstalledModels(): Promise<BaseEngine[]> {
    try {
      const models = await this.fetchModels();
      return models.map((m) => new OllamaEngine(m));
    } catch (e) {
      console.log("Error:", (e as Error).message);
      console.log(`Ollama is not running at ${ollamaApiUrl}`);
      return [];
    }
  }

  // Ollama specific methods
  private payload(prompt: string) {
    return {
      "model": this.name,
      "messages": [
        {
          "role": "system",
          "content":
            "You are a very helpful assistant. You may be provided with documents or content to analyze and answer questions about them, in that case refer to the content provided in the user message for your responses.",
        },
        {
          "role": "user",
          "content": prompt,
          "images": [],
        },
      ],
      "options": {
        // "num_ctx": 104901
        "num_ctx": 20000,
      },
      "stream": false,
    };
  }
}
