// enTT lib main, extensible class
// ----------------------------------------------------------------------------

// Import dependencies
import { _readPropertyMetadata, _readPropertyDescriptor } from '../decorators/property';
import { _rawDataType, _cast, _serialize, _deserialize } from '../decorators/serializable';
import { _readValidityMetadata, _validateProperty, _isValid, _getValidationErrors } from '../decorators/validate';

// Define a unique symbol for Property decorator
const symbol = Symbol('EnTT');
export const _undefined = Symbol('undefined');

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
  public static cast (value, type = 'object' as _rawDataType, { Class = undefined as (new() => any) } = {}) {
    // using @Serializable
    const CastIntoClass = (Class || (this.prototype.constructor as (new() => any)));
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
  public get errors (): Record<string, Error[]> {
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
        store: {},
        // Initialize a private property values' store of last valid values
        restore: {},
        // Array of child EnTT instances
        children: []
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
            children.push(...findChildEnTTs([key], store[key]));

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
function findChildEnTTs (path, value) {
  // Find child EnTTs
  const children = [];
  if (value instanceof EnTT) {
    children.push({
      path,
      child: value
    });
  } else if ((value instanceof Array) || (value instanceof Object)) {
    for (const key of Object.keys(value)) {
      children.push(...findChildEnTTs([...path, key], value[key]));
    }
  }
  return children;
}
