// enTT lib @Property decorator
// Configures an EnTT property's getters, setters and other basic descriptors
// ----------------------------------------------------------------------------

// Import and (re)export internals
import { _symbolProperty, _readPropertyMetadata, _readPropertyDescriptor } from './internals';

// Import dependencies
import { _getDecoratorMetadata } from '../../entt/internals';

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
  get        = undefined as ((target: any, value: any) => any) | boolean,
  set        = undefined as ((target: any, value: any) => any) | boolean,
  enumerable = undefined as boolean
} = {}) {

  // Set defaults
  const defaults = {
    get:        true,
    set:        true,
    enumerable: true
  };

  // Return decorator
  return (target, key) => {
    // Store @Serializable metadata (configured value, or else inherited value, or else default value)
    const metadata = _getDecoratorMetadata(target.constructor, _symbolProperty);
    metadata[key] = {
      key,
      get:        (get !== undefined ? get : (metadata[key]?.get !== undefined ? metadata[key].get : defaults.get)),
      set:        (set !== undefined ? set : (metadata[key]?.set !== undefined ? metadata[key].set : defaults.set)),
      enumerable: (enumerable !== undefined ? enumerable : (metadata[key]?.enumerable !== undefined ? metadata[key].enumerable : defaults.enumerable))
    };
  }

}

