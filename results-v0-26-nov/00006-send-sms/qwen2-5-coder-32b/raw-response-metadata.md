```json
{
  "id": "shinkai-tool-send-sms",
  "name": "Shinkai: Send SMS",
  "description": "Tool for sending SMS messages via an API",
  "author": "Shinkai",
  "keywords": [
    "send sms",
    "sms api",
    "message sender"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "smsApiUrl": { "type": "string" },
      "apiKey": { "type": "string" }
    },
    "required": [
      "smsApiUrl",
      "apiKey"
    ]
  },
  "parameters": {
    "type": "object",
    "properties": {
      "phone_number": { "type": "string" },
      "message": { "type": "string" }
    },
    "required": [
      "phone_number",
      "message"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "success": { "type": "boolean" },
      "message": { "type": "string", "nullable": true }
    },
    "required": [
      "success"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```