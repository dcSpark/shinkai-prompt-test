```json
{
  "id": "summarize-webpage",
  "name": "Web Page Summarizer",
  "description": "Fetches and summarizes the content of a webpage using LLM prompt processing.",
  "author": "Shinkai",
  "keywords": [
    "web page summarizer",
    "LLM prompt processor",
    "website summary"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "url": { "type": "string" }
    },
    "required": [
      "url"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "summary": { "type": "string" }
    },
    "required": [
      "summary"
    ]
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": [
    "local:::rust_toolkit:::shinkai_llm_prompt_processor",
    "local:::benchmark_store_website_test_engine:::benchmark_store_website"
  ]
}
```