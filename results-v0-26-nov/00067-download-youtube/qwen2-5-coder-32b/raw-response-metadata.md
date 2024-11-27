```json
{
  "id": "shinkai-tool-youtube-dl",
  "name": "Shinkai: YouTube Video Downloader",
  "description": "Downloads a YouTube video based on the provided URL and quality settings.",
  "author": "Shinkai",
  "keywords": [
    "youtube",
    "video downloader",
    "quality options"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "url": { "type": "string" },
      "quality": { "type": "string", "enum": ["highest", "lowest", "1080p", "720p", "480p", "360p"], "nullable": true }
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
  "sqlQueries": []
}
```