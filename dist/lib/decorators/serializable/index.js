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
 * @param cast (Optional) Configures how serialized value is cast before being set. Supported shapes are:
 * - { cast: MyEnTTClass }, will cast property value as instance of MyEnTTClass
 *    => new myEnTTClass()
 * - { cast: [MyEnTTClass] }, will cast property value (assumed to be an array) as an array of instances of MyEnTTClass
 *    => [ new myEnTTClass(), new myEnTTClass(), new myEnTTClass(), ... ]
 * - { cast: {MyEnTTClass} }, will cast property value (assumed to be a hashmap) as a hashmap of instances of MyEnTTClass
 *    => { a: new myEnTTClass(), b: new myEnTTClass(), c: new myEnTTClass(), ... }
 */
function Serializable({ serialize = undefined, alias = undefined, cast = undefined } = {}) {
    // Set defaults
    const defaults = {
        serialize: true,
        alias: undefined,
        cast: undefined
    };
    // Return decorator
    return (target, key) => {
        var _a, _b, _c;
        // Store @Serializable metadata (configured value, or else inherited value, or else default value)
        const metadata = internals_2._getDecoratorMetadata(target.constructor, internals_1._symbolSerializable);
        metadata[key] = {
            key,
            serialize: (serialize !== undefined ? serialize : (((_a = metadata[key]) === null || _a === void 0 ? void 0 : _a.serialized) !== undefined ? metadata[key].serialized : defaults.serialize)),
            alias: (alias !== undefined ? alias : (((_b = metadata[key]) === null || _b === void 0 ? void 0 : _b.alias) !== undefined ? metadata[key].alias : defaults.alias)),
            cast: (cast !== undefined ? cast : (((_c = metadata[key]) === null || _c === void 0 ? void 0 : _c.cast) !== undefined ? metadata[key].cast : defaults.cast))
        };
    };
}
exports.Serializable = Serializable;
//# sourceMappingURL=index.js.map