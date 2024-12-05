
  // These environment variables are required, before any import.
  // Do not remove them, as they set environment variables for the Shinkai Tools.
  Deno.env.set('SHINKAI_NODE_LOCATION', "http://localhost:9950");
  Deno.env.set('BEARER', "debug");
  Deno.env.set('X_SHINKAI_TOOL_ID', "tool-id-debug");
  Deno.env.set('X_SHINKAI_APP_ID', "tool-app-debug");
  Deno.env.set('X_SHINKAI_LLM_PROVIDER', "o_qwen2_5_coder_32b");
  Deno.env.set('HOME', "results/typescript/typescript-00012-benchmark-oauth/qwen2-5-coder-32b/editor/home");
  Deno.env.set('MOUNT', "results/typescript/typescript-00012-benchmark-oauth/qwen2-5-coder-32b/editor/mount");
  Deno.env.set('ASSETS', "results/typescript/typescript-00012-benchmark-oauth/qwen2-5-coder-32b/editor/assets");
  
import { getHomePath } from './shinkai-local-support.ts';

type CONFIG = {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  refresh_token: string;
};

type INPUTS = {
  event: string;
  description: string;
  start_iso: string;
  end_iso: string;
};

type OUTPUT = {
  success: boolean;
  message: string;
};

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

async function getAccessToken(config: CONFIG): Promise<string> {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.client_id,
      client_secret: config.client_secret,
      refresh_token: config.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch access token: ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function createEvent(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
  try {
    const accessToken = await getAccessToken(config);
    const event = {
      summary: inputs.event,
      description: inputs.description,
      start: { dateTime: inputs.start_iso },
      end: { dateTime: inputs.end_iso },
    };

    const response = await fetch(CALENDAR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Failed to create event: ${await response.text()}`);
    }

    return { success: true, message: 'Event created successfully' };
  } catch (error: unknown) {
    return { success: false, message: String(error) };
  }
}

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
  return createEvent(config, inputs);
}

  
  // console.log('Running...')
  // console.log('Config: {}')
  // console.log('Inputs: {"event":"Test Event","description":"Test Description","start_iso":"2024-12-05T10:00:00","end_iso":"2024-12-05T11:00:00"}')
  
  try {
    const program_result = await run({}, {"event":"Test Event","description":"Test Description","start_iso":"2024-12-05T10:00:00","end_iso":"2024-12-05T11:00:00"});
    if (program_result) console.log(JSON.stringify(program_result, null, 2));
    else console.log(program_result);
  } catch (e) {
    console.log('::ERROR::', e);
  }

