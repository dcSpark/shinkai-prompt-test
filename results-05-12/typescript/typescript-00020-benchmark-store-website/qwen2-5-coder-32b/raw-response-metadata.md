```json
{
  "id": "fetch-website-content",
  "name": "Fetch Website Content",
  "description": "Fetches the content of a website and stores it in an SQLite database, updating if already present.",
  "author": "",
  "keywords": [
    "website",
    "content",
    "sqlite",
    "database"
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
    "required": ["url"]
  },
  "result": {
    "type": "object",
    "properties": {
      "content": { "type": "string" },
      "last_updated": { "type": "string" }
    },
    "required": ["content", "last_updated"]
  },
  "sqlTables": [
    {
      "name": "website_content",
      "definition": "CREATE TABLE website_content (url TEXT PRIMARY KEY, content TEXT, last_updated DATETIME DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get content by URL",
      "query": "SELECT * FROM website_content WHERE url = :url"
    },
    {
      "name": "Get all contents",
      "query": "SELECT * FROM website_content"
    },
    {
      "name": "Get recent content updates",
      "query": "SELECT * FROM website_content ORDER BY last_updated DESC LIMIT 10"
    }
  ],
  "tools": [
    "local:::rust_toolkit:::shinkai_sqlite_query_executor"
  ]
}
```