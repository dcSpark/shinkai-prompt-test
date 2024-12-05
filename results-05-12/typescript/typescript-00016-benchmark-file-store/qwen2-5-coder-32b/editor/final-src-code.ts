
  // These environment variables are required, before any import.
  // Do not remove them, as they set environment variables for the Shinkai Tools.
  Deno.env.set('SHINKAI_NODE_LOCATION', "http://localhost:9950");
  Deno.env.set('BEARER', "debug");
  Deno.env.set('X_SHINKAI_TOOL_ID', "tool-id-debug");
  Deno.env.set('X_SHINKAI_APP_ID', "tool-app-debug");
  Deno.env.set('X_SHINKAI_LLM_PROVIDER', "o_qwen2_5_coder_32b");
  Deno.env.set('HOME', "results/typescript/typescript-00016-benchmark-file-store/qwen2-5-coder-32b/editor/home");
  Deno.env.set('MOUNT', "results/typescript/typescript-00016-benchmark-file-store/qwen2-5-coder-32b/editor/mount");
  Deno.env.set('ASSETS', "results/typescript/typescript-00016-benchmark-file-store/qwen2-5-coder-32b/editor/assets");
  
import { getHomePath } from './shinkai-local-support.ts';

type CONFIG = {};
type INPUTS = { url: string };
type OUTPUT = { filePath: string };

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
  const response = await fetch(inputs.url);
  if (!response.ok) {
    throw new Error(`Failed to download image from ${inputs.url}`);
  }
  const data = await response.arrayBuffer();
  const filePath = `${getHomePath()}/downloaded_image.png`;
  await Deno.writeFile(filePath, new Uint8Array(data));
  return { filePath };
}

  
  // console.log('Running...')
  // console.log('Config: {}')
  // console.log('Inputs: {"url":"https://raw.githubusercontent.com/acedward/expert-octo-computing-machine/main/screenshot.png"}')
  
  try {
    const program_result = await run({}, {"url":"https://raw.githubusercontent.com/acedward/expert-octo-computing-machine/main/screenshot.png"});
    if (program_result) console.log(JSON.stringify(program_result, null, 2));
    else console.log(program_result);
  } catch (e) {
    console.log('::ERROR::', e);
  }

