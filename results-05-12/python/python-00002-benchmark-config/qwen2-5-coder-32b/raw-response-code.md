```python
from typing import Dict, Any, Optional, List
import requests

class CONFIG:
    api_key: str

class INPUTS:
    prompt: str

class OUTPUT:
    response: Optional[Dict[str, Any]]

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
    
    output = OUTPUT()
    if response.status_code == 200:
        output.response = response.json()
    else:
        output.response = None
    
    return output
```