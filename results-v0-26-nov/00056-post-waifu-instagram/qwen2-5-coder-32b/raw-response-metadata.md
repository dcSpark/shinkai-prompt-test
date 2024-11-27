```json
{
  "id": "shinkai-tool-instagram-poster",
  "name": "Shinkai: Instagram Poster",
  "description": "Tool for posting images to Instagram with a caption and hashtags based on theme",
  "author": "Shinkai",
  "keywords": [
    "instagram",
    "poster",
    "image upload",
    "caption",
    "hashtags",
    "shinkai"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "instagramUsername": { "type": "string" },
      "instagramPassword": { "type": "string" },
      "sqliteDbPath": { "type": "string" }
    },
    "required": [
      "instagramUsername",
      "instagramPassword",
      "sqliteDbPath"
    ]
  },
  "parameters": {
    "type": "object",
    "properties": {
      "image_path": { "type": "string" },
      "caption_theme": { "type": "string" }
    },
    "required": [
      "image_path",
      "caption_theme"
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
  "sqlTables": [
    {
      "name": "posts",
      "definition": "CREATE TABLE posts (id INTEGER PRIMARY KEY AUTOINCREMENT, image_path TEXT NOT NULL, caption_theme TEXT NOT NULL, post_id TEXT NOT NULL, success BOOLEAN NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all posts",
      "query": "SELECT * FROM posts"
    },
    {
      "name": "Get successful posts by theme",
      "query": "SELECT * FROM posts WHERE caption_theme = :caption_theme AND success = true"
    },
    {
      "name": "Delete post by ID",
      "query": "DELETE FROM posts WHERE id = :id"
    }
  ]
}
```