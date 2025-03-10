import { TestData } from "../support/types.ts";

export const socialMediaTests: TestData[] = [
  {
    code: `create-waifu-account`,
    prompt:
      `Generate a tool that can create a standardized waifu character and set up an Instagram account.`,
    prompt_type:
      "type INPUT = { waifu_characteristics: string[], account_name: string }",
    inputs: {
      waifu_characteristics: ["blue_hair", "cheerful", "casual_style"],
      account_name: "anime_waifu_daily",
    },
    tools: [
      "local:::rust_toolkit:::shinkai_llm_prompt_processor",
      "local:::shinkai_tool_playwright_example:::shinkai__playwright_example",
    ],
    config: {},
  },
  {
    code: `post-waifu-instagram`,
    prompt:
      `Generate a tool that can post a waifu image to Instagram with appropriate captions and hashtags.`,
    prompt_type: "type INPUT = { image_path: string, caption_theme: string }",
    inputs: {
      image_path: "/path/to/waifu.png",
      caption_theme: "kawaii",
    },
    tools: [
      "local:::shinkai_tool_perplexity_api:::shinkai__perplexity_api",
      "local:::rust_toolkit:::shinkai_llm_prompt_processor",
    ],
    config: {},
  },
  {
    code: `post-waifu-twitter`,
    prompt:
      `Generate a tool that can post a waifu image to Twitter with engaging text.`,
    prompt_type: "type INPUT = { image_path: string, tweet_text: string }",
    inputs: {
      image_path: "/path/to/waifu.png",
      tweet_text: "Your daily dose of kawaii! ✨",
    },
    tools: [
      "local:::shinkai_tool_perplexity_api:::shinkai__perplexity_api",
      "local:::rust_toolkit:::shinkai_llm_prompt_processor",
    ],
    config: {},
  },
  {
    code: `post-waifu-reddit`,
    prompt:
      `Generate a tool that can post a waifu image to relevant Reddit communities.`,
    prompt_type: "type INPUT = { image_path: string, subreddits: string[] }",
    inputs: {
      image_path: "/path/to/waifu.png",
      subreddits: ["awwnime", "wholesomeanimemes"],
    },
    tools: [
      "local:::shinkai_tool_perplexity:::shinkai__perplexity",
      "local:::shinkai_tool_playwright_example:::shinkai__playwright_example",
    ],
    config: {},
  },
  {
    code: `twitter-topic-info`,
    prompt:
      `Generate a tool that can gather and analyze information from Twitter about a specific topic.`,
    prompt_type: "type INPUT = { topic: string, days_back?: number }",
    inputs: {
      topic: "artificial intelligence",
      days_back: 7,
    },
    tools: [
      "local:::shinkai_tool_perplexity_api:::shinkai__perplexity_api",
      "local:::rust_toolkit:::shinkai_llm_prompt_processor",
      "local:::rust_toolkit:::shinkai_sqlite_query_executor",
    ],
    config: {},
  },
];
