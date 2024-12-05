
<source-codes>
* Here is the program soruce code files:
# File Name shinkai_local_support.py
```typescript
import os
from typing import List


def get_mount_paths() -> List[str]:
    """Gets an array of mounted files.
    
    Returns:
        List[str]: Array of files
    """
    mount_paths = os.environ.get('MOUNT')
    if not mount_paths:
        return []
    return [path.strip() for path in mount_paths.split(',')]


def get_asset_paths() -> List[str]:
    """Gets an array of asset files. These files are read only.
    
    Returns:
        List[str]: Array of files
    """
    asset_paths = os.environ.get('ASSETS')
    if not asset_paths:
        return []
    return [path.strip() for path in asset_paths.split(',')]


def get_home_path() -> str:
    """Gets the home directory path. All created files must be written to this directory.
    
    Returns:
        str: Home directory path
    """
    return os.environ.get('HOME', '')


def get_shinkai_node_location() -> str:
    """Gets the Shinkai Node location URL. This is the URL of the Shinkai Node server.
    
    Returns:
        str: Shinkai Node URL
    """
    return os.environ.get('SHINKAI_NODE_LOCATION', '')


```


# File Name shinkai-local-support.ts
```typescript

/**
 * Gets an array of mounted files.
 * @returns {string[]} Array of files.
 */
export function getMountPaths(): string[] {
    const mountPaths = Deno.env.get('MOUNT');
    if (!mountPaths) return [];
    return mountPaths.split(',').map(path => path.trim());
}

/**
 * Gets an array of asset files. These files are read only.
 * @returns {string[]} Array of files.
 */
export function getAssetPaths(): string[] {
    const assetPaths = Deno.env.get('ASSETS');
    if (!assetPaths) return [];
    return assetPaths.split(',').map(path => path.trim());
}

/**
 * Gets the home directory path. All created files must be written to this directory.
 * @returns {string} Home directory path.
 */
export function getHomePath(): string {
    return Deno.env.get('HOME') || "";
}

/**
 * Gets the Shinkai Node location URL. This is the URL of the Shinkai Node server.
 * @returns {string} Shinkai Node URL.
 */
export function getShinkaiNodeLocation(): string {
    return Deno.env.get('SHINKAI_NODE_LOCATION') || "";
}

```


# File Name extracted-src-code.ts
```typescript
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
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
  return createEvent(config, inputs);
}
```


</source-codes>

<agent-fix-code-rules>
* Only return the fixed code in a single code block.
* Only make the changes necessary to fix the errors above, no other changes to the code.
* Avoid all comments, text, notes and metadata.
</agent-fix-code-rules>

<errors>
* These are the following errors found:
Check file:///Users/edwardalvarado/shinkai-prompt-test/results/typescript/typescript-00012-benchmark-oauth/qwen2-5-coder-32b/extracted-src-code.ts
error: TS18046 [ERROR]: 'error' is of type 'unknown'.
    return { success: false, message: error.message };
                                      ~~~~~
    at file:///Users/edwardalvarado/shinkai-prompt-test/results/typescript/typescript-00012-benchmark-oauth/qwen2-5-coder-32b/extracted-src-code.ts:72:39

</errors>


    