
<agent_libraries>
  * You may use any of the following functions if they are relevant and a good match for the task.
  * Import them with the format: `from shinkai_local_tools import xx`
  
  Import these functions with the format: `from shinkai_local_support import xx`                  
# <shinkai_local_support>
```python

def get_mount_paths() -> List[str]:
    """Gets an array of mounted files.
    
    Returns:
        List[str]: Array of files
    """
    ...


def get_asset_paths() -> List[str]:
    """Gets an array of asset files. These files are read only.
    
    Returns:
        List[str]: Array of files
    """
    ...


def get_home_path() -> str:
    """Gets the home directory path. All created files must be written to this directory.
    
    Returns:
        str: Home directory path
    """
    ...


def get_shinkai_node_location() -> str:
    """Gets the Shinkai Node location URL. This is the URL of the Shinkai Node server.
    
    Returns:
        str: Shinkai Node URL
    """
    ...


```

Import these functions with the format: `from shinkai_local_tools import xx`                  
# <shinkai_local_tools>
```python
def shinkai_sqlite_query_executor(database_name: str, query: str, query_params: Optional[List[Any]]) -> Dict[str, Any]:
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
    ...

```

</agent_libraries>

<agent_python_libraries>
* Prefer libraries in the following order:
  1. A function provided by './shinkai_local_tools.py' that resolves correctly the requierement.
  2. If network fetch is required, use the "requests" library and import it with using `import requests`.
  3. The code will be ran with Python Runtime, so prefer Python default and standard libraries. Import all used libraries as `from <library> import <function>` for example for Lists use `from typing import List`.
  4. If an external system requires to be used through a package, or the API is unknown use "pip" libraries.
  5. If an external system has a well known and defined API, call the API endpoints.
</agent_python_libraries>

<agent_code_format>
  * To implement the task you can update the CONFIG, INPUTS and OUTPUT types to match the run function type:
  ```python
from typing import Dict, Any, Optional, List

class CONFIG:
    pass

class INPUTS:
    pass

class OUTPUT:
    pass

async def run(config: CONFIG, inputs: INPUTS) -> OUTPUT:
    output = Output()
    return output
  ```
  * Update CONFIG, INPUTS and OUTPUT as follows but with the correct members to correcly implement the input_command tag.
```python
class CONFIG:
    arg1: str
    arg2: int
    arg3: List[str]

class INPUTS:
    sample: List[str]

class OUTPUT:
    another_sample: str
```

</agent_code_format>

<agent_code_rules>
  * Do not implement __init__ or __new__ methods for CONFIG, INPUTS or OUTPUT.
  * The code will be shared as a library, when used it run(...) function will be called.
  * The function signature MUST be: `async def run(config: CONFIG, inputs: INPUTS) -> OUTPUT`
  * If permanent memory is required, write to disk, store, sql always prioritize using shinkaiSqliteQueryExecutor.
</agent_code_rules>

<agent_code_implementation>
  * Do not output, notes, ideas, explanations or examples.
  * Write only valid python code, so the complete printed code can be directly executed.
  * Only if required any additional notes, comments or explanation lines should be prefixed with # character.
  * Write a single implementation file, only one typescript code block.
  * Implements the code in python for the following input_command tag
</agent_code_implementation>

<input_command>
Generate a tool that does this call: curl https://api.openai.com/v1/chat/completions   -H "Content-Type: application/json"   -H "Authorization: Bearer {config.api_key}"   -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "{input.prompt}"}]
  }'. Store the result in a database. given type INPUT = { prompt: string }


</input_command>

