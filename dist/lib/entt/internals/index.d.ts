export declare const _symbolEnTT: unique symbol;
export declare const _undefined: unique symbol;
/**
 * Root EnTT class, to be extended by EnTT base, used for internal instance detection avoiding circular dependencies
 */
export declare class _EnTTRoot {
}
/**
 * Initializes and gets stored EnTT class metadata
 * @param Class EnTT class containing the metadata
 * @returns Stored EnTT class metadata
 */
export declare function _getClassMetadata(Class: any): any;
/**
 * Initializes and gets stored EnTT instance metadata
 * @param instance EnTT instance containing the metadata
 * @returns Stored EnTT instance metadata
 */
export declare function _getInstanceMetadata(instance: any): any;
