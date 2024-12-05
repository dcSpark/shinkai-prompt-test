```typescript
import { getHomePath } from './shinkai-local-support.ts';

type CONFIG = {};
type INPUTS = { url: string };
type OUTPUT = { content: string };

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
    const response = await fetch(inputs.url);
    if (!response.ok) {
        throw new Error(`Failed to fetch the URL. Status: ${response.status} ${response.statusText}`);
    }
    const content = await response.text();
    return { content };
}
```