```json
{
  "id": "shinkai-tool-send-email",
  "name": "Shinkai: Send Email via Gmail",
  "description": "Sends an email using Gmail with OAuth2 authentication",
  "author": "Shinkai",
  "keywords": [
    "email",
    "gmail",
    "oauth2",
    "send mail"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "clientId": { "type": "string" },
      "clientSecret": { "type": "string" },
      "refreshToken": { "type": "string" }
    },
    "required": [
      "clientId",
      "clientSecret",
      "refreshToken"
    ]
  },
  "parameters": {
    "type": "object",
    "properties": {
      "to": { "type": "string" },
      "subject": { "type": "string" },
      "body": { "type": "string" },
      "attachments": { "type": "array", "items": { "type": "string" }, "nullable": true }
    },
    "required": [
      "to",
      "subject",
      "body"
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
  "sqlTables": [],
  "sqlQueries": []
}
```