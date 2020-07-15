"use strict";
// enTT lib @Serializable decorator
// Configures an EnTT property serialization behavior
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import and (re)export internals
const internals_1 = require("./internals");
// Import dependencies
const internals_2 = require("../../entt/internals");
/**
 * @Serializable() decorator, configures property serialization behavior
 * @param alias (Optional) Configures property getter
 * @param serialize (Optional) Configures custom serialization mapper.
 *   Function ((target: any, value: any) => any) will be called (with a reference to the entire EnTT instance
 *   and the property value being fetched) and it's returned value will be used as serialized value.
 * @param deserialize (Optional) Configures custom de-serialization mapper,
 *   Function ((target: any, value: any) => any)  will be called (with a reference to the entire EnTT instance
 *   and the property value being set) and it's returned value will be used  as de-serialized value.
 * @param cast (Optional) Configures how serialized value is cast before being set. Supported shapes are:
 * - { cast: MyEnTTClass }, will cast property value as instance of MyEnTTClass
 *    => new myEnTTClass()
 * - { cast: [MyEnTTClass] }, will cast property value (assumed to be an array) as an array of instances of MyEnTTClass
 *    => [ new myEnTTClass(), new myEnTTClass(), new myEnTTClass(), ... ]
 * - { cast: {MyEnTTClass} }, will cast property value (assumed to be a hashmap) as a hashmap of instances of MyEnTTClass
 *    => { a: new myEnTTClass(), b: new myEnTTClass(), c: new myEnTTClass(), ... }
 */
function Serializable({ alias = undefined, serialize = undefined, deserialize = undefined, cast = undefined, } = {}) {
    // Set defaults
    const defaults = {
        alias: undefined,
        serialize: true,
        deserialize: true,
        cast: undefined,
    };
    // Return decorator
    return (target, key) => {
        var _a, _b, _c, _d;
        // Store decorator metadata (configured value, or else inherited value, or else default value)
        const metadata = internals_2._getDecoratorMetadata(target.constructor, internals_1._symbolSerializable);
        metadata[key] = {
            key,
            alias: alias !== undefined ? alias : ((_a = metadata[key]) === null || _a === void 0 ? void 0 : _a.alias) !== undefined ? metadata[key].alias : defaults.alias,
            serialize: serialize !== undefined ? serialize : ((_b = metadata[key]) === null || _b === void 0 ? void 0 : _b.serialize) !== undefined ? metadata[key].serialize : defaults.serialize,
            deserialize: deserialize !== undefined ? deserialize : ((_c = metadata[key]) === null || _c === void 0 ? void 0 : _c.deserialize) !== undefined ? metadata[key].deserialize : defaults.deserialize,
            cast: cast !== undefined ? cast : ((_d = metadata[key]) === null || _d === void 0 ? void 0 : _d.cast) !== undefined ? metadata[key].cast : defaults.cast,
        };
    };
}
exports.Serializable = Serializable;
/**
 * Registers a native JS class which will not be attempter to be serialized or de-serialized, but will be copied as is
 * @param nativeClass Native JS class
 */
Serializable.registerNativeClass = internals_1._registerNativeClass;
//# sourceMappingURL=index.js.map