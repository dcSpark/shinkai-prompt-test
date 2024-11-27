```json
{
  "id": "shinkai-tool-create-pet-website",
  "name": "Shinkai: Create Pet Website",
  "description": "Creates a website for a pet and stores the information in SQL",
  "author": "Shinkai",
  "keywords": [
    "pet",
    "website",
    "HTML",
    "SQL"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "pet_name": { "type": "string" },
      "pet_type": { "type": "string" },
      "photos": { "type": "array", "items": { "type": "string" } }
    },
    "required": [
      "pet_name",
      "pet_type",
      "photos"
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
      "name": "pet_websites",
      "definition": "CREATE TABLE pet_websites (id INTEGER PRIMARY KEY AUTOINCREMENT, pet_name VARCHAR(255) NOT NULL, pet_type VARCHAR(255) NOT NULL, photo_count INTEGER NOT NULL, file_path TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get website by pet name",
      "query": "SELECT * FROM pet_websites WHERE pet_name = :pet_name"
    },
    {
      "name": "List all pet websites",
      "query": "SELECT * FROM pet_websites ORDER BY created_at DESC"
    }
  ]
}
```