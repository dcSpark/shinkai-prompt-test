```json
{
  "id": "shinkai-tool-mailgun-email-sender",
  "name": "Shinkai: Mailgun Email Sender",
  "description": "Tool for sending emails using Mailgun API",
  "author": "Shinkai",
  "keywords": [
    "mailgun",
    "email",
    "sender",
    "shinkai"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "apiKey": { "type": "string" },
      "domain": { "type": "string" }
    },
    "required": [
      "apiKey",
      "domain"
    ]
  },
  "parameters": {
    "type": "object",
    "properties": {
      "to": { "type": "string" },
      "subject": { "type": "string" },
      "body": { "type": "string" },
      "from": { "type": "string" },
      "attachments": { "type": "array", "items": { "type": "string" }, "nullable": true }
    },
    "required": [
      "to",
      "subject",
      "body",
      "from"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "status": { "type": "number" },
      "message": { "type": "string" }
    },
    "required": [
      "status",
      "message"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```