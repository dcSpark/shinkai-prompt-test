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