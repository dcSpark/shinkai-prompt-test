```json
{
  "id": "tool-website-summary",
  "name": "Website Content Summary",
  "description": "Generates a summary of the content from a specified website URL using stored data and AI LLM.",
  "author": "",
  "keywords": [
    "website",
    "content",
    "summary",
    "AI"
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
  "sqlTables": [
    {
      "name": "websites",
      "definition": "CREATE TABLE websites (id SERIAL PRIMARY KEY, url TEXT NOT NULL UNIQUE, content TEXT, last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get website content by URL",
      "query": "SELECT content FROM websites WHERE url = :url"
    }
  ],
  "tools": [
    "local:::rust_toolkit:::shinkai_sqlite_query_executor",
    "local:::rust_toolkit:::shinkai_llm_prompt_processor"
  ]
}
```