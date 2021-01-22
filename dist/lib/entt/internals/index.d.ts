export declare const _symbolEnTTClass: unique symbol;
export declare const _symbolEnTTInstance: unique symbol;
export declare const _undefined: unique symbol;
export declare type TNew<T> = new () => T;
/**
 * Root EnTT class, to be extended by EnTT base, used for internal instance detection avoiding circular dependencies
 */
export declare class _EnTTRoot {
    /**
     * Returns validation status of the instance
     * @returns If instance is validated
     */
    get valid(): boolean;
    /**
     * Returns validation errors of all properties
     * @returns A hashmap of arrays of errors per property
     */
    get errors(): Record<string, any>;
}
/**
 * Initializes and gets stored EnTT class metadata
 * @param aClass EnTT class containing the metadata
 * @returns Stored EnTT class metadata
 */
export declare function _getClassMetadata<T extends Function>(aClass: T): any;
/**
 * Initializes and gets stored EnTT class metadata for a requested decorator
 * @param aClass EnTT class containing the metadata
 * @param _symbolDecorator Unique symbol name-spacing the decorator in question
 * @returns Stored EnTT class metadata for requested decorator
 */
export declare function _getDecoratorMetadata<T extends Function>(aClass: T, _symbolDecorator: string | symbol): any;
/**
 * Initializes and gets stored EnTT instance metadata
 * @param instance EnTT instance containing the metadata
 * @returns Stored EnTT instance metadata
 */
export declare function _getInstanceMetadata<T>(instance: T): {
    store: any;
    restore: any;
    children: {
        path: string[];
        child: _EnTTRoot;
    }[];
    custom: Record<string, any>;
};
