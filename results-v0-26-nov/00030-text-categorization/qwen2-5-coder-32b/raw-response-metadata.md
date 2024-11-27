```json
{
  "id": "shinkai-tool-categorize-text",
  "name": "Shinkai: Text Categorizer",
  "description": "Tool for categorizing text based on predefined categories or auto-categorization.",
  "author": "Shinkai",
  "keywords": [
    "text categorization",
    "NLP",
    "categories",
    "auto categorize"
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
      "predefined_categories": { "type": "array", "items": { "type": "string" }, "nullable": true },
      "auto_categorize": { "type": "boolean", "default": false, "nullable": true },
      "max_categories": { "type": "number", "nullable": true }
    },
    "required": [
      "text"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "categories": { "type": "array", "items": { "type": "string" } }
    },
    "required": [
      "categories"
    ]
  },
  "sqlTables": [
    {
      "name": "categories",
      "definition": "CREATE TABLE categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255) NOT NULL UNIQUE)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all categories",
      "query": "SELECT * FROM categories"
    },
    {
      "name": "Get categories by names",
      "query": "SELECT name FROM categories WHERE name IN (?)"
    },
    {
      "name": "Insert new categories",
      "query": "INSERT INTO categories (name) VALUES ?"
    }
  ]
}
```