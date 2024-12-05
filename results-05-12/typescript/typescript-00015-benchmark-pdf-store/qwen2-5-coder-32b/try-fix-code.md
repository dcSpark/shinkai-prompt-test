
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
import { fetch } from 'globalthis/implementation'; // To ensure fetch is available
import { PDFDocument } from 'npm:@pdf-lib/pdf-lib';

type CONFIG = {};
type INPUTS = { url: string };
type OUTPUT = { filePath: string };

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
    const response = await fetch(inputs.url);
    if (!response.ok) {
        throw new Error(`Failed to download PDF from ${inputs.url}: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);

    // Parse the PDF using @pdf-lib/pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    let textContent = '';
    for (const page of pages) {
        const content = await page.getTextContent();
        textContent += content.map(item => item.str).join(' ') + '\n';
    }

    const homePath = getHomePath();
    const filePath = `${homePath}/downloaded-pdf.txt`;

    await Deno.writeFile(filePath, new TextEncoder().encode(textContent));

    return { filePath };
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
Download https://registry.npmjs.org/@pdf-lib%2fpdf-lib
error: Relative import path "globalthis/implementation" not prefixed with / or ./ or ../ and not in import map from "file:///Users/edwardalvarado/shinkai-prompt-test/results/typescript/typescript-00015-benchmark-pdf-store/qwen2-5-coder-32b/extracted-src-code.ts"
    at file:///Users/edwardalvarado/shinkai-prompt-test/results/typescript/typescript-00015-benchmark-pdf-store/qwen2-5-coder-32b/extracted-src-code.ts:2:23

</errors>


    