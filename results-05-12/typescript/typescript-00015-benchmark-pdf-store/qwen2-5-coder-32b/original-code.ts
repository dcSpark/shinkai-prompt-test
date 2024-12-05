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