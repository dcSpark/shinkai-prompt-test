```json
{
  "id": "shinkai-tool-audio-transcription",
  "name": "Shinkai: Audio Transcription Tool",
  "description": "Tool for converting audio files to text transcriptions and storing them in a SQLite database",
  "author": "Shinkai",
  "keywords": [
    "audio transcription",
    "speech to text",
    "sqlite storage",
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
      "file_path": { "type": "string" }
    },
    "required": [
      "file_path"
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
  "sqlTables": [
    {
      "name": "transcriptions",
      "definition": "CREATE TABLE transcriptions (id SERIAL PRIMARY KEY, file_path TEXT NOT NULL, text TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get transcription by file path",
      "query": "SELECT * FROM transcriptions WHERE file_path = :file_path"
    },
    {
      "name": "Get all transcriptions",
      "query": "SELECT * FROM transcriptions ORDER BY created_at DESC"
    }
  ]
}
```