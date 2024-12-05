```json
{
  "id": "website-content-fetcher",
  "name": "Website Content Fetcher and Storer",
  "description": "Fetches website content from a URL, stores it in an SQLite database, and retrieves all stored data.",
  "author": "Shinkai",
  "keywords": [
    "website",
    "content",
    "fetch",
    "store",
    "sqlite"
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
      "table_data": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": true
        }
      }
    },
    "required": [
      "table_data"
    ]
  },
  "sqlTables": [
    {
      "name": "website_content",
      "definition": "CREATE TABLE IF NOT EXISTS website_content (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL UNIQUE, content TEXT NOT NULL)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all website contents",
      "query": "SELECT * FROM website_content"
    },
    {
      "name": "Get website content by URL",
      "query": "SELECT * FROM website_content WHERE url = :url"
    }
  ],
  "tools": [
    "local:::rust_toolkit:::shinkai_sqlite_query_executor"
  ]
}
```