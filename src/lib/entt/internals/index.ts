// enTT lib main, extensible class's internals
// ----------------------------------------------------------------------------

// Define a unique symbol for Property decorator
export const _symbolEnTT = Symbol('EnTT');

// Define reusable undefined stand-in symbol
export const _undefined = Symbol('undefined');

/**
 * Root EnTT class, to be extended by EnTT base, used for internal instance detection avoiding circular dependencies
 */
export class _EnTTRoot {}

/**
 * Initializes and gets stored EnTT class metadata
 * @param Class EnTT class containing the metadata
 * @returns Stored EnTT class metadata
 */
export function _getClassMetadata (Class) {
  // Initialize metadata on the derived class
  if (Class && !Class[_symbolEnTT]) {
    Object.defineProperty(Class, _symbolEnTT, {
      enumerable: false,
      value: {
        // Initialize a private decorators store
        decorators: {}
      }        
    });
  }
  // Return metadata reference
  return Class[_symbolEnTT] || {};
}

/**
 * Initializes and gets stored EnTT instance metadata
 * @param instance EnTT instance containing the metadata
 * @returns Stored EnTT instance metadata
 */
export function _getInstanceMetadata (instance) {
  // Initialize metadata on the instance (non-enumerable an hidden-ish)
  if (instance && !instance[_symbolEnTT]) {
    Object.defineProperty(instance, _symbolEnTT, {
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
  return instance[_symbolEnTT] || {};
}
