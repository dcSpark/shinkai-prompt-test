```json
{
  "id": "post-to-social-media",
  "name": "Post to Social Media",
  "description": "Posts a title and content to multiple social media platforms including Facebook, X/Twitter, Instagram, and Reddit.",
  "author": "",
  "keywords": [
    "social media",
    "posting",
    "API",
    "Facebook",
    "Twitter",
    "Instagram",
    "Reddit"
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
    "properties": {},
    "required": []
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": []
}
```