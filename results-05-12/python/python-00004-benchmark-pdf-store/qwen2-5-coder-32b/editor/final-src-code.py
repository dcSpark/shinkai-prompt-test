
import os
import json
os.environ["SHINKAI_NODE_LOCATION"] = "http://localhost:9950"
os.environ["BEARER"] = "debug"
os.environ["X_SHINKAI_TOOL_ID"] = "tool-id-debug"
os.environ["X_SHINKAI_APP_ID"] = "tool-app-debug"
os.environ["X_SHINKAI_LLM_PROVIDER"] = "o_qwen2_5_coder_32b"
os.environ["HOME"] = "results/python/python-00004-benchmark-pdf-store/qwen2-5-coder-32b/editor/home"
os.environ["MOUNT"] = "results/python/python-00004-benchmark-pdf-store/qwen2-5-coder-32b/editor/mount"
os.environ["ASSETS"] = "results/python/python-00004-benchmark-pdf-store/qwen2-5-coder-32b/editor/assets"

from typing import Any, Optional
import requests
from shinkai_local_support import get_home_path
from pdfminer.high_level import extract_text

class CONFIG:
    pass

class INPUTS:
    url: str

class OUTPUT:
    file_path: str

async def run(config: CONFIG, inputs: INPUTS) -> OUTPUT:
    response = requests.get(inputs.url)
    home_path = get_home_path()
    file_name = "downloaded_pdf.pdf"
    file_path = f"{home_path}/{file_name}"
    
    with open(file_path, 'wb') as file:
        file.write(response.content)

    pdf_text = extract_text(file_path)
    text_file_name = "parsed_content.txt"
    text_file_path = f"{home_path}/{text_file_name}"
    
    with open(text_file_path, 'w', encoding='utf-8') as text_file:
        text_file.write(pdf_text)

    output = OUTPUT()
    output.file_path = text_file_path
    return output

if __name__ == "__main__":
    import asyncio
    
    config = CONFIG()
    inputs = INPUTS()
    inputs.url="https://raw.githubusercontent.com/acedward/expert-octo-computing-machine/main/sample.pdf"
    
    # Run the async function
    result = asyncio.run(run(config, inputs))
    print(json.dumps(result.__dict__))
