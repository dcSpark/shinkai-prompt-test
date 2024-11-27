```json
{
  "id": "shinkai-tool-spiritual-guidance",
  "name": "Shinkai: Spiritual Guidance Generator",
  "description": "Generates spiritual guidance based on confession text and religion",
  "author": "Shinkai",
  "keywords": [
    "spiritual guidance",
    "confession",
    "religion"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "confession_text": { "type": "string" },
      "religion": { "type": "string" }
    },
    "required": [
      "confession_text",
      "religion"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "guidance": { "type": "string" }
    },
    "required": [
      "guidance"
    ]
  },
  "sqlTables": [
    {
      "name": "confessions",
      "definition": "CREATE TABLE confessions (id SERIAL PRIMARY KEY, confession_text TEXT NOT NULL, religion VARCHAR(255) NOT NULL, guidance TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all confessions",
      "query": "SELECT * FROM confessions"
    },
    {
      "name": "Get confession by religion",
      "query": "SELECT * FROM confessions WHERE religion = :religion"
    },
    {
      "name": "Get latest confession",
      "query": "SELECT * FROM confessions ORDER BY created_at DESC LIMIT 1"
    }
  ]
}
```