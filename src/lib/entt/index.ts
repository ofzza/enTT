// enTT lib main, extensible class
// ----------------------------------------------------------------------------

// Import and (re)export internals
import { _undefined, _symbolEnTT, _EnTTRoot, _getClassMetadata, _getInstanceMetadata } from './internals';

// Import dependencies
import { _readPropertyMetadata, _readPropertyDescriptor } from '../decorators/property/internals';
import { _rawDataType, _cast, _serialize, _deserialize } from '../decorators/serializable/internals';
import { EnttValidationError, _readValidityMetadata, _validateProperty, _isValid, _getValidationErrors } from '../decorators/validate/internals';

/**
 * Main, extensible EnTT class definition
 */
export class EnTT extends _EnTTRoot {

  /**
   * Casts a value of given type as an instance of a parent EnTT Class
   * @param value Value (or structure of values) being cast, or (alternatively) a Promise about to resolve such a value
   * @param into Casting target class, or structure:
   * - MyEnTTClass, will cast value as instance of MyEnTTClass
   *    => new myEnTTClass()
   * - [MyEnTTClass], will cast value (assumed to be an array) as an array of instances of MyEnTTClass
   *    => [ new myEnTTClass(), new myEnTTClass(), new myEnTTClass(), ... ]
   * - {MyEnTTClass}, will cast value (assumed to be a hashmap) as a hashmap of instances of MyEnTTClass
   *    => { a: new myEnTTClass(), b: new myEnTTClass(), c: new myEnTTClass(), ... }
   * @param type Type of value being cast
   * @returns Instance (or structure of instances) of the class with deserialized data, or (alternatively) a Promise about to resolve to such an instance
   */
  public static cast (value, { into = undefined as ((new() => EnTT) | (new() => EnTT)[] | Record<any, (new() => EnTT)>), type = 'object' as _rawDataType } = {}) {
    // using @Serializable    
    // Get casting target class
    into = (into || (this.prototype.constructor as (new() => any)));
    // Check if value is a Promise
    if (value instanceof Promise) {
      // Return promise of cast, resolved value
      return new Promise((resolve, reject) => {
        value
          .then((value) => {
            resolve(EnTT.cast(value, { into, type }));
          })
          .catch(reject)
      });
    } else {
      // Cast value
      return _cast(into)(value, type);
    }
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
    _replacePropertiesWithGetterSetters.bind(this)({
      store:    instanceMetadata.store,
      restore:  instanceMetadata.restore,
      children: instanceMetadata.children
    });

  }

  /**
   * Serializes (extracts underlying instance state) Class instance as value of given type
   * @param type Value type to serialize as
   * @returns Serialized value of requested type
   */
  public serialize (type = 'object' as _rawDataType) {
    // using @Serializable
    return _serialize(this, type);
  }

  /**
   * Deserializes value of given type into a target
   * @param value Value being deserialized from
   * @param type Type of value to deserialized form
   * @return Target with given value deserialized into it
   */
  public deserialize (value, type = 'object' as _rawDataType) {
    // using @Serializable
    return _deserialize(value, type, { target: this });
  }

  /**
   * Returns validation status of the instance
   * @returns If instance is validated
   */
  public get valid (): boolean {
    // using @Validate
    return _isValid(this);
  }

  /**
   * Returns validation errors of all properties
   * @returns A hashmap of arrays of errors per property
   */
  public get errors (): Record<string, EnttValidationError[]> {
    // using @Validate
    return _getValidationErrors(this);
  }

  /**
   * Reverts property value(s) of requested property (or all properties if no property key specified) to last valid value
   * @param key (Optional) Property key of the property to be reverted
   */
  public revert (key?: string) {
    const store   = _getInstanceMetadata(this).store,
          restore = _getInstanceMetadata(this).restore,
          errors  = _readValidityMetadata(this).errors,
          keys    = (key ? [key] : Object.keys(restore));
    keys.forEach((key) => {
      if (errors[key].length) {
        // Undo to latest valid value
        store[key] = restore[key];
        // Revalidate
        _validateProperty(this, key);
      }
    });
  }

}

/**
 * Replaces properties with dynamic counterparts
 * @param store Private store for all property values
 */
function _replacePropertiesWithGetterSetters ({
  store    = undefined as object,
  restore  = undefined as object,
  children = undefined as object[]
} = {}) {
  // Iterate over properties
  for (const key of Object.keys(this) ) {
    // Check if own property
    if (this.hasOwnProperty(key)) {
      if (typeof this[key] !== 'function') {

        // Get initial value
        const value = this[key];

        // Generate property descriptor (advised by @Property)
        const descriptor = _readPropertyDescriptor({ target: this, key, store });
        
        // Wrap descriptor setter
        if (descriptor.set) {
          const previousSetter = descriptor.set;
          descriptor.set = (value) => {

            // Deffer to originally set up setter and store value
            previousSetter(value);

            // Validate property (using @Validate)
            const errors = _validateProperty(this, key);

            // If valid, store as last validated value
            if (!errors.length) {
              restore[key] = store[key];
            }

            // Remove previously found children of this property
            for (let i = children.length - 1; i >= 0; i--) {
              if ((children[i] as any).path[0] === key) {
                children.splice(i, 1);
              }
            }
            // Search newly added children of this property
            children.push(..._findChildEnTTs([key], store[key]));

          }
        }

        // Replace property with a custom property
        Object.defineProperty(this, key, {
          // Default property configuration
          ...{ configurable: false },
          // @Property property overrides
          ...descriptor
        });

        // Store initial value (through property custom setter, if available)
        if (descriptor.set) {
          this[key] = value;
        } else {
          store[key] = value;
        }

      }
    }
  }
}

/**
 * Finds akk EnTT instances nested within the given child
 * @param value Value being searched for EnTTs
 * @returns Array of found EnTT children
 */
function _findChildEnTTs (path, value) {
  // Find child EnTTs
  const children = [];
  if (value instanceof EnTT) {
    children.push({
      path,
      child: value
    });
  } else if ((value instanceof Array) || (value instanceof Object)) {
    for (const key of Object.keys(value)) {
      children.push(..._findChildEnTTs([...path, key], value[key]));
    }
  }
  return children;
}
