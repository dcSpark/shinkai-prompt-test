```json
{
  "id": "shinkai-tool-create-presentation",
  "name": "Shinkai: Presentation Creator",
  "description": "Creates a PowerPoint presentation based on given topic, number of slides, and style.",
  "author": "Shinkai",
  "keywords": [
    "PowerPoint",
    "presentation creator",
    "topic-based presentation"
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
      "slides_count": { "type": "number" },
      "style": { "type": "string", "enum": ["dark", "light"] }
    },
    "required": [
      "topic",
      "slides_count",
      "style"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "filePath": { "type": "string" }
    },
    "required": [
      "filePath"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```