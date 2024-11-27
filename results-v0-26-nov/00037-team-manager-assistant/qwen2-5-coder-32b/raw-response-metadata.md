```json
{
  "id": "shinkai-tool-team-activities",
  "name": "Shinkai: Team Activities and Quotes",
  "description": "Generates recommended team activities and inspirational quotes based on team size, project type, and management style",
  "author": "Shinkai",
  "keywords": [
    "team activities",
    "inspirational quotes",
    "project management",
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
      "team_size": { "type": "number" },
      "project_type": { "type": "string" },
      "management_style": { "type": "string" }
    },
    "required": [
      "team_size",
      "project_type",
      "management_style"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "inspirational_quotes": { "type": "array", "items": { "type": "string" } },
      "recommended_activities": { "type": "array", "items": { "type": "string" } }
    },
    "required": [
      "inspirational_quotes",
      "recommended_activities"
    ]
  },
  "sqlTables": [
    {
      "name": "team_activities",
      "definition": "CREATE TABLE team_activities (id SERIAL PRIMARY KEY, team_size INT NOT NULL, project_type VARCHAR(255) NOT NULL, management_style VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    },
    {
      "name": "inspirational_quotes",
      "definition": "CREATE TABLE inspirational_quotes (id SERIAL PRIMARY KEY, quote TEXT NOT NULL, management_style VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get team activities by team size and project type",
      "query": "SELECT * FROM team_activities WHERE team_size = :team_size AND project_type = :project_type"
    },
    {
      "name": "Get inspirational quotes by management style",
      "query": "SELECT quote FROM inspirational_quotes WHERE management_style LIKE '%' || :management_style || '%'"
    }
  ]
}
```