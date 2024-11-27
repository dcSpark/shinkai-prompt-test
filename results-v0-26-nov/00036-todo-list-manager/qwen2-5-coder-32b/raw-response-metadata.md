```json
{
  "id": "shinkai-tool-todo-list-manager",
  "name": "Shinkai: Todo List Manager",
  "description": "Manages a todo list by adding tasks to an SQLite database",
  "author": "Shinkai",
  "keywords": [
    "todo list",
    "sqlite",
    "task manager"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "tasks": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "category": { "type": "string" },
            "due_date": { "type": "string" }
          },
          "required": ["title", "category", "due_date"]
        }
      }
    },
    "required": ["tasks"]
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
      "name": "todos",
      "definition": "CREATE TABLE todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT NOT NULL, due_date TEXT NOT NULL)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all tasks",
      "query": "SELECT * FROM todos"
    },
    {
      "name": "Get tasks by category",
      "query": "SELECT * FROM todos WHERE category = :category"
    },
    {
      "name": "Get tasks by due date",
      "query": "SELECT * FROM todos WHERE due_date = :due_date"
    }
  ]
}
```