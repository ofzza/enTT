// enTT lib @Serializable decorator
// Configures an EnTT property serialization behavior
// ----------------------------------------------------------------------------

// Import and (re)export internals
import {
  _symbolSerializable,
  _serializeType,
  _rawDataType,
  _castType,
  _readSerializableMetadata,
  _serialize,
  _deserialize,
  _cast,
  _registerNativeClass,
} from './internals';

// Import dependencies
import { _getDecoratorMetadata } from '../../entt/internals';

/**
 * @Serializable() decorator, configures property serialization behavior
 * @param alias (Optional) Configures property getter
 * @param serialize (Optional) Configures custom serialization mapper.
 *   Function ((target: any, value: any) => any) will be called (with a reference to the entire EnTT instance
 *   and the property value being fetched) and it's returned value will be used as serialized value.
 * @param deserialize (Optional) Configures custom de-serialization mapper,
 *   Function ((target: any, value: any) => any)  will be called (with a reference to the entire EnTT instance
 *   and the property value being set) and it's returned value will be used  as de-serialized value.
 * @param cast (Optional) Configures how serialized value is cast before being set. Supported shapes are:
 * - { cast: MyEnTTClass }, will cast property value as instance of MyEnTTClass
 *    => new myEnTTClass()
 * - { cast: [MyEnTTClass] }, will cast property value (assumed to be an array) as an array of instances of MyEnTTClass
 *    => [ new myEnTTClass(), new myEnTTClass(), new myEnTTClass(), ... ]
 * - { cast: {MyEnTTClass} }, will cast property value (assumed to be a hashmap) as a hashmap of instances of MyEnTTClass
 *    => { a: new myEnTTClass(), b: new myEnTTClass(), c: new myEnTTClass(), ... }
 */
export function Serializable({
  alias = undefined as string,
  serialize = undefined as ((target: any, value: any) => any) | boolean,
  deserialize = undefined as ((target: any, value: any) => any) | boolean,
  cast = undefined as _castType,
} = {}) {
  // Set defaults
  const defaults = {
    alias: undefined as string,
    serialize: true as ((target: any, value: any) => any) | boolean,
    deserialize: true as ((target: any, value: any) => any) | boolean,
    cast: undefined as _castType,
  };

  // Return decorator
  return (target, key) => {
    // Store decorator metadata (configured value, or else inherited value, or else default value)
    const metadata = _getDecoratorMetadata(target.constructor, _symbolSerializable);
    metadata[key] = {
      key,
      alias: alias !== undefined ? alias : metadata[key]?.alias !== undefined ? metadata[key].alias : defaults.alias,
      serialize: serialize !== undefined ? serialize : metadata[key]?.serialize !== undefined ? metadata[key].serialize : defaults.serialize,
      deserialize: deserialize !== undefined ? deserialize : metadata[key]?.deserialize !== undefined ? metadata[key].deserialize : defaults.deserialize,
      cast: cast !== undefined ? cast : metadata[key]?.cast !== undefined ? metadata[key].cast : defaults.cast,
    };
  };
}

/**
 * Registers a native JS class which will not be attempter to be serialized or de-serialized, but will be copied as is
 * @param nativeClass Native JS class
 */
Serializable.registerNativeClass = _registerNativeClass;
