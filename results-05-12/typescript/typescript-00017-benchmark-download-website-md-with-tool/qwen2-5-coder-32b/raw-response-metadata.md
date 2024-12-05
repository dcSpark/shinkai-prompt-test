```json
{
  "id": "tool-download-pages",
  "name": "Download Pages",
  "description": "Downloads one or more URLs and converts their HTML content to Markdown",
  "author": "",
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
      "content": { "type": "string" }
    },
    "required": ["content"]
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": ["local:::shinkai_tool_download_pages:::shinkai__download_pages"]
}
```