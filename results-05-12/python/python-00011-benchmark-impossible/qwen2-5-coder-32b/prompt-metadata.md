
<agent_metadata_schema>
  * This is the SCHEMA for the METADATA:
  ```json
  {
    "name": "metaschema",
    "schema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "The name of the schema"
        },
        "type": {
          "type": "string",
          "enum": [
            "object",
            "array",
            "string",
            "number",
            "boolean",
            "null"
          ]
        },
        "properties": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#/$defs/schema_definition"
          }
        },
        "items": {
          "anyOf": [
            {
              "$ref": "#/$defs/schema_definition"
            },
            {
              "type": "array",
              "items": {
                "$ref": "#/$defs/schema_definition"
              }
            }
          ]
        },
        "required": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "additionalProperties": {
          "type": "boolean"
        }
      },
      "required": [
        "type"
      ],
      "additionalProperties": false,
      "if": {
        "properties": {
          "type": {
            "const": "object"
          }
        }
      },
      "then": {
        "required": [
          "properties"
        ]
      },
      "$defs": {
        "schema_definition": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "object",
                "array",
                "string",
                "number",
                "boolean",
                "null"
              ]
            },
            "properties": {
              "type": "object",
              "additionalProperties": {
                "$ref": "#/$defs/schema_definition"
              }
            },
            "items": {
              "anyOf": [
                {
                  "$ref": "#/$defs/schema_definition"
                },
                {
                  "type": "array",
                  "items": {
                    "$ref": "#/$defs/schema_definition"
                  }
                }
              ]
            },
            "required": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "additionalProperties": {
              "type": "boolean"
            }
          },
          "required": [
            "type"
          ],
          "additionalProperties": false,
          "sqlTables": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "description": "Name of the table"
                },
                "definition": {
                  "type": "string",
                  "description": "SQL CREATE TABLE statement"
                }
              },
              "required": ["name", "definition"]
            }
          },
          "sqlQueries": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "description": "Name/description of the query"
                },
                "query": {
                  "type": "string",
                  "description": "Example SQL query"
                }
              },
              "required": ["name", "query"]
            }
          },
          "tools": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "if": {
            "properties": {
              "type": {
                "const": "object"
              }
            }
          },
          "then": {
            "required": [
              "properties"
            ]
          }
        }
      }
    }
  }
  ```
</agent_metadata_schema>
<agent_metadata_examples>
  These are two examples of METADATA:
  ## Example 1:
  Output: ```json
  {
    "id": "coinbase-create-wallet",
    "name": "Coinbase Wallet Creator",
    "description": "Tool for creating a Coinbase wallet",
    "author": "Shinkai",
    "keywords": [
      "coinbase",
      "wallet",
      "creator",
      "shinkai"
    ],
    "configurations": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "privateKey": { "type": "string" },
        "useServerSigner": { "type": "string", "default": "false", "nullable": true },
      },
      "required": [
        "name",
        "privateKey"
      ]
    },
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "result": {
      "type": "object",
      "properties": {
        "walletId": { "type": "string", "nullable": true },
        "seed": { "type": "string", "nullable": true },
        "address": { "type": "string", "nullable": true },
      },
      "required": []
    },
    "sqlTables": [
      {
        "name": "wallets",
        "definition": "CREATE TABLE wallets (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL, private_key TEXT NOT NULL, address VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
      }
    ],
    "sqlQueries": [
      {
        "name": "Get wallet by address",
        "query": "SELECT * FROM wallets WHERE address = :address"
      }
    ],
    "tools": [
      "local:::rust_toolkit:::shinkai_sqlite_query_executor",
      "local:::shinkai_tool_echo:::shinkai_echo"
    ]
  };
  ```

  ## Example 2:
  Output:```json
  {
    "id": "tool-download-pages",
    "name": "Download Pages",
    "description": "Downloads one or more URLs and converts their HTML content to Markdown",
    "author": "Shinkai",
    "keywords": [
      "HTML to Markdown",
      "web page downloader",
      "content conversion",
      "URL to Markdown",
    ],
    "configurations": {
      "type": "object",
      "properties": {},
      "required": []
    },
    "parameters": {
      "type": "object",
      "properties": {
        "urls": { "type": "array", "items": { "type": "string" } },
      },
      "required": [
        "urls"
      ]
    },
    "result": {
      "type": "object",
      "properties": {
        "markdowns": { "type": "array", "items": { "type": "string" } },
      },
      "required": [
        "markdowns"
      ]
    },
    "sqlTables": [
      {
        "name": "downloaded_pages",
        "definition": "CREATE TABLE downloaded_pages (id SERIAL PRIMARY KEY, url TEXT NOT NULL, markdown_content TEXT, downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
      }
    ],
    "sqlQueries": [
      {
        "name": "Get page by URL",
        "query": "SELECT * FROM downloaded_pages WHERE url = :url ORDER BY downloaded_at DESC LIMIT 1"
      }
    ],
    "tools": []
  };
  ```
</agent_metadata_examples>

<agent_metadata_rules>
  * If the code uses shinkaiSqliteQueryExecutor then fill the sqlTables and sqlQueries sections, otherwise these sections are empty.
  * sqlTables contains the complete table structures, they should be same as in the code.
  * sqlQueries contains from 1 to 3 examples that show how the data should be retrieved for usage.
</agent_metadata_rules>

<available_tools>
[""]
</available_tools>

<agent_metadata_implementation>
  * Return a valid schema for the described JSON, remove trailing commas.
  * The METADATA must be in JSON valid format in only one JSON code block and nothing else.
  * Output only the METADATA, so the complete Output it's a valid JSON string.
  * Any comments, notes, explanations or examples must be omitted in the Output.
  * Use the available_tools section to get the list of tools for the metadata.
  * Generate the METADATA for the following source code in the input_command tag.
  * configuration, parameters and result must be objects, not arrays neither basic types.
</agent_metadata_implementation>

<input_command>
from typing import Dict, Any, Optional, List
import requests

class CONFIG:
    facebook_token: str
    twitter_token: str
    instagram_token: str
    reddit_client_id: str
    reddit_client_secret: str
    reddit_user_agent: str
    reddit_username: str
    reddit_password: str

class INPUTS:
    title: str
    content: str

class OUTPUT:
    results: Dict[str, Any]

async def run(config: CONFIG, inputs: INPUTS) -> OUTPUT:
    output = OUTPUT()
    output.results = {}

    # Facebook Post
    try:
        facebook_response = requests.post(
            "https://graph.facebook.com/me/feed",
            params={
                'access_token': config.facebook_token,
                'message': f"{inputs.title}\n{inputs.content}"
            }
        )
        output.results['facebook'] = facebook_response.json()
    except Exception as e:
        output.results['facebook'] = str(e)

    # Twitter Post
    try:
        twitter_headers = {
            "Authorization": f"Bearer {config.twitter_token}",
            "Content-Type": "application/json"
        }
        twitter_data = {
            "text": f"{inputs.title}\n{inputs.content}"
        }
        twitter_response = requests.post(
            "https://api.twitter.com/2/tweets",
            headers=twitter_headers,
            json=twitter_data
        )
        output.results['twitter'] = twitter_response.json()
    except Exception as e:
        output.results['twitter'] = str(e)

    # Instagram Post (Note: Instagram Graph API does not support text-only posts)
    try:
        instagram_response = requests.post(
            "https://graph.instagram.com/me/media",
            params={
                'access_token': config.instagram_token,
                'image_url': '',  # Add image URL if needed
                'caption': f"{inputs.title}\n{inputs.content}"
            }
        )
        output.results['instagram'] = instagram_response.json()
    except Exception as e:
        output.results['instagram'] = str(e)

    # Reddit Post
    try:
        reddit_auth = requests.auth.HTTPBasicAuth(config.reddit_client_id, config.reddit_client_secret)
        reddit_data = {
            'grant_type': 'password',
            'username': config.reddit_username,
            'password': config.reddit_password
        }
        reddit_headers = {'User-Agent': config.reddit_user_agent}
        reddit_token_response = requests.post(
            "https://www.reddit.com/api/v1/access_token",
            headers=reddit_headers,
            data=reddit_data,
            auth=reddit_auth
        )
        token = reddit_token_response.json().get('access_token')
        reddit_headers['Authorization'] = f'bearer {token}'

        reddit_post_data = {
            'title': inputs.title,
            'selftext': inputs.content,
            'sr': 'your_subreddit'  # Replace with your subreddit
        }
        reddit_post_response = requests.post(
            "https://oauth.reddit.com/api/submit",
            headers=reddit_headers,
            data=reddit_post_data
        )
        output.results['reddit'] = reddit_post_response.json()
    except Exception as e:
        output.results['reddit'] = str(e)

    return output


</input_command>

