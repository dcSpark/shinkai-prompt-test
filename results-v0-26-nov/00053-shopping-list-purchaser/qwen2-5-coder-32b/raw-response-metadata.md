```json
{
  "id": "shinkai-tool-shopping-list-purchaser",
  "name": "Shinkai: Shopping List Purchaser",
  "description": "Tool for purchasing items from preferred stores based on a shopping list",
  "author": "Shinkai",
  "keywords": [
    "shopping list",
    "purchase",
    "preferred stores"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "shopping_list": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "item": { "type": "string" },
            "quantity": { "type": "number" }
          },
          "required": ["item", "quantity"]
        }
      },
      "preferred_stores": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "required": [
      "shopping_list",
      "preferred_stores"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "purchased_items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "store": { "type": "string" },
            "item": { "type": "string" },
            "quantity": { "type": "number" },
            "success": { "type": "boolean" }
          },
          "required": ["store", "item", "quantity", "success"]
        }
      }
    },
    "required": [
      "purchased_items"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```