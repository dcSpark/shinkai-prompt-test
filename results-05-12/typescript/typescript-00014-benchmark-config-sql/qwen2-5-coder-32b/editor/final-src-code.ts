
  // These environment variables are required, before any import.
  // Do not remove them, as they set environment variables for the Shinkai Tools.
  Deno.env.set('SHINKAI_NODE_LOCATION', "http://localhost:9950");
  Deno.env.set('BEARER', "debug");
  Deno.env.set('X_SHINKAI_TOOL_ID', "tool-id-debug");
  Deno.env.set('X_SHINKAI_APP_ID', "tool-app-debug");
  Deno.env.set('X_SHINKAI_LLM_PROVIDER', "o_qwen2_5_coder_32b");
  Deno.env.set('HOME', "results/typescript/typescript-00014-benchmark-config-sql/qwen2-5-coder-32b/editor/home");
  Deno.env.set('MOUNT', "results/typescript/typescript-00014-benchmark-config-sql/qwen2-5-coder-32b/editor/mount");
  Deno.env.set('ASSETS', "results/typescript/typescript-00014-benchmark-config-sql/qwen2-5-coder-32b/editor/assets");
  
import { shinkaiSqliteQueryExecutor } from './shinkai-local-tools.ts';

type CONFIG = {
    api_key: string;
};

type INPUTS = {
    prompt: string;
};

type OUTPUT = {
    success: boolean;
    message: string;
};

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
    const { prompt } = inputs;
    const { api_key } = config;

    try {
        // Create the table if it does not exist
        await shinkaiSqliteQueryExecutor('default', `
            CREATE TABLE IF NOT EXISTS chat_responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prompt TEXT NOT NULL,
                response TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Prepare the request body
        const requestBody = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
        });

        // Make the API call
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api_key}`
            },
            body: requestBody
        });

        if (!response.ok) {
            throw new Error(`API call failed with status ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const chatResponse = data.choices[0].message.content;

        // Store the result in the database
        await shinkaiSqliteQueryExecutor('default', `
            INSERT INTO chat_responses (prompt, response) VALUES (?, ?);
        `, [prompt, chatResponse]);

        return { success: true, message: 'Chat response stored successfully.' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, message: `An error occurred: ${errorMessage}` };
    }
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

