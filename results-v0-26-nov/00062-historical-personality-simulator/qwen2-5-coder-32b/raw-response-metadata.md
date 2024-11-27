```json
{
  "id": "shinkai-tool-conversation-generator",
  "name": "Shinkai: Conversation Generator for Historical Figures",
  "description": "Generates a conversation based on historical figure data retrieved from the local database.",
  "author": "Shinkai",
  "keywords": [
    "historical figures",
    "conversation generator",
    "database query"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "person_name": { "type": "string" },
      "time_period": { "type": "string" },
      "topic": { "type": "string", "nullable": true }
    },
    "required": [
      "person_name",
      "time_period"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "conversation": { "type": "string" }
    },
    "required": [
      "conversation"
    ]
  },
  "sqlTables": [
    {
      "name": "historical_figures",
      "definition": "CREATE TABLE historical_figures (id INTEGER PRIMARY KEY, name TEXT NOT NULL, time_period TEXT NOT NULL, major_contributions TEXT, additional_details TEXT)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get historical figure by name and time period",
      "query": "SELECT * FROM historical_figures WHERE name LIKE ? AND time_period LIKE ? LIMIT 1"
    },
    {
      "name": "List all historical figures in a specific time period",
      "query": "SELECT * FROM historical_figures WHERE time_period = ?"
    },
    {
      "name": "Find historical figures with major contributions related to a topic",
      "query": "SELECT * FROM historical_figures WHERE major_contributions LIKE ?"
    }
  ]
}
```