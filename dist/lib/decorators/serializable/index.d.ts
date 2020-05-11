import { _castType } from './internals';
/**
 * @Serializable() decorator, configures property serialization behavior
 * @param alias (Optional) Configures property getter
 * @param cast (Optional) Configures how serialized value is cast before being set. Supported shapes are:
 * - { cast: MyEnTTClass }, will cast property value as instance of MyEnTTClass
 *    => new myEnTTClass()
 * - { cast: [MyEnTTClass] }, will cast property value (assumed to be an array) as an array of instances of MyEnTTClass
 *    => [ new myEnTTClass(), new myEnTTClass(), new myEnTTClass(), ... ]
 * - { cast: {MyEnTTClass} }, will cast property value (assumed to be a hashmap) as a hashmap of instances of MyEnTTClass
 *    => { a: new myEnTTClass(), b: new myEnTTClass(), c: new myEnTTClass(), ... }
 */
export declare function Serializable({ serialize, alias, cast }?: {
    serialize?: boolean | Symbol;
    alias?: string;
    cast?: _castType;
}): (target: any, key: any) => void;
export declare namespace Serializable {
    var serialize: {
        Never: symbol;
        DeserializeOnly: symbol;
        SerializeOnly: symbol;
        Always: symbol;
    };
}
