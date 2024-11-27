```json
{
  "id": "shinkai-tool-post-tweet-with-image",
  "name": "Shinkai: Post Tweet with Image",
  "description": "Tool for posting a tweet with an image using the Twitter CLI",
  "author": "Shinkai",
  "keywords": [
    "twitter",
    "cli",
    "tweet",
    "image",
    "post"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "image_path": { "type": "string" },
      "tweet_text": { "type": "string" }
    },
    "required": [
      "image_path",
      "tweet_text"
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
  "sqlQueries": []
}
```