```json
{
  "id": "tool-download-content",
  "name": "Download Content",
  "description": "Downloads content from a given URL",
  "author": "",
  "keywords": [
    "web page downloader",
    "content retrieval",
    "URL to content"
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
      "content": { "type": "string" }
    },
    "required": ["content"]
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": []
}
```