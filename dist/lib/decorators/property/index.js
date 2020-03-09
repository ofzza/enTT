"use strict";
// enTT lib @Property decorator
// Configures an EnTT property's getters, setters and other basic descriptors
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
const entt_1 = require("../../entt");
// Define a unique symbol for Property decorator
const symbol = Symbol('@Property');
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
 */
function Property({ get = true, set = true, enumerable = true } = {}) {
    // Return decorator
    return (target, key) => {
        // Store @Property metadata
        const decorators = entt_1._getClassMetadata(target.constructor).decorators, metadata = decorators[symbol] || (decorators[symbol] = {});
        if (!metadata[key]) {
            metadata[key] = {
                get,
                set,
                enumerable
            };
        }
    };
}
exports.Property = Property;
/**
 * Gets @Property decorator metadata store
 * @param Class EnTT class containing the metadata
 * @returns Stored @Property decorator metadata
 */
function _readPropertyMetadata(Class) {
    var _a, _b;
    return ((_b = (_a = entt_1._getClassMetadata(Class)) === null || _a === void 0 ? void 0 : _a.decorators) === null || _b === void 0 ? void 0 : _b[symbol]) || {};
}
exports._readPropertyMetadata = _readPropertyMetadata;
/**
 * Fetches basic property behavior metadata
 * @param target Class to fetch property metadata for
 * @param key Property key to fetch property metadata for
 * @param store Private store for all property values
 * @returns Property descriptor
 */
function _readPropertyDescriptor({ target = undefined, key = undefined, store = undefined } = {}) {
    // Get @Property metadata (or defaults)
    const metadata = _readPropertyMetadata(target.constructor)[key] || {
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
exports._readPropertyDescriptor = _readPropertyDescriptor;
//# sourceMappingURL=index.js.map