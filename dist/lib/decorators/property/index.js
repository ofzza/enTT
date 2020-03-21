"use strict";
// enTT lib @Property decorator
// Configures an EnTT property's getters, setters and other basic descriptors
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import and (re)export internals
const internals_1 = require("./internals");
exports._symbolProperty = internals_1._symbolProperty;
exports._readPropertyMetadata = internals_1._readPropertyMetadata;
exports._readPropertyDescriptor = internals_1._readPropertyDescriptor;
// Import dependencies
const internals_2 = require("../../entt/internals");
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
        const decorators = internals_2._getClassMetadata(target.constructor).decorators, metadata = decorators[internals_1._symbolProperty] || (decorators[internals_1._symbolProperty] = {});
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
//# sourceMappingURL=index.js.map