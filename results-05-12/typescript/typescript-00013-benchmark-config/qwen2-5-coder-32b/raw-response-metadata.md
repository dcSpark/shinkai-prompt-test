```json
{
  "id": "openai-chat-completion",
  "name": "OpenAI Chat Completion",
  "description": "Tool for generating chat completions using OpenAI's GPT-3.5-turbo model",
  "author": "",
  "keywords": [
    "openai",
    "chat completion",
    "gpt-3.5-turbo"
  ],
  "configurations": {
    "type": "object",
    "properties": {
      "api_key": { "type": "string" }
    },
    "required": ["api_key"]
  },
  "parameters": {
    "type": "object",
    "properties": {
      "prompt": { "type": "string" }
    },
    "required": ["prompt"]
  },
  "result": {
    "type": "object",
    "properties": {
      "response": { "type": "any" }
    },
    "required": ["response"]
  },
  "sqlTables": [],
  "sqlQueries": [],
  "tools": []
}
```