
import axios from 'npm:axios';
// deno-lint-ignore no-explicit-any
const tryToParseError = (data: any) => { try { return JSON.stringify(data); } catch (_) { return data; } };
// deno-lint-ignore no-explicit-any
const manageAxiosError = (error: any) => {
    // axios error management
    let message = '::NETWORK_ERROR::';
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        message += ' ' + tryToParseError(error.response.data);
        message += ' ' + tryToParseError(error.response.status);
        message += ' ' + tryToParseError(error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        message += ' ' + tryToParseError(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        message += ' ' + tryToParseError(error.message);
    }
    message += ' ' + tryToParseError(error.config);
    throw new Error(message);
};
/**
 * Tool for executing a single SQL query on a specified database file. 
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
 * @param database_name - (required, Database name. Use 'default' to use default database) 
 * @param query - (required, The SQL query to execute) 
 * @param query_params - (optional, The parameters to bind to the query) , default: undefined
 * @returns {
 *   result: any 
 *   rowCount: number 
 *   rowsAffected: number 
 *   type: string 
 * }
 */
export async function shinkaiSqliteQueryExecutor(database_name: string, query: string, query_params?: any[]): Promise<{
    result: any;
    rowCount: number;
    rowsAffected: number;
    type: string;
}> {

    const _url = `${Deno.env.get('SHINKAI_NODE_LOCATION')}/v2/tool_execution`;
    const data = {
        tool_router_key: 'local:::rust_toolkit:::shinkai_sqlite_query_executor',
        tool_type: 'rust',
        llm_provider: `${Deno.env.get('X_SHINKAI_LLM_PROVIDER')}`,
        parameters: {
            database_name: database_name,
            query: query,
            query_params: query_params,

        },
    };
    try {
        const response = await axios.post(_url, data, {
            headers: {
                'Authorization': `Bearer ${Deno.env.get('BEARER')}`,
                'x-shinkai-tool-id': `${Deno.env.get('X_SHINKAI_TOOL_ID')}`,
                'x-shinkai-app-id': `${Deno.env.get('X_SHINKAI_APP_ID')}`,
                'x-shinkai-llm-provider': `${Deno.env.get('X_SHINKAI_LLM_PROVIDER')}`
            }
        });
        return response.data;
    } catch (error) {
        return manageAxiosError(error);
    }
}

