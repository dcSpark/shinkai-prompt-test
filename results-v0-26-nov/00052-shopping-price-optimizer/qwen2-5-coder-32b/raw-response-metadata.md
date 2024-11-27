```json
{
  "id": "shinkai-tool-fetch-prices",
  "name": "Shinkai: Fetch Prices",
  "description": "Tool for fetching the best prices of items from a shopping list at a given location",
  "author": "Shinkai",
  "keywords": [
    "price fetcher",
    "shopping list",
    "best prices"
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
      "location": { "type": "string" }
    },
    "required": [
      "shopping_list",
      "location"
    ]
  },
  "result": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "sqlTables": [
    {
      "name": "best_prices",
      "definition": "CREATE TABLE best_prices (item TEXT, price REAL, store TEXT)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all prices",
      "query": "SELECT * FROM best_prices"
    },
    {
      "name": "Get prices by item",
      "query": "SELECT * FROM best_prices WHERE item = :item"
    },
    {
      "name": "Get best price by store",
      "query": "SELECT MIN(price) as min_price, store FROM best_prices GROUP BY store"
    }
  ]
}
```