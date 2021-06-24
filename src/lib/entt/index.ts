// enTT lib main, extensible class
// ----------------------------------------------------------------------------

// Import and (re)export internals
import { _undefined, TNew } from './internals';
import {
  _EnTTRoot,
  _getClassMetadata,
  _getInstanceMetadata,
  _getDecoratorMetadata,
  _updateChildrenOnPropertyValueChange,
  _symbolEnTTInstance,
} from './internals';

// Import dependencies
import { _readPropertyMetadata, _readPropertyDescriptor, _findTaggedProperties } from '../decorators/property/internals';
import { _rawDataType, _registerNativeClass, _cast, _clone, _serialize, _deserialize } from '../decorators/serializable/internals';
import {
  EnttValidationError,
  _readValidityMetadata,
  _validateObject,
  _validateProperty,
  _isValid,
  _getValidationErrors,
} from '../decorators/validate/internals';

/**
 * Main, extensible EnTT class definition
 */
export class EnTT extends _EnTTRoot {
  /**
   * Registers a native JS class which will not be attempter to be serialized or de-serialized, but will be copied as is
   * @param nativeClass Native JS class
   */
  public static registerNativeClass(nativeClass: any): void {
    _registerNativeClass(nativeClass);
  }

  /**
   * Finds all properties of an EnTT class tagged with the specified tag
   * @param tag Tag to search for
   * @param from (Optional) EnTT class whose properties to search
   */
  public static findTaggedProperties(tag: string | symbol, { from = undefined as TNew<EnTT> } = {}): string[] {
    // using @Property
    // Get searching class
    from = from || (this.prototype.constructor as TNew<any>);
    // Find tagged properties
    return _findTaggedProperties(from, tag);
  }

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
   * @param validate If cast instance should be validated after
   * @returns Instance (or structure of instances) of the class with deserialized data, or (alternatively) a Promise about to resolve to such an instance
   */
  // OVERLOADS: Casting promises
  // Promise<any> => Promise<EnTT>
  public static cast<TThis, TInto>(
    this: TNew<TThis>,
    value: Promise<any>,
    params?: { into?: TNew<TInto>; type?: _rawDataType; validate?: boolean },
  ): Promise<unknown extends TInto ? TThis : TInto>;
  // Promise<any[]> => Promise<EnTT[]>
  public static cast<TThis, TInto>(
    this: TNew<TThis>,
    value: Promise<any>,
    params?: { into?: TNew<TInto>[]; type?: _rawDataType; validate?: boolean },
  ): Promise<(unknown extends TInto ? TThis : TInto)[]>;
  // Promise<Record<any, any> => Promise<Record<any, EnTT>>
  public static cast<TThis, TInto>(
    this: TNew<TThis>,
    value: Promise<any>,
    params?: { into?: Record<any, TNew<TInto>>; type?: _rawDataType; validate?: boolean },
  ): Promise<Record<any, unknown extends TInto ? TThis : TInto>>;
  // Promise<any | any[] | Record<any, any> => Promise<EnTT | EnTT[] | Record<any, EnTT>
  public static cast<TThis, TInto>(
    this: TNew<TThis>,
    value: Promise<any>,
    params?: { into?: TNew<TInto> | TNew<TInto>[] | Record<any, TNew<TInto>>; type?: _rawDataType; validate?: boolean },
  ): Promise<(unknown extends TInto ? TThis : TInto) | (unknown extends TInto ? TThis : TInto)[] | Record<any, unknown extends TInto ? TThis : TInto>>;
  // OVERLOADS: Casting values
  // any => EnTT
  public static cast<TThis, TInto>(
    this: TNew<TThis>,
    value: any,
    params?: { into?: TNew<TInto>; type?: _rawDataType; validate?: boolean },
  ): unknown extends TInto ? TThis : TInto;
  // any[] => EnTT[]
  public static cast<TThis, TInto>(
    this: TNew<TThis>,
    value: any,
    params?: { into?: TNew<TInto>[]; type?: _rawDataType; validate?: boolean },
  ): (unknown extends TInto ? TThis : TInto)[];
  // Record<any, any> => Record<any, EnTT>
  public static cast<TThis, TInto>(
    this: TNew<TThis>,
    value: any,
    params?: { into?: Record<any, TNew<TInto>>; type?: _rawDataType; validate?: boolean },
  ): Record<any, unknown extends TInto ? TThis : TInto>;
  // any | any[] | Record<any, any> => EnTT | EnTT[] | Record<any, EnTT>
  public static cast<TThis, TInto>(
    this: TNew<TThis>,
    value: any,
    params?: { into?: TNew<TInto> | TNew<TInto>[] | Record<any, TNew<TInto>>; type?: _rawDataType; validate?: boolean },
  ): (unknown extends TInto ? TThis : TInto) | (unknown extends TInto ? TThis : TInto)[] | Record<any, unknown extends TInto ? TThis : TInto>;
  // OVERLOAD: Combined
  // Promise<any | any[] | Record<any, any> => Promise<EnTT | EnTT[] | Record<any, EnTT>
  // any | any[] | Record<any, any> => EnTT | EnTT[] | Record<any, EnTT>
  public static cast<TThis, TInto>(
    this: TNew<TThis>,
    value: Promise<any> | any,
    params?: { into?: TNew<TInto> | TNew<TInto>[] | Record<any, TNew<TInto>>; type?: _rawDataType; validate?: boolean },
  ):
    | (unknown extends TInto ? TThis : TInto)
    | (unknown extends TInto ? TThis : TInto)[]
    | Record<any, unknown extends TInto ? TThis : TInto>
    | Promise<(unknown extends TInto ? TThis : TInto) | (unknown extends TInto ? TThis : TInto)[] | Record<any, unknown extends TInto ? TThis : TInto>>;
  // Implementation
  public static cast<TThis, TInto>(
    this: TNew<TThis>,
    value: Promise<any> | any,
    { into = undefined as TNew<TInto> | TNew<TInto>[] | Record<any, TNew<TInto>>, type = 'object' as _rawDataType, validate = true } = {},
  ):
    | (unknown extends TInto ? TThis : TInto)
    | (unknown extends TInto ? TThis : TInto)[]
    | Record<any, unknown extends TInto ? TThis : TInto>
    | Promise<(unknown extends TInto ? TThis : TInto) | (unknown extends TInto ? TThis : TInto)[] | Record<any, unknown extends TInto ? TThis : TInto>> {
    // using @Serializable
    // Get casting target class
    const resolvedInto = (into || (this.prototype.constructor as any)) as TNew<unknown extends TInto ? TThis : TInto>;
    // Return promise of cast, resolved value
    if (value instanceof Promise) {
      return new Promise<
        (unknown extends TInto ? TThis : TInto) | (unknown extends TInto ? TThis : TInto)[] | Record<any, unknown extends TInto ? TThis : TInto>
      >((resolve, reject) => {
        value
          .then((v: any) => {
            const result = _cast<unknown extends TInto ? TThis : TInto>(resolvedInto)(v, type, { validate });
            resolve(result);
          })
          .catch(reject);
      });
    }
    // Return immediately cast value
    else {
      return _cast<unknown extends TInto ? TThis : TInto>(resolvedInto)(value, type, { validate });
    }
  }

  /**
   * Clones an EnTT instance
   * @param instance EnTT instance to clone
   * @param target Instance being deserialized into
   * @param validate If cloned instance should be validated after
   * @returns Cloned instance
   */
  public static clone<TThis, TInto>(instance: TThis, { target = undefined as TInto, validate = true } = {}): unknown extends TInto ? TThis : TInto {
    return _clone(instance, { target, validate });
  }

  /**
   * Initializes EnTT features for the extending class - should be called in extending class' constructor, right after "super()".
   * Example:
   *   constructor () { super(); super.entt(); }
   */
  protected entt() {
    // Initialize metadata on the derived class
    const classMetadata = _getClassMetadata(this.constructor);
    // Initialize metadata on the instance (non-enumerable an hidden-ish)
    const instanceMetadata = _getInstanceMetadata(this);

    // Replace properties with dynamic counterparts
    _replacePropertiesWithGetterSetters.bind(this)({
      store: instanceMetadata.store,
      restore: instanceMetadata.restore,
      children: instanceMetadata.children,
    });
  }

  /**
   * Serializes (extracts underlying instance state) Class instance as value of given type
   * @param type Value type to serialize as
   * @returns Serialized value of requested type
   */
  public serialize(type = 'object' as _rawDataType): any {
    // using @Serializable
    return _serialize(this, type);
  }

  /**
   * Deserializes value of given type into a target
   * @param value Value being deserialized from
   * @param type Type of value to deserialized form
   * @param validate If deserialized instance should be validated after
   * @return Target with given value deserialized into it
   */
  public deserialize<TThis>(this: TThis, value: any, type = 'object' as _rawDataType, { validate = true } = {}): TThis {
    // using @Serializable
    return _deserialize(value, type, { target: this, validate });
  }

  /**
   * Returns validation status of the instance
   * @returns If instance is validated
   */
  public get valid(): boolean {
    // using @Validate
    _validateObject(this);
    return _isValid(this);
  }

  /**
   * Returns validation errors of all properties
   * @returns A hashmap of arrays of errors per property
   */
  public get errors(): Record<string, EnttValidationError[]> {
    // using @Validate
    _validateObject(this);
    return _getValidationErrors(this);
  }

  /**
   * Reverts property value(s) of requested property (or all properties if no property key specified) to last valid value
   * @param key (Optional) Property key of the property to be reverted
   */
  public revert(key?: string): void {
    const store = _getInstanceMetadata(this).store,
      restore = _getInstanceMetadata(this).restore,
      errors = _readValidityMetadata(this).errors,
      keys = key ? [key] : Object.keys(restore);
    keys.forEach(k => {
      if (errors[k].length) {
        // Undo to latest valid value
        store[k] = restore[k];
      }
    });
  }
}

/**
 * Replaces properties with dynamic counterparts
 * @param store Private store for all property values
 */
function _replacePropertiesWithGetterSetters({ store = undefined as object, restore = undefined as object, children = undefined as object[] } = {}): void {
  // Iterate over properties
  for (const key of Object.keys(this)) {
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
          descriptor.set = v => {
            // Deffer to originally set up setter and store value
            previousSetter(v);

            // Validate property (using @Validate)
            const errors = _validateProperty(this, key);

            // If valid, store as last validated value
            if (!errors.length) {
              restore[key] = store[key];
            }

            // Update children definitions
            _updateChildrenOnPropertyValueChange(key, store, children);
          };
        }

        // Replace property with a custom property
        Object.defineProperty(this, key, {
          // Default property configuration
          ...{ configurable: true },
          // @Property property overrides
          ...descriptor,
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
