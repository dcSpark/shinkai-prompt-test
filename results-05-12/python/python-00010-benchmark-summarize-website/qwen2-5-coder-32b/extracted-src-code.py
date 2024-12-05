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