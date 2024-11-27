```json
{
  "id": "shinkai-tool-analyze-text",
  "name": "Shinkai: Text Analysis Tool",
  "description": "Tool for analyzing sentiment and emotion in text",
  "author": "Shinkai",
  "keywords": [
    "text analysis",
    "sentiment analysis",
    "emotion analysis",
    "shinkai"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "text": { "type": "string" },
      "language": { "type": "string", "nullable": true },
      "include_emotion_breakdown": { "type": "boolean", "default": false, "nullable": true },
      "confidence_threshold": { "type": "number", "minimum": 0, "maximum": 1, "nullable": true }
    },
    "required": [
      "text"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "sentiment": { "type": "string" },
      "emotion_analysis": { "type": "object", "additionalProperties": { "type": "number" }, "nullable": true }
    },
    "required": [
      "sentiment"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```