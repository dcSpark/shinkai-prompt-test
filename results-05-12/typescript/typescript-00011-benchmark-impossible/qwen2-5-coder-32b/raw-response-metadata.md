```json
{
  "id": "social-media-poster",
  "name": "Social Media Poster",
  "description": "Tool for posting content to multiple social media platforms",
  "author": "",
  "keywords": [
    "social media",
    "poster",
    "facebook",
    "x/twitter",
    "instagram",
    "reddit"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "content": { "type": "string" }
    },
    "required": [
      "title",
      "content"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "success": { "type": "boolean" },
      "message": { "type": "string" }
    },
    "required": [
      "success",
      "message"
    ]
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": []
}
```