```json
{
  "id": "download-page-content",
  "name": "Download Page Content",
  "description": "Downloads the HTML content of a given URL",
  "author": "",
  "keywords": [
    "HTML downloader",
    "web page content",
    "URL fetcher"
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