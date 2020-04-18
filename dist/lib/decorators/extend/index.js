"use strict";
// enTT lib @Extend decorator
// Provides a way of changing an extended property
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import and (re)export internals
const internals_1 = require("./internals");
// Import dependencies
const internals_2 = require("../../entt/internals");
/**
 * @Extend() decorator, provides a way of changing an extended property
 * TODO: ...
 */
function Property({} = {}) {
    // Set defaults
    const defaults = {};
    // Return decorator
    return (target, key) => {
        // Store decorator metadata (configured value, or else inherited value, or else default value)
        const metadata = internals_2._getDecoratorMetadata(target.constructor, internals_1._symbolExtend);
        metadata[key] = {};
    };
}
exports.Property = Property;
//# sourceMappingURL=index.js.map