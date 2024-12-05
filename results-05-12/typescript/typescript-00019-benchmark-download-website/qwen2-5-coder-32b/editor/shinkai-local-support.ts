
/**
 * Gets an array of mounted files.
 * @returns {string[]} Array of files.
 */
export function getMountPaths(): string[] {
    const mountPaths = Deno.env.get('MOUNT');
    if (!mountPaths) return [];
    return mountPaths.split(',').map(path => path.trim());
}

/**
 * Gets an array of asset files. These files are read only.
 * @returns {string[]} Array of files.
 */
export function getAssetPaths(): string[] {
    const assetPaths = Deno.env.get('ASSETS');
    if (!assetPaths) return [];
    return assetPaths.split(',').map(path => path.trim());
}

/**
 * Gets the home directory path. All created files must be written to this directory.
 * @returns {string} Home directory path.
 */
export function getHomePath(): string {
    return Deno.env.get('HOME') || "";
}

/**
 * Gets the Shinkai Node location URL. This is the URL of the Shinkai Node server.
 * @returns {string} Shinkai Node URL.
 */
export function getShinkaiNodeLocation(): string {
    return Deno.env.get('SHINKAI_NODE_LOCATION') || "";
}
