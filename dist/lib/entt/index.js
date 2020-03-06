"use strict";
// enTT lib main, extensible class
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Import dependencies
const property_1 = require("../decorators/property");
/**
 * Main, extensible EnTT class definition
 */
class EnTT {
    /**
     * Initializes EnTT features for the extending class - should be called in extending class' constructor, right after "super()".
     * Example:
     *   constructor () { super(); super.entt(); }
     */
    entt() {
        // Initialize metadata on the derived class
        const Class = this.constructor.__enTT__ || (this.constructor.__enTT__ = {});
        // Initialize instance metadata
        const instance = {
            // Initialize a private property values' store
            store: {}
        };
        // Replace properties with dynamic counterparts
        replacePropertiesWithGetterSetters.bind(this)({ store: instance.store });
    }
}
exports.EnTT = EnTT;
/**
 * Replaces properties with dynamic counterparts
 * @param store Private store for all property values
 */
function replacePropertiesWithGetterSetters({ store = undefined } = {}) {
    // Iterate over properties
    for (const key in this) {
        // Check if own property
        if (this.hasOwnProperty(key)) {
            if (typeof this[key] !== 'function') {
                // Store initial value
                store[key] = this[key];
                // Delete property
                delete this[key];
                // Replace property with a custom property
                Object.defineProperty(this, key, {
                    // Default property configuration
                    ...{ configurable: false },
                    // @Property property overrides
                    ...property_1.readPropertyDescriptor({ target: this, key, store })
                });
            }
        }
    }
}
//# sourceMappingURL=index.js.map