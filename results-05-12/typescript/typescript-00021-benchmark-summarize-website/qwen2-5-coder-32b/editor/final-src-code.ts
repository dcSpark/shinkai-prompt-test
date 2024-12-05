
  // These environment variables are required, before any import.
  // Do not remove them, as they set environment variables for the Shinkai Tools.
  Deno.env.set('SHINKAI_NODE_LOCATION', "http://localhost:9950");
  Deno.env.set('BEARER', "debug");
  Deno.env.set('X_SHINKAI_TOOL_ID', "tool-id-debug");
  Deno.env.set('X_SHINKAI_APP_ID', "tool-app-debug");
  Deno.env.set('X_SHINKAI_LLM_PROVIDER', "o_qwen2_5_coder_32b");
  Deno.env.set('HOME', "results/typescript/typescript-00021-benchmark-summarize-website/qwen2-5-coder-32b/editor/home");
  Deno.env.set('MOUNT', "results/typescript/typescript-00021-benchmark-summarize-website/qwen2-5-coder-32b/editor/mount");
  Deno.env.set('ASSETS', "results/typescript/typescript-00021-benchmark-summarize-website/qwen2-5-coder-32b/editor/assets");
  
import { shinkaiSqliteQueryExecutor, shinkaiLlmPromptProcessor } from './shinkai-local-tools.ts';

type CONFIG = {};
type INPUTS = { url: string };
type OUTPUT = { summary: string };

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
    const { url } = inputs;

    // Read the website content from the SQLite database
    const query = `SELECT content FROM websites WHERE url = ?`;
    const result = await shinkaiSqliteQueryExecutor('default', query, [url]);

    if (result.rowCount === 0) {
        throw new Error(`No content found for URL: ${url}`);
    }

    const content = result.result[0].content;

    // Generate a summary using the AI LLM
    const prompt = `Please provide a summary of the following text:\n\n${content}`;
    const summaryResult = await shinkaiLlmPromptProcessor('text', prompt);

    return {
        summary: summaryResult.message,
    };
}

  
  // console.log('Running...')
  // console.log('Config: {}')
  // console.log('Inputs: {"url":"https://raw.githubusercontent.com/acedward/expert-octo-computing-machine/main/test.html"}')
  
  try {
    const program_result = await run({}, {"url":"https://raw.githubusercontent.com/acedward/expert-octo-computing-machine/main/test.html"});
    if (program_result) console.log(JSON.stringify(program_result, null, 2));
    else console.log(program_result);
  } catch (e) {
    console.log('::ERROR::', e);
  }

