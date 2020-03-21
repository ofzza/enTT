export declare const _symbolProperty: unique symbol;
/**
 * Gets @Property decorator metadata store
 * @param Class EnTT class containing the metadata
 * @returns Stored @Property decorator metadata
 */
export declare function _readPropertyMetadata(Class: any): any;
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
}): {
    get: () => any;
    set: (value: any) => void;
    enumerable: boolean;
};
