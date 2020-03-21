export declare const _symbolValidate: unique symbol;
export declare type _primitiveTypeName = 'boolean' | 'string' | 'number' | 'object';
/**
 * Initializes and returns validity store for the instance
 * @param target EnTT class instance containing the validity data
 * @returns Instance's validity store
 */
export declare function _readValidityMetadata(target: any): any;
/**
 * Validates all properties of object instance
 * @param target Object instance to validate all properties of
 * @returns Hashmap of all properties having validation errors
 */
export declare function _validateObject(target: any): Record<string, Error[]>;
/**
 * Validates a property of target object instance
 * @param target Object instance to validate a property of
 * @param key Key of the property being validated
 * @param value (Optional) Property value being validated; if not present, current property value will be validated instead
 * @returns Array of validation errors
 */
export declare function _validateProperty(target: any, key: any, value?: any): Error[];
/**
 * Returns validation status of the instance
 * @param target target instance being validated
 * @returns If instance is validated
 */
export declare function _isValid(target: any): boolean;
/**
 * Returns validation errors of all properties
 * @param target target instance being validated
 * @returns A hashmap of arrays of errors per property
 */
export declare function _getValidationErrors(target: any): Record<string, Error[]>;
