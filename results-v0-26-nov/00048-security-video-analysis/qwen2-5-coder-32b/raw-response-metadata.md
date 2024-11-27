```json
{
  "id": "shinkai-tool-video-intrusion-detection",
  "name": "Shinkai: Video Intrusion Detection",
  "description": "Tool for detecting intrusions in a video stream using OpenCV",
  "author": "Shinkai",
  "keywords": [
    "video analysis",
    "intrusion detection",
    "opencv"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "video_stream_url": { "type": "string" },
      "sensitivity": { "type": "number", "default": 50 }
    },
    "required": [
      "video_stream_url"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "status": { "type": "string" }
    },
    "required": [
      "status"
    ]
  },
  "sqlTables": [
    {
      "name": "intrusions",
      "definition": "CREATE TABLE intrusions (id INTEGER PRIMARY KEY AUTOINCREMENT, result TEXT NOT NULL, detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all intrusions",
      "query": "SELECT * FROM intrusions"
    },
    {
      "name": "Get latest intrusion",
      "query": "SELECT * FROM intrusions ORDER BY detected_at DESC LIMIT 1"
    }
  ]
}
```