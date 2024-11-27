```json
{
  "id": "shinkai-tool-send-whatsapp-message",
  "name": "Shinkai: Send WhatsApp Message",
  "description": "Sends a WhatsApp message to a specified phone number using WhatsApp Business API",
  "author": "Shinkai",
  "keywords": [
    "WhatsApp",
    "send message",
    "API",
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