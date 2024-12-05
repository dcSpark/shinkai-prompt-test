
import os
import json
os.environ["SHINKAI_NODE_LOCATION"] = "http://localhost:9950"
os.environ["BEARER"] = "debug"
os.environ["X_SHINKAI_TOOL_ID"] = "tool-id-debug"
os.environ["X_SHINKAI_APP_ID"] = "tool-app-debug"
os.environ["X_SHINKAI_LLM_PROVIDER"] = "o_qwen2_5_coder_32b"
os.environ["HOME"] = "results/python/python-00005-benchmark-file-store/qwen2-5-coder-32b/editor/home"
os.environ["MOUNT"] = "results/python/python-00005-benchmark-file-store/qwen2-5-coder-32b/editor/mount"
os.environ["ASSETS"] = "results/python/python-00005-benchmark-file-store/qwen2-5-coder-32b/editor/assets"

from typing import Optional
import requests
from shinkai_local_support import get_home_path

class CONFIG:
    pass

class INPUTS:
    url: str

class OUTPUT:
    file_path: Optional[str]

async def run(config: CONFIG, inputs: INPUTS) -> OUTPUT:
    try:
        response = requests.get(inputs.url)
        response.raise_for_status()
        
        home_path = get_home_path()
        file_name = inputs.url.split('/')[-1]
        file_path = f"{home_path}/{file_name}"
        
        with open(file_path, 'wb') as file:
            file.write(response.content)
            
        output = OUTPUT()
        output.file_path = file_path
        return output
    
    except Exception as e:
        output = OUTPUT()
        output.file_path = None  # or handle the exception as needed
        return output

if __name__ == "__main__":
    import asyncio
    
    config = CONFIG()
    inputs = INPUTS()
    inputs.url="https://raw.githubusercontent.com/acedward/expert-octo-computing-machine/main/screenshot.png"
    
    # Run the async function
    result = asyncio.run(run(config, inputs))
    print(json.dumps(result.__dict__))
