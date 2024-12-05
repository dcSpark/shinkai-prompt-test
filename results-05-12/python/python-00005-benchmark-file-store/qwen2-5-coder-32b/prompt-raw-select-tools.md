
<available-tools-definitions>
  # Available Tools Definitions:
  /**
 * Fetches the balance of an Ethereum address in ETH using Uniswap.
 * @param address - (required) 
 * @returns {
 *   balance: string 
 * }
 */
export async function shinkaiWeb3EthUniswap(address: string): Promise<{
    balance: string;
}>;

/**
 * Fetches the price of a coin or token using Chainlink. It doesn't have many tokens.
 * @param symbol - (required) 
 * @returns {
 *   price: number 
 *   symbol: string 
 * }
 */
export async function shinkaiTokenPriceUsingChainlinkLimited(symbol: string): Promise<{
    price: number;
    symbol: string;
}>;

/**
 * Fetches the balance of an Ethereum address in ETH.
 * @param address - (required) 
 * @returns {
 *   balance: string 
 * }
 */
export async function shinkaiWeb3EthBalance(address: string): Promise<{
    balance: string;
}>;

/**
 * Downloads one or more URLs and converts their HTML content to Markdown
 * @param urls - (required) 
 * @returns {
 *   markdowns: string[] 
 * }
 */
export async function shinkaiDownloadPages(urls: any[]): Promise<{
    markdowns: string[];
}>;

/**
 * Echoes the input message
 * @param message - (required) 
 * @returns {
 *   message: string 
 * }
 */
export async function shinkaiEcho(message: string): Promise<{
    message: string;
}>;

/**
 * Searches the DuckDuckGo search engine. Example result: [{"title": "IMDb Top 250 Movies", "description": "Find out which <b>movies</b> are rated as the <b>best</b> <b>of</b> <b>all</b> <b>time</b> by IMDb users. See the list of 250 titles sorted by ranking, genre, year, and rating, and learn how the list is determined.", "url": "https://www.imdb.com/chart/top/"}]
 * @param message - (required) 
 * @returns {
 *   message: string 
 * }
 */
export async function shinkaiDuckduckgoSearch(message: string): Promise<{
    message: string;
}>;

/**
 * Parses and evaluates mathematical expressions. It’s a safer and more math-oriented alternative to using JavaScript’s eval function for mathematical expressions.
 * @param expression - (required) 
 * @returns {
 *   result: string 
 * }
 */
export async function shinkaiMathExpressionEvaluator(expression: string): Promise<{
    result: string;
}>;

/**
 * New foobar tool from template
 * @param message - (required) 
 * @returns {
 *   message: string 
 * }
 */
export async function shinkaiFoobar(message: string): Promise<{
    message: string;
}>;

/**
 * Runs the Leiden algorithm on the input edges
 * @param convergenceThreshold - (optional) , default: undefined
 * @param edges - (required) 
 * @param nIterations - (optional) , default: undefined
 * @param nRandomStarts - (optional) , default: undefined
 * @param resolution - (optional) , default: undefined
 * @returns {
 *   bestClustering: object 
 *   bestLayout: object 
 * }
 */
export async function shinkaiLeidenAlgorithm(convergenceThreshold?: number, edges: any[], nIterations?: number, nRandomStarts?: number, resolution?: number): Promise<{
    bestClustering: object;
    bestLayout: object;
}>;

/**
 * Fetches the balance for an Ethereum EVM address like 0x123... and returns detailed token information. Example output: { "address": "0x123...", "ETH": { "balance": 1.23, "rawBalance": "12300000000000000000" }, "tokens": [ { "balance": 100, "rawBalance": "100000000000000000000", "tokenInfo": { "name": "TokenName", "symbol": "TKN", "decimals": "18" } } ] }
 * @param address - (required) 
 * @returns {
 *   ETH: object 
 *   address: string 
 *   tokens: object[] 
 * }
 */
export async function tokenBalanceForEvmEthereumAddressBasedOnEthplorer(address: string): Promise<{
    ETH: object;
    address: string;
    tokens: object[];
}>;

/**
 * Echoes the input message
 * @param message - (required) 
 * @returns {
 * }
 */
export async function networkEcho(message: string): Promise<{
}>;

/**
 * Takes a YouTube link and summarizes the content by creating multiple sections with a summary and a timestamp.
 * @param url - (required, The URL of the YouTube video) 
 * @returns {
 * }
 */
export async function youtubeTranscriptWithTimestamps(url: string): Promise<{
}>;

/**
 * Tool for processing any prompt using an AI LLM. 
Analyzing the input prompt and returning a string with the result of the prompt.
This can be used to process complex requests, text analysis, text matching, text generation, and any other AI LLM task.
 * @param format - (required, The output format. Only 'text' is supported) 
 * @param prompt - (required, The prompt to process) 
 * @returns {
 *   message: string 
 * }
 */
export async function shinkaiLlmPromptProcessor(format: string, prompt: string): Promise<{
    message: string;
}>;

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
}>;

/**
 * Tool for processing embeddings within a job scope. 
This tool processes resources and generates embeddings using a specified mapping function.

Example usage:
- Provide a custom mapping function to transform resource content.
- Process resources in chunks to optimize performance.
- Collect and join processed embeddings for further analysis.
 * @param map_function - (optional, A function to map over resource content) , default: undefined
 * @returns {
 *   result: string 
 *   rowCount: number 
 *   rowsAffected: number 
 *   type: string 
 * }
 */
export async function shinkaiProcessEmbeddings(map_function?: string): Promise<{
    result: string;
    rowCount: number;
    rowsAffected: number;
    type: string;
}>;

/**
 * bbb1
 * @returns {
 * }
 */
export async function aaa3(): Promise<{
}>;

/**
 * Downloads the content of a given URL
 * @param url - (required) 
 * @returns {
 * }
 */
export async function benchmarkDownloadWebsite(url: string): Promise<{
}>;

/**
 * Fetches the content of a specified URL and stores it in an SQLite database.
 * @param url - (required) 
 * @returns {
 * }
 */
export async function benchmarkStoreWebsite(url: string): Promise<{
}>;

/**
 * Generates a summary of the content from a specified website URL using stored data and AI LLM.
 * @param url - (required) 
 * @returns {
 * }
 */
export async function benchmarkSummarizeWebsite(url: string): Promise<{
}>;


</available-tools-definitions>

<agent-code-rules>
  * Only return a list of the function names from this list.
  * Avoid all comments, text, notes and metadata.
  * Select the minimum required tools that are needed to execute the instruction in the command tag from this list.
  * If there is a required tool that is not in the list, prefix with '!' to indicate that it is not available, but needed to execute the command tag instruction.
</agent-code-rules>

<command>
'''
download a image URL and store it in a file. Return the file path.
'''
</command>
