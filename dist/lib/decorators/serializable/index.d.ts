import { _registerNativeClass } from './internals';
import { TNew } from '../../entt/internals';
/**
 * @Serializable() decorator, configures property serialization behavior
 * @param alias (Optional) Configures property getter
 * @param serialize (Optional) Configures custom serialization mapper.
 *   Function ((value: any, target: any) => any) will be called (with a reference to the entire EnTT instance
 *   and the property value being fetched) and it's returned value will be used as serialized value.
 * @param deserialize (Optional) Configures custom de-serialization mapper,
 *   Function ((value: any, target: any) => any)  will be called (with a reference to the entire EnTT instance
 *   and the property value being set) and it's returned value will be used  as de-serialized value.
 * @param cast (Optional) Configures how serialized value is cast before being set. Supported shapes are:
 * - { cast: MyEnTTClass }, will cast property value as instance of MyEnTTClass
 *    => new myEnTTClass()
 * - { cast: [MyEnTTClass] }, will cast property value (assumed to be an array) as an array of instances of MyEnTTClass
 *    => [ new myEnTTClass(), new myEnTTClass(), new myEnTTClass(), ... ]
 * - { cast: {MyEnTTClass} }, will cast property value (assumed to be a hashmap) as a hashmap of instances of MyEnTTClass
 *    => { a: new myEnTTClass(), b: new myEnTTClass(), c: new myEnTTClass(), ... }
 */
export declare function Serializable({ alias, serialize, deserialize, cast, }?: {
    alias?: string;
    serialize?: boolean | ((value: any, target: any) => any);
    deserialize?: boolean | ((value: any, target: any) => any);
    cast?: TNew<any> | TNew<any>[] | Record<any, TNew<any>>;
}): (target: any, key: any) => void;
export declare namespace Serializable {
    var registerNativeClass: typeof _registerNativeClass;
}
