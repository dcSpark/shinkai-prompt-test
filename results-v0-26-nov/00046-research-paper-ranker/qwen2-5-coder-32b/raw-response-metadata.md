```json
{
  "id": "shinkai-tool-research-paper-search",
  "name": "Shinkai: Research Paper Search",
  "description": "Tool for searching research papers based on a topic, sorting criteria, and limit",
  "author": "Shinkai",
  "keywords": [
    "research paper",
    "search",
    "API",
    "citations"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "topic": { "type": "string" },
      "sort_by": { "type": "string", "enum": ["citations", "relevance", "date"] },
      "limit": { "type": "number", "default": 10, "nullable": true }
    },
    "required": [
      "topic",
      "sort_by"
    ]
  },
  "result": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "authors": { "type": "array", "items": { "type": "string" } },
        "publication_date": { "type": "string" },
        "citations": { "type": "number" },
        "url": { "type": "string" }
      },
      "required": [
        "title",
        "authors",
        "publication_date",
        "citations",
        "url"
      ]
    }
  },
  "sqlTables": [],
  "sqlQueries": []
}
```