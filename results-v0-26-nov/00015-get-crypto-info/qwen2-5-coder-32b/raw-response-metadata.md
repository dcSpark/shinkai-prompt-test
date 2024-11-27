```json
{
  "id": "shinkai-tool-crypto-price",
  "name": "Shinkai: Crypto Price Fetcher",
  "description": "Tool for fetching the price, 24h volume, and market cap of a cryptocurrency from CoinGecko API",
  "author": "Shinkai",
  "keywords": [
    "crypto",
    "price",
    "coingecko",
    "volume",
    "market cap"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "crypto_symbol": { "type": "string" }
    },
    "required": [
      "crypto_symbol"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "symbol": { "type": "string" },
      "price": { "type": "number" },
      "volume_24h": { "type": "number" },
      "market_cap": { "type": "number" }
    },
    "required": [
      "symbol",
      "price",
      "volume_24h",
      "market_cap"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```