```json
{
  "id": "shinkai-tool-env-parser",
  "name": "Shinkai: Environment Variable Parser",
  "description": "Parses an environment file and optionally includes system environment variables",
  "author": "Shinkai",
  "keywords": [
    "environment variable parser",
    "env file reader",
    "system environment variables"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "env_file_path": { "type": "string", "nullable": true },
      "include_system_vars": { "type": "boolean", "default": false }
    },
    "required": []
  },
  "result": {
    "type": "object",
    "properties": {
      "envVariables": { "type": "object", "additionalProperties": { "type": "string" } },
      "explanation": { "type": "array", "items": { "type": "string" } }
    },
    "required": [
      "envVariables",
      "explanation"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```