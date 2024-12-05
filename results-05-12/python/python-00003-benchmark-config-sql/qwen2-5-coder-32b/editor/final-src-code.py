
import os
import json
os.environ["SHINKAI_NODE_LOCATION"] = "http://localhost:9950"
os.environ["BEARER"] = "debug"
os.environ["X_SHINKAI_TOOL_ID"] = "tool-id-debug"
os.environ["X_SHINKAI_APP_ID"] = "tool-app-debug"
os.environ["X_SHINKAI_LLM_PROVIDER"] = "o_qwen2_5_coder_32b"
os.environ["HOME"] = "results/python/python-00003-benchmark-config-sql/qwen2-5-coder-32b/editor/home"
os.environ["MOUNT"] = "results/python/python-00003-benchmark-config-sql/qwen2-5-coder-32b/editor/mount"
os.environ["ASSETS"] = "results/python/python-00003-benchmark-config-sql/qwen2-5-coder-32b/editor/assets"

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

if __name__ == "__main__":
    import asyncio
    
    config = CONFIG()
    inputs = INPUTS()
    inputs.prompt="2 + 2 = ?"
    
    # Run the async function
    result = asyncio.run(run(config, inputs))
    print(json.dumps(result.__dict__))
