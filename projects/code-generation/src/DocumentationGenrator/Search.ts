import { exists } from "jsr:@std/fs/exists";
import axios, { AxiosError } from "npm:axios";
import { BaseEngine } from "../Engines/BaseEngine.ts";
import { FileManager } from "../ShinkaiPipeline/FileManager.ts";
import { Cache } from "./Cache.ts";
const BRAVE_API_KEY = Deno.env.get("BRAVE_API_KEY");

interface Main {
  type: MainType;
  index: number;
  all: boolean;
}

export enum MainType {
  Web = "web",
}

interface Mixed {
  type: string;
  main: Main[];
  top: any[];
  side: any[];
}

interface Result {
  title: string;
  url: string;
  is_source_local: boolean;
  is_source_both: boolean;
  description: string;
  language: Lang;
  family_friendly: boolean;
  type: ResultType;
  subtype: string;
  is_live: boolean;
  meta_url: MetaURL;
  thumbnail?: Thumbnail;
  page_age?: Date;
  profile?: Profile;
  age?: string;
}

export enum Lang {
  En = "en",
}

interface MetaURL {
  scheme: Scheme;
  netloc: string;
  hostname: string;
  favicon: string;
  path: string;
}

export enum Scheme {
  HTTPS = "https",
}

interface Profile {
  name: string;
  url: string;
  long_name: string;
  img: string;
}

interface Thumbnail {
  src: string;
  original: string;
  logo: boolean;
}

export enum ResultType {
  SearchResult = "search_result",
}

interface Query {
  original: string;
  show_strict_warning: boolean;
  is_navigational: boolean;
  is_news_breaking: boolean;
  spellcheck_off: boolean;
  country: string;
  bad_results: boolean;
  should_fallback: boolean;
  postal_code: string;
  city: string;
  header_country: string;
  more_results_available: boolean;
  state: string;
}

interface Web {
  type: string;
  results: Result[];
  family_friendly: boolean;
}

export interface SearchResponse {
  query: Query;
  mixed: Mixed;
  type: string;
  web: Web;
}

export class Search {
  constructor(
    private llm: BaseEngine,
    private logger: FileManager | undefined,
    private cache: Cache
  ) {}

  public async search(query: string): Promise<SearchResponse> {
    return await this.braveSearch(query);
  }

  private async braveSearch(query: string): Promise<SearchResponse> {
    if (!BRAVE_API_KEY) {
      throw new Error("API key is required");
    }

    if (!query) {
      throw new Error("Search query is required");
    }

    const { folders, file } = this.cache.toSafeFilename(
      "search_" + query,
      "json",
      "brave"
    );
    if (await exists(Deno.cwd() + "/" + folders.join("/") + "/" + file)) {
      return JSON.parse(await this.cache.load(file, folders)) as SearchResponse;
    }

    try {
      const response = await axios.get(
        "https://api.search.brave.com/res/v1/web/search",
        {
          params: {
            q: query,
          },
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": BRAVE_API_KEY,
          },
        }
      );
      await this.cache.save(
        file,
        JSON.stringify(response.data, null, 2),
        folders
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(`Brave Search API error: ${error.message}`);
      }
      throw error;
    }
  }
}
