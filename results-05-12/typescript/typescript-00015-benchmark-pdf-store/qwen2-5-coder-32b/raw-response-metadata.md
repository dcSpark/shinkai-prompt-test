```json
{
  "id": "tool-download-pdf-to-text",
  "name": "Download PDF to Text",
  "description": "Downloads a PDF from a URL and converts its content to text",
  "author": "",
  "keywords": [
    "PDF download",
    "content conversion",
    "URL to text"
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
      "filePath": { "type": "string" }
    },
    "required": [
      "filePath"
    ]
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": []
}
```