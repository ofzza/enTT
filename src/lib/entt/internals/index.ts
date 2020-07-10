// enTT lib main, extensible class's internals
// ----------------------------------------------------------------------------

// Define a unique symbol for Property decorator
export const _symbolEnTTClass = Symbol('EnTT Class Metadata');
export const _symbolEnTTInstance = Symbol('EnTT Instance Metadata');

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
export function _getClassMetadata(Class) {
  // Initialize metadata on the derived class
  if (Class && !Class.hasOwnProperty(_symbolEnTTClass)) {
    // Set metadata store
    Object.defineProperty(Class, _symbolEnTTClass, {
      enumerable: false,
      value: {
        // Initialize a private decorators store
        decorators: {},
      },
    });
  }
  // Return metadata reference
  return Class[_symbolEnTTClass];
}

/**
 * Initializes and gets stored EnTT class metadata for a requested decorator
 * @param {*} Class EnTT class containing the metadata
 * @param {*} _symbolDecorator Unique symbol name-spacing the decorator in question
 * @returns Stored EnTT class metadata for requested decorator
 */
export function _getDecoratorMetadata(Class, _symbolDecorator) {
  // Get class metadata
  const decoratorsMetadata = _getClassMetadata(Class).decorators;
  // Check if decorator already initialized
  if (!decoratorsMetadata[_symbolDecorator]) {
    // Initialized decorator
    decoratorsMetadata[_symbolDecorator] = {};
    // Check for inherited metadata
    const prototypeClass = Object.getPrototypeOf(Class),
      prototypeDecoratorMetadata = prototypeClass ? _getClassMetadata(prototypeClass).decorators : {};
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

/**
 * Initializes and gets stored EnTT instance metadata
 * @param instance EnTT instance containing the metadata
 * @returns Stored EnTT instance metadata
 */
export function _getInstanceMetadata(instance) {
  // Initialize metadata on the instance (non-enumerable an hidden-ish)
  if (instance && !instance[_symbolEnTTInstance]) {
    Object.defineProperty(instance, _symbolEnTTInstance, {
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
  return instance[_symbolEnTTInstance];
}
