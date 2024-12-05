```json
{
  "id": "openai-response-storer",
  "name": "OpenAI Response Storer",
  "description": "Sends a prompt to the OpenAI API and stores the response in a SQLite database.",
  "author": "",
  "keywords": [
    "OpenAI",
    "API",
    "prompt",
    "response",
    "SQLite"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "api_key": {
        "type": "string"
      }
    },
    "required": [
      "api_key"
    ]
  },
  "parameters": {
    "type": "object",
    "properties": {
      "prompt": {
        "type": "string"
      }
    },
    "required": [
      "prompt"
    ]
  },
  "result": {
    "type": "object",
    "properties": {}
  },
  "sqlTables": [
    {
      "name": "openai_responses",
      "definition": "CREATE TABLE IF NOT EXISTS openai_responses (id INTEGER PRIMARY KEY AUTOINCREMENT, prompt TEXT NOT NULL, response TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get latest response by prompt",
      "query": "SELECT * FROM openai_responses WHERE prompt = :prompt ORDER BY created_at DESC LIMIT 1"
    },
    {
      "name": "Get all responses by prompt",
      "query": "SELECT * FROM openai_responses WHERE prompt = :prompt"
    }
  ],
  "tools": [
    "local:::rust_toolkit:::shinkai_sqlite_query_executor"
  ]
}
```