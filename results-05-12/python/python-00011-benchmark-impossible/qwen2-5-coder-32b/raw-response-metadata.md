```json
{
  "id": "social-media-poster",
  "name": "Social Media Poster",
  "description": "Posts content to Facebook, Twitter, Instagram, and Reddit",
  "author": "",
  "keywords": [
    "social media",
    "poster",
    "facebook",
    "twitter",
    "instagram",
    "reddit"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "facebook_token": { "type": "string" },
      "twitter_token": { "type": "string" },
      "instagram_token": { "type": "string" },
      "reddit_client_id": { "type": "string" },
      "reddit_client_secret": { "type": "string" },
      "reddit_user_agent": { "type": "string" },
      "reddit_username": { "type": "string" },
      "reddit_password": { "type": "string" }
    },
    "required": [
      "facebook_token",
      "twitter_token",
      "instagram_token",
      "reddit_client_id",
      "reddit_client_secret",
      "reddit_user_agent",
      "reddit_username",
      "reddit_password"
    ]
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
      "results": {
        "type": "object",
        "additionalProperties": {
          "anyOf": [
            { "type": "object" },
            { "type": "string" }
          ]
        }
      }
    },
    "required": [
      "results"
    ]
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": []
}
```