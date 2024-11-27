```json
{
  "id": "shinkai-tool-download-pages-to-markdown",
  "name": "Shinkai: Download Pages and Save as Markdown",
  "description": "Downloads one or more URLs, converts their HTML content to Markdown, and saves the content in a SQLite database.",
  "author": "Shinkai",
  "keywords": [
    "HTML to Markdown",
    "web page downloader",
    "content conversion",
    "URL to Markdown"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "urls": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["urls"]
  },
  "result": {
    "type": "object",
    "properties": {
      "query_results": { "type": "array", "items": { "type": "any" } }
    },
    "required": ["query_results"]
  },
  "sqlTables": [
    {
      "name": "downloaded_content",
      "definition": "CREATE TABLE downloaded_content (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL, content TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all downloaded content",
      "query": "SELECT * FROM downloaded_content;"
    },
    {
      "name": "Get content by URL",
      "query": "SELECT * FROM downloaded_content WHERE url = :url ORDER BY created_at DESC LIMIT 1"
    }
  ]
}
```