import { BaseEngine } from "../Engines/BaseEngine.ts";
import { FileManager } from "../ShinkaiPipeline/FileManager.ts";
import { LLMFormatter } from "../ShinkaiPipeline/LLMFormatter.ts";
import { Language } from "../ShinkaiPipeline/types.ts";
import { Cache } from "./Cache.ts";
import { mapReducePrompt } from "./prompts/map-reduce.ts";
import { Scrape } from "./Scrape.ts";
import { Search } from "./Search.ts";

export class DependencyDoc {
  cache: Cache;
  scrape: Scrape;
  search: Search;
  constructor(
    private llm: BaseEngine,
    private logger: FileManager | undefined
  ) {
    this.cache = new Cache();
    this.scrape = new Scrape(this.llm, this.logger, this.cache);
    this.search = new Search(this.llm, this.logger, this.cache);
  }

  private chunkDocumentation(documentation: string): string[] {
    const chunkSize = 40000;
    const overlapSize = 1000;
    const chunks: string[] = [];

    // If documentation is smaller than chunk size, return as is
    if (documentation.length <= chunkSize) {
      return [documentation];
    }

    let currentPosition = 0;

    while (currentPosition < documentation.length) {
      let chunkEnd = currentPosition + chunkSize;

      // If we're not at the end, find the next word boundary
      if (chunkEnd < documentation.length) {
        // Look forward for a word boundary within next 2000 chars
        const nextSpaceAfterChunk = documentation.indexOf(" ", chunkEnd);
        if (
          nextSpaceAfterChunk !== -1 &&
          nextSpaceAfterChunk - chunkEnd < 2000
        ) {
          chunkEnd = nextSpaceAfterChunk;
        }
      }

      // Get the chunk
      let chunk = documentation.slice(
        Math.max(0, currentPosition - (currentPosition > 0 ? overlapSize : 0)),
        Math.min(
          documentation.length,
          chunkEnd + (chunkEnd < documentation.length ? overlapSize : 0)
        )
      );

      // Ensure we start and end at word boundaries
      if (currentPosition > 0) {
        const firstSpaceIndex = chunk.indexOf(" ");
        if (firstSpaceIndex !== -1) {
          chunk = chunk.slice(firstSpaceIndex + 1);
        }
      }

      if (chunkEnd < documentation.length) {
        const lastSpaceIndex = chunk.lastIndexOf(" ");
        if (lastSpaceIndex !== -1) {
          chunk = chunk.slice(0, lastSpaceIndex);
        }
      }

      chunks.push("..." + chunk + "...");
      currentPosition = chunkEnd;
    }
    return chunks;
  }

  private async postProcessDocumentation(
    library: string,
    documentation: string
  ): Promise<string> {
    const { folders: foldersOriginal, file: fileOriginal } =
      this.cache.toSafeFilename("doc_original_" + library, "md", "original");
    await this.cache.save(fileOriginal, documentation, foldersOriginal);

    const { folders, file } = this.cache.toSafeFilename(
      "doc_postprocess_" + library,
      "md",
      "processed"
    );
    // if (await exists(Deno.cwd() + '/' + folders.join('/') + '/' + file)) {
    //     return await this.cache.load(file, folders);
    // }

    const chunks = this.chunkDocumentation(documentation);
    const cleanChunks = [];
    for (const [index, chunk] of chunks.entries()) {
      const partialDoc = await new LLMFormatter(this.logger).retryUntilSuccess(
        async () => {
          const prompt = mapReducePrompt(library, chunk);
          const response = await this.llm.run(
            prompt,
            this.logger,
            undefined,
            `Processing documentation chunk ${index + 1}/${
              chunks.length
            } for "${library}"`
          );
          return response.message;
        },
        "none",
        {}
      );
      const { folders: chunkFolders, file: chunkFile } =
        this.cache.toSafeFilename(
          "query_" + (index + 1) + "of" + chunks.length + "_" + library,
          "md",
          "chunks"
        );
      await this.cache.save(chunkFile, partialDoc, chunkFolders);
      cleanChunks.push(partialDoc);
    }
    const result = cleanChunks.join("\n");
    await this.cache.save(file, result, folders);
    return result;
  }

  public async getDependencyDocumentation(
    libraryName: string,
    language: Language
  ): Promise<string> {
    const isURL = libraryName.match(/https?:\/\//);
    let urls: string[] = [];
    let query = "";

    const { folders, file } = this.cache.toSafeFilename(
      "doc_postprocess_" + libraryName,
      "md",
      "processed"
    );
    // if (await exists(Deno.cwd() + '/' + folders.join('/') + '/' + file)) {
    //     return await this.cache.load(file, folders);
    // }

    if (isURL) {
      const using_exact_url = true;
      const { folders, file } = this.cache.toSafeFilename(
        "exact_url_" + libraryName,
        "json",
        "exact_url"
      );
      query = "Exact URL: " + libraryName;

      if (using_exact_url) {
        urls = [libraryName];
      } else {
        urls = await this.scrape.getURLsFromScrape(
          [libraryName],
          "Exact URL: " + libraryName,
          file,
          folders
        );
      }
    } else {
      // Disable web search
      if (true) {
        return "";
      }

      query = `${libraryName} - ${language} documentation`;
      const searchResponse = await this.search.search(query);
      await this.logger?.log(`[Web Search] query: ${query}`);
      for (const [index, result] of searchResponse.web.results.entries()) {
        await this.logger?.log(
          `[Possible Sites] (#${index + 1}) ${result.title} - ${result.url}`
        );
      }

      urls = await this.scrape.getURLsFromSearch(searchResponse, query);
    }

    const pages: string[] = [];
    for (const url of urls) {
      await this.logger?.log(`[Reading] ${url}`, true);
      const scrape = await this.scrape.scrapeWebsite({
        url,
        formats: ["markdown"],
      });
      pages.push(scrape.data.markdown || "");
    }

    const documentation = await this.postProcessDocumentation(
      query,
      pages.join("\n")
    );

    return documentation;
  }
}
