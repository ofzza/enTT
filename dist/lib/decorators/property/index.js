"use strict";
// enTT lib @Property decorator
// Configures an EnTT property
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
require("reflect-metadata");
// Define a unique symbol for Property decorator
const symbol = Symbol("format");
/**
 * @Property() decorator, configures basic property behavior metadata
 * @param get Configures property getter
 * - If false, property won't have a getter.
 * - If true, property will have a simple, pass-through getter.
 * - If ((target: any, value: any) => any), the function will be called (with a reference to the entire EnTT instance
 *   and the property value being fetched) and it's returned value will be used as the value returned by the getter.
 * @param set Configures property setter
 * - If false, property won't have a setter.
 * - If true, property will have a simple, pass-through setter.
 * - If ((target: any, value: any) => any), the function will be called (with a reference to the entire EnTT instance
 *   and the property value being set) and it's returned value will be used as the value being stored for the property.
 * @param enumerable If the property is enumerable
 */
function Property({ get = true, set = true, enumerable = true } = {}) {
    // Return decorator metadata
    return Reflect.metadata(symbol, {
        get,
        set,
        enumerable
    });
}
exports.Property = Property;
/**
 * Fetches basic property behavior metadata
 * @param target Class to fetch property metadata for
 * @param key Property key to fetch property metadata for
 * @param store Private store for all property values
 * @returns Property descriptor
 */
function readPropertyDescriptor({ target = undefined, key = undefined, store = undefined } = {}) {
    // Get 
    const metadata = Reflect.getMetadata(symbol, target, key) || {
        get: true,
        set: true,
        enumerable: true
    };
    return {
        // Define property getter
        get: (metadata.get === false ? undefined : () => {
            if (typeof metadata.get === 'function') {
                // Use specified function in getter
                return metadata.get(target, store[key]);
            }
            else if (metadata.get === true) {
                // Use default, pass-through getter
                return store[key];
            }
        }),
        // Define property setter
        set: (metadata.set === false ? undefined : (value) => {
            if (typeof metadata.set === 'function') {
                // Use specified function in setter
                store[key] = metadata.set(target, value);
            }
            else if (metadata.set === true) {
                // Use default, pass-through setter
                store[key] = value;
            }
        }),
        // Define if property is enumerable
        enumerable: !!metadata.enumerable
    };
}
exports.readPropertyDescriptor = readPropertyDescriptor;
//# sourceMappingURL=index.js.map