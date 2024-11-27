```json
{
  "id": "shinkai-tool-summarize-papers",
  "name": "Shinkai: Summarize Papers",
  "description": "Tool for summarizing academic papers from URLs",
  "author": "Shinkai",
  "keywords": [
    "paper summary",
    "academic papers",
    "URL to summary"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "paper_urls": { "type": "array", "items": { "type": "string" } },
      "focus_areas": { "type": "array", "items": { "type": "string" }, "nullable": true }
    },
    "required": [
      "paper_urls"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "summaries": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "url": { "type": "string" },
            "summary": { "type": "string" }
          },
          "required": ["url", "summary"]
        }
      }
    },
    "required": [
      "summaries"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```