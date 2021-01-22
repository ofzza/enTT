"use strict";
// enTT lib main, extensible class's internals
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports._getInstanceMetadata = exports._getDecoratorMetadata = exports._getClassMetadata = exports._EnTTRoot = exports._undefined = exports._symbolEnTTInstance = exports._symbolEnTTClass = void 0;
// Define a unique symbol for Property decorator
exports._symbolEnTTClass = Symbol('EnTT Class Metadata');
exports._symbolEnTTInstance = Symbol('EnTT Instance Metadata');
// Define reusable undefined stand-in symbol
exports._undefined = Symbol('undefined');
/**
 * Root EnTT class, to be extended by EnTT base, used for internal instance detection avoiding circular dependencies
 */
// tslint:disable-next-line: class-name
class _EnTTRoot {
    /**
     * Returns validation status of the instance
     * @returns If instance is validated
     */
    get valid() {
        throw new Error('Not implemented!');
    }
    /**
     * Returns validation errors of all properties
     * @returns A hashmap of arrays of errors per property
     */
    get errors() {
        throw new Error('Not implemented!');
    }
}
exports._EnTTRoot = _EnTTRoot;
/**
 * Initializes and gets stored EnTT class metadata
 * @param aClass EnTT class containing the metadata
 * @returns Stored EnTT class metadata
 */
// tslint:disable-next-line: ban-types
function _getClassMetadata(aClass) {
    // Initialize metadata on the derived class
    if (aClass && !aClass.hasOwnProperty(exports._symbolEnTTClass)) {
        // Set metadata store
        Object.defineProperty(aClass, exports._symbolEnTTClass, {
            enumerable: false,
            value: {
                // Initialize a private decorators store
                decorators: {},
            },
        });
    }
    // Return metadata reference
    return aClass[exports._symbolEnTTClass];
}
exports._getClassMetadata = _getClassMetadata;
/**
 * Initializes and gets stored EnTT class metadata for a requested decorator
 * @param aClass EnTT class containing the metadata
 * @param _symbolDecorator Unique symbol name-spacing the decorator in question
 * @returns Stored EnTT class metadata for requested decorator
 */
// tslint:disable-next-line: ban-types
function _getDecoratorMetadata(aClass, _symbolDecorator) {
    // Get class metadata
    const decoratorsMetadata = _getClassMetadata(aClass).decorators;
    // Check if decorator already initialized
    if (!decoratorsMetadata[_symbolDecorator]) {
        // Initialized decorator
        decoratorsMetadata[_symbolDecorator] = {};
        // Check for inherited metadata
        const prototypeClass = Object.getPrototypeOf(aClass), prototypeDecoratorMetadata = prototypeClass ? _getClassMetadata(prototypeClass).decorators : {};
        // Inherit metadata
        if (prototypeDecoratorMetadata[_symbolDecorator]) {
            for (const key of Object.keys(prototypeDecoratorMetadata[_symbolDecorator])) {
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
    // Return type must be any 'cos it can be modified by different "extensions" to the main structure
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
                // Repository of custom data required by different "extensions"
                custom: {},
            },
        });
    }
    // Return metadata reference
    return instance[exports._symbolEnTTInstance];
}
exports._getInstanceMetadata = _getInstanceMetadata;
//# sourceMappingURL=index.js.map