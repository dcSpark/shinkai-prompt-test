```json
{
  "id": "shinkai-tool-deploy-code",
  "name": "Shinkai: Deploy Code Generator",
  "description": "Tool for generating and deploying code for different platforms",
  "author": "Shinkai",
  "keywords": [
    "code generation",
    "deployment",
    "platform specific",
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
      "platform": { "type": "string" },
      "api_name": { "type": "string" }
    },
    "required": [
      "platform",
      "api_name"
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
      "name": "deployments",
      "definition": "CREATE TABLE deployments (id INTEGER PRIMARY KEY AUTOINCREMENT, api_name VARCHAR(255) NOT NULL, platform VARCHAR(100) NOT NULL, code TEXT NOT NULL, deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all deployments",
      "query": "SELECT * FROM deployments"
    },
    {
      "name": "Get deployment by API name",
      "query": "SELECT * FROM deployments WHERE api_name = :api_name"
    },
    {
      "name": "Get latest deployment for a platform",
      "query": "SELECT * FROM deployments WHERE platform = :platform ORDER BY deployed_at DESC LIMIT 1"
    }
  ]
}
```