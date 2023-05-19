// enTT lib types
// ----------------------------------------------------------------------------

// Import dependencies
import { Class, ClassInstance } from '@ofzza/ts-std/types/corejs/class';

// #region EnTT types: Helper types

/**
 * A transparent proxy to the underlying class instance with dynamic EnTT functionality attached
 */
export type EnttInstance<T extends ClassInstance> = T & {};

/**
 * Describes a property value and all the information needed to get/set that value
 */
export type FullPathPropertyValue<T extends ClassInstance, V> = {
  /**
   * Parent instance containing the property containing the value
   */
  target: ClassInstance<T>;
  /**
   * Name of the property containing the value
   */
  key: PropertyKey;
  /**
   * Value being get/set
   */
  value: V;
};

// #endregion

// #region EnTT types: Custom decorator types

/**
 * Type definition for a callback function for enttified class instance onConstruct hook callback
 */
export type OnConstructorCallback<TInstance extends ClassInstance> = (instance: TInstance) => void;
/**
 * Type definition for a callback function for enttified class instance onPropertyGet hook callback or a full staged callbacks configuration
 */
export type OnPropertyGetCallback<TInstance extends ClassInstance, TValInner = any, TValOuter = any> =
  | ((v: FullPathPropertyValue<TInstance, TValInner>) => TValOuter)
  | {
      before?: (v: FullPathPropertyValue<TInstance, TValInner>) => void;
      transform?: (v: FullPathPropertyValue<TInstance, TValInner>) => TValOuter;
      after?: (v: FullPathPropertyValue<TInstance, TValInner>) => void;
    };
/**
 * Type definition for a callback function for enttified class instance onPropertySet hook callback, interceptor callback or a full staged callbacks configuration
 */
export type OnPropertySetCallback<TInstance extends ClassInstance, TValInner = any, TValOuter = any> =
  | ((v: FullPathPropertyValue<TInstance, TValOuter>) => TValInner)
  | {
      intercept: (v: FullPathPropertyValue<TInstance, TValOuter>) => void;
    }
  | {
      before?: (v: FullPathPropertyValue<TInstance, TValOuter>) => void;
      transform?: (v: FullPathPropertyValue<TInstance, TValOuter>) => TValInner;
      after?: (v: FullPathPropertyValue<TInstance, TValOuter>) => void;
    };

/**
 * Interface for a decorator definition, holding all its proxy hooks implementation
 */
export interface ICustomDecoratorImplementation<TInstance extends ClassInstance, TValInner, TValOuter> {
  /**
   * Getter interception/transformation configuration can be expressed as:
   *
   * - A transformation callback function called when accessing (getting) any property of an EnTTified instance. The callback is expected to transform
   * the value being returned before it is passed on to other decorator's callbacks and is eventually returned:
   *
   *   ```ts
   *   (v: FullPathPropertyValue<TInstance, TValInner>) => TValOuter
   *   ```
   *
   * - A staged callback hierarchy, provides (optional):
   *   - Callback to be called before the transformation callbacks of all the decorators are called:
   *   - A transformation callback function called when accessing (getting) any property of an EnTTified instance. The callback is expected to transform
   *     the value being returned before it is passed on to other decorator's callbacks and is eventually returned
   *   - Callback to be called after the transformation callbacks of all the decorators are called
   *
   *   ```ts
   *   {
   *     before: (v: FullPathPropertyValue<TInstance, TValInner>) => void;
   *     transform: (v: FullPathPropertyValue<TInstance, TValInner>) => TValOuter;
   *     after:  (v: FullPathPropertyValue<TInstance, TValInner>) => void;
   *   }
   *   ```
   */
  onPropertyGet?: OnPropertyGetCallback<TInstance, TValInner, TValOuter>;
  /**
   * Setter interception/transformation configuration can be expressed as:
   *
   * - A transformation callback function called when accessing (setting) any property of an EnTTified instance. The callback is expected to transform
   * the value being set before it is passed on to other decorator's callbacks and is eventually stored:
   *
   *   ```ts
   *   (v: FullPathPropertyValue<TInstance, TValOuter>) => TValInner
   *   ```
   *
   * - An interceptor callback. If interceptor callback is used, neither this decorator's or any other decorator's transformation callback will be called;
   * only interceptor callbacks will be called. Interceptor callbacks do not return a transformed value so there is no value to be stored - if storing the value
   * being set is desirable, it is up to the intercepting callback to store it.
   *   ```ts
   *   { intercept: (v: FullPathPropertyValue<TInstance, TValOuter>) => void }
   *   ```
   *
   * - A staged callback hierarchy, provides (optional):
   *   - Callback to be called before the transformation callbacks of all the decorators are called:
   *   - A transformation callback function called when accessing (setting) any property of an EnTTified instance. The callback is expected to transform
   *   - Callback to be called after the transformation callbacks of all the decorators are called
   *
   *   ```ts
   *   {
   *     before: (v: FullPathPropertyValue<TInstance, TValOuter>) => void;
   *     transform: (v: FullPathPropertyValue<TInstance, TValOuter>) => TValInner;
   *     after:  (v: FullPathPropertyValue<TInstance, TValOuter>) => void;
   *   }
   *   ```
   */
  onPropertySet?: OnPropertySetCallback<TInstance, TValInner, TValOuter>;
}

/**
 * Interface for a property decorator definition, holding all its proxy hooks implementation
 */
export interface ICustomPropertyDecoratorImplementation<TInstance extends ClassInstance, TValInner = any, TValOuter = any>
  extends ICustomDecoratorImplementation<TInstance, TValInner, TValOuter> {}

/**
 * Interface for a class decorator definition, holding all its proxy hooks implementation
 */
export interface ICustomClassDecoratorImplementation<TInstance extends ClassInstance> extends ICustomDecoratorImplementation<TInstance, any, any> {
  /**
   * Callback function called when an EnTTified instance of the decorated EnTTified class is being constructed. The callback is allowed to mutate the
   * EnTTified instance before it is returned as constructed.
   */
  onConstruct?: OnConstructorCallback<TInstance>;
}

// #endregion

// #region EnTT types: Custom class decorator types

/**
 * Definition for a class decorator, holding all its proxy hooks implementation
 */
export class CustomClassDecoratorImplementation<TInstance extends ClassInstance> implements ICustomClassDecoratorImplementation<TInstance> {
  /**
   * Constructor
   * @param onConstruct Proxy hook to be called when instance is being constructed
   * @param onPropertyGet Proxy hook to be called when any property value is being requested
   * @param onPropertySet Proxy hook to be called when any property value is being set
   */
  constructor(
    /**
     * Callback function called when an EnTTified instance of the decorated EnTTified class is being constructed. The callback is allowed to mutate the
     * EnTTified instance before it is returned as constructed.
     */
    public onConstruct?: OnConstructorCallback<TInstance>,
    /**
     * Getter interception/transformation configuration can be expressed as:
     *
     * - A transformation callback function called when accessing (getting) any property of an EnTTified instance. The callback is expected to transform
     * the value being returned before it is passed on to other decorator's callbacks and is eventually returned:
     *
     *   ```ts
     *   (v: FullPathPropertyValue<TInstance, TValInner>) => TValOuter
     *   ```
     *
     * - A staged callback hierarchy, provides (optional):
     *   - Callback to be called before the transformation callbacks of all the decorators are called:
     *   - A transformation callback function called when accessing (getting) any property of an EnTTified instance. The callback is expected to transform
     *     the value being returned before it is passed on to other decorator's callbacks and is eventually returned
     *   - Callback to be called after the transformation callbacks of all the decorators are called
     *
     *   ```ts
     *   {
     *     before: (v: FullPathPropertyValue<TInstance, TValInner>) => void;
     *     transform: (v: FullPathPropertyValue<TInstance, TValInner>) => TValOuter;
     *     after:  (v: FullPathPropertyValue<TInstance, TValInner>) => void;
     *   }
     *   ```
     */
    public onPropertyGet?: OnPropertyGetCallback<TInstance, any, any>,
    /**
     * Setter interception/transformation configuration can be expressed as:
     *
     * - A transformation callback function called when accessing (setting) any property of an EnTTified instance. The callback is expected to transform
     * the value being set before it is passed on to other decorator's callbacks and is eventually stored:
     *
     *   ```ts
     *   (v: FullPathPropertyValue<TInstance, TValOuter>) => TValInner
     *   ```
     *
     * - An interceptor callback. If interceptor callback is used, neither this decorator's or any other decorator's transformation callback will be called;
     * only interceptor callbacks will be called. Interceptor callbacks do not return a transformed value so there is no value to be stored - if storing the value
     * being set is desirable, it is up to the intercepting callback to store it.
     *   ```ts
     *   { intercept: (v: FullPathPropertyValue<TInstance, TValOuter>) => void }
     *   ```
     *
     * - A staged callback hierarchy, provides (optional):
     *   - Callback to be called before the transformation callbacks of all the decorators are called:
     *   - A transformation callback function called when accessing (setting) any property of an EnTTified instance. The callback is expected to transform
     *   - Callback to be called after the transformation callbacks of all the decorators are called
     *
     *   ```ts
     *   {
     *     before: (v: FullPathPropertyValue<TInstance, TValOuter>) => void;
     *     transform: (v: FullPathPropertyValue<TInstance, TValOuter>) => TValInner;
     *     after:  (v: FullPathPropertyValue<TInstance, TValOuter>) => void;
     *   }
     *   ```
     */
    public onPropertySet?: OnPropertySetCallback<TInstance, any, any>,
  ) {}
}

/**
 * Callback function expected to return data which will be stored within a class's decorator definition once decorator is used to decorate a class
 */
export type CustomStaticClassDecoratorConfiguration<TPayload> = () => TPayload;

/**
 * Definition for custom dynamic decorator configuration
 */
export type CustomDynamicClassDecoratorConfiguration<TInstance extends ClassInstance, TPayload> = {
  /**
   * Callback function expected to return data which will be stored within a class's decorator definition once decorator is used to decorate a class
   */
  composeDecoratorDefinitionPayload?: () => TPayload;
  /**
   * Callback function expected to return a boolean value signifying if the decorator is allowed to be used multiple times on the same target
   */
  composeDecoratorMultipleUsagePermission?: () => boolean;
  /**
   * Callback function called when an EnTTified instance of the decorated EnTTified class is being constructed. The callback is allowed to mutate the
   * EnTTified instance before it is returned as constructed.
   *
   */
  onConstruct?: (instance: TInstance) => void;
  /**
   * Getter interception/transformation configuration can be expressed as:
   *
   * - A transformation callback function called when accessing (getting) any property of an EnTTified instance. The callback is expected to transform
   * the value being returned before it is passed on to other decorator's callbacks and is eventually returned:
   *
   *   ```ts
   *   (v: FullPathPropertyValue<TInstance, TValInner>) => TValOuter
   *   ```
   *
   * - A staged callback hierarchy, provides (optional):
   *   - Callback to be called before the transformation callbacks of all the decorators are called:
   *   - A transformation callback function called when accessing (getting) any property of an EnTTified instance. The callback is expected to transform
   *     the value being returned before it is passed on to other decorator's callbacks and is eventually returned
   *   - Callback to be called after the transformation callbacks of all the decorators are called
   *
   *   ```ts
   *   {
   *     before: (v: FullPathPropertyValue<TInstance, TValInner>) => void;
   *     transform: (v: FullPathPropertyValue<TInstance, TValInner>) => TValOuter;
   *     after:  (v: FullPathPropertyValue<TInstance, TValInner>) => void;
   *   }
   *   ```
   */
  onPropertyGet?: OnPropertyGetCallback<TInstance, any, any>;
  /**
   * Setter interception/transformation configuration can be expressed as:
   *
   * - A transformation callback function called when accessing (setting) any property of an EnTTified instance. The callback is expected to transform
   * the value being set before it is passed on to other decorator's callbacks and is eventually stored:
   *
   *   ```ts
   *   (v: FullPathPropertyValue<TInstance, TValOuter>) => TValInner
   *   ```
   *
   * - An interceptor callback. If interceptor callback is used, neither this decorator's or any other decorator's transformation callback will be called;
   * only interceptor callbacks will be called. Interceptor callbacks do not return a transformed value so there is no value to be stored - if storing the value
   * being set is desirable, it is up to the intercepting callback to store it.
   *   ```ts
   *   { intercept: (v: FullPathPropertyValue<TInstance, TValOuter>) => void }
   *   ```
   *
   * - A staged callback hierarchy, provides (optional):
   *   - Callback to be called before the transformation callbacks of all the decorators are called:
   *   - A transformation callback function called when accessing (setting) any property of an EnTTified instance. The callback is expected to transform
   *   - Callback to be called after the transformation callbacks of all the decorators are called
   *
   *   ```ts
   *   {
   *     before: (v: FullPathPropertyValue<TInstance, TValOuter>) => void;
   *     transform: (v: FullPathPropertyValue<TInstance, TValOuter>) => TValInner;
   *     after:  (v: FullPathPropertyValue<TInstance, TValOuter>) => void;
   *   }
   *   ```
   */
  onPropertySet?: OnPropertySetCallback<TInstance, any, any>;
};

// #endregion

// #region EnTT types: Custom property decorator types

/**
 * Definition for a property decorator, holding all its proxy hooks implementation
 */
export class CustomPropertyDecoratorImplementation<TInstance extends ClassInstance, TValInner = any, TValOuter = any>
  implements ICustomPropertyDecoratorImplementation<TInstance, TValInner, TValOuter>
{
  /**
   * Constructor
   * @param onPropertyGet Proxy hook to be called when property value is being requested
   * @param onPropertySet Proxy hook to be called when property value is being set
   */
  constructor(
    /**
     * Getter interception/transformation configuration can be expressed as:
     *
     * - A transformation callback function called when accessing (getting) any property of an EnTTified instance. The callback is expected to transform
     * the value being returned before it is passed on to other decorator's callbacks and is eventually returned:
     *
     *   ```ts
     *   (v: FullPathPropertyValue<TInstance, TValInner>) => TValOuter
     *   ```
     *
     * - A staged callback hierarchy, provides (optional):
     *   - Callback to be called before the transformation callbacks of all the decorators are called:
     *   - A transformation callback function called when accessing (getting) any property of an EnTTified instance. The callback is expected to transform
     *     the value being returned before it is passed on to other decorator's callbacks and is eventually returned
     *   - Callback to be called after the transformation callbacks of all the decorators are called
     *
     *   ```ts
     *   {
     *     before: (v: FullPathPropertyValue<TInstance, TValInner>) => void;
     *     transform: (v: FullPathPropertyValue<TInstance, TValInner>) => TValOuter;
     *     after:  (v: FullPathPropertyValue<TInstance, TValInner>) => void;
     *   }
     *   ```
     */
    public onPropertyGet?: OnPropertyGetCallback<TInstance, TValInner, TValOuter>,
    /**
     * Setter interception/transformation configuration can be expressed as:
     *
     * - A transformation callback function called when accessing (setting) any property of an EnTTified instance. The callback is expected to transform
     * the value being set before it is passed on to other decorator's callbacks and is eventually stored:
     *
     *   ```ts
     *   (v: FullPathPropertyValue<TInstance, TValOuter>) => TValInner
     *   ```
     *
     * - An interceptor callback. If interceptor callback is used, neither this decorator's or any other decorator's transformation callback will be called;
     * only interceptor callbacks will be called. Interceptor callbacks do not return a transformed value so there is no value to be stored - if storing the value
     * being set is desirable, it is up to the intercepting callback to store it.
     *   ```ts
     *   { intercept: (v: FullPathPropertyValue<TInstance, TValOuter>) => void }
     *   ```
     *
     * - A staged callback hierarchy, provides (optional):
     *   - Callback to be called before the transformation callbacks of all the decorators are called:
     *   - A transformation callback function called when accessing (setting) any property of an EnTTified instance. The callback is expected to transform
     *   - Callback to be called after the transformation callbacks of all the decorators are called
     *
     *   ```ts
     *   {
     *     before: (v: FullPathPropertyValue<TInstance, TValOuter>) => void;
     *     transform: (v: FullPathPropertyValue<TInstance, TValOuter>) => TValInner;
     *     after:  (v: FullPathPropertyValue<TInstance, TValOuter>) => void;
     *   }
     *   ```
     */
    public onPropertySet?: OnPropertySetCallback<TInstance, TValInner, TValOuter>,
  ) {}
}

/**
 * Callback function expected to return data which will be stored within a property's decorator definition once decorator is used to decorate a property
 */
export type CustomStaticPropertyDecoratorConfiguration<TPayload> = () => TPayload;

/**
 * Definition for custom dynamic decorator configuration
 */
export type CustomDynamicPropertyDecoratorConfiguration<TInstance extends ClassInstance, TPayload, TValInner = any, TValOuter = any> = {
  /**
   * Callback function expected to return data which will be stored within a property's decorator definition once decorator is used to decorate a property
   */
  composeDecoratorDefinitionPayload?: () => TPayload;
  /**
   * Callback function expected to return a boolean value signifying if the decorator is allowed to be used multiple times on the same target
   * @returns
   */
  composeDecoratorMultipleUsagePermission?: () => boolean;
  /**
   * Getter interception/transformation configuration can be expressed as:
   *
   * - A transformation callback function called when accessing (getting) any property of an EnTTified instance. The callback is expected to transform
   * the value being returned before it is passed on to other decorator's callbacks and is eventually returned:
   *
   *   ```ts
   *   (v: FullPathPropertyValue<TInstance, TValInner>) => TValOuter
   *   ```
   *
   * - A staged callback hierarchy, provides (optional):
   *   - Callback to be called before the transformation callbacks of all the decorators are called:
   *   - A transformation callback function called when accessing (getting) any property of an EnTTified instance. The callback is expected to transform
   *     the value being returned before it is passed on to other decorator's callbacks and is eventually returned
   *   - Callback to be called after the transformation callbacks of all the decorators are called
   *
   *   ```ts
   *   {
   *     before: (v: FullPathPropertyValue<TInstance, TValInner>) => void;
   *     transform: (v: FullPathPropertyValue<TInstance, TValInner>) => TValOuter;
   *     after:  (v: FullPathPropertyValue<TInstance, TValInner>) => void;
   *   }
   *   ```
   */
  onPropertyGet?: OnPropertyGetCallback<TInstance, any, any>;
  /**
   * Setter interception/transformation configuration can be expressed as:
   *
   * - A transformation callback function called when accessing (setting) any property of an EnTTified instance. The callback is expected to transform
   * the value being set before it is passed on to other decorator's callbacks and is eventually stored:
   *
   *   ```ts
   *   (v: FullPathPropertyValue<TInstance, TValOuter>) => TValInner
   *   ```
   *
   * - An interceptor callback. If interceptor callback is used, neither this decorator's or any other decorator's transformation callback will be called;
   * only interceptor callbacks will be called. Interceptor callbacks do not return a transformed value so there is no value to be stored - if storing the value
   * being set is desirable, it is up to the intercepting callback to store it.
   *   ```ts
   *   { intercept: (v: FullPathPropertyValue<TInstance, TValOuter>) => void }
   *   ```
   *
   * - A staged callback hierarchy, provides (optional):
   *   - Callback to be called before the transformation callbacks of all the decorators are called:
   *   - A transformation callback function called when accessing (setting) any property of an EnTTified instance. The callback is expected to transform
   *   - Callback to be called after the transformation callbacks of all the decorators are called
   *
   *   ```ts
   *   {
   *     before: (v: FullPathPropertyValue<TInstance, TValOuter>) => void;
   *     transform: (v: FullPathPropertyValue<TInstance, TValOuter>) => TValInner;
   *     after:  (v: FullPathPropertyValue<TInstance, TValOuter>) => void;
   *   }
   *   ```
   */
  onPropertySet?: OnPropertySetCallback<TInstance, any, any>;
};

// #endregion

// #region EnTT types: Decorator definitions

/**
 * Definition for an entity carrying properties decorated with EnTT functionality
 */
export class EnttDefinition {
  /**
   * Constructor
   * @param owner Stores the parent class this definition refers to
   */
  constructor(public readonly owner: Class<object>) {}
  /**
   * Holds class decorator definitions for decorators applied to this class
   */
  public decorators: {
    all: Array<EnttClassDecoratorDefinition>;
    bySymbol: Record<symbol, Array<EnttClassDecoratorDefinition>>;
  } = { all: [], bySymbol: {} };
  /**
   * Holds property definitions for this entity
   */
  public properties: Record<PropertyKey, EnttPropertyDefinition> = {};
}
/**
 * Definition for a single EnTT decorator used on an EnTT class
 */
export class EnttClassDecoratorDefinition {
  /**
   * Constructor
   * @param decoratorSymbol Unique symbol of the decorator this definition refers to
   * @param owner Stores the parent class this definition refers to
   * @param ownerPropertyKey Name of the property this definition refers to
   */
  constructor(public readonly decoratorSymbol: symbol, public readonly owner: Class<object>) {}
  /**
   * Decorator hooks implementation (per decorator instance because a hook implementation can trap values from a decorator factory and thus be specific to the instance)
   */
  implementation?: ICustomClassDecoratorImplementation<any>; // TODO: Replace with full proper generic typing
  /**
   * Holds data the decorator was configured with
   */
  data: any;
}
/**
 * Definition for an entity property carrying properties decorated with EnTT functionality
 */
export class EnttPropertyDefinition {
  /**
   * Constructor
   * @param owner Stores the parent class this definition refers to
   * @param ownerPropertyKey Name of the property this definition refers to
   */
  constructor(public readonly owner: Class<object>, public readonly ownerPropertyKey: PropertyKey) {}
  /**
   * Holds property decorator definitions for decorators applied to this property
   */
  public decorators: {
    all: Array<EnttPropertyDecoratorDefinition>;
    bySymbol: Record<symbol, Array<EnttPropertyDecoratorDefinition>>;
  } = { all: [], bySymbol: {} };
}
/**
 * Definition for a single EnTT decorator used on an EnTT class property
 */
export class EnttPropertyDecoratorDefinition {
  /**
   * Constructor
   * @param decoratorSymbol Unique symbol of the decorator this definition refers to
   * @param owner Stores the parent class this definition refers to
   * @param ownerPropertyKey Name of the property this definition refers to
   */
  constructor(public readonly decoratorSymbol: symbol, public readonly owner: Class<object>, public readonly ownerPropertyKey?: PropertyKey) {}
  /**
   * Decorator hooks implementation (per decorator instance because a hook implementation can trap values from a decorator factory and thus be specific to the instance)
   */
  implementation?: ICustomPropertyDecoratorImplementation<any, any, any>; // TODO: Replace with full proper generic typing
  /**
   * Holds data the decorator was configured with
   */
  data: any;
}

// #endregion
