// enTT lib @Serializable decorator's internals
// ----------------------------------------------------------------------------

// Import dependencies
import { _undefined, _EnTTRoot, _getDecoratorMetadata, _getInstanceMetadata } from '../../../entt/internals';
import { _readPropertyDescriptor } from '../../property/internals';
import { _validateObject } from '../../validate/internals';

// Define a unique symbols for Serializable decorator
export const _symbolSerializable = Symbol('@Serializable');

// Define supported types
export type _rawDataType = 'object' | 'json';
export type _castType =  (new() => any) | (Array<new() => any>) | Object;

/**
 * Gets @Serializable decorator metadata store
 * @param Class EnTT class containing the metadata
 * @returns Stored @Serializable decorator metadata
 */
export function _readSerializableMetadata (Class) {
  return _getDecoratorMetadata(Class, _symbolSerializable) || {};
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
  const instance = (source instanceof _EnTTRoot ? _getInstanceMetadata(source).store : source);

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
            serialize: true,
            alias:     undefined,
            cast:      undefined
          };

          // Check if property is serializable
          if (metadata.serialize) {

            // Serializable value (EnTT instance or raw value)
            serialized[metadata.alias || key] = _serialize(instance[key], 'object');

          }

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
  const instance = (target instanceof _EnTTRoot ? _getInstanceMetadata(target).store : target);

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
          const properties = _getDecoratorMetadata(target.constructor, _symbolSerializable);
          const metadata = properties?.[key] || {
            serialize: true,
            alias:     undefined,
            cast:      undefined
          };

          // Check if property is serializable
          if (metadata.serialize) {

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

      }

      // Return deserialized
      return deserialized

    }, instance);

    // Revalidate instance
    _validateObject(target);

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
 * @param into Casting target class, or structure:
 * - MyEnTTClass, will cast value as instance of MyEnTTClass
 *    => new myEnTTClass()
 * - [MyEnTTClass], will cast value (assumed to be an array) as an array of instances of MyEnTTClass
 *    => [ new myEnTTClass(), new myEnTTClass(), new myEnTTClass(), ... ]
 * - {MyEnTTClass}, will cast value (assumed to be a hashmap) as a hashmap of instances of MyEnTTClass
 *    => { a: new myEnTTClass(), b: new myEnTTClass(), c: new myEnTTClass(), ... }
 * @returns A casting function
 */
export function _cast <T> (into: ((new() => T) | (new() => T)[] | Record<any, (new() => T)>)): ((value: any, type?:_rawDataType) => any) {
  // Check casting target
  if (into && (into instanceof Array) && (into.length === 1) && (typeof into[0] === 'function')) {

    /**
     * Casts a array of values of given type as an array of instances of a given Class
     * @param value Array of values being cast
     * @param type Type of value being cast
     * @returns Array of instances of the class with deserialized data
     */
    return (value = undefined as T[], type = 'object' as _rawDataType) => {
      return value.map(value => _deserialize<T>(value, type, { target: new (into[0])() }));
    }

  } else if (into && (into instanceof Object) && (Object.values(into).length === 1) && (typeof Object.values(into)[0] === 'function')) {

    /**
     * Casts a hashmap of values of given type as a hashmap of instances of a given Class
     * @param value Hashmap of values being cast
     * @param type Type of value being cast
     * @returns Hashmap of instances of the class with deserialized data
     */
    return (value = undefined as Record<any, T>, type = 'object' as _rawDataType) => {
      return Object.keys(value).reduce((hashmap, key) => {
        hashmap[key] = _deserialize<T>(value[key], type, { target: new (Object.values(into)[0])() });
        return hashmap;
      }, {});
    }

  } else if (into && (typeof into === 'function')) {

    /**
     * Casts a value of given type as an instance of a given Class
     * @param value Value being cast
     * @param type Type of value being cast
     * @returns Instance of the class with deserialized data
     */
    return (value = undefined as T, type = 'object' as _rawDataType) => {
      return _deserialize<T>(value, type, { target: new into() });
    }

  } else {
    // Throw error
    throw new Error(`Can't recognize casting target class or structure!`);
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
