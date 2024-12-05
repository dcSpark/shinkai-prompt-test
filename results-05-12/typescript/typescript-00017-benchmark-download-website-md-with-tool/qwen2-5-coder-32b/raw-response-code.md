```typescript
import { shinkaiDownloadPages } from './shinkai-local-tools.ts';

type CONFIG = {};
type INPUTS = { urls: string[] };
type OUTPUT = { content: string };

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
    const { markdowns } = await shinkaiDownloadPages(inputs.urls);
    const combinedContent = markdowns.join('\n');
    return { content: combinedContent };
}
```