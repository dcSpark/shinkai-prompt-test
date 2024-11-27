```json
{
  "id": "shinkai-tool-upload-reddit-image",
  "name": "Shinkai: Upload Reddit Image",
  "description": "Uploads an image to specified subreddits on Reddit using a Reddit access token.",
  "author": "Shinkai",
  "keywords": [
    "reddit",
    "image upload",
    "subreddit",
    "access token"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "redditAccessToken": { "type": "string" }
    },
    "required": [
      "redditAccessToken"
    ]
  },
  "parameters": {
    "type": "object",
    "properties": {
      "image_path": { "type": "string" },
      "subreddits": { "type": "array", "items": { "type": "string" } }
    },
    "required": [
      "image_path",
      "subreddits"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "success": { "type": "boolean" },
      "messages": { "type": "array", "items": { "type": "string" } }
    },
    "required": [
      "success",
      "messages"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```