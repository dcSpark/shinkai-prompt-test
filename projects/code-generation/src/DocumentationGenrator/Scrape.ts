import { exists } from "jsr:@std/fs/exists";
import axios from "npm:axios";
import { BaseEngine } from "../Engines/BaseEngine.ts";
import { FileManager } from "../ShinkaiPipeline/FileManager.ts";
import { LLMFormatter } from "../ShinkaiPipeline/LLMFormatter.ts";
import { Cache } from "./Cache.ts";
import { selectInPageUrlsPrompt } from "./prompts/select-in-page-urls.ts";
import { selectSearchUrlsPrompt } from "./prompts/select-serach-urls.ts";
import { SearchResponse } from "./Search.ts";
const FIRECRAWL_API_URL = Deno.env.get("FIRECRAWL_API_URL");
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

interface CrawlResponse {
  success: boolean;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: Date;
  data: Datum[];
}

interface Datum {
  markdown: string;
  metadata: Metadata;
}

interface Metadata {
  description: string;
  "theme-color": string;
  "og:image:width": string;
  ogImage: string;
  viewport: string[];
  "og:image:height": string;
  title: string;
  favicon: string;
  ogUrl: string;
  "og:site_name": string;
  ogSiteName: string;
  "og:type": string;
  "og:title": string;
  "og:url": string;
  ogDescription: string;
  "readthedocs-addons-api-version": string;
  ogTitle: string;
  "og:image": string;
  language: string;
  "og:description": string;
  "og:image:alt": string;
  scrapeId: string;
  sourceURL: string;
  url: string;
  statusCode: number;
}

interface CrawlOptions {
  url: string;
  limit?: number;
  scrapeOptions?: {
    formats?: string[];
  };
}

interface CrawlInitResponse {
  success: boolean;
  id: string;
  url: string;
}

interface MapResponse {
  status: string;
  links: string[];
}

interface ScrapeResponse {
  success: boolean;
  data: {
    markdown?: string;
    html?: string;
    metadata: {
      title?: string;
      description?: string;
      language?: string;
      keywords?: string;
      robots?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogUrl?: string;
      ogImage?: string;
      ogLocaleAlternate?: string[];
      ogSiteName?: string;
      sourceURL: string;
      statusCode: number;
    };
  };
}

interface ScrapeOptions {
  url: string;
  formats?: ("markdown" | "html")[];
}

export class Scrape {
  constructor(
    private llm: BaseEngine,
    private logger: FileManager | undefined,
    private cache: Cache
  ) {}

  public async getURLsFromSearch(
    searchResponse: SearchResponse,
    finalQuery: string
  ) {
    const { folders, file } = this.cache.toSafeFilename(
      "searchurls_" + finalQuery,
      "json",
      "search"
    );
    // if (await exists(Deno.cwd() + '/' + folders.join('/') + '/' + file)) {
    //     await this.logger?.log(` getURLsFromScratch for ${finalQuery}`, true);
    //     return JSON.parse(await this.cache.load(file, folders)).links;
    // }

    // How to get the best match? trust the first result?
    const url = searchResponse.web.results.find((r) => {
      const isCompressedFile = r.url.match(/\.(zip|tar|gz|bz2|rar|7z|iso)$/);
      const isBinaryFile = r.url.match(
        /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|dmg|pkg|deb|rpm|msi|exe|app|exe|app|pkg|rpm|deb|msi)$/
      );
      return !isCompressedFile && !isBinaryFile;
    })?.url;
    if (!url) {
      throw new Error("No URL found");
    }

    const urlsString = await new LLMFormatter(this.logger).retryUntilSuccess(
      async () => {
        const prompt = selectSearchUrlsPrompt(searchResponse, finalQuery);
        const response = await this.llm.run(
          prompt,
          this.logger,
          undefined,
          `Analyzing search results for "${finalQuery}"`
        );
        return response.message;
      },
      "json",
      { regex: [/^https?:\/\/.*$/], isJSONArray: true }
    );

    const urls: string[] = JSON.parse(urlsString);
    return this.getURLsFromScrape(urls, finalQuery, file, folders);
  }

  public async getURLsFromScrape(
    urls: string[],
    finalQuery: string,
    file: string,
    folders: string[]
  ) {
    // lets scrape these pages for context
    const context: string[] = [];
    for (const url of urls) {
      const scrape = await this.scrapeWebsite({ url, formats: ["markdown"] });
      const limit = 1000000;
      context.push((scrape.data.markdown || "").substring(0, limit));
    }

    // We can get this by extracting the links from the scrape as well...
    const possiblePages: string[] = [];
    for (const url of urls) {
      const map = await this.mapWebsite(url);
      const limit = 250;
      possiblePages.push(...map.slice(0, limit));
    }

    const urlsString2 = await new LLMFormatter(this.logger).retryUntilSuccess(
      async () => {
        const prompt = selectInPageUrlsPrompt(
          context,
          possiblePages,
          finalQuery
        );
        const response = await this.llm.run(
          prompt,
          this.logger,
          undefined,
          `Finding documentation pages for "${finalQuery}"`
        );
        return response.message;
      },
      "json",
      { regex: [/^https?:\/\/.*$/], isJSONArray: true }
    );

    const urls2: string[] = JSON.parse(urlsString2);
    await this.cache.save(
      file,
      JSON.stringify({ links: urls2 }, null, 2),
      folders
    );
    return urls2;
  }

  private async pollCrawlStatus(statusUrl: string): Promise<CrawlResponse> {
    let retries = 0;

    while (true) {
      try {
        const response = await axios.get(statusUrl);
        const statusData: CrawlResponse = response.data;

        if (
          retries < 3 ||
          (retries >= 3 && retries < 24 && retries % 3 === 0) ||
          (retries >= 24 && retries % 5 === 0)
        ) {
          await this.logger?.log(
            `Polling status: ${statusData.status}, retry #${retries}`,
            true
          );
        }

        if (statusData.status === "completed") {
          return statusData;
        }
      } catch (error) {
        await this.logger?.log(
          `Polling error on retry #${retries}, continuing...`,
          true
        );
      }

      retries++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  public async crawlWebsite(options: CrawlOptions): Promise<CrawlResponse> {
    if (!options.url) {
      throw new Error("URL is required");
    }

    const { folders, file } = this.cache.toSafeFilename(
      "crawl_" + options.url,
      "json",
      "crawl"
    );
    if (await exists(Deno.cwd() + "/" + folders.join("/") + "/" + file)) {
      return JSON.parse(await this.cache.load(file, folders)) as CrawlResponse;
    }

    try {
      if (!FIRECRAWL_API_URL) {
        throw new Error("FIRECRAWL_API_URL is not set");
      }
      if (!options.url.match(/https?:\/\//)) {
        throw new Error(
          options.url + " - URL must start with http:// or https://"
        );
      } else {
        await this.logger?.log("Crawling " + options.url, true);
      }
      const response = await axios.post(
        FIRECRAWL_API_URL + "/v1/crawl",
        {
          url: options.url,
          limit: options.limit || 100,
          scrapeOptions: {
            formats: options.scrapeOptions?.formats || ["markdown"],
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + FIRECRAWL_API_KEY,
          },
        }
      );

      const initResponse: CrawlInitResponse = response.data;
      const crawlResponse = await this.pollCrawlStatus(
        initResponse.url.replace("https://", "http://")
      );

      await this.cache.save(
        file,
        JSON.stringify(crawlResponse, null, 2),
        folders
      );
      return crawlResponse;
    } catch (error: unknown) {
      console.log(`INTERNAL ERROR @ crawlWebsite`, options.url);
      return {
        success: false,
        status: "error",
        completed: 0,
        total: 0,
        creditsUsed: 0,
        expiresAt: new Date(),
        data: [],
      };
    }
  }

  public async mapWebsite(url: string): Promise<string[]> {
    if (!url) {
      throw new Error("URL is required");
    }

    const { folders, file } = this.cache.toSafeFilename(
      "map_" + url,
      "json",
      "map"
    );
    if (await exists(Deno.cwd() + "/" + folders.join("/") + "/" + file)) {
      return JSON.parse(await this.cache.load(file, folders)).links;
    }

    try {
      if (!FIRECRAWL_API_URL) {
        throw new Error("FIRECRAWL_API_URL is not set");
      }
      if (!url.match(/https?:\/\//)) {
        throw new Error(url + " - URL must start with http:// or https://");
      }

      const response = await axios.post(
        FIRECRAWL_API_URL + "/v1/map",
        {
          url: url,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + FIRECRAWL_API_KEY,
          },
        }
      );

      const mapResponse: MapResponse = response.data;
      await this.cache.save(
        file,
        JSON.stringify(mapResponse, null, 2),
        folders
      );
      return mapResponse.links;
    } catch (error: unknown) {
      console.log(`INTERNAL ERROR @ mapWebsite`, url);
      return [];
    }
  }

  public async scrapeWebsite(options: ScrapeOptions): Promise<ScrapeResponse> {
    if (!options.url) {
      throw new Error("URL is required");
    }

    const isCompressedFile = options.url.match(
      /\.(zip|tar|gz|bz2|rar|7z|iso)$/
    );
    const isBinaryFile = options.url.match(
      /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|dmg|pkg|deb|rpm|msi|exe|app|exe|app|pkg|rpm|deb|msi)$/
    );
    const isImageFile = options.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/);
    const isVideoFile = options.url.match(
      /\.(mp4|mov|avi|wmv|flv|mpeg|mpg|m4v|webm|mkv)$/
    );
    const isAudioFile = options.url.match(
      /\.(mp3|wav|ogg|m4a|aac|flac|wma|m4b|m4p|m4r|m4b|m4p|m4r)$/
    );

    if (
      isCompressedFile ||
      isBinaryFile ||
      isImageFile ||
      isVideoFile ||
      isAudioFile
    ) {
      return {
        success: false,
        data: {
          markdown: "",
          html: "",
          metadata: {
            statusCode: 400,
            sourceURL: options.url,
          },
        },
      };
    }

    const { folders, file } = this.cache.toSafeFilename(
      "scrape_" + options.url,
      "json",
      "scrape"
    );
    if (await exists(Deno.cwd() + "/" + folders.join("/") + "/" + file)) {
      return JSON.parse(await this.cache.load(file, folders)) as ScrapeResponse;
    }

    try {
      if (!FIRECRAWL_API_URL) {
        throw new Error("FIRECRAWL_API_URL is not set");
      }
      if (!options.url.match(/https?:\/\//)) {
        throw new Error(
          options.url + " - URL must start with http:// or https://"
        );
      }

      const response = await axios.post(
        FIRECRAWL_API_URL + "/v1/scrape",
        {
          url: options.url,
          formats: options.formats || ["markdown"],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + FIRECRAWL_API_KEY,
          },
        }
      );

      const scrapeResponse: ScrapeResponse = response.data;
      if (scrapeResponse.data.metadata.statusCode > 399) {
        scrapeResponse.data.markdown = "";
        scrapeResponse.data.html = "";
        await this.logger?.log(
          `Scrape failed ${scrapeResponse.data.metadata.statusCode} - ${options.url}`,
          true
        );
      } else {
        await this.cache.save(
          file,
          JSON.stringify(scrapeResponse, null, 2),
          folders
        );
      }
      return scrapeResponse;
    } catch (error: unknown) {
      console.log(`INTERNAL ERROR @ scrapeWebsite`, options.url);
      return {
        success: false,
        data: {
          markdown: "",
          html: "",
          metadata: {
            statusCode: 500,
            sourceURL: options.url,
          },
        },
      };
    }
  }
}
