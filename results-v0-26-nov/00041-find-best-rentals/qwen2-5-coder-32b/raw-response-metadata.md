```json
{
  "id": "shinkai-tool-score-properties",
  "name": "Shinkai: Property Scorer",
  "description": "Scores properties based on given criteria for a specific city",
  "author": "Shinkai",
  "keywords": [
    "property scoring",
    "city property evaluation",
    "criteria-based scoring"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "city": { "type": "string" },
      "criteria": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "factor": { "type": "string" },
            "weight": { "type": "number" }
          },
          "required": ["factor", "weight"]
        }
      }
    },
    "required": [
      "city",
      "criteria"
    ]
  },
  "result": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "propertyId": { "type": "number" },
        "score": { "type": "number" }
      },
      "required": ["propertyId", "score"]
    }
  },
  "sqlTables": [
    {
      "name": "properties",
      "definition": "CREATE TABLE properties (id INTEGER PRIMARY KEY, city VARCHAR(255) NOT NULL, factor1 NUMBER, factor2 NUMBER, factor3 NUMBER)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all properties for a city",
      "query": "SELECT * FROM properties WHERE city = :city"
    },
    {
      "name": "Get property by ID",
      "query": "SELECT * FROM properties WHERE id = :id"
    }
  ]
}
```