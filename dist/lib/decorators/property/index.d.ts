/**
 * @Property() decorator, configures basic property behavior metadata
 * @param get (Optional) Configures property getter
 * - If false, property won't have a getter.
 * - If true, property will have a simple, pass-through getter.
 * - If ((target: any, value: any) => any), the function will be called (with a reference to the entire EnTT instance
 *   and the property value being fetched) and it's returned value will be used as the value returned by the getter.
 * @param set (Optional) Configures property setter
 * - If false, property won't have a setter.
 * - If true, property will have a simple, pass-through setter.
 * - If ((target: any, value: any) => any), the function will be called (with a reference to the entire EnTT instance
 *   and the property value being set) and it's returned value will be used as the value being stored for the property.
 * @param enumerable (Optional) If the property is enumerable
 * @param tag (Optional) String or array of strings marking the property as belonging to a certain subset
 */
export declare function Property({ get, set, enumerable, tag }?: {
    get?: boolean | ((target: any, value: any) => any);
    set?: boolean | ((target: any, value: any) => any);
    enumerable?: boolean;
    tag?: string | Symbol | string[] | Symbol[];
}): (target: any, key: any) => void;
