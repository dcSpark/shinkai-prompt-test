```json
{
  "id": "image-downloader",
  "name": "Image Downloader",
  "description": "Downloads an image from a given URL and saves it to the local file system.",
  "author": "",
  "keywords": [
    "image downloader",
    "web content download",
    "URL to image"
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