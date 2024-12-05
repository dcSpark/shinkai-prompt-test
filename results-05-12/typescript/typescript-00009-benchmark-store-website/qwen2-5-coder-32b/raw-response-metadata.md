```json
{
  "id": "fetch-website-content",
  "name": "Fetch Website Content",
  "description": "Fetches the content of a specified URL and stores it in an SQLite database.",
  "author": "",
  "keywords": [
    "website content fetcher",
    "sqlite storage",
    "web scraping"
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
      "content": { "type": "string" }
    },
    "required": [
      "content"
    ]
  },
  "sqlTables": [
    {
      "name": "website_content",
      "definition": "CREATE TABLE IF NOT EXISTS website_content (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL UNIQUE, content TEXT NOT NULL, last_updated DATETIME DEFAULT CURRENT_TIMESTAMP);"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all website contents",
      "query": "SELECT * FROM website_content;"
    },
    {
      "name": "Get website content by URL",
      "query": "SELECT * FROM website_content WHERE url = :url;"
    },
    {
      "name": "Get latest updated website content",
      "query": "SELECT * FROM website_content ORDER BY last_updated DESC LIMIT 1;"
    }
  ],
  "tools": [
    "local:::rust_toolkit:::shinkai_sqlite_query_executor"
  ]
}
```