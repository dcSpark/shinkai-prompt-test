```json
{
  "id": "shinkai-tool-travel-itinerary",
  "name": "Shinkai: Travel Itinerary Planner",
  "description": "Tool for creating a budget-friendly travel itinerary based on available activities",
  "author": "Shinkai",
  "keywords": [
    "travel",
    "itinerary",
    "budget-friendly",
    "activities"
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
      "max_budget": { "type": "number" }
    },
    "required": [
      "destination",
      "duration_days",
      "max_budget"
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
            "activities": { "type": "array", "items": { "type": "string" } },
            "cost": { "type": "number" }
          },
          "required": [
            "day",
            "activities",
            "cost"
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
      "name": "activities",
      "definition": "CREATE TABLE activities (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, cost DECIMAL NOT NULL, destination VARCHAR(255) NOT NULL)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all activities for a destination",
      "query": "SELECT * FROM activities WHERE destination = :destination"
    },
    {
      "name": "Get budget-friendly activities for a destination",
      "query": "SELECT name, cost FROM activities WHERE destination = :destination AND cost <= :max_budget_per_day ORDER BY cost ASC"
    }
  ]
}
```