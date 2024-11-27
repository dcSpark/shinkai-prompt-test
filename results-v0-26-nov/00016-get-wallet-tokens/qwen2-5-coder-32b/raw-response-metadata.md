```json
{
  "id": "shinkai-tool-get-token-balance",
  "name": "Shinkai: Get Token Balance",
  "description": "Tool for getting the token balance of a wallet address on a specified blockchain",
  "author": "Shinkai",
  "keywords": [
    "token balance",
    "wallet address",
    "blockchain",
    "shinkai"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "wallet_address": { "type": "string" },
      "blockchain": { "type": "string" }
    },
    "required": [
      "wallet_address",
      "blockchain"
    ]
  },
  "result": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "sqlTables": [
    {
      "name": "wallet_balances",
      "definition": "CREATE TABLE wallet_balances (id INTEGER PRIMARY KEY AUTOINCREMENT, wallet_address VARCHAR(255) NOT NULL, blockchain VARCHAR(255) NOT NULL, token_amount DECIMAL(18, 8), recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    }
  ],
  "sqlQueries": [
    {
      "name": "Get balance by wallet address and blockchain",
      "query": "SELECT * FROM wallet_balances WHERE wallet_address = :wallet_address AND blockchain = :blockchain"
    },
    {
      "name": "Get latest balance for a wallet address",
      "query": "SELECT * FROM wallet_balances WHERE wallet_address = :wallet_address ORDER BY recorded_at DESC LIMIT 1"
    },
    {
      "name": "Get all balances for a specific blockchain",
      "query": "SELECT * FROM wallet_balances WHERE blockchain = :blockchain"
    }
  ]
}
```