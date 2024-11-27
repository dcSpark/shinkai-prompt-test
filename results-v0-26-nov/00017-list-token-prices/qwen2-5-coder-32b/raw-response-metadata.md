```json
{
  "id": "shinkai-tool-get-wallet-tokens",
  "name": "Shinkai: Get Wallet Tokens",
  "description": "Tool for fetching token balances of a wallet from different blockchains using Covalent API",
  "author": "Shinkai",
  "keywords": [
    "covalent",
    "wallet",
    "tokens",
    "blockchain"
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
    "properties": {
      "tokens": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "symbol": { "type": "string" },
            "price": { "type": "number" }
          },
          "required": [
            "symbol",
            "price"
          ]
        }
      }
    },
    "required": [
      "tokens"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```