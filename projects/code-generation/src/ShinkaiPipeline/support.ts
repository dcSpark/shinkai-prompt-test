
const py_header_shinkai_local_support = "\nasync def get_mount_paths() -> List[str]:\n    \"\"\"Gets an array of mounted files.\n    \n    Returns:\n        List[str]: Array of files\n    \"\"\"\n    ...\n\n\nasync def get_asset_paths() -> List[str]:\n    \"\"\"Gets an array of asset files. These files are read only.\n    \n    Returns:\n        List[str]: Array of files\n    \"\"\"\n    ...\n\n\nasync def get_home_path() -> str:\n    \"\"\"Gets the home directory path. All created files must be written to this directory.\n    \n    Returns:\n        str: Home directory path\n    \"\"\"\n    ...\n\n\nasync def get_shinkai_node_location() -> str:\n    \"\"\"Gets the Shinkai Node location URL. This is the URL of the Shinkai Node server.\n    \n    Returns:\n        str: Shinkai Node URL\n    \"\"\"\n    ...\n\n\nasync def get_access_token(provider_name: str) -> str:\n    \"\"\"Gets a valid OAuth AccessToken for the given provider.\n    \n    Returns:\n        str: OAuth access token\n    \"\"\"\n    ...\n\n";
const ts_header_shinkai_local_support = "\n/**\n * Gets an array of mounted files.\n * @returns Promise<string[]> - Array of files.\n */\ndeclare async function getMountPaths(): Promise<string[]>;\n\n/**\n * Gets an array of asset files. These files are read only.\n * @returns Promise<string[]> - Array of files.\n */\ndeclare async function getAssetPaths(): Promise<string[]>;\n\n/**\n * Gets the home directory path. All created files must be written to this directory.\n * @returns Promise<string> - Home directory path.\n */\ndeclare async function getHomePath(): Promise<string>;\n\n/**\n * Gets the Shinkai Node location URL. This is the URL of the Shinkai Node server.\n * @returns Promise<string> - Shinkai Node URL.\n */\ndeclare async function getShinkaiNodeLocation(): Promise<string>;\n\n/**\n * Gets a valid OAuth AccessToken for the given provider.\n * @returns Promise<string> - OAuth access token.\n */\ndeclare async function getAccessToken(providerName: string): Promise<string>;\n";

export function getHeaders(): {
  typescript: {
    headers: {
      "shinkai-local-support": string,
    }
  },
  python: {
    headers: {
      "shinkai_local_support": string,
    }
  }
} {
  return {
    typescript: {
      headers: {
        "shinkai-local-support": ts_header_shinkai_local_support,
      }
    },
    python: {
      headers: {
        "shinkai_local_support": py_header_shinkai_local_support,
      }
    }
  }
}
