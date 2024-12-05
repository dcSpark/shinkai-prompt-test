
  // These environment variables are required, before any import.
  // Do not remove them, as they set environment variables for the Shinkai Tools.
  Deno.env.set('SHINKAI_NODE_LOCATION', "http://localhost:9950");
  Deno.env.set('BEARER', "debug");
  Deno.env.set('X_SHINKAI_TOOL_ID', "tool-id-debug");
  Deno.env.set('X_SHINKAI_APP_ID', "tool-app-debug");
  Deno.env.set('X_SHINKAI_LLM_PROVIDER', "o_qwen2_5_coder_32b");
  Deno.env.set('HOME', "results/typescript/typescript-00017-benchmark-download-website-md-with-tool/qwen2-5-coder-32b/editor/home");
  Deno.env.set('MOUNT', "results/typescript/typescript-00017-benchmark-download-website-md-with-tool/qwen2-5-coder-32b/editor/mount");
  Deno.env.set('ASSETS', "results/typescript/typescript-00017-benchmark-download-website-md-with-tool/qwen2-5-coder-32b/editor/assets");
  
import { shinkaiDownloadPages } from './shinkai-local-tools.ts';

type CONFIG = {};
type INPUTS = { urls: string[] };
type OUTPUT = { content: string };

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
    const { markdowns } = await shinkaiDownloadPages(inputs.urls);
    const combinedContent = markdowns.join('\n');
    return { content: combinedContent };
}

  
  // console.log('Running...')
  // console.log('Config: {}')
  // console.log('Inputs: {"urls":["https://raw.githubusercontent.com/acedward/expert-octo-computing-machine/main/test.html"]}')
  
  try {
    const program_result = await run({}, {"urls":["https://raw.githubusercontent.com/acedward/expert-octo-computing-machine/main/test.html"]});
    if (program_result) console.log(JSON.stringify(program_result, null, 2));
    else console.log(program_result);
  } catch (e) {
    console.log('::ERROR::', e);
  }

