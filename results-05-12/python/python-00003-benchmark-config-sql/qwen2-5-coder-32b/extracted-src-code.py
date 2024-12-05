from typing import Dict, Any, Optional, List
import requests
from shinkai_local_tools import shinkai_sqlite_query_executor

class CONFIG:
    api_key: str

class INPUTS:
    prompt: str

class OUTPUT:
    pass

async def run(config: CONFIG, inputs: INPUTS) -> OUTPUT:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {config.api_key}"
    }
    data = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": inputs.prompt}]
    }
    
    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=data)
    result = response.json()
    
    # Store the result in a database
    query = """
    CREATE TABLE IF NOT EXISTS openai_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO openai_responses (prompt, response) 
    VALUES (?, ?);
    """
    
    shinkai_sqlite_query_executor('default', query, [inputs.prompt, str(result)])
    
    output = OUTPUT()
    return output