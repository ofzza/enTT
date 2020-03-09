// enTT lib @Serializable decorator
// Configures an EnTT property serialization behavior
// ----------------------------------------------------------------------------

// Import dependencies
import { EnTT } from '../../../';
import { _getClassMetadata, _getInstanceMetadata } from '../../entt'
import { _readPropertyDescriptor } from '../property';

// Define a unique symbol for Serializable decorator
const symbol = Symbol('@Serializable');

// Define supported types
export type _rawDataType = 'object' | 'json';
export type _castType =  (new() => any) | (Array<new() => any>) | Object;

/**
 * @Serializable() decorator, configures property serialization behavior
 * @param alias (Optional) Configures property getter
 * @param cast (Optional) Configures how serialized value is cast before being set. Supported shapes are:
 * - { cast: MyEnTTClass }, will cast property value as instance of MyEnTTClass
 *    => myEnTTClass
 * - { cast: [MyEnTTClass] }, will cast property value (assumed to be an array) as an array of instances of MyEnTTClass
 *    => [ myEnTTClass, myEnTTClass, myEnTTClass, ... ]
 * - { cast: {MyEnTTClass} }, will cast property value (assumed to be a hashmap) as a hashmap of instances of MyEnTTClass
 *    => { a: myEnTTClass, b: myEnTTClass, c: myEnTTClass, ... }
 */
export function Serializable ({
  alias = undefined as string,
  cast  = undefined as _castType
} = {}) {

  // Return decorator
  return (target, key) => {
    // Store @Serializable metadata
    const decorators  = _getClassMetadata(target.constructor).decorators,
          metadata    = decorators[symbol] || (decorators[symbol] = {});
    if (!metadata[key]) {
      metadata[key] = {
        key,
        alias,
        cast
      };
    }
  }

}

/**
 * Gets @Serializable decorator metadata store
 * @param Class EnTT class containing the metadata
 * @returns Stored @Serializable decorator metadata
 */
export function _readSerializableMetadata (Class) {
  return _getClassMetadata(Class)?.decorators?.[symbol] || {};
}

/**
 * Serializes anything as value of given type
 * @param T Source class
 * @param source Source being serialized from
 * @param type Value type to serialize as
 * @returns Serialized value of requested type
 */
export function _serialize <T> (source: T, type = 'object' as _rawDataType): any {

  // Check if source's store should be source instead
  const instance = (source instanceof EnTT ? _getInstanceMetadata(source).store : source);

  // Serializable
  if (instance && (instance instanceof Array || instance instanceof Object)) {

    // Serializable array or object
    const serialized = Object.keys(instance).reduce((serialized, key) => {

      // Check if property not a method
      if (typeof instance[key] !== 'function') {
      
        // Check if property has a getter or if both getter and setter aren't defined on plain property
        const hasGetter = !!Object.getOwnPropertyDescriptor(instance, key).get
                        || !Object.getOwnPropertyDescriptor(instance, key).set;

        // Check if property has or needs a getter
        if (hasGetter) {

          // Get @Serializable metadata (or defaults)
          const metadata = _readSerializableMetadata(source.constructor)[key] || {
            alias: undefined,
            cast:  undefined
          };

          // Serializable value (EnTT instance or raw value)
          serialized[metadata.alias || key] = _serialize(instance[key], 'object');

        }

      }

      // Return serialized
      return serialized;

    }, (instance instanceof Array ? [] : {}));

    // Convert value
    return _obj2data(serialized, type);

  } else {

    // Convert raw value
    return _obj2data(instance, type);

  }

}

/**
 * Deserializes value of given type into a target
 * @param T Target class
 * @param target Instance being deserialized into
 * @param value Value being deserialized from
 * @param type Type of value to deserialized form
 * @return Target with given value deserialized into it
 */
export function _deserialize <T> (value, type = 'object' as _rawDataType, { target = undefined as T } = {}) {
  
  // Convert value
  const source = _data2obj(value, type);

  // Check if target defined
  if (target === undefined) {
    target = (source instanceof Array ? [] : {}) as T;
  }

  // Check if target's store should be source instead
  const instance = (target instanceof EnTT ? _getInstanceMetadata(target).store : target);

  // Check if value matches target shape
  if ((source instanceof Array && instance instanceof Array) || (source instanceof Object && instance instanceof Object)) {

    // Deserialize
    Object.keys(source).reduce((deserialized, key) => {

      // Check if target property exists and isn't a method
      if (source.hasOwnProperty(key) && typeof source[key] !== 'function') {

        // Check if target property has a setter or if both setter and setter aren't defined on plain property
        const hasSetter = !!Object.getOwnPropertyDescriptor(source, key).set
                        || !Object.getOwnPropertyDescriptor(source, key).get;

        // Check if property has or needs a getter
        if (hasSetter) {

          // Get @Serializable metadata (or defaults)
          const properties = _getClassMetadata(target.constructor)?.decorators?.[symbol];
          const metadata = properties?.[key] || {
            alias: undefined,
            cast:  undefined
          };

          // Serializable value (EnTT instance or raw value)
          const alias = properties && (Object.values(properties) as any[]).find((prop) => (prop.alias === key))?.key || key;
          if (metadata.cast && (metadata.cast instanceof Array) && (metadata.cast.length === 1) && (typeof metadata.cast[0] === 'function')) {
            // Deserialize and cast array
            deserialized[alias] = source[key]
              .map((value) => {
                return _deserialize(value, 'object', { target: new (metadata.cast[0])() })
              });
          } else if (metadata.cast && (metadata.cast instanceof Object) && (Object.values(metadata.cast).length === 1) && (typeof Object.values(metadata.cast)[0] === 'function')) {
            // Deserialize and cast hashmap
            deserialized[alias] = Object.keys(source[key])
              .reduce((deserialized, k) => {
                deserialized[k] = _deserialize(source[key][k], 'object', { target: new (Object.values(metadata.cast)[0] as any)() });
                return deserialized;
              }, {});
          } else if (metadata.cast && (typeof metadata.cast === 'function')) {
            // Deserialize and cast
            deserialized[alias] = _deserialize(source[key], 'object', { target: new (metadata.cast)() });
          } else {
            // Deserialize without casting
            deserialized[alias] = _deserialize(source[key], 'object');
          }

        }

      }

      // Return deserialized
      return deserialized

    }, instance);

    // Return deserialized target
    return target;

  } else {

    // Just return a value as deserialized
    return value;

  }
  
}

/**
 * Returns a casting function that casts a value of given type as an instance of a given Class
 * @param T Class type to cast into
 * @param Class Class to cast into
 * @returns A casting function
 */
export function _cast <T> (Class: (new() => T)) {
  /**
   * Casts a value of given type as an instance of a given Class
   * @param value Value being cast
   * @param type Type of value being cast
   * @returns Instance of the class with deserialized data
   */
  return (value = undefined as T, type = 'object' as _rawDataType) => {
    return _deserialize<T>(value, type, { target: new Class() });
  }
}

/**
 * Converts an object into serialized value of given type
 * @param obj Object being serialized
 * @param type Type to serialize to
 * @returns Given object, serialized into given type
 */
function _obj2data (obj, type = 'object' as _rawDataType) {
  if (type === 'object') {
    return obj;
  } else if (type === 'json') {
    return JSON.stringify(obj, null, 2);
  }
}

/**
 * Converts serialized value of given type into an object
 * @param str Value being deserialized
 * @param type Type to deserialize from
 * @returns Object, deserialized from given type
 */
function _data2obj (str, type = 'object' as _rawDataType) {
  if (type === 'object') {
    return str;
  } else if (type === 'json') {
    return JSON.parse(str);
  }
}
