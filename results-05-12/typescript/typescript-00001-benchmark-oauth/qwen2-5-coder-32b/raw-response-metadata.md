```json
{
  "id": "google-calendar-event-creator",
  "name": "Google Calendar Event Creator",
  "description": "Tool for creating events in a Google Calendar",
  "author": "Shinkai",
  "keywords": [
    "google",
    "calendar",
    "event",
    "creator",
    "shinkai"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "clientId": { "type": "string" },
      "clientSecret": { "type": "string" },
      "redirectUri": { "type": "string" },
      "refreshToken": { "type": "string" }
    },
    "required": [
      "clientId",
      "clientSecret",
      "redirectUri",
      "refreshToken"
    ]
  },
  "parameters": {
    "type": "object",
    "properties": {
      "event": { "type": "string" },
      "description": { "type": "string" },
      "start_iso": { "type": "string" },
      "end_iso": { "type": "string" }
    },
    "required": [
      "event",
      "description",
      "start_iso",
      "end_iso"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "eventId": { "type": ["string", "null"] },
      "error": { "type": ["string", "null"] }
    },
    "required": []
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": []
}
```