```json
{
  "id": "google-calendar-event-creator",
  "name": "Google Calendar Event Creator",
  "description": "Tool for creating an event in Google Calendar using OAuth2 authentication.",
  "author": "",
  "keywords": [
    "google calendar",
    "event creator",
    "oauth2"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "client_secret_file": { "type": "string" },
      "token_file": { "type": "string" },
      "scopes": { "type": "array", "items": { "type": "string" } }
    },
    "required": [
      "client_secret_file",
      "token_file",
      "scopes"
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
      "event_id": { "type": "string", "nullable": true },
      "error_message": { "type": "string", "nullable": true }
    },
    "required": []
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": []
}
```