```json
{
  "id": "shinkai-tool-gmail-fetcher",
  "name": "Shinkai: Gmail Fetcher",
  "description": "Tool for fetching emails from Gmail using Google API",
  "author": "Shinkai",
  "keywords": [
    "gmail",
    "email fetcher",
    "google api",
    "shinkai"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "clientId": { "type": "string" },
      "clientEmail": { "type": "string" },
      "privateKey": { "type": "string" }
    },
    "required": [
      "clientId",
      "clientEmail",
      "privateKey"
    ]
  },
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "nullable": true },
      "max_results": { "type": "number", "default": 10, "nullable": true },
      "include_attachments": { "type": "boolean", "default": false, "nullable": true },
      "label": { "type": "string", "nullable": true }
    },
    "required": []
  },
  "result": {
    "type": "object",
    "properties": {
      "emails": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": { "type": "string" },
            "subject": { "type": "string" },
            "from": { "type": "string" },
            "date": { "type": "string" },
            "snippet": { "type": "string" },
            "attachments": {
              "anyOf": [
                { "type": "array", "items": {
                  "type": "object",
                  "properties": {
                    "filename": { "type": "string" },
                    "content": { "type": ["string", "null"] }
                  },
                  "required": ["filename"]
                }},
                { "type": "null" }
              ]
            }
          },
          "required": ["id", "subject", "from", "date", "snippet"]
        }
      }
    },
    "required": [
      "emails"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```