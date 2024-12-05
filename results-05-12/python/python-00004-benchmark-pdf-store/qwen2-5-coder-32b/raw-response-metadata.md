```json
{
  "id": "download-and-parse-pdf",
  "name": "Download and Parse PDF",
  "description": "Downloads a PDF from a URL and parses its content to plain text",
  "author": "",
  "keywords": [
    "PDF download",
    "content parsing",
    "web scraper"
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
      "file_path": { "type": "string" }
    },
    "required": [
      "file_path"
    ]
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": []
}
```