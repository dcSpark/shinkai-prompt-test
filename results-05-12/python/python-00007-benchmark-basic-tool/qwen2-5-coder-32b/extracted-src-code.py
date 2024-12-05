from typing import Dict, Any
from shinkai_local_tools import shinkai_foobar

class CONFIG:
    pass

class INPUTS:
    pass

class OUTPUT:
    message: str

async def run(config: CONFIG, inputs: INPUTS) -> OUTPUT:
    response = shinkai_foobar("")
    output = OUTPUT()
    output.message = response["message"]
    return output