// enTT lib @Serializable decorator's internals
// ----------------------------------------------------------------------------

// Import dependencies
import { _undefined, _EnTTRoot, _getDecoratorMetadata, _getInstanceMetadata } from '../../../entt/internals';
import { _readPropertyDescriptor } from '../../property/internals';
import { _validationDisable, _validationEnable, _validateObject } from '../../validate/internals';

// Define a unique symbols for Serializable decorator
export const _symbolSerializable = Symbol('@Serializable');

// Define supported types
export type _serializeType = Symbol;
export type _rawDataType = 'object' | 'json';
export type _castType = (new () => any) | Array<new () => any> | Object;

// Holds registered native JS classes
const _nativeClasses = [Symbol, Date];

/**
 * Registers a native JS class which will not be attempter to be serialized or de-serialized, but will be copied as is
 * @param nativeClass Native JS class
 */
export function _registerNativeClass(nativeClass) {
  this._nativeClasses.push(nativeClass);
}

/**
 * Gets @Serializable decorator metadata store
 * @param Class EnTT class containing the metadata
 * @returns Stored @Serializable decorator metadata
 */
export function _readSerializableMetadata(Class) {
  return _getDecoratorMetadata(Class, _symbolSerializable) || {};
}

/**
 * Serializes anything as value of given type
 * @param T Source class
 * @param source Source being serialized from
 * @param type Value type to serialize as
 * @param _customValue (Internal) Used for internal passing of custom serialized values
 * @param _directSerialize (Internal) If true, ignores all custom serialization configuration (used by .clone())
 * @returns Serialized value of requested type
 */
export function _serialize<T>(source: T, type = 'object' as _rawDataType, { _customValue = _undefined as any, _directSerialize = false } = {}): any {
  // Check if source's store should be source instead
  const instance = source instanceof _EnTTRoot ? _getInstanceMetadata(source).store : source;

  // Serializable
  if (instance && !_isNativeClassInstance(instance) && (instance instanceof Array || instance instanceof Object)) {
    // Serializable array or object
    const serialized = Object.keys(instance).reduce(
      (serialized, key) => {
        // Check if property not a method
        if (typeof instance[key] !== 'function') {
          // Check if property has a getter or if both getter and setter aren't defined on plain property
          const hasGetter = !!Object.getOwnPropertyDescriptor(instance, key).get || !Object.getOwnPropertyDescriptor(instance, key).set;

          // Check if property has or needs a getter
          if (hasGetter) {
            // Get @Serializable metadata (or defaults)
            const metadata = _readSerializableMetadata(source.constructor)[key] || {
              alias: undefined,
              serialize: true,
              deserialize: true,
              cast: undefined,
            };

            // Check if property is serializable
            if (_directSerialize || metadata.serialize) {
              // If custom serialization function, map value using the function
              const _customValue = !_directSerialize && metadata.serialize instanceof Function ? metadata.serialize(instance, instance[key]) : _undefined;
              // Serializable value (EnTT instance or raw value)
              serialized[metadata.alias || key] = _serialize(instance[key], 'object', { _customValue });
            }
          }
        }

        // Return serialized
        return serialized;
      },
      instance instanceof Array ? [] : {},
    );

    // Convert value
    return _obj2data(serialized, type);
  } else {
    // Convert raw value
    return _obj2data(_customValue !== _undefined ? _customValue : instance, type);
  }
}

/**
 * Deserializes value of given type into a target
 * @param T Target class
 * @param value Value being deserialized from
 * @param type Type of value to deserialized form
 * @param target Instance being deserialized into
 * @param validate If deserialized instance should be validated after
 * @param _customValue Used for internal passing of custom deserialized values
 * @param _directDeserialize (Internal) If true, ignores all custom deserialization configuration (used by .clone())
 * @return Target with given value deserialized into it
 */
export function _deserialize<T>(
  value,
  type = 'object' as _rawDataType,
  { target = undefined as T, validate = true, _customValue = _undefined as any, _directDeserialize = false } = {},
) {
  // Convert value
  const source = _data2obj(value, type);

  // Check if target defined
  if (target === undefined) {
    target = (source instanceof Array ? [] : {}) as T;
  }

  // Check if target's store should be source instead
  const instance = target instanceof _EnTTRoot ? _getInstanceMetadata(target).store : target;

  // Check if value matches target shape
  if (!_isNativeClassInstance(source) && ((source instanceof Array && instance instanceof Array) || (source instanceof Object && instance instanceof Object))) {
    // Disable validation
    _validationDisable();

    // Deserialize
    Object.keys(source).reduce((deserialized, key) => {
      // Check if target property exists and isn't a method
      if (source.hasOwnProperty(key) && typeof source[key] !== 'function') {
        // Check if target property has a setter or if both setter and setter aren't defined on plain property
        const hasSetter = !!Object.getOwnPropertyDescriptor(source, key).set || !Object.getOwnPropertyDescriptor(source, key).get;

        // Check if property has or needs a getter
        if (hasSetter) {
          // Get @Serializable metadata (or defaults)
          const properties = _getDecoratorMetadata(target.constructor, _symbolSerializable),
            alias = (properties && (Object.values(properties) as any[]).find(prop => prop.alias === key)?.key) || key;
          const metadata = properties?.[alias] || {
            alias: undefined,
            serialize: true,
            deserialize: true,
            cast: undefined,
          };

          // Check if property is serializable
          if (_directDeserialize || metadata.deserialize) {
            // If custom deserialization function, map value using the function
            const _customValue = !_directDeserialize && metadata.deserialize instanceof Function ? metadata.deserialize(source, source[key]) : _undefined;
            // Deserializable value (EnTT instance or raw value)
            if (metadata.cast && metadata.cast instanceof Array && metadata.cast.length === 1 && typeof metadata.cast[0] === 'function') {
              // Deserialize and cast array
              deserialized[alias] = source[key].map(value => {
                return _deserialize(value, 'object', { target: new metadata.cast[0](), _customValue, validate });
              });
            } else if (
              metadata.cast &&
              metadata.cast instanceof Object &&
              Object.values(metadata.cast).length === 1 &&
              typeof Object.values(metadata.cast)[0] === 'function'
            ) {
              // Deserialize and cast hashmap
              deserialized[alias] = Object.keys(source[key]).reduce((deserialized, k) => {
                deserialized[k] = _deserialize(source[key][k], 'object', { target: new (Object.values(metadata.cast)[0] as any)(), _customValue, validate });
                return deserialized;
              }, {});
            } else if (metadata.cast && typeof metadata.cast === 'function') {
              // Deserialize and cast
              deserialized[alias] = _deserialize(source[key], 'object', { target: new metadata.cast(), _customValue, validate });
            } else {
              // Deserialize without casting
              deserialized[alias] = _deserialize(source[key], 'object', { _customValue, validate });
            }
          }
        }
      }

      // Return deserialized
      return deserialized;
    }, instance);

    // (Re)enable validation
    _validationEnable();

    // Revalidate instance
    if (validate) {
      _validateObject(target);
    }

    // Return deserialized target
    return target;
  } else {
    // Just return a value as deserialized
    return _customValue !== _undefined ? _customValue : value;
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
export function _cast<T>(
  into: (new () => T) | (new () => T)[] | Record<any, new () => T>,
): (value: any, type?: _rawDataType, options?: { [key: string]: any }) => any {
  // Check casting target
  if (into && into instanceof Array && into.length === 1 && typeof into[0] === 'function') {
    /**
     * Casts a array of values of given type as an array of instances of a given Class
     * @param value Array of values being cast
     * @param type Type of value being cast
     * @param validate If cast instance should be validated after
     * @returns Array of instances of the class with deserialized data
     */
    return (value = undefined as T[], type = 'object' as _rawDataType, { validate = true } = {}) => {
      return value.map(value => _deserialize<T>(value, type, { target: new into[0](), validate }));
    };
  } else if (into && into instanceof Object && Object.values(into).length === 1 && typeof Object.values(into)[0] === 'function') {
    /**
     * Casts a hashmap of values of given type as a hashmap of instances of a given Class
     * @param value Hashmap of values being cast
     * @param type Type of value being cast
     * @param validate If cast instance should be validated after
     * @returns Hashmap of instances of the class with deserialized data
     */
    return (value = undefined as Record<any, T>, type = 'object' as _rawDataType, { validate = true } = {}) => {
      return Object.keys(value).reduce((hashmap, key) => {
        hashmap[key] = _deserialize<T>(value[key], type, { target: new (Object.values(into)[0])(), validate });
        return hashmap;
      }, {});
    };
  } else if (into && typeof into === 'function') {
    /**
     * Casts a value of given type as an instance of a given Class
     * @param value Value being cast
     * @param type Type of value being cast
     * @param validate If cast instance should be validated after
     * @returns Instance of the class with deserialized data
     */
    return (value = undefined as T, type = 'object' as _rawDataType, { validate = true } = {}) => {
      return _deserialize<T>(value, type, { target: new into(), validate });
    };
  } else {
    // Throw error
    throw new Error(`Can't recognize casting target class or structure!`);
  }
}

/**
 * Clones an EnTT instance
 * @param instance EnTT instance to clone
 * @param target Instance being deserialized into
 * @param validate If cloned instance should be validated after
 * @returns Cloned instance
 */
export function _clone(instance, { target = undefined as _EnTTRoot, validate = true } = {}) {
  target = target || new instance.constructor();
  return _deserialize(_serialize(instance, 'object', { _directSerialize: true }), 'object', { target, _directDeserialize: true, validate });
}

/**
 * Checks if object is an instance of a native JS class
 * @param obj Object to check
 */
function _isNativeClassInstance(obj) {
  for (const nativeClass of _nativeClasses) {
    if (obj instanceof nativeClass) {
      return true;
    }
  }
  return false;
}

/**
 * Converts an object into serialized value of given type
 * @param obj Object being serialized
 * @param type Type to serialize to
 * @returns Given object, serialized into given type
 */
function _obj2data(obj, type = 'object' as _rawDataType) {
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
function _data2obj(str, type = 'object' as _rawDataType) {
  if (type === 'object') {
    return str;
  } else if (type === 'json') {
    return JSON.parse(str);
  }
}
