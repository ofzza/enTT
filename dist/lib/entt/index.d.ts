import { _undefined, _symbolEnTT, _EnTTRoot, _getClassMetadata, _getInstanceMetadata } from './internals';
export { _undefined, _symbolEnTT, _EnTTRoot, _getClassMetadata, _getInstanceMetadata };
import { _rawDataType } from '../decorators/serializable';
/**
 * Main, extensible EnTT class definition
 */
export declare class EnTT extends _EnTTRoot {
    /**
     * Casts a value of given type as an instance of a parent EnTT Class
     * @param value Value (or structure of values) being cast, or (alternatively) a Promise about to resolve such a value
     * @param type Type of value being cast
     * @param Class Casting target class, or structure:
     * - MyEnTTClass, will cast value as instance of MyEnTTClass
     *    => new myEnTTClass()
     * - [MyEnTTClass], will cast value (assumed to be an array) as an array of instances of MyEnTTClass
     *    => [ new myEnTTClass(), new myEnTTClass(), new myEnTTClass(), ... ]
     * - {MyEnTTClass}, will cast value (assumed to be a hashmap) as a hashmap of instances of MyEnTTClass
     *    => { a: new myEnTTClass(), b: new myEnTTClass(), c: new myEnTTClass(), ... }
     * @returns Instance (or structure of instances) of the class with deserialized data, or (alternatively) a Promise about to resolve to such an instance
     */
    static cast(value: any, type?: _rawDataType, { Class }?: {
        Class?: (new () => EnTT) | (new () => EnTT)[] | Record<any, new () => EnTT>;
    }): any;
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
     * @return Target with given value deserialized into it
     */
    deserialize(value: any, type?: _rawDataType): any;
    /**
     * Returns validation status of the instance
     * @returns If instance is validated
     */
    get valid(): boolean;
    /**
     * Returns validation errors of all properties
     * @returns A hashmap of arrays of errors per property
     */
    get errors(): Record<string, Error[]>;
    /**
     * Reverts property value(s) of requested property (or all properties if no property key specified) to last valid value
     * @param key (Optional) Property key of the property to be reverted
     */
    revert(key?: string): void;
}
