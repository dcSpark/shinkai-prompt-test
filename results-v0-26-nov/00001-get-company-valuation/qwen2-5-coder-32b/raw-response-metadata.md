```json
{
  "id": "shinkai-tool-financial-data",
  "name": "Shinkai: Financial Data Fetcher",
  "description": "Fetches financial data for a given company from an external API",
  "author": "Shinkai",
  "keywords": [
    "financial data",
    "company profile",
    "API",
    "market cap",
    "pe ratio",
    "beta"
  ],
  "configurations": {
    "type": "object",
    "properties": {},
    "required": []
  },
  "parameters": {
    "type": "object",
    "properties": {
      "company_name": { "type": "string" },
      "detailed": { "type": "boolean", "default": false, "nullable": true }
    },
    "required": [
      "company_name"
    ]
  },
  "result": {
    "type": "object",
    "properties": {
      "companyName": { "type": "string" },
      "marketCap": { "type": "number", "nullable": true },
      "peRatio": { "type": "number", "nullable": true },
      "beta": { "type": "number", "nullable": true },
      "errorMessage": { "type": "string", "nullable": true }
    },
    "required": [
      "companyName"
    ]
  },
  "sqlTables": [],
  "sqlQueries": []
}
```