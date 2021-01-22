// enTT lib @Property decorator's internals
// ----------------------------------------------------------------------------

// Import dependencies
import { _getDecoratorMetadata } from '../../../entt/internals';

// Define a unique symbol for Property decorator
export const _symbolProperty = Symbol('@Property');

/**
 * Gets @Property decorator metadata store
 * @param Class EnTT class containing the metadata
 * @returns Stored @Property decorator metadata
 */
export function _readPropertyMetadata(Class) {
  return _getDecoratorMetadata(Class, _symbolProperty) || {};
}

/**
 * Fetches basic property behavior metadata
 * @param target Class to fetch property metadata for
 * @param key Property key to fetch property metadata for
 * @param store Private store for all property values
 * @returns Property descriptor
 */
export function _readPropertyDescriptor({ target = undefined as any, key = undefined as string | symbol, store = undefined as object } = {}): {
  get: () => any;
  set: (value: any) => void;
  enumerable: boolean;
  tag: any;
} {
  // Get @Property metadata (or defaults)
  const metadata = _readPropertyMetadata(target.constructor)[key] || {
    get: true,
    set: true,
    enumerable: true,
    tag: [],
  };
  return {
    // Define property getter
    get:
      metadata.get === false
        ? undefined
        : () => {
            if (typeof metadata.get === 'function') {
              // Use specified function in getter
              return metadata.get(target, store[key]);
            } else if (metadata.get === true) {
              // Use default, pass-through getter
              return store[key];
            }
          },
    // Define property setter
    set:
      metadata.set === false
        ? undefined
        : value => {
            if (typeof metadata.set === 'function') {
              // Use specified function in setter
              store[key] = metadata.set(target, value);
            } else if (metadata.set === true) {
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
/**
 * Finds all properties of an EnTT class tagged with the specified tag
 * @param target Class to search for tagged properties
 * @param tag Tag to search for
 */
export function _findTaggedProperties(target = undefined as any, tag = undefined as string | Symbol): string[] {
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
