```json
{
  "id": "shinkai-tool-download-and-summarize-pages",
  "name": "Shinkai: Download and Summarize Pages",
  "description": "Downloads one or more URLs, converts their HTML content to Markdown, and summarizes the content in 100 characters.",
  "author": "Shinkai",
  "keywords": [
    "HTML to Markdown",
    "web page downloader",
    "content conversion",
    "URL to Markdown",
    "content summarization"
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
    "required": [
      "urls"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "summaries": { "type": "array", "items": { "type": "string" } }
    },
    "required": [
      "summaries"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```