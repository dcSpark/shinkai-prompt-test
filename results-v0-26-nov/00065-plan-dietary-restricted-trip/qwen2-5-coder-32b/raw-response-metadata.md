```json
{
  "id": "shinkai-tool-itinerary-generator",
  "name": "Shinkai: Itinerary Generator",
  "description": "Generates an itinerary based on dietary restrictions and location",
  "author": "Shinkai",
  "keywords": [
    "itinerary",
    "dietary restrictions",
    "location",
    "restaurants"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "destination": { "type": "string" },
      "duration_days": { "type": "number" },
      "dietary_restrictions": { "type": "array", "items": { "type": "string" } }
    },
    "required": [
      "destination",
      "duration_days",
      "dietary_restrictions"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "itinerary": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "day": { "type": "number" },
            "meals": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "mealType": { "type": "string" },
                  "restaurantName": { "type": "string" }
                },
                "required": [
                  "mealType",
                  "restaurantName"
                ]
              }
            }
          },
          "required": [
            "day",
            "meals"
          ]
        }
      }
    },
    "required": [
      "itinerary"
    ]
  },
  "sqlTables": [
    {
      "name": "restaurants",
      "definition": "CREATE TABLE restaurants (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, address TEXT, location VARCHAR(255), dietary_tags TEXT)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all restaurants",
      "query": "SELECT * FROM restaurants"
    },
    {
      "name": "Get restaurants by location and dietary tags",
      "query": "SELECT name, address, meal_type FROM restaurants WHERE location = ? AND (dietary_tags LIKE ? OR dietary_tags LIKE ?)"
    },
    {
      "name": "Get restaurant count",
      "query": "SELECT COUNT(*) FROM restaurants"
    }
  ]
}
```