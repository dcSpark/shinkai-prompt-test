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