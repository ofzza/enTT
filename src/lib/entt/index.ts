// enTT lib main, extensible class
// ----------------------------------------------------------------------------

// Import dependencies
import { _readPropertyMetadata, _readPropertyDescriptor } from '../decorators/property';
import { _rawDataType, _cast, _serialize, _deserialize } from '../decorators/serialize';

// Define a unique symbol for Property decorator
const symbol = Symbol('EnTT class');

/**
 * Main, extensible EnTT class definition
 */
export class EnTT {

  /**
   * Casts a value of given type as an instance of a parent EnTT Class
   * @param value Value being cast
   * @param type Type of value being cast
   * @param Class (Optional) Class to cast into
   * @returns Instance of the class with deserialized data
   */
  public static cast (value = undefined as any, type = 'object' as _rawDataType, { Class = undefined as (new() => any) } = {}) {
    const CastIntoClass = (Class || (this.constructor as (new() => any)));
    return _cast(CastIntoClass)(value, type);
  }

  /**
   * Initializes EnTT features for the extending class - should be called in extending class' constructor, right after "super()".
   * Example:
   *   constructor () { super(); super.entt(); }
   */
  protected entt () {

    // Initialize metadata on the derived class
    const classMetadata = _getClassMetadata(this.constructor);
    // Initialize metadata on the instance (non-enumerable an hidden-ish)
    const instanceMetadata = _getInstanceMetadata(this);

    // Replace properties with dynamic counterparts
    _replacePropertiesWithGetterSetters.bind(this)({ store: instanceMetadata.store });

  }

  /**
   * Serializes (extracts underlying instance state) Class instance as value of given type
   * @param type Value type to serialize as
   * @returns Serialized value of requested type
   */
  public serialize (type = 'object' as _rawDataType) {
    return _serialize(this, type);
  }

  /**
   * Deserializes value of given type into a target
   * @param value Value being deserialized from
   * @param type Type of value to deserialized form
   * @return Target with given value deserialized into it
   */
  public deserialize (value, type = 'object' as _rawDataType) {
    return _deserialize(value, type, { target: this });
  }

}

/**
 * Initializes and gets stored EnTT class metadata
 * @param Class EnTT class containing the metadata
 * @returns Stored EnTT class metadata
 */
export function _getClassMetadata (Class) {
  // Initialize metadata on the derived class
  if (Class && !Class[symbol]) {
    Object.defineProperty(Class, symbol, {
      enumerable: false,
      value: {
        // Initialize a private decorators store
        decorators: {}
      }        
    });
  }
  // Return metadata reference
  return Class[symbol] || {};
}

/**
 * Initializes and gets stored EnTT instance metadata
 * @param instance EnTT instance containing the metadata
 * @returns Stored EnTT instance metadata
 */
export function _getInstanceMetadata (instance) {
  // Initialize metadata on the instance (non-enumerable an hidden-ish)
  if (instance && !instance[symbol]) {
    Object.defineProperty(instance, symbol, {
      enumerable: false,
      value: {
        // Initialize a private property values' store
        store: {}
      }        
    });
  }
  // Return metadata reference
  return instance[symbol] || {};
}

/**
 * Replaces properties with dynamic counterparts
 * @param store Private store for all property values
 */
function _replacePropertiesWithGetterSetters ({
  store = undefined as object
} = {}) {
  // Iterate over properties
  for (const key of Object.keys(this) ) {
    // Check if own property
    if (this.hasOwnProperty(key)) {
      if (typeof this[key] !== 'function') {

        // Store initial value
        store[key] = this[key];

        // Replace property with a custom property
        Object.defineProperty(this, key, {
          // Default property configuration
          ...{ configurable: false },
          // @Property property overrides
          ..._readPropertyDescriptor({ target: this, key, store })
        });

      }
    }
  }
}
