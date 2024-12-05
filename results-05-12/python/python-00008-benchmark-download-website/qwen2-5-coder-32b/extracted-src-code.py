from typing import Dict, Any, Optional
import requests

class CONFIG:
    pass

class INPUTS:
    url: str

class OUTPUT:
    content: str

async def run(config: CONFIG, inputs: INPUTS) -> OUTPUT:
    response = requests.get(inputs.url)
    output = OUTPUT()
    output.content = response.text
    return output