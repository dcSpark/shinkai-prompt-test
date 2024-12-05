```json
{
  "id": "download-file-from-url",
  "name": "Download File from URL",
  "description": "Downloads a file from a given URL and saves it to the local home directory.",
  "author": "",
  "keywords": [
    "file download",
    "URL downloader",
    "web content retrieval"
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
      "file_path": { "type": "string", "nullable": true }
    },
    "required": []
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": []
}
```