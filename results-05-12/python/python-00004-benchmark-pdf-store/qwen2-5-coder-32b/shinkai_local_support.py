import os
from typing import List


def get_mount_paths() -> List[str]:
    """Gets an array of mounted files.
    
    Returns:
        List[str]: Array of files
    """
    mount_paths = os.environ.get('MOUNT')
    if not mount_paths:
        return []
    return [path.strip() for path in mount_paths.split(',')]


def get_asset_paths() -> List[str]:
    """Gets an array of asset files. These files are read only.
    
    Returns:
        List[str]: Array of files
    """
    asset_paths = os.environ.get('ASSETS')
    if not asset_paths:
        return []
    return [path.strip() for path in asset_paths.split(',')]


def get_home_path() -> str:
    """Gets the home directory path. All created files must be written to this directory.
    
    Returns:
        str: Home directory path
    """
    return os.environ.get('HOME', '')


def get_shinkai_node_location() -> str:
    """Gets the Shinkai Node location URL. This is the URL of the Shinkai Node server.
    
    Returns:
        str: Shinkai Node URL
    """
    return os.environ.get('SHINKAI_NODE_LOCATION', '')

