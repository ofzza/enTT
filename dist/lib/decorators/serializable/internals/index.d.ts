export declare const _symbolSerializable: unique symbol;
export declare type _rawDataType = 'object' | 'json';
export declare type _castType = (new () => any) | (Array<new () => any>) | Object;
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
 * @returns Serialized value of requested type
 */
export declare function _serialize<T>(source: T, type?: _rawDataType): any;
/**
 * Deserializes value of given type into a target
 * @param T Target class
 * @param target Instance being deserialized into
 * @param value Value being deserialized from
 * @param type Type of value to deserialized form
 * @return Target with given value deserialized into it
 */
export declare function _deserialize<T>(value: any, type?: _rawDataType, { target }?: {
    target?: T;
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
export declare function _cast<T>(into: ((new () => T) | (new () => T)[] | Record<any, (new () => T)>)): ((value: any, type?: _rawDataType) => any);
