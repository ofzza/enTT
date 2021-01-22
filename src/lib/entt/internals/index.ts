// enTT lib main, extensible class's internals
// ----------------------------------------------------------------------------

// Define a unique symbol for Property decorator
export const _symbolEnTTClass = Symbol('EnTT Class Metadata');
export const _symbolEnTTInstance = Symbol('EnTT Instance Metadata');

// Define reusable undefined stand-in symbol
export const _undefined = Symbol('undefined');

// Helper types
export type TNew<T> = new () => T;

/**
 * Root EnTT class, to be extended by EnTT base, used for internal instance detection avoiding circular dependencies
 */
// tslint:disable-next-line: class-name
export class _EnTTRoot {
  /**
   * Returns validation status of the instance
   * @returns If instance is validated
   */
  public get valid(): boolean {
    throw new Error('Not implemented!');
  }

  /**
   * Returns validation errors of all properties
   * @returns A hashmap of arrays of errors per property
   */
  public get errors(): Record<string, any> {
    throw new Error('Not implemented!');
  }
}

/**
 * Initializes and gets stored EnTT class metadata
 * @param aClass EnTT class containing the metadata
 * @returns Stored EnTT class metadata
 */
// tslint:disable-next-line: ban-types
export function _getClassMetadata<T extends Function>(aClass: T): any {
  // Initialize metadata on the derived class
  if (aClass && !aClass.hasOwnProperty(_symbolEnTTClass)) {
    // Set metadata store
    Object.defineProperty(aClass, _symbolEnTTClass, {
      enumerable: false,
      value: {
        // Initialize a private decorators store
        decorators: {},
      },
    });
  }
  // Return metadata reference
  return aClass[_symbolEnTTClass];
}

/**
 * Initializes and gets stored EnTT class metadata for a requested decorator
 * @param aClass EnTT class containing the metadata
 * @param _symbolDecorator Unique symbol name-spacing the decorator in question
 * @returns Stored EnTT class metadata for requested decorator
 */
// tslint:disable-next-line: ban-types
export function _getDecoratorMetadata<T extends Function>(aClass: T, _symbolDecorator: string | symbol): any {
  // Get class metadata
  const decoratorsMetadata = _getClassMetadata(aClass).decorators;
  // Check if decorator already initialized
  if (!decoratorsMetadata[_symbolDecorator]) {
    // Initialized decorator
    decoratorsMetadata[_symbolDecorator] = {};
    // Check for inherited metadata
    const prototypeClass = Object.getPrototypeOf(aClass),
      prototypeDecoratorMetadata = prototypeClass ? _getClassMetadata(prototypeClass).decorators : {};
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

/**
 * Initializes and gets stored EnTT instance metadata
 * @param instance EnTT instance containing the metadata
 * @returns Stored EnTT instance metadata
 */
export function _getInstanceMetadata<T>(
  instance: T,
): { store: any; restore: any; children: { path: string[]; child: _EnTTRoot }[]; custom: Record<string, any> } {
  // Return type must be any 'cos it can be modified by different "extensions" to the main structure
  // Initialize metadata on the instance (non-enumerable an hidden-ish)
  if (instance && !instance[_symbolEnTTInstance]) {
    Object.defineProperty(instance, _symbolEnTTInstance, {
      enumerable: false,
      value: {
        // Initialize a private property values' store
        store: {} as any,
        // Initialize a private property values' store of last valid values
        restore: {} as any,
        // Array of child EnTT instances
        children: [] as { path: string[]; child: _EnTTRoot }[],
        // Repository of custom data required by different "extensions"
        custom: {} as Record<string, any>,
      },
    });
  }
  // Return metadata reference
  return instance[_symbolEnTTInstance];
}
