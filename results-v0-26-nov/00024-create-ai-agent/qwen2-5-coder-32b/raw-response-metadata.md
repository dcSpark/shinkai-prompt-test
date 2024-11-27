```json
{
  "id": "shinkai-tool-create-ai-agent",
  "name": "Shinkai: Create AI Agent",
  "description": "Creates an AI agent with specified capabilities and personality in the database",
  "author": "Shinkai",
  "keywords": [
    "AI agent",
    "capabilities",
    "personality",
    "database"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "capabilities": { "type": "array", "items": { "type": "string" } },
      "personality": { "type": "string" }
    },
    "required": [
      "capabilities",
      "personality"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "success": { "type": "boolean" },
      "message": { "type": "string" }
    },
    "required": [
      "success",
      "message"
    ]
  },
  "sqlTables": [
    {
      "name": "ai_agents",
      "definition": "CREATE TABLE ai_agents (id INTEGER PRIMARY KEY AUTOINCREMENT, agent_data TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all AI agents",
      "query": "SELECT * FROM ai_agents"
    },
    {
      "name": "Get AI agent by ID",
      "query": "SELECT * FROM ai_agents WHERE id = :id"
    },
    {
      "name": "Delete AI agent by ID",
      "query": "DELETE FROM ai_agents WHERE id = :id"
    }
  ]
}
```