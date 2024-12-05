
import os
import json
os.environ["SHINKAI_NODE_LOCATION"] = "http://localhost:9950"
os.environ["BEARER"] = "debug"
os.environ["X_SHINKAI_TOOL_ID"] = "tool-id-debug"
os.environ["X_SHINKAI_APP_ID"] = "tool-app-debug"
os.environ["X_SHINKAI_LLM_PROVIDER"] = "o_qwen2_5_coder_32b"
os.environ["HOME"] = "results/python/python-00006-benchmark-download-website-md-with-tool/qwen2-5-coder-32b/editor/home"
os.environ["MOUNT"] = "results/python/python-00006-benchmark-download-website-md-with-tool/qwen2-5-coder-32b/editor/mount"
os.environ["ASSETS"] = "results/python/python-00006-benchmark-download-website-md-with-tool/qwen2-5-coder-32b/editor/assets"

from typing import List, Dict
from shinkai_local_tools import shinkai_download_pages

class CONFIG:
    pass

class INPUTS:
    urls: List[str]

class OUTPUT:
    content: str

async def run(config: CONFIG, inputs: INPUTS) -> OUTPUT:
    result = shinkai_download_pages(inputs.urls)
    markdown_content = '\n'.join(result['markdowns'])
    output = OUTPUT()
    output.content = markdown_content
    return output

if __name__ == "__main__":
    import asyncio
    
    config = CONFIG()
    inputs = INPUTS()
    inputs.urls=["https://raw.githubusercontent.com/acedward/expert-octo-computing-machine/main/test.html"]
    
    # Run the async function
    result = asyncio.run(run(config, inputs))
    print(json.dumps(result.__dict__))
