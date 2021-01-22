export declare const _symbolProperty: unique symbol;
/**
 * Gets @Property decorator metadata store
 * @param aClass EnTT class containing the metadata
 * @returns Stored @Property decorator metadata
 */
export declare function _readPropertyMetadata<T extends Function>(aClass: T): any;
/**
 * Fetches basic property behavior metadata
 * @param target Class to fetch property metadata for
 * @param key Property key to fetch property metadata for
 * @param store Private store for all property values
 * @returns Property descriptor
 */
export declare function _readPropertyDescriptor({ target, key, store }?: {
    target?: any;
    key?: string | symbol;
    store?: object;
}): any;
/**
 * Finds all properties of an EnTT class tagged with the specified tag
 * @param target Class to search for tagged properties
 * @param tag Tag to search for
 */
export declare function _findTaggedProperties(target?: any, tag?: string | symbol): string[];
