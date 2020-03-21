"use strict";
// enTT lib main, extensible class's internals
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Define a unique symbol for Property decorator
exports._symbolEnTT = Symbol('EnTT');
// Define reusable undefined stand-in symbol
exports._undefined = Symbol('undefined');
/**
 * Root EnTT class, to be extended by EnTT base, used for internal instance detection avoiding circular dependencies
 */
class _EnTTRoot {
}
exports._EnTTRoot = _EnTTRoot;
/**
 * Initializes and gets stored EnTT class metadata
 * @param Class EnTT class containing the metadata
 * @returns Stored EnTT class metadata
 */
function _getClassMetadata(Class) {
    // Initialize metadata on the derived class
    if (Class && !Class[exports._symbolEnTT]) {
        Object.defineProperty(Class, exports._symbolEnTT, {
            enumerable: false,
            value: {
                // Initialize a private decorators store
                decorators: {}
            }
        });
    }
    // Return metadata reference
    return Class[exports._symbolEnTT] || {};
}
exports._getClassMetadata = _getClassMetadata;
/**
 * Initializes and gets stored EnTT instance metadata
 * @param instance EnTT instance containing the metadata
 * @returns Stored EnTT instance metadata
 */
function _getInstanceMetadata(instance) {
    // Initialize metadata on the instance (non-enumerable an hidden-ish)
    if (instance && !instance[exports._symbolEnTT]) {
        Object.defineProperty(instance, exports._symbolEnTT, {
            enumerable: false,
            value: {
                // Initialize a private property values' store
                store: {},
                // Initialize a private property values' store of last valid values
                restore: {},
                // Array of child EnTT instances
                children: []
            }
        });
    }
    // Return metadata reference
    return instance[exports._symbolEnTT] || {};
}
exports._getInstanceMetadata = _getInstanceMetadata;
//# sourceMappingURL=index.js.map