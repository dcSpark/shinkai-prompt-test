import { getHomePath } from './shinkai-local-support.ts';

type CONFIG = {};
type INPUTS = { url: string };
type OUTPUT = { filePath: string };

export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT> {
  const response = await fetch(inputs.url);
  if (!response.ok) {
    throw new Error(`Failed to download image from ${inputs.url}`);
  }
  const data = await response.arrayBuffer();
  const filePath = `${getHomePath()}/downloaded_image.png`;
  await Deno.writeFile(filePath, new Uint8Array(data));
  return { filePath };
}