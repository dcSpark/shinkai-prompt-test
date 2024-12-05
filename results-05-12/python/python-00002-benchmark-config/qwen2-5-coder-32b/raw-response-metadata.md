```json
{
  "id": "openai-gpt3-5-turbo",
  "name": "OpenAI GPT-3.5 Turbo Chat Completion",
  "description": "Tool for generating chat completions using OpenAI's GPT-3.5 Turbo model",
  "author": "",
  "keywords": [
    "openai",
    "gpt-3.5-turbo",
    "chat",
    "completion"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "api_key": { "type": "string" }
    },
    "required": [
      "api_key"
    ]
  },
  "parameters": {
    "type": "object",
    "properties": {
      "prompt": { "type": "string" }
    },
    "required": [
      "prompt"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "response": { "type": "object", "nullable": true }
    },
    "required": []
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": []
}
```