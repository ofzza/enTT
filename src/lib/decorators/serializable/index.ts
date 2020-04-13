// enTT lib @Serializable decorator
// Configures an EnTT property serialization behavior
// ----------------------------------------------------------------------------

// Import and (re)export internals
import { _symbolSerializable, _rawDataType, _castType, _readSerializableMetadata, _serialize, _deserialize, _cast } from './internals';

// Import dependencies
import { _getClassMetadata } from '../../entt/internals';

/**
 * @Serializable() decorator, configures property serialization behavior
 * @param alias (Optional) Configures property getter
 * @param cast (Optional) Configures how serialized value is cast before being set. Supported shapes are:
 * - { cast: MyEnTTClass }, will cast property value as instance of MyEnTTClass
 *    => new myEnTTClass()
 * - { cast: [MyEnTTClass] }, will cast property value (assumed to be an array) as an array of instances of MyEnTTClass
 *    => [ new myEnTTClass(), new myEnTTClass(), new myEnTTClass(), ... ]
 * - { cast: {MyEnTTClass} }, will cast property value (assumed to be a hashmap) as a hashmap of instances of MyEnTTClass
 *    => { a: new myEnTTClass(), b: new myEnTTClass(), c: new myEnTTClass(), ... }
 */
export function Serializable ({
  serialize = true as boolean,
  alias     = undefined as string,
  cast      = undefined as _castType
} = {}) {

  // Return decorator
  return (target, key) => {
    // Store @Serializable metadata
    const decorators  = _getClassMetadata(target.constructor).decorators,
          metadata    = decorators[_symbolSerializable] || (decorators[_symbolSerializable] = {});
    if (!metadata[key]) {
      metadata[key] = {
        key,
        serialize,
        alias,
        cast
      };
    }
  }

}
