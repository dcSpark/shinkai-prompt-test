
import os
import json
os.environ["SHINKAI_NODE_LOCATION"] = "http://localhost:9950"
os.environ["BEARER"] = "debug"
os.environ["X_SHINKAI_TOOL_ID"] = "tool-id-debug"
os.environ["X_SHINKAI_APP_ID"] = "tool-app-debug"
os.environ["X_SHINKAI_LLM_PROVIDER"] = "o_qwen2_5_coder_32b"
os.environ["HOME"] = "results/python/python-00009-benchmark-store-website/qwen2-5-coder-32b/editor/home"
os.environ["MOUNT"] = "results/python/python-00009-benchmark-store-website/qwen2-5-coder-32b/editor/mount"
os.environ["ASSETS"] = "results/python/python-00009-benchmark-store-website/qwen2-5-coder-32b/editor/assets"

from typing import Dict, Any
from shinkai_local_tools import shinkai_sqlite_query_executor
import requests

class CONFIG:
    pass

class INPUTS:
    url: str

class OUTPUT:
    table_data: List[Dict[str, Any]]

async def run(config: CONFIG, inputs: INPUTS) -> OUTPUT:
    # Fetch the content from the given URL
    response = requests.get(inputs.url)
    website_content = response.text

    # Define the database and table details
    database_name = 'default'
    table_name = 'website_content'

    # Create table if it doesn't exist
    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS {table_name} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL
    );
    """
    shinkai_sqlite_query_executor(database_name, create_table_query, None)

    # Insert or update the website content in the table
    insert_update_query = f"""
    INSERT INTO {table_name} (url, content) 
    VALUES (?, ?)
    ON CONFLICT(url) DO UPDATE SET content = ?;
    """
    query_params = [inputs.url, website_content, website_content]
    shinkai_sqlite_query_executor(database_name, insert_update_query, query_params)

    # Select all data from the table
    select_query = f"SELECT * FROM {table_name};"
    result = shinkai_sqlite_query_executor(database_name, select_query, None)

    output = OUTPUT()
    output.table_data = result['result']
    return output

if __name__ == "__main__":
    import asyncio
    
    config = CONFIG()
    inputs = INPUTS()
    inputs.url="https://raw.githubusercontent.com/acedward/expert-octo-computing-machine/main/test.html"
    
    # Run the async function
    result = asyncio.run(run(config, inputs))
    print(json.dumps(result.__dict__))