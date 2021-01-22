import { TNew } from './internals';
import { _EnTTRoot } from './internals';
import { _rawDataType } from '../decorators/serializable/internals';
import { EnttValidationError } from '../decorators/validate/internals';
/**
 * Main, extensible EnTT class definition
 */
export declare class EnTT extends _EnTTRoot {
    /**
     * Registers a native JS class which will not be attempter to be serialized or de-serialized, but will be copied as is
     * @param nativeClass Native JS class
     */
    static registerNativeClass(nativeClass: any): void;
    /**
     * Finds all properties of an EnTT class tagged with the specified tag
     * @param tag Tag to search for
     * @param from (Optional) EnTT class whose properties to search
     */
    static findTaggedProperties(tag: string | symbol, { from }?: {
        from?: TNew<EnTT>;
    }): string[];
    /**
     * Casts a value of given type as an instance of a parent EnTT Class
     * @param value Value (or structure of values) being cast, or (alternatively) a Promise about to resolve such a value
     * @param into Casting target class, or structure:
     * - MyEnTTClass, will cast value as instance of MyEnTTClass
     *    => new myEnTTClass()
     * - [MyEnTTClass], will cast value (assumed to be an array) as an array of instances of MyEnTTClass
     *    => [ new myEnTTClass(), new myEnTTClass(), new myEnTTClass(), ... ]
     * - {MyEnTTClass}, will cast value (assumed to be a hashmap) as a hashmap of instances of MyEnTTClass
     *    => { a: new myEnTTClass(), b: new myEnTTClass(), c: new myEnTTClass(), ... }
     * @param type Type of value being cast
     * @param validate If cast instance should be validated after
     * @returns Instance (or structure of instances) of the class with deserialized data, or (alternatively) a Promise about to resolve to such an instance
     */
    static cast<T>(this: TNew<T>, value: Promise<any>, params?: {
        into?: TNew<T>;
        type?: _rawDataType;
        validate?: boolean;
    }): Promise<T>;
    static cast<T>(this: TNew<T>, value: Promise<any>, params?: {
        into?: TNew<T>[];
        type?: _rawDataType;
        validate?: boolean;
    }): Promise<T[]>;
    static cast<T>(this: TNew<T>, value: Promise<any>, params?: {
        into?: Record<any, TNew<T>>;
        type?: _rawDataType;
        validate?: boolean;
    }): Promise<Record<any, T>>;
    static cast<T>(this: TNew<T>, value: Promise<any>, params?: {
        into?: TNew<T> | TNew<T>[] | Record<any, TNew<T>>;
        type?: _rawDataType;
        validate?: boolean;
    }): Promise<T | T[] | Record<any, T>>;
    static cast<T>(this: TNew<T>, value: any, params?: {
        into?: TNew<T>;
        type?: _rawDataType;
        validate?: boolean;
    }): T;
    static cast<T>(this: TNew<T>, value: any, params?: {
        into?: TNew<T>[];
        type?: _rawDataType;
        validate?: boolean;
    }): T[];
    static cast<T>(this: TNew<T>, value: any, params?: {
        into?: Record<any, TNew<T>>;
        type?: _rawDataType;
        validate?: boolean;
    }): Record<any, T>;
    static cast<T>(this: TNew<T>, value: any, params?: {
        into?: TNew<T> | TNew<T>[] | Record<any, TNew<T>>;
        type?: _rawDataType;
        validate?: boolean;
    }): T | T[] | Record<any, T>;
    static cast<T>(this: TNew<T>, value: Promise<any> | any, params?: {
        into?: TNew<T> | TNew<T>[] | Record<any, TNew<T>>;
        type?: _rawDataType;
        validate?: boolean;
    }): T | T[] | Record<any, T> | Promise<T | T[] | Record<any, T>>;
    /**
     * Clones an EnTT instance
     * @param instance EnTT instance to clone
     * @param target Instance being deserialized into
     * @param validate If cloned instance should be validated after
     * @returns Cloned instance
     */
    static clone<T>(this: TNew<any>, instance: T, { target, validate }?: {
        target?: T;
        validate?: boolean;
    }): T;
    /**
     * Initializes EnTT features for the extending class - should be called in extending class' constructor, right after "super()".
     * Example:
     *   constructor () { super(); super.entt(); }
     */
    protected entt(): void;
    /**
     * Serializes (extracts underlying instance state) Class instance as value of given type
     * @param type Value type to serialize as
     * @returns Serialized value of requested type
     */
    serialize(type?: _rawDataType): any;
    /**
     * Deserializes value of given type into a target
     * @param value Value being deserialized from
     * @param type Type of value to deserialized form
     * @param validate If deserialized instance should be validated after
     * @return Target with given value deserialized into it
     */
    deserialize(value: any, type?: _rawDataType, { validate }?: {
        validate?: boolean;
    }): EnTT;
    /**
     * Returns validation status of the instance
     * @returns If instance is validated
     */
    get valid(): boolean;
    /**
     * Returns validation errors of all properties
     * @returns A hashmap of arrays of errors per property
     */
    get errors(): Record<string, EnttValidationError[]>;
    /**
     * Reverts property value(s) of requested property (or all properties if no property key specified) to last valid value
     * @param key (Optional) Property key of the property to be reverted
     */
    revert(key?: string): void;
}
