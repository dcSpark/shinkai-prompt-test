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