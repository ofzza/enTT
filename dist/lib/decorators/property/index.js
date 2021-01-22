"use strict";
// enTT lib @Property decorator
// Configures an EnTT property's getters, setters and other basic descriptors
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = void 0;
// Import and (re)export internals
const internals_1 = require("./internals");
// Import dependencies
const internals_2 = require("../../entt/internals");
/**
 * @Property() decorator, configures basic property behavior metadata
 * @param get (Optional) Configures property getter
 * - If false, property won't have a getter.
 * - If true, property will have a simple, pass-through getter.
 * - If ((value: any, target: any) => any), the function will be called (with a reference to the entire EnTT instance
 *   and the property value being fetched) and it's returned value will be used as the value returned by the getter.
 * @param set (Optional) Configures property setter
 * - If false, property won't have a setter.
 * - If true, property will have a simple, pass-through setter.
 * - If ((value: any, target: any) => any), the function will be called (with a reference to the entire EnTT instance
 *   and the property value being set) and it's returned value will be used as the value being stored for the property.
 * @param enumerable (Optional) If the property is enumerable
 * @param tag (Optional) String or array of strings marking the property as belonging to a certain subset
 */
function Property({ get = undefined, set = undefined, enumerable = undefined, tag = undefined, } = {}) {
    // Set defaults
    const defaults = {
        get: true,
        set: true,
        enumerable: true,
        tag: [],
    };
    // Return decorator
    return (target, key) => {
        var _a, _b, _c, _d;
        // Store decorator metadata (configured value, or else inherited value, or else default value)
        const metadata = internals_2._getDecoratorMetadata(target.constructor, internals_1._symbolProperty);
        metadata[key] = {
            key,
            get: get !== undefined ? get : ((_a = metadata[key]) === null || _a === void 0 ? void 0 : _a.get) !== undefined ? metadata[key].get : defaults.get,
            set: set !== undefined ? set : ((_b = metadata[key]) === null || _b === void 0 ? void 0 : _b.set) !== undefined ? metadata[key].set : defaults.set,
            enumerable: enumerable !== undefined ? enumerable : ((_c = metadata[key]) === null || _c === void 0 ? void 0 : _c.enumerable) !== undefined ? metadata[key].enumerable : defaults.enumerable,
            tag: tag !== undefined ? tag : ((_d = metadata[key]) === null || _d === void 0 ? void 0 : _d.tag) !== undefined ? metadata[key].tag : defaults.tag,
        };
    };
}
exports.Property = Property;
//# sourceMappingURL=index.js.map