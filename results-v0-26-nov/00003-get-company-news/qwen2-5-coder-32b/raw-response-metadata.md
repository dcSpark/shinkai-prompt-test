```json
{
  "id": "shinkai-tool-fetch-news",
  "name": "Shinkai: Fetch News",
  "description": "Fetches recent news articles related to a given company name over a specified number of days.",
  "author": "Shinkai",
  "keywords": [
    "news",
    "company",
    "articles",
    "fetch"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "company_name": { "type": "string" },
      "days_back": { "type": "number" }
    },
    "required": [
      "company_name",
      "days_back"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "news_count": { "type": "number" },
      "recent_news": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "description": { "type": "string" },
            "url": { "type": "string" },
            "publishedAt": { "type": "string" }
          },
          "required": [
            "title",
            "description",
            "url",
            "publishedAt"
          ]
        }
      }
    },
    "required": [
      "news_count",
      "recent_news"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```