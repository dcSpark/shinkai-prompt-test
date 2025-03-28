import { exists } from "jsr:@std/fs/exists";

export class Cache {
    constructor() {
    }

    public toSafeFilename(filename: string, extension: 'json' | 'md', folder: string = 'cache'): { folders: string[], file: string } {
        const file = filename.replace(/[^a-zA-Z0-9]/g, '_').toLocaleLowerCase() + '.' + extension;
        return { folders: ['cache', folder], file };
    }

    public async save(name: string, content: string, folders: string[]): Promise<void> {
        const dir = Deno.cwd() + '/' + folders.join('/');
        try {
            await Deno.mkdir(dir, { recursive: true });
        } catch (error) {
            if (!(error instanceof Deno.errors.AlreadyExists)) {
                throw error;
            }
        }
        await Deno.writeTextFile(`${dir}/${name}`, content);
    }

    public async load(name: string, folders: string[]): Promise<string> {
        const filePath = `${Deno.cwd()}/${folders.join('/')}/${name}`;
        if (await exists(filePath)) {
            return await Deno.readTextFile(filePath);
        }
        throw new Error(`File not found: ${filePath}`);
    }
}