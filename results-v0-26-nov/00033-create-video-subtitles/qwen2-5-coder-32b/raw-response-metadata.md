```json
{
  "id": "shinkai-tool-video-to-srt",
  "name": "Shinkai: Video to SRT Converter",
  "description": "Converts video files to SRT subtitle files by extracting audio, performing speech recognition, and generating subtitles.",
  "author": "Shinkai",
  "keywords": [
    "video to SRT",
    "speech recognition",
    "subtitle generation"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "video_path": { "type": "string" }
    },
    "required": [
      "video_path"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "subtitle_path": { "type": "string" }
    },
    "required": [
      "subtitle_path"
    ]
  },
  "sqlTables": [
    {
      "name": "video_subtitles",
      "definition": "CREATE TABLE video_subtitles (id SERIAL PRIMARY KEY, video_path TEXT NOT NULL, subtitle_path TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get subtitles by video path",
      "query": "SELECT * FROM video_subtitles WHERE video_path = :videoPath"
    },
    {
      "name": "Get latest subtitles",
      "query": "SELECT * FROM video_subtitles ORDER BY created_at DESC LIMIT 1"
    },
    {
      "name": "List all subtitles",
      "query": "SELECT * FROM video_subtitles"
    }
  ]
}
```