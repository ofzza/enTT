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
function Serializable({ serialize = true, alias = undefined, cast = undefined } = {}) {
    // Return decorator
    return (target, key) => {
        // Store @Serializable metadata
        const decorators = internals_2._getClassMetadata(target.constructor).decorators, metadata = decorators[internals_1._symbolSerializable] || (decorators[internals_1._symbolSerializable] = {});
        if (!metadata[key]) {
            metadata[key] = {
                key,
                serialize,
                alias,
                cast
            };
        }
    };
}
exports.Serializable = Serializable;
//# sourceMappingURL=index.js.map