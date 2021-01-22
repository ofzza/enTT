"use strict";
// enTT lib @Property decorator's internals
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports._findTaggedProperties = exports._readPropertyDescriptor = exports._readPropertyMetadata = exports._symbolProperty = void 0;
// Import dependencies
const internals_1 = require("../../../entt/internals");
// Define a unique symbol for Property decorator
exports._symbolProperty = Symbol('@Property');
/**
 * Gets @Property decorator metadata store
 * @param Class EnTT class containing the metadata
 * @returns Stored @Property decorator metadata
 */
function _readPropertyMetadata(Class) {
    return internals_1._getDecoratorMetadata(Class, exports._symbolProperty) || {};
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
        enumerable: true,
        tag: [],
    };
    return {
        // Define property getter
        get: metadata.get === false
            ? undefined
            : () => {
                if (typeof metadata.get === 'function') {
                    // Use specified function in getter
                    return metadata.get(target, store[key]);
                }
                else if (metadata.get === true) {
                    // Use default, pass-through getter
                    return store[key];
                }
            },
        // Define property setter
        set: metadata.set === false
            ? undefined
            : value => {
                if (typeof metadata.set === 'function') {
                    // Use specified function in setter
                    store[key] = metadata.set(target, value);
                }
                else if (metadata.set === true) {
                    // Use default, pass-through setter
                    store[key] = value;
                }
            },
        // Define if property is enumerable
        enumerable: !!metadata.enumerable,
        // Define property tags
        tag: metadata.tag,
    };
}
exports._readPropertyDescriptor = _readPropertyDescriptor;
/**
 * Finds all properties of an EnTT class tagged with the specified tag
 * @param target Class to search for tagged properties
 * @param tag Tag to search for
 */
function _findTaggedProperties(target = undefined, tag = undefined) {
    // Get @Property metadata (or defaults)
    const metadata = _readPropertyMetadata(target);
    // Find properties matching requested tab
    return Object.keys(metadata).filter(key => {
        const propertyMetadata = metadata[key];
        if (propertyMetadata && propertyMetadata.tag) {
            if (propertyMetadata.tag instanceof Array && propertyMetadata.tag.indexOf(tag) !== -1) {
                return true;
            }
            if (typeof propertyMetadata.tag === 'symbol' && propertyMetadata.tag === tag) {
                return true;
            }
            if (typeof propertyMetadata.tag === 'string' && propertyMetadata.tag === tag) {
                return true;
            }
        }
        return false;
    });
}
exports._findTaggedProperties = _findTaggedProperties;
//# sourceMappingURL=index.js.map