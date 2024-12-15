import axios from "npm:axios";
import { BaseEngine } from "../llm-engine/BaseEngine.ts";
import { Language, TestData } from "../types.ts";
import { Paths } from "../paths.ts";

const shinkaiApiUrl = Deno.env.get("SHINKAI_API_URL") ??
  "http://localhost:9950";

export async function getAllToolsHeaders(): Promise<{
  "shinkai-local-support": string;
  "shinkai-local-tools": string;
}> {
  const response1 = await axios({
    method: "GET",
    url: `${shinkaiApiUrl}/v2/get_tool_implementation_prompt`,
    params: {
      language: "typescript",
      tools: [],
    },
    headers: {
      Authorization: `Bearer ${Deno.env.get("BEARER") ?? "debug"}`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  const { availableTools } = response1.data;

  const response2 = await axios({
    method: "GET",
    url: `${shinkaiApiUrl}/v2/get_tool_implementation_prompt`,
    params: {
      language: "typescript",
      tools: availableTools.join(","),
    },
    headers: {
      Authorization: `Bearer ${Deno.env.get("BEARER") ?? "debug"}`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  const { headers } = response2.data;

  return headers;
}

export async function getToolImplementationPrompt(
  language: Language,
  test: TestData,
  code: string,
  model: BaseEngine,
): Promise<void> {
  const response = await axios({
    method: "GET",
    url: `${shinkaiApiUrl}/v2/get_tool_implementation_prompt`,
    params: {
      language,
      code,
      tools: test.tools.join(","),
    },
    headers: {
      Authorization: `Bearer ${Deno.env.get("BEARER") ?? "debug"}`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  const { codePrompt, libraryCode, metadataPrompt } = response.data;

  for (
    const [fileName, code] of Object.entries(
      libraryCode as Record<string, string>,
    )
  ) {
    if (!test.supportFiles) test.supportFiles = [];
    test.supportFiles?.push({ fileName, path: Paths.shinkaiLocalFile(language, test, model, false, fileName) });
    // Write the library code in the root and in the editor folder
    await Deno.writeTextFile(
      Paths.shinkaiLocalFile(language, test, model, false, fileName),
      code,
    );
    await Deno.writeTextFile(
      Paths.shinkaiLocalFile(language, test, model, true, fileName),
      code,
    );
  }

  await Deno.writeTextFile(
    Paths.createMetadata(language, test, model),
    metadataPrompt,
  );
  await Deno.writeTextFile(
    Paths.createTool(language, test, model),
    codePrompt,
  );
  console.log(
    `    [Shinkai] Fetched prompts & ${test.tools.length} tool${
      test.tools.length === 1 ? "" : "s"
    } for ${language}`,
  );
}
