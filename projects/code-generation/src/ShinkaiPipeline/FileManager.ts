import { exists } from "jsr:@std/fs/exists";
import * as path from "jsr:@std/path";
import { Language } from "./types.ts";

type FEEDBACK_EXPECTED = "no" | "requirements" | "plan";
export class FileManager {
  public toolDir: string;
  private static basePath = path.join(Deno.cwd(), "cache", ".execution");

  constructor(
    private language: Language,
    runCode: string,
    private stream: boolean
  ) {
    this.toolDir = path.join(FileManager.basePath, runCode);
  }

  async setLanguageIfNotSet(language: Language): Promise<Language> {
    const filePath = path.join(this.toolDir, `language.json`);
    if (await exists(filePath)) {
      const lang = JSON.parse(await Deno.readTextFile(filePath));
      this.language = lang.language;
      return this.language;
    } else {
      await Deno.mkdir(this.toolDir, { recursive: true });
      await Deno.writeTextFile(filePath, JSON.stringify({ language }));
      return language;
    }
  }

  async log(message: string, stdout: boolean = false) {
    const filePath = path.join(this.toolDir, `log.txt`);
    await Deno.mkdir(this.toolDir, { recursive: true });
    const file = await Deno.open(filePath, { create: true, append: true });
    await file.write(new TextEncoder().encode(message + "\n"));
    file.close();
    if (stdout || this.stream) {
      console.log(message);
    }
  }

  async saveCache(fileName: string, text: string): Promise<void> {
    if (Deno.env.get("CACHE") === "false") {
      return;
    }
    const basePath = path.join(Deno.cwd(), "cache", ".internal");
    const filePath = path.join(basePath, fileName);
    await Deno.mkdir(basePath, { recursive: true });
    await Deno.writeTextFile(filePath, text);
    if (Deno.env.get("DEBUG") === "true") {
      console.log(`EVENT: debug\n[DEBUG] Saved Cache ::: ${filePath}`);
    }
  }

  async loadCache(fileName: string): Promise<string | null> {
    if (Deno.env.get("CACHE") === "false") {
      return null;
    }
    const basePath = path.join(Deno.cwd(), "cache", ".internal");
    const filePath = path.join(basePath, fileName);
    if (!(await exists(filePath))) {
      if (Deno.env.get("DEBUG") === "true") {
        // console.log(`EVENT: debug\n[DEBUG] Cache Not Found ::: ${filePath}`);
      }
      return null;
    }
    if (Deno.env.get("DEBUG") === "true") {
      console.log(`EVENT: debug\n[DEBUG] Loaded Cache ::: ${filePath}`);
    }
    return await Deno.readTextFile(filePath);
  }

  async save(
    step: number,
    substep: string,
    text: string,
    fileName: string
  ): Promise<string> {
    const filePath = path.join(
      this.toolDir,
      `step_${step}.${substep}.${fileName}`
    );
    await Deno.mkdir(this.toolDir, { recursive: true });
    await Deno.writeTextFile(filePath, text);
    if (Deno.env.get("DEBUG") === "true") {
      console.log(`EVENT: debug\n[DEBUG] Saved File ::: ${filePath}`);
    }
    const state = await this.loadState();
    if (!state.exists) {
      await this.writeState({
        date: new Date().toISOString(),
        feedback_expected: "no",
      });
    }
    return filePath;
  }

  async saveFinal(tool: string | undefined, metadata: string | undefined) {
    const srcPath = path.join(this.toolDir, `src`);
    if (this.language === "typescript") {
      const filePath1 = path.join(srcPath, `tool.ts`);
      const filePath2 = path.join(srcPath, `metadata.json`);
      await Deno.mkdir(srcPath, { recursive: true });
      if (tool) {
        await Deno.writeTextFile(filePath1, tool);
      }
      if (metadata) {
        await Deno.writeTextFile(filePath2, metadata);
      }
    } else if (this.language === "python") {
      const filePath = path.join(srcPath, `tool.py`);
      const filePath2 = path.join(srcPath, `metadata.json`);
      await Deno.mkdir(srcPath, { recursive: true });
      if (tool) {
        await Deno.writeTextFile(filePath, tool);
      }
      if (metadata) {
        await Deno.writeTextFile(filePath2, metadata);
      }
    }
    await this.writeState({
      date: new Date().toISOString(),
      feedback_expected: "no",
    });
  }

  async exists(
    step: number,
    substep: string,
    fileName: string
  ): Promise<boolean> {
    const filePath = path.join(
      this.toolDir,
      `step_${step}.${substep}.${fileName}`
    );
    return await exists(filePath);
  }

  async writeState(config: {
    date: string;
    feedback_expected: FEEDBACK_EXPECTED;
  }) {
    const filePath = path.join(this.toolDir, `state.json`);
    await Deno.writeTextFile(filePath, JSON.stringify(config));
  }

  async loadState(): Promise<{
    exists: boolean;
    completed: boolean;
    date: string;
    feedback_expected: FEEDBACK_EXPECTED;
    metadata: boolean;
  }> {
    const filePath = path.join(this.toolDir, `state.json`);
    if (!(await exists(filePath))) {
      return {
        exists: false,
        completed: false,
        date: new Date().toISOString(),
        feedback_expected: "no",
        metadata: false,
      };
    }

    const srcPath = path.join(this.toolDir, `src`);

    const codePath1 = path.join(srcPath, `tool.ts`);
    const codePath2 = path.join(srcPath, `tool.py`);
    const metadataPath1 = path.join(srcPath, `metadata.json`);

    const completed = (await exists(codePath1)) || (await exists(codePath2));
    const metadata = await exists(metadataPath1);

    const state: { date: string; feedback_expected: FEEDBACK_EXPECTED } =
      JSON.parse(await Deno.readTextFile(filePath));
    return {
      ...state,
      exists: true,
      metadata,
      completed,
    };
  }

  async load(step: number, substep: string, fileName: string): Promise<string> {
    const filePath = path.join(
      this.toolDir,
      `step_${step}.${substep}.${fileName}`
    );
    return await Deno.readTextFile(filePath);
  }

  public static async clearFolder() {
    if (await exists(FileManager.basePath)) {
      await Deno.remove(FileManager.basePath, { recursive: true });
    }
    await Deno.mkdir(FileManager.basePath, { recursive: true });
  }

  public async addSpending(
    isMock: boolean,
    model: string,
    subItem: string,
    tokens: number,
    cost: number
  ) {
    const filePath = path.join(this.toolDir, `spent.json`);
    const CSVSpacer = " ";
    const spent = (await exists(filePath))
      ? JSON.parse(await Deno.readTextFile(filePath))
      : { items: [], sum: 0 };
    spent.items.push(
      `${
        isMock ? `FREE${CSVSpacer}` : ""
      }${model}${CSVSpacer}${subItem}${CSVSpacer}${tokens}${CSVSpacer}${cost}`
    );
    spent.sum += cost;
    await Deno.writeTextFile(filePath, JSON.stringify(spent, null, 2));
  }
}
