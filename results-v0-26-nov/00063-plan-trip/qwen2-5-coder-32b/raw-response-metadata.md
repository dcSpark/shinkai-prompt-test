```json
{
  "id": "shinkai-tool-travel-itinerary-generator",
  "name": "Shinkai: Travel Itinerary Generator",
  "description": "Generates a travel itinerary based on destination, duration, and budget.",
  "author": "Shinkai",
  "keywords": [
    "travel",
    "itinerary",
    "generator",
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
      "destination": { "type": "string" },
      "duration_days": { "type": "number" },
      "budget": { "type": "number", "nullable": true }
    },
    "required": [
      "destination",
      "duration_days"
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
            "activities": {
              "type": "array",
              "items": { "type": "string" }
            }
          },
          "required": [
            "day",
            "activities"
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
      "name": "travel_activities",
      "definition": "CREATE TABLE travel_activities (id INTEGER PRIMARY KEY, location TEXT NOT NULL, activity TEXT NOT NULL)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get activities by location",
      "query": "SELECT activity FROM travel_activities WHERE location LIKE :location"
    },
    {
      "name": "List all locations",
      "query": "SELECT DISTINCT location FROM travel_activities"
    },
    {
      "name": "Count activities in a location",
      "query": "SELECT COUNT(*) AS count FROM travel_activities WHERE location = :location"
    }
  ]
}
```