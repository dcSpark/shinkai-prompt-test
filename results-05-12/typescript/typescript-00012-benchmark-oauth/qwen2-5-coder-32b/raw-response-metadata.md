```json
{
  "id": "google-calendar-event-creator",
  "name": "Google Calendar Event Creator",
  "description": "Tool for creating events in Google Calendar using OAuth2 authentication",
  "author": "",
  "keywords": [
    "google calendar",
    "event creator",
    "oauth2"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "client_id": { "type": "string" },
      "client_secret": { "type": "string" },
      "redirect_uri": { "type": "string" },
      "refresh_token": { "type": "string" }
    },
    "required": [
      "client_id",
      "client_secret",
      "redirect_uri",
      "refresh_token"
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
      "success": { "type": "boolean" },
      "message": { "type": "string" }
    },
    "required": [
      "success",
      "message"
    ]
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": []
}
```