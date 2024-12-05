
from typing import Optional, Any, Dict, List, Union
import os
import requests
def shinkai_llm_prompt_processor(format: str, prompt: str) -> Dict[str, Any]:
    """Tool for processing any prompt using an AI LLM. 
Analyzing the input prompt and returning a string with the result of the prompt.
This can be used to process complex requests, text analysis, text matching, text generation, and any other AI LLM task.

    Args:
        format: The output format. Only 'text' is supported (required)
        prompt: The prompt to process (required)

    Returns:
        Dict[str, Any]: {
            message: str 
        }
    """
    _url = os.environ.get('SHINKAI_NODE_LOCATION', '') + '/v2/tool_execution'
    data = {
        'tool_router_key': 'local:::rust_toolkit:::shinkai_llm_prompt_processor',
        'tool_type': 'rust',
        'llm_provider': os.environ.get('X_SHINKAI_LLM_PROVIDER', ''),
        'parameters': {
            'format': format,
            'prompt': prompt,
        }
    }
    try:
        response = requests.post(
            _url,
            json=data,
            headers={
                'Authorization': f"Bearer {os.environ.get('BEARER', '')}",
                'x-shinkai-tool-id': os.environ.get('X_SHINKAI_TOOL_ID', ''),
                'x-shinkai-app-id': os.environ.get('X_SHINKAI_APP_ID', ''),
                'x-shinkai-llm-provider': os.environ.get('X_SHINKAI_LLM_PROVIDER', '')
            }
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        error_message = '::NETWORK_ERROR:: '
        if hasattr(e, 'response') and e.response is not None:
            error_message += f"Status: {e.response.status_code}, "
            try:
                error_message += f"Response: {e.response.json()}"
            except:
                error_message += f"Response: {e.response.text}"
        else:
            error_message += str(e)
        raise Exception(error_message)
def shinkai_sqlite_query_executor(database_name: str, query: str, query_params: Optional[List[Any]] = None) -> Dict[str, Any]:
    """Tool for executing a single SQL query on a specified database file. 
If this tool is used, you need to create if not exists the tables used other queries.
Table creation should always use 'CREATE TABLE IF NOT EXISTS'.

-- Example table creation:
CREATE TABLE IF NOT EXISTS table_name (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field_1 TEXT NOT NULL,
    field_2 DATETIME DEFAULT CURRENT_TIMESTAMP,
    field_3 INTEGER,
    field_4 TEXT
);

-- Example insert:
INSERT INTO table_name (field_1, field_3, field_4) 
    VALUES ('value_1', 3, 'value_4')
    ON CONFLICT(id) DO UPDATE SET field_1 = 'value_1', field_3 = 3, field_4 = 'value_4';
;

-- Example read:
SELECT * FROM table_name WHERE field_2 > datetime('now', '-1 day');
SELECT field_1, field_3 FROM table_name WHERE field_3 > 100 ORDER BY field_2 DESC LIMIT 10;

    Args:
        database_name: Database name. Use 'default' to use default database (required)
        query: The SQL query to execute (required)
        query_params: The parameters to bind to the query (optional)

    Returns:
        Dict[str, Any]: {
            result: Any 
            rowCount: float 
            rowsAffected: float 
            type: str 
        }
    """
    _url = os.environ.get('SHINKAI_NODE_LOCATION', '') + '/v2/tool_execution'
    data = {
        'tool_router_key': 'local:::rust_toolkit:::shinkai_sqlite_query_executor',
        'tool_type': 'rust',
        'llm_provider': os.environ.get('X_SHINKAI_LLM_PROVIDER', ''),
        'parameters': {
            'database_name': database_name,
            'query': query,
            'query_params': query_params,
        }
    }
    try:
        response = requests.post(
            _url,
            json=data,
            headers={
                'Authorization': f"Bearer {os.environ.get('BEARER', '')}",
                'x-shinkai-tool-id': os.environ.get('X_SHINKAI_TOOL_ID', ''),
                'x-shinkai-app-id': os.environ.get('X_SHINKAI_APP_ID', ''),
                'x-shinkai-llm-provider': os.environ.get('X_SHINKAI_LLM_PROVIDER', '')
            }
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        error_message = '::NETWORK_ERROR:: '
        if hasattr(e, 'response') and e.response is not None:
            error_message += f"Status: {e.response.status_code}, "
            try:
                error_message += f"Response: {e.response.json()}"
            except:
                error_message += f"Response: {e.response.text}"
        else:
            error_message += str(e)
        raise Exception(error_message)
def benchmark_store_website(url: str) -> Dict[str, Any]:
    """Fetches website content from a URL, stores it in an SQLite database, and retrieves all stored data.

    Args:
        url: Parameter (required)

    Returns:
        Dict[str, Any]: {
        }
    """
    _url = os.environ.get('SHINKAI_NODE_LOCATION', '') + '/v2/tool_execution'
    data = {
        'tool_router_key': 'local:::benchmark_store_website_test_engine:::benchmark_store_website',
        'tool_type': 'deno',
        'llm_provider': os.environ.get('X_SHINKAI_LLM_PROVIDER', ''),
        'parameters': {
            'url': url,
        }
    }
    try:
        response = requests.post(
            _url,
            json=data,
            headers={
                'Authorization': f"Bearer {os.environ.get('BEARER', '')}",
                'x-shinkai-tool-id': os.environ.get('X_SHINKAI_TOOL_ID', ''),
                'x-shinkai-app-id': os.environ.get('X_SHINKAI_APP_ID', ''),
                'x-shinkai-llm-provider': os.environ.get('X_SHINKAI_LLM_PROVIDER', '')
            }
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        error_message = '::NETWORK_ERROR:: '
        if hasattr(e, 'response') and e.response is not None:
            error_message += f"Status: {e.response.status_code}, "
            try:
                error_message += f"Response: {e.response.json()}"
            except:
                error_message += f"Response: {e.response.text}"
        else:
            error_message += str(e)
        raise Exception(error_message)
