```json
{
  "id": "shinkai-tool-shopping-list-generator",
  "name": "Shinkai: Shopping List Generator",
  "description": "Generates a shopping list based on household size, dietary restrictions, and budget.",
  "author": "Shinkai",
  "keywords": [
    "shopping list",
    "household size",
    "dietary restrictions",
    "budget"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "household_size": { "type": "number" },
      "dietary_restrictions": { "type": "array", "items": { "type": "string" }, "nullable": true },
      "budget": { "type": "number", "nullable": true }
    },
    "required": [
      "household_size"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "shopping_list": { "type": "object", "additionalProperties": { "type": "number" } }
    },
    "required": [
      "shopping_list"
    ]
  },
  "sqlTables": [
    {
      "name": "shopping_lists",
      "definition": "CREATE TABLE shopping_lists (id SERIAL PRIMARY KEY, household_size INTEGER NOT NULL, dietary_restrictions TEXT[], budget NUMERIC, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all shopping lists",
      "query": "SELECT * FROM shopping_lists"
    },
    {
      "name": "Get shopping list by household size",
      "query": "SELECT * FROM shopping_lists WHERE household_size = :household_size"
    },
    {
      "name": "Get latest shopping list",
      "query": "SELECT * FROM shopping_lists ORDER BY created_at DESC LIMIT 1"
    }
  ]
}
```