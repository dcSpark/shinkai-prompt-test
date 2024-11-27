```json
{
  "id": "shinkai-tool-recommendation-fetcher",
  "name": "Shinkai: Recommendation Fetcher",
  "description": "Fetches recommended methods for accomplishing a task with optional constraints from an external API.",
  "author": "Shinkai",
  "keywords": [
    "recommendation",
    "task completion",
    "constraints",
    "external API"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "task": { "type": "string" },
      "constraints": { "type": "array", "items": { "type": "string" } }
    },
    "required": [
      "task"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "recommendedMethods": { "type": "array", "items": { "type": "string" } },
      "researchSummary": { "type": "string" }
    },
    "required": [
      "recommendedMethods",
      "researchSummary"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```