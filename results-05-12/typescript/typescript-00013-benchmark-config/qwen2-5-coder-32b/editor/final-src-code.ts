
  // These environment variables are required, before any import.
  // Do not remove them, as they set environment variables for the Shinkai Tools.
  Deno.env.set('SHINKAI_NODE_LOCATION', "http://localhost:9950");
  Deno.env.set('BEARER', "debug");
  Deno.env.set('X_SHINKAI_TOOL_ID', "tool-id-debug");
  Deno.env.set('X_SHINKAI_APP_ID', "tool-app-debug");
  Deno.env.set('X_SHINKAI_LLM_PROVIDER', "o_qwen2_5_coder_32b");
  Deno.env.set('HOME', "results/typescript/typescript-00013-benchmark-config/qwen2-5-coder-32b/editor/home");
  Deno.env.set('MOUNT', "results/typescript/typescript-00013-benchmark-config/qwen2-5-coder-32b/editor/mount");
  Deno.env.set('ASSETS', "results/typescript/typescript-00013-benchmark-config/qwen2-5-coder-32b/editor/assets");
  
import { getHomePath } from './shinkai-local-support.ts';

type CONFIG = {
  api_key: string;
};

type INPUTS = {
  prompt: string;
};

type OUTPUT = {
  response: any;
};

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.api_key}`,
  };
  const body = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: inputs.prompt }]
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: body
  });

  return { response: await response.json() };
}

  
  // console.log('Running...')
  // console.log('Config: {"api_key":""}')
  // console.log('Inputs: {"prompt":"2 + 2 = ?"}')
  
  try {
    const program_result = await run({"api_key":""}, {"prompt":"2 + 2 = ?"});
    if (program_result) console.log(JSON.stringify(program_result, null, 2));
    else console.log(program_result);
  } catch (e) {
    console.log('::ERROR::', e);
  }

