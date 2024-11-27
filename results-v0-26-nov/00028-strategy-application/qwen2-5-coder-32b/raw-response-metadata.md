```json
{
  "id": "shinkai-tool-store-task-results",
  "name": "Shinkai: Store Task Results",
  "description": "Stores the results of a strategy and task execution in an SQLite database",
  "author": "Shinkai",
  "keywords": [
    "task results",
    "strategy",
    "sqlite",
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
      "strategy": { "type": "string" },
      "task": { "type": "string" },
      "constraints": { "type": "array", "items": { "type": "string" }, "nullable": true },
      "resources": { "type": "array", "items": { "type": "string" }, "nullable": true }
    },
    "required": [
      "strategy",
      "task"
    ]
  },
  "result": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "sqlTables": [
    {
      "name": "task_results",
      "definition": "CREATE TABLE task_results (id INTEGER PRIMARY KEY AUTOINCREMENT, strategy TEXT, task TEXT, constraints TEXT, resources TEXT);"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all task results",
      "query": "SELECT * FROM task_results;"
    },
    {
      "name": "Get task results by strategy",
      "query": "SELECT * FROM task_results WHERE strategy = :strategy;"
    },
    {
      "name": "Get task results by task",
      "query": "SELECT * FROM task_results WHERE task = :task;"
    }
  ]
}
```