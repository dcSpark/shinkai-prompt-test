```json
{
  "id": "shinkai-tool-pet-itinerary",
  "name": "Shinkai: Pet Friendly Itinerary Generator",
  "description": "Generates a pet-friendly itinerary based on destination, duration, and pet type",
  "author": "Shinkai",
  "keywords": [
    "pet friendly",
    "itinerary generator",
    "destination",
    "duration",
    "pet type"
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
      "pet_type": { "type": "string" }
    },
    "required": [
      "destination",
      "duration_days",
      "pet_type"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "success": { "type": "boolean" },
      "message": { "type": "string" }
    },
    "required": [
      "success",
      "message"
    ]
  },
  "sqlTables": [
    {
      "name": "pet_friendly_itineraries",
      "definition": "CREATE TABLE pet_friendly_itineraries (id SERIAL PRIMARY KEY, destination TEXT NOT NULL, duration_days INTEGER NOT NULL, pet_type TEXT NOT NULL, details JSONB, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get itinerary by destination",
      "query": "SELECT * FROM pet_friendly_itineraries WHERE destination = :destination ORDER BY created_at DESC LIMIT 1"
    },
    {
      "name": "Get itineraries by pet type",
      "query": "SELECT * FROM pet_friendly_itineraries WHERE pet_type = :pet_type"
    },
    {
      "name": "Get all itineraries",
      "query": "SELECT * FROM pet_friendly_itineraries"
    }
  ]
}
```