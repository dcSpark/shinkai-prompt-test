
  // These environment variables are required, before any import.
  // Do not remove them, as they set environment variables for the Shinkai Tools.
  Deno.env.set('SHINKAI_NODE_LOCATION', "http://localhost:9950");
  Deno.env.set('BEARER', "debug");
  Deno.env.set('X_SHINKAI_TOOL_ID', "tool-id-debug");
  Deno.env.set('X_SHINKAI_APP_ID', "tool-app-debug");
  Deno.env.set('X_SHINKAI_LLM_PROVIDER', "o_qwen2_5_coder_32b");
  Deno.env.set('HOME', "results/typescript/typescript-00018-benchmark-basic-tool/qwen2-5-coder-32b/editor/home");
  Deno.env.set('MOUNT', "results/typescript/typescript-00018-benchmark-basic-tool/qwen2-5-coder-32b/editor/mount");
  Deno.env.set('ASSETS', "results/typescript/typescript-00018-benchmark-basic-tool/qwen2-5-coder-32b/editor/assets");
  
import { shinkaiFoobar } from './shinkai-local-tools.ts';

type CONFIG = {};
type INPUTS = {};
type OUTPUT = {
  message: string;
};

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
    const response = await shinkaiFoobar("Sample message for foobar tool");
    return {
        message: response.message
    };
}

  
  // console.log('Running...')
  // console.log('Config: {}')
  // console.log('Inputs: {}')
  
  try {
    const program_result = await run({}, {});
    if (program_result) console.log(JSON.stringify(program_result, null, 2));
    else console.log(program_result);
  } catch (e) {
    console.log('::ERROR::', e);
  }

