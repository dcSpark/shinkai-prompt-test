const shinkaiApiUrl = Deno.env.get("SHINKAI_API_URL") ??
  "http://localhost:9950";

import axios from "npm:axios";
import { Language, TestData } from "../types.ts";
import { BaseEngine } from "../llm-engine/BaseEngine.ts";
import { Paths } from "../paths.ts";

export function tool_router_key(test: TestData) {
  const code = test.code.replace(/[^a-zA-Z0-9]/g, "_");
  return `local:::${code}_test_engine:::${code}`;
}

async function delete_if_exists(test: TestData) {
  const key = tool_router_key(test);
  console.log(`    [Delete] ${key}`);
  const url = `${shinkaiApiUrl}/v2/remove_playground_tool`;
  try {
    await axios({
      url,
      method: "delete",
      params: { tool_key: key },
      headers: { Authorization: `Bearer ${Deno.env.get("BEARER") ?? "debug"}` },
    });
  } catch { /* ignore */ }
}

export async function save_tool(
  language: Language,
  test: TestData,
  model: BaseEngine,
) {
  try {
    await delete_if_exists(test);
    const metadata = JSON.parse(
      await Deno.readTextFile(Paths.srcMetadata(language, test, model)),
    );
    const body = {
      metadata: {
        ...metadata,
        name: test.code.replace(/[^a-zA-Z0-9]/g, "_"),
        author: "test_engine",
      },
      job_id: `id_${test.id}`,
      job_id_history: [],
      code: await Deno.readTextFile(Paths.finalSrcCode(language, test, model)),
    };

    const response = await axios({
      url: `${shinkaiApiUrl}/v2/set_playground_tool`,
      method: "post",
      data: body,
      headers: { Authorization: `Bearer ${Deno.env.get("BEARER") ?? "debug"}` },
    });
    return response.data.metadata.tool_router_key;
    // deno-lint-ignore no-explicit-any
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
    }
    console.log(error.config);
  }
}
