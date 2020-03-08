// enTT lib @Property decorator
// Configures an EnTT property's getters, setters and other basic descriptors
// ----------------------------------------------------------------------------

// Import dependencies
import { _getClassMetadata } from '../../entt';

// Define a unique symbol for Property decorator
const symbol = Symbol("enTT @Property");

/**
 * @Property() decorator, configures basic property behavior metadata
 * @param get (Optional) Configures property getter
 * - If false, property won't have a getter.
 * - If true, property will have a simple, pass-through getter.
 * - If ((target: any, value: any) => any), the function will be called (with a reference to the entire EnTT instance
 *   and the property value being fetched) and it's returned value will be used as the value returned by the getter.
 * @param set (Optional) Configures property setter
 * - If false, property won't have a setter.
 * - If true, property will have a simple, pass-through setter.
 * - If ((target: any, value: any) => any), the function will be called (with a reference to the entire EnTT instance
 *   and the property value being set) and it's returned value will be used as the value being stored for the property.
 * @param enumerable (Optional) If the property is enumerable
 */
export function Property ({
  get        = true as ((target: any, value: any) => any) | boolean,
  set        = true as ((target: any, value: any) => any) | boolean,
  enumerable = true as boolean
} = {}) {

  // Return decorator
  return (target, key) => {
    // Store @Property metadata
    const decorators  = _getClassMetadata(target.constructor).decorators,
          metadata    = decorators[symbol] || (decorators[symbol] = {});
    if (!metadata[key]) {
      metadata[key] = {
        get,
        set,
        enumerable
      };
    }
  }

}

/**
 * Gets @Property decorator metadata store
 * @param Class EnTT class containing the metadata
 * @returns Stored @Property decorator metadata
 */
export function _readPropertyMetadata (Class) {
  return _getClassMetadata(Class)?.decorators?.[symbol] || {};
}

/**
 * Fetches basic property behavior metadata
 * @param target Class to fetch property metadata for
 * @param key Property key to fetch property metadata for
 * @param store Private store for all property values
 * @returns Property descriptor
 */
export function _readPropertyDescriptor ({
  target = undefined as any,
  key    = undefined as string | symbol,
  store  = undefined as object
} = {}) {
  // Get @Property metadata (or defaults)
  const metadata = _readPropertyMetadata(target.constructor)[key] || {
    get:        true,
    set:        true,
    enumerable: true
  };
  return {
    // Define property getter
    get: (metadata.get === false ? undefined : () => {
      if (typeof metadata.get === 'function') {
        // Use specified function in getter
        return metadata.get(target, store[key]);
      } else if (metadata.get === true) {
        // Use default, pass-through getter
        return store[key];
      }
    }),
    // Define property setter
    set: (metadata.set === false ? undefined : (value) => {
      if (typeof metadata.set === 'function') {
        // Use specified function in setter
        store[key] = metadata.set(target, value);
      } else if (metadata.set === true) {
        // Use default, pass-through setter
        store[key] = value;
      }
    }),
    // Define if property is enumerable
    enumerable: !!metadata.enumerable
  };  
}
