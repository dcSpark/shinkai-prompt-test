```json
{
  "id": "generate-summary-from-db",
  "name": "Generate Summary from Database",
  "description": "Generates a summary of website content stored in a SQLite database using an AI LLM.",
  "author": "Shinkai",
  "keywords": [
    "website content summary",
    "AI LLM",
    "SQLite database"
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
      "definition": "CREATE TABLE websites (id SERIAL PRIMARY KEY, url TEXT NOT NULL, content TEXT, fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
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