"use strict";
// enTT lib main, extensible class's internals
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
// Define a unique symbol for Property decorator
exports._symbolEnTTClass = Symbol('EnTT Class Metadata');
exports._symbolEnTTInstance = Symbol('EnTT Instance Metadata');
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
    if (Class && !Class.hasOwnProperty(exports._symbolEnTTClass)) {
        // Set metadata store
        Object.defineProperty(Class, exports._symbolEnTTClass, {
            enumerable: false,
            value: {
                // Initialize a private decorators store
                decorators: {},
            },
        });
    }
    // Return metadata reference
    return Class[exports._symbolEnTTClass];
}
exports._getClassMetadata = _getClassMetadata;
/**
 * Initializes and gets stored EnTT class metadata for a requested decorator
 * @param {*} Class EnTT class containing the metadata
 * @param {*} _symbolDecorator Unique symbol name-spacing the decorator in question
 * @returns Stored EnTT class metadata for requested decorator
 */
function _getDecoratorMetadata(Class, _symbolDecorator) {
    // Get class metadata
    const decoratorsMetadata = _getClassMetadata(Class).decorators;
    // Check if decorator already initialized
    if (!decoratorsMetadata[_symbolDecorator]) {
        // Initialized decorator
        decoratorsMetadata[_symbolDecorator] = {};
        // Check for inherited metadata
        const prototypeClass = Object.getPrototypeOf(Class), prototypeDecoratorMetadata = prototypeClass ? _getClassMetadata(prototypeClass).decorators : {};
        // Inherit metadata
        if (prototypeDecoratorMetadata[_symbolDecorator]) {
            for (const key in prototypeDecoratorMetadata[_symbolDecorator]) {
                decoratorsMetadata[_symbolDecorator][key] = prototypeDecoratorMetadata[_symbolDecorator][key];
            }
        }
    }
    // Return decorator metadata
    return decoratorsMetadata[_symbolDecorator];
}
exports._getDecoratorMetadata = _getDecoratorMetadata;
/**
 * Initializes and gets stored EnTT instance metadata
 * @param instance EnTT instance containing the metadata
 * @returns Stored EnTT instance metadata
 */
function _getInstanceMetadata(instance) {
    // Initialize metadata on the instance (non-enumerable an hidden-ish)
    if (instance && !instance[exports._symbolEnTTInstance]) {
        Object.defineProperty(instance, exports._symbolEnTTInstance, {
            enumerable: false,
            value: {
                // Initialize a private property values' store
                store: {},
                // Initialize a private property values' store of last valid values
                restore: {},
                // Array of child EnTT instances
                children: [],
            },
        });
    }
    // Return metadata reference
    return instance[exports._symbolEnTTInstance];
}
exports._getInstanceMetadata = _getInstanceMetadata;
//# sourceMappingURL=index.js.map