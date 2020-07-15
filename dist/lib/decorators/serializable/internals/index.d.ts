import { _EnTTRoot } from '../../../entt/internals';
export declare const _symbolSerializable: unique symbol;
export declare type _serializeType = Symbol;
export declare type _rawDataType = 'object' | 'json';
export declare type _castType = (new () => any) | Array<new () => any> | Object;
/**
 * Registers a native JS class which will not be attempter to be serialized or de-serialized, but will be copied as is
 * @param nativeClass Native JS class
 */
export declare function _registerNativeClass(nativeClass: any): void;
/**
 * Gets @Serializable decorator metadata store
 * @param Class EnTT class containing the metadata
 * @returns Stored @Serializable decorator metadata
 */
export declare function _readSerializableMetadata(Class: any): any;
/**
 * Serializes anything as value of given type
 * @param T Source class
 * @param source Source being serialized from
 * @param type Value type to serialize as
 * @param _customValue (Internal) Used for internal passing of custom serialized values
 * @param _directSerialize (Internal) If true, ignores all custom serialization configuration (used by .clone())
 * @returns Serialized value of requested type
 */
export declare function _serialize<T>(source: T, type?: _rawDataType, { _customValue, _directSerialize }?: {
    _customValue?: any;
    _directSerialize?: boolean;
}): any;
/**
 * Deserializes value of given type into a target
 * @param T Target class
 * @param value Value being deserialized from
 * @param type Type of value to deserialized form
 * @param target Instance being deserialized into
 * @param validate If deserialized instance should be validated after
 * @param _customValue Used for internal passing of custom deserialized values
 * @param _directDeserialize (Internal) If true, ignores all custom deserialization configuration (used by .clone())
 * @return Target with given value deserialized into it
 */
export declare function _deserialize<T>(value: any, type?: _rawDataType, { target, validate, _customValue, _directDeserialize }?: {
    target?: T;
    validate?: boolean;
    _customValue?: any;
    _directDeserialize?: boolean;
}): any;
/**
 * Returns a casting function that casts a value of given type as an instance of a given Class
 * @param T Class type to cast into
 * @param into Casting target class, or structure:
 * - MyEnTTClass, will cast value as instance of MyEnTTClass
 *    => new myEnTTClass()
 * - [MyEnTTClass], will cast value (assumed to be an array) as an array of instances of MyEnTTClass
 *    => [ new myEnTTClass(), new myEnTTClass(), new myEnTTClass(), ... ]
 * - {MyEnTTClass}, will cast value (assumed to be a hashmap) as a hashmap of instances of MyEnTTClass
 *    => { a: new myEnTTClass(), b: new myEnTTClass(), c: new myEnTTClass(), ... }
 * @returns A casting function
 */
export declare function _cast<T>(into: (new () => T) | (new () => T)[] | Record<any, new () => T>): (value: any, type?: _rawDataType, options?: {
    [key: string]: any;
}) => any;
/**
 * Clones an EnTT instance
 * @param instance EnTT instance to clone
 * @param target Instance being deserialized into
 * @param validate If cloned instance should be validated after
 * @returns Cloned instance
 */
export declare function _clone(instance: any, { target, validate }?: {
    target?: _EnTTRoot;
    validate?: boolean;
}): any;
