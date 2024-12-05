
import os
import json
os.environ["SHINKAI_NODE_LOCATION"] = "http://localhost:9950"
os.environ["BEARER"] = "debug"
os.environ["X_SHINKAI_TOOL_ID"] = "tool-id-debug"
os.environ["X_SHINKAI_APP_ID"] = "tool-app-debug"
os.environ["X_SHINKAI_LLM_PROVIDER"] = "o_qwen2_5_coder_32b"
os.environ["HOME"] = "results/python/python-00010-benchmark-summarize-website/qwen2-5-coder-32b/editor/home"
os.environ["MOUNT"] = "results/python/python-00010-benchmark-summarize-website/qwen2-5-coder-32b/editor/mount"
os.environ["ASSETS"] = "results/python/python-00010-benchmark-summarize-website/qwen2-5-coder-32b/editor/assets"

from typing import Dict, Any
from shinkai_local_tools import benchmark_store_website, shinkai_llm_prompt_processor

class CONFIG:
    pass

class INPUTS:
    url: str

class OUTPUT:
    summary: str

async def run(config: CONFIG, inputs: INPUTS) -> OUTPUT:
    # Fetch and store website content
    website_data = benchmark_store_website(inputs.url)
    
    # Generate a summary using LLM prompt processor
    prompt = f"Please provide a concise summary of the following webpage content:\n{website_data}"
    response = shinkai_llm_prompt_processor(format='text', prompt=prompt)
    
    output = OUTPUT()
    output.summary = response['message']
    return output

if __name__ == "__main__":
    import asyncio
    
    config = CONFIG()
    inputs = INPUTS()
    inputs.url="https://raw.githubusercontent.com/acedward/expert-octo-computing-machine/main/test.html"
    
    # Run the async function
    result = asyncio.run(run(config, inputs))
    print(json.dumps(result.__dict__))
