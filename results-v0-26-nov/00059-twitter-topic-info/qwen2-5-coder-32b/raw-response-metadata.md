```json
{
  "id": "shinkai-tool-fetch-tweets",
  "name": "Shinkai: Fetch Tweets by Topic",
  "description": "Fetches tweets related to a specific topic from the past given days.",
  "author": "Shinkai",
  "keywords": [
    "twitter",
    "tweets",
    "topic",
    "fetch"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "bearerToken": { "type": "string" }
    },
    "required": [
      "bearerToken"
    ]
  },
  "parameters": {
    "type": "object",
    "properties": {
      "topic": { "type": "string" },
      "days_back": { "type": "number", "default": 7, "nullable": true }
    },
    "required": [
      "topic"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "tweets": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": { "type": "string" },
            "text": { "type": "string" },
            "created_at": { "type": "string" },
            "author_id": { "type": "string" }
          },
          "required": [
            "id",
            "text",
            "created_at",
            "author_id"
          ]
        }
      },
      "analysis": {
        "type": "object",
        "properties": {
          "totalTweets": { "type": "number" },
          "averageTweetLength": { "type": "number" }
        },
        "required": [
          "totalTweets",
          "averageTweetLength"
        ]
      }
    },
    "required": [
      "tweets",
      "analysis"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```