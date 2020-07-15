export declare const _symbolValidate: unique symbol;
export declare const _symbolValidationEnabled: unique symbol;
export declare type _primitiveTypeName = 'boolean' | 'string' | 'number' | 'object';
/**
 * Richer error class used for describing validation errors
 */
export declare class EnttValidationError extends Error {
    /**
     * Unique key enumerating the type of validation error
     */
    type: string;
    /**
     * Context of the error message, containing values involved in validation
     */
    context: any;
    /**
     * Creates an instance of JoiError.
     * @param type Unique key enumerating the type of validation error
     * @param message User friendly, verbose error message
     * @param context Context of the error message, containing values involved in validation
     */
    constructor({ type, message, context }?: {
        type?: string;
        message?: string;
        context?: any;
    });
}
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
export declare function _validateObject(target: any): Record<string, EnttValidationError[]>;
/**
 * Validates a property of target object instance
 * @param target Object instance to validate a property of
 * @param key Key of the property being validated
 * @param value (Optional) Property value being validated; if not present, current property value will be validated instead
 * @returns Array of validation errors
 */
export declare function _validateProperty(target: any, key: any, value?: any): EnttValidationError[];
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
export declare function _getValidationErrors(target: any): Record<string, EnttValidationError[]>;
