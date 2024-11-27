```json
{
  "id": "shinkai-tool-podcast-script-generator",
  "name": "Shinkai: Podcast Script Generator",
  "description": "Generates a podcast episode script based on the given topic, duration, and style.",
  "author": "Shinkai",
  "keywords": [
    "podcast",
    "script generator",
    "episode outline",
    "content creation"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "topic": { "type": "string" },
      "duration_minutes": { "type": "number" },
      "style": { "type": "string" }
    },
    "required": [
      "topic",
      "duration_minutes",
      "style"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "episode_script": { "type": "string" }
    },
    "required": [
      "episode_script"
    ]
  },
  "sqlTables": [
    {
      "name": "podcast_episodes",
      "definition": "CREATE TABLE podcast_episodes (id SERIAL PRIMARY KEY, topic TEXT NOT NULL, duration_minutes INTEGER NOT NULL, style TEXT NOT NULL, episode_script TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get all episodes",
      "query": "SELECT * FROM podcast_episodes"
    },
    {
      "name": "Get episodes by topic",
      "query": "SELECT * FROM podcast_episodes WHERE topic = :topic"
    },
    {
      "name": "Get latest episode",
      "query": "SELECT * FROM podcast_episodes ORDER BY created_at DESC LIMIT 1"
    }
  ]
}
```