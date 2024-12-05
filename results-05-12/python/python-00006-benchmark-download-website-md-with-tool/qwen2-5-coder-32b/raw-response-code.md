```python
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
```