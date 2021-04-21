// enTT lib @Serializable decorator's internals
// ----------------------------------------------------------------------------

// Import dependencies
import { _undefined, TNew } from '../../../entt/internals';
import { _EnTTRoot, _getDecoratorMetadata, _getInstanceMetadata } from '../../../entt/internals';
import { _readPropertyDescriptor } from '../../property/internals';
import { _validationDisable, _validationEnable, _validateObject } from '../../validate/internals';

// Define a unique symbols for Serializable decorator
export const _symbolSerializable = Symbol('@Serializable');

// Define supported types
export type _serializeType = symbol;
export type _rawDataType = 'object' | 'json';

// Holds registered native JS classes
const _nativeClasses = [Symbol, Date];

/**
 * Registers a native JS class which will not be attempter to be serialized or de-serialized, but will be copied as is
 * @param nativeClass Native JS class
 */
export function _registerNativeClass(nativeClass: any): void {
  this._nativeClasses.push(nativeClass);
}

/**
 * Gets @Serializable decorator metadata store
 * @param aClass EnTT class containing the metadata
 * @returns Stored @Serializable decorator metadata
 */
// tslint:disable-next-line: ban-types
export function _readSerializableMetadata<T extends Function>(aClass: T): any {
  return _getDecoratorMetadata(aClass, _symbolSerializable) || {};
}

/**
 * Serializes anything as value of given type
 * @param T Source class
 * @param source Source being serialized from
 * @param type Value type to serialize as
 * @param _directSerialize (Internal) If true, ignores all custom serialization configuration (used by .clone())
 * @returns Serialized value of requested type
 */
export function _serialize<T>(source: T, type = 'object' as _rawDataType, { _directSerialize = false } = {}): any {
  // Check if source's store should be source instead
  const instance = source instanceof _EnTTRoot ? _getInstanceMetadata(source).store : source;

  // Serializable array or object
  if (instance && !_isNativeClassInstance(instance) && (instance instanceof Array || instance instanceof Object)) {
    const serialized = Object.keys(instance).reduce(
      // tslint:disable-next-line: no-shadowed-variable
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
              if (!_directSerialize && metadata.serialize instanceof Function) {
                serialized[metadata.alias || key] = metadata.serialize(instance[key], instance);
                return serialized;
              }
              // Serializable value (EnTT instance or raw value)
              serialized[metadata.alias || key] = _serialize(instance[key], 'object');
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
  }

  // Convert raw value
  else {
    return _obj2data(instance, type);
  }
}

/**
 * Deserializes value of given type into a target
 * @param T Target class
 * @param value Value being deserialized from
 * @param type Type of value to deserialized form
 * @param target Instance being deserialized into
 * @param validate If deserialized instance should be validated after
 * @param _directDeserialize (Internal) If true, ignores all custom deserialization configuration (used by .clone())
 * @return Target with given value deserialized into it
 */
export function _deserialize<T>(value: any, type = 'object' as _rawDataType, { target = undefined as T, validate = true, _directDeserialize = false } = {}): T {
  // Convert value
  const source = _data2obj(value, type);

  // Check if target defined
  if (target === undefined) {
    target = (source instanceof Array ? [] : {}) as T;
  }

  // Check if target's store should be target instead
  const instance = target instanceof _EnTTRoot ? _getInstanceMetadata(target).store : target;

  // Deserialize if value matches target shape
  if (!_isNativeClassInstance(source) && ((source instanceof Array && instance instanceof Array) || (source instanceof Object && instance instanceof Object))) {
    // Disable validation
    _validationDisable();

    // Deserialize
    Object.keys(source).reduce((deserialized, key) => {
      // Check if target property exists and isn't a method
      if (source.hasOwnProperty(key) && typeof source[key] !== 'function') {
        // Check if target property has a setter or if both setter and setter aren't defined on plain property
        const hasSetter = !!Object.getOwnPropertyDescriptor(source, key).set || !Object.getOwnPropertyDescriptor(source, key).get;

        // Check if property has or needs a setter
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
            if (!_directDeserialize && metadata.deserialize instanceof Function) {
              deserialized[alias] = metadata.deserialize(source[key], source);
              return deserialized;
            }
            // Deserialize and cast array
            if (metadata.cast && metadata.cast instanceof Array && metadata.cast.length === 1 && typeof metadata.cast[0] === 'function') {
              // tslint:disable-next-line: no-shadowed-variable
              deserialized[alias] = source[key].map(value => {
                return _deserialize(value, 'object', { target: new metadata.cast[0](), validate });
              });
            }
            // Deserialize and cast hashmap
            else if (
              metadata.cast &&
              metadata.cast instanceof Object &&
              Object.values(metadata.cast).length === 1 &&
              typeof Object.values(metadata.cast)[0] === 'function'
            ) {
              // tslint:disable-next-line: no-shadowed-variable
              deserialized[alias] = Object.keys(source[key]).reduce((deserialized, k) => {
                deserialized[k] = _deserialize(source[key][k], 'object', { target: new (Object.values(metadata.cast)[0] as any)(), validate });
                return deserialized;
              }, {});
            }
            // Deserialize and cast
            else if (metadata.cast && typeof metadata.cast === 'function') {
              deserialized[alias] = _deserialize(source[key], 'object', { target: new metadata.cast(), validate });
            }
            // Deserialize without casting
            else {
              deserialized[alias] = _deserialize(source[key], 'object', { validate });
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

    // Return deserialized instance
    return target;
  }

  // Skip deserialization and just return a value as deserialized
  else {
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
export function _cast<T>(into: TNew<T>): (value: any, type?: _rawDataType, options?: { validate?: boolean }) => T;
export function _cast<T>(into: TNew<T>[]): (value: any, type?: _rawDataType, options?: { validate?: boolean }) => T[];
export function _cast<T>(into: Record<any, TNew<T>>): (value: any, type?: _rawDataType, options?: { validate?: boolean }) => Record<any, T>;

export function _cast<T>(
  into: TNew<T> | TNew<T>[] | Record<any, TNew<T>>,
): (value: any, type?: _rawDataType, options?: { validate?: boolean }) => T | T[] | Record<any, T>;

export function _cast<T>(
  into: TNew<T> | TNew<T>[] | Record<any, TNew<T>>,
): (value: any, type?: _rawDataType, options?: { validate?: boolean }) => T | T[] | Record<any, T> {
  // Cast as array
  if (into && into instanceof Array && into.length === 1 && typeof into[0] === 'function') {
    /**
     * Casts a array of values of given type as an array of instances of a given Class
     * @param value Array of values being cast
     * @param type Type of value being cast
     * @param validate If cast instance should be validated after
     * @returns Array of instances of the class with deserialized data
     */
    return (value: T[], type = 'object' as _rawDataType, { validate = true } = {}): T[] => {
      // tslint:disable-next-line: no-shadowed-variable
      return value.map(value =>
        _deserialize<T>(value, type, {
          target: (new ((into as unknown) as TNew<T>)[0]() as unknown) as T,
          validate,
        }),
      );
    };
  }

  // Cast as hashmap
  else if (into && into instanceof Object && Object.values(into).length === 1 && typeof Object.values(into)[0] === 'function') {
    /**
     * Casts a hashmap of values of given type as a hashmap of instances of a given Class
     * @param value Hashmap of values being cast
     * @param type Type of value being cast
     * @param validate If cast instance should be validated after
     * @returns Hashmap of instances of the class with deserialized data
     */
    return (value: Record<any, T>, type = 'object' as _rawDataType, { validate = true } = {}): Record<any, T> => {
      return Object.keys(value).reduce((hashmap, key) => {
        hashmap[key] = _deserialize<T>(value[key], type, {
          target: new (Object.values((into as unknown) as TNew<T>)[0])(),
          validate,
        });
        return hashmap;
      }, {});
    };
  }

  // Cast as single value
  else if (into && typeof into === 'function') {
    /**
     * Casts a value of given type as an instance of a given Class
     * @param value Value being cast
     * @param type Type of value being cast
     * @param validate If cast instance should be validated after
     * @returns Instance of the class with deserialized data
     */
    return (value: T, type = 'object' as _rawDataType, { validate = true } = {}): T => {
      return _deserialize<T>(value, type, {
        target: (new ((into as unknown) as TNew<T>)() as unknown) as T,
        validate,
      });
    };
  }

  // Casting failed
  else {
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
export function _clone<TInstance, TInto>(
  instance: TInstance,
  { target = undefined as TInto, validate = true } = {},
): unknown extends TInto ? TInstance : TInto {
  const serialized = _serialize(instance, 'object', { _directSerialize: true }),
    deserialized = _deserialize<unknown extends TInto ? TInstance : TInto>(serialized, 'object', {
      target: (target || (new (instance as any).constructor() as TInstance)) as unknown extends TInto ? TInstance : TInto,
      _directDeserialize: true,
      validate,
    });
  return deserialized;
}

/**
 * Checks if object is an instance of a native JS class
 * @param obj Object to check
 */
function _isNativeClassInstance(obj: TNew<any>): boolean {
  for (const nativeClass of _nativeClasses) {
    if (obj instanceof nativeClass) {
      return true;
    }
  }
  return false;
}

/**
 * Converts an object into serialized value of given type
 * @param data Data being serialized
 * @param type Type to serialize to
 * @returns Given object, serialized into given type
 */
function _obj2data(data: any, type = 'object' as _rawDataType): any {
  if (type === 'object') {
    return data;
  } else if (type === 'json') {
    return JSON.stringify(data, null, 2);
  }
}

/**
 * Converts serialized value of given type into an object
 * @param data Data being deserialized
 * @param type Type to deserialize from
 * @returns Object, deserialized from given type
 */
function _data2obj(data: any, type = 'object' as _rawDataType): any {
  if (type === 'object') {
    return data;
  } else if (type === 'json') {
    return JSON.parse(data);
  }
}
