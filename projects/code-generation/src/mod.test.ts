import { assert } from "https://deno.land/std@0.220.1/assert/assert.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";
import "jsr:@std/dotenv/load";
import { getModelSmall } from "./Engines/index.ts";
import { FileManager } from "./ShinkaiPipeline/FileManager.ts";
import { getTests } from "./ShinkaiPipeline/Requirement.ts";
import { ShinkaiPipeline } from "./ShinkaiPipeline/ShinkaiPipeline.ts";
import type { Language } from "./ShinkaiPipeline/types.ts";

Deno.test("test", async () => {
  const flags = parseArgs(Deno.args, {
    boolean: ["keepcache", "force-docs"],
  });
  const KEEP_CACHE = flags.keepcache || flags["force-docs"];
  const FORCE_DOCS_GENERATION = flags["force-docs"];

  if (!KEEP_CACHE) {
    await FileManager.clearFolder();
  }
  const llm = [getModelSmall()];
  const languages: Language[] = ["typescript", "python"];
  for (const llmModel of llm) {
    for (const language of languages) {
      for (const test of getTests()) {
        const pipeline = new ShinkaiPipeline(
          true,
          language,
          test,
          llmModel,
          llmModel,
          true,
          "shinkai"
        );
        const result = await pipeline.run();
        assert(result.status === "COMPLETED");
      }
    }
  }
});
