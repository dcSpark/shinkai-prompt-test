```json
{
  "id": "tool-download-content",
  "name": "Download Content",
  "description": "Downloads the content of a given URL",
  "author": "",
  "keywords": [
    "web page downloader",
    "content retrieval"
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
  "sqlTables": [],
  "sqlQueries": [],
  "tools": []
}
```