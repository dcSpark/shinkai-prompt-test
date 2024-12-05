```json
{
  "id": "chat-response-storage",
  "name": "Chat Response Storage",
  "description": "Tool for storing chat responses in a SQLite database",
  "author": "Shinkai",
  "keywords": [
    "chat response",
    "storage",
    "sqlite"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "api_key": { "type": "string" }
    },
    "required": ["api_key"]
  },
  "parameters": {
    "type": "object",
    "properties": {
      "prompt": { "type": "string" }
    },
    "required": ["prompt"]
  },
  "result": {
    "type": "object",
    "properties": {
      "success": { "type": "boolean" },
      "message": { "type": "string" }
    },
    "required": ["success", "message"]
  },
  "sqlTables": [
    {
      "name": "chat_responses",
      "definition": "CREATE TABLE IF NOT EXISTS chat_responses (id INTEGER PRIMARY KEY AUTOINCREMENT, prompt TEXT NOT NULL, response TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all chat responses",
      "query": "SELECT * FROM chat_responses"
    },
    {
      "name": "Get latest chat response by prompt",
      "query": "SELECT * FROM chat_responses WHERE prompt = :prompt ORDER BY created_at DESC LIMIT 1"
    }
  ],
  "tools": [
    "local:::rust_toolkit:::shinkai_sqlite_query_executor"
  ]
}
```