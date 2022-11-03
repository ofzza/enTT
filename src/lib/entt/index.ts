// enTT lib main, base functionality
// ----------------------------------------------------------------------------

// #region Utility types

/**
 * A class which constructs instances of type T
 */
export type Class<T> = new (...args: any[]) => T;

// #endregion

// #region EnTT types

/**
 * A transparent proxy to the underlying class instance with dynamic EnTT functionality attached
 */
type EnttInstance<T extends object> = T & {};

/**
 * Describes a property value and all the information needed to get/set that value
 */
type FullPathPropertyValue<T, V> = {
  /**
   * Parent instance containing the property containing the value
   */
  target: T;
  /**
   * Name of the property containing the value
   */
  key: string | number | symbol;
  /**
   * Value being get/set
   */
  value: V;
};

/**
 * Definition for a decorator, holding all its proxy hooks
 */
class CustomDecoratorDefinition<TTarget, TValOuter, TValInner> {
  /**
   * Constructor
   * @param onPropertyGet Proxy hook to be called when property value is being requested
   * @param onPropertySet Proxy hook to be called when property value is being set
   */
  constructor(
    public onPropertyGet?: (v: TValInner) => TValOuter,
    public onPropertySet?: (v: FullPathPropertyValue<TTarget, TValOuter>) => FullPathPropertyValue<TTarget, TValInner>,
  ) {}
}

/**
 * Callback function expected to return data which will be stored within a property's decorator definition once decorator is used to decorate a property
 */
type CustomStaticDecoratorConfiguration = (definition: EnttPropertyDecoratorDefinition) => any;

/**
 * Definition for custom dynamic decorator configuration
 */
type CustomDynamicDecoratorConfiguration<TInstance, TValInner, TValOuter> = {
  /**
   * Callback function expected to return data which will be stored within a property's decorator definition once decorator is used to decorate a property
   */
  setDecoratorDefinitionData?: (definition: EnttPropertyDecoratorDefinition) => any;
  /**
   * Callback function called when accessing (getting) a property of an EnTTified instance. The callback is expected to transform the value being returned
   * before it is passed on ...
   */
  onPropertyGet?: (value: TValInner) => TValOuter;
  /**
   * Callback function called when accessing (setting) a property of an EnTTified instance. The callback is expected to transform the value being stored
   * before it is passed on ...
   */
  onPropertySet?: (value: FullPathPropertyValue<TInstance, TValOuter>) => FullPathPropertyValue<TInstance, TValInner>;
  /**
   * Callbsck function called when the decorated class has not been EnTTified. The callback is expected to throw or log an error or a warning.
   */
  whenUsedOnNotEnttified?: (target: Class<object>, key: string | number | symbol) => void;
};

/**
 * Definition for an entity carrying properties decorated with EnTT functionality
 */
class EnttDefinition {
  /**
   * Constructor
   * @param owner Stores the parent class this definition refers to
   */
  constructor(public readonly owner: Class<object>) {}
  /**
   * Holds property definitions for this entity
   */
  public properties: Record<string | number | symbol, EnttPropertyDefinition> = {};
}
/**
 * Definition for an entity property carrying properties decorated with EnTT functionality
 */
class EnttPropertyDefinition {
  /**
   * Constructor
   * @param owner Stores the parent class this definition refers to
   * @param ownerPropertyKey Name of the property this definition refers to
   */
  constructor(public readonly owner: Class<object>, public readonly ownerPropertyKey: string | number | symbol) {}
  /**
   * Holds property decorator definitions for decorators applied to this property
   */
  public decorators: {
    byOrderOfApplication: EnttPropertyDecoratorDefinition[];
    bySymbol: Record<symbol, EnttPropertyDecoratorDefinition>;
  } = { byOrderOfApplication: [], bySymbol: {} };
}
/**
 * Definition for a single EnTT decorator an entity property has been decorated with
 */
class EnttPropertyDecoratorDefinition {
  /**
   * Constructor
   * @param owner Stores the parent class this definition refers to
   * @param ownerPropertyKey Name of the property this definition refers to
   * @param ownerPropertyDecoratorSymbol Unique symbol of the decorator this definition refers to
   */
  constructor(
    public readonly owner: Class<object>,
    public readonly ownerPropertyKey: string | number | symbol,
    public readonly ownerPropertyDecoratorSymbol: symbol,
  ) {}
  /**
   * Holds data the decorator was configured with for the property it is decorating
   */
  data: any;
}

// #endregion

// #region EnTT decorator helpers: Manage definitions

/**
 * All classes carrying properties decorated with EnTT functionality
 */
const decoratedClasses: WeakMap<Class<Object>, EnttDefinition> = new WeakMap();

/**
 * Gets (and first registers if necesarry) definitions for a class carrying properties decorated with EnTT functionality
 * @param target A class (or instance of a class) carrying properties decorated with EnTT functionality
 * @returns Definition of associated EnTT functionality for the class
 */
export function getDecoratedClassDefinition<T extends object>(target: T): EnttDefinition;
export function getDecoratedClassDefinition<T extends object>(target: Class<T>): EnttDefinition;
export function getDecoratedClassDefinition<T extends object>(target: Class<T> | T): EnttDefinition {
  // Check if using instance of class to get definition
  if (typeof target !== 'function') {
    return getDecoratedClassDefinition(target.constructor);
  }

  // Check if already registered
  const definitions = decoratedClasses.get(target);
  if (definitions) {
    return definitions;
  }
  // ... and register if not
  else {
    const definitions = new EnttDefinition(target);
    decoratedClasses.set(target, definitions);
    return definitions;
  }
}
/**
 * Gets (and first registers if necesarry) definitions for a class property decorated with EnTT functionality
 * @param target A class (or instance of a class) carrying properties decorated with EnTT functionality
 * @param propertyKey Name of the property decorated with EnTT functionality
 * @returns Definition of associated EnTT functionality for the class property
 */
export function getDecoratedClassPropertyDefinition<T extends object>(target: T, propertyKey: string | number | symbol): EnttPropertyDefinition;
export function getDecoratedClassPropertyDefinition<T extends object>(target: Class<T>, propertyKey: string | number | symbol): EnttPropertyDefinition;
export function getDecoratedClassPropertyDefinition<T extends object>(target: Class<T> | T, propertyKey: string | number | symbol): EnttPropertyDefinition {
  // Check if using instance of class to get definition
  if (typeof target !== 'function') {
    return getDecoratedClassPropertyDefinition(target.constructor, propertyKey);
  }

  // Get definition for target class
  const definition = getDecoratedClassDefinition(target);
  // Return (first register if required) property definition
  return definition.properties[propertyKey] || (definition.properties[propertyKey] = new EnttPropertyDefinition(target, propertyKey));
}
/**
 * Gets (and first registers if necesarry) a definition for a single EnTT decorator a class property has been decorated with
 * @param target A class (or instance of a class) carrying properties decorated with EnTT functionality
 * @param propertyKey Name of the property decorated with EnTT functionality
 * @param decoratorSymbol Unique symbol identifying EnTT decorator the property has been decorated with
 * @returns Definition of associated EnTT functionality for the class property decorator
 */
export function getDecoratedClassPropertyDecoratorDefinition<T extends object>(
  target: T,
  propertyKey: string | number | symbol,
  decoratorSymbol: symbol,
): EnttPropertyDecoratorDefinition;
export function getDecoratedClassPropertyDecoratorDefinition<T extends object>(
  target: Class<T>,
  propertyKey: string | number | symbol,
  decoratorSymbol: symbol,
): EnttPropertyDecoratorDefinition;
export function getDecoratedClassPropertyDecoratorDefinition<T extends object>(
  target: Class<T> | T,
  propertyKey: string | number | symbol,
  decoratorSymbol: symbol,
): EnttPropertyDecoratorDefinition {
  // Check if using instance of class to get definition
  if (typeof target !== 'function') {
    return getDecoratedClassPropertyDecoratorDefinition(target.constructor, propertyKey, decoratorSymbol);
  }

  // Get definition for target property
  const definition = getDecoratedClassPropertyDefinition(target, propertyKey);

  // If doesn't exist, create, register and return decorator definition
  if (!definition.decorators.bySymbol[decoratorSymbol]) {
    const decorator = new EnttPropertyDecoratorDefinition(target, propertyKey, decoratorSymbol);
    definition.decorators.byOrderOfApplication.push(decorator);
    definition.decorators.bySymbol[decoratorSymbol] = decorator;
  }

  // Return definition
  return definition.decorators.bySymbol[decoratorSymbol];
}

// #endregion

// #region EnTT decorator helpers: Implement a custom decorator

/**
 * Definitions for all custom decorators
 */
const customDecorators: Record<symbol, CustomDecoratorDefinition<any, any, any>> = {};

/**
 * Array of classes requiring enttification, queued for verification if they were EnTTified
 */
const validationQueueForClassesRequiringEnttification: { target: Class<object>; callback: () => void }[] = [];

/**
 * Helper function used to create a custom decoorator.
 *
 * Creating a decorator which will work even on classes that were not EnTTified:
 *
 * ```ts
 * function MyStaticPropertyDecorator(data: any) {
 *   return createCustomDecorator(
 *     undefined
 *     Symbol('My property decorator symbol')
 *   );
 * }
 * class MyClass {
 *   @MyStaticPropertyDecorator({ my: 'configuration' })
 *   public myProperty: any;
 * }
 * ```
 *
 * @param configuration Empty configuration
 * @param decoratorSymbol (Optional) Unique symbol used to identity a particular decorator
 * @returns Static decorator
 */
export function createCustomDecorator(configuration: undefined, decoratorSymbol?: symbol): (target: any, key: string | number | symbol) => void;
/**
 * Helper function used to create a custom decoorator.
 *
 * Creating a decorator which will work even on classes that were not EnTTified:
 *
 * ```ts
 * function MyStaticPropertyDecorator(data: any) {
 *   return createCustomDecorator(
 *     definition => data, // Returned data which will be stored in decorator definition once decorator is used to decorate a property
 *     Symbol('My property decorator symbol')
 *   );
 * }
 * class MyClass {
 *   @MyStaticPropertyDecorator({ my: 'configuration' })
 *   public myProperty: any;
 * }
 * ```
 *
 * @param configuration A Callback function expected to return data which will be stored within a property's decorator definition once decorator is used to decorate a property
 * @param decoratorSymbol (Optional) Unique symbol used to identity a particular decorator
 * @returns Static decorator
 */
export function createCustomDecorator(
  configuration: CustomStaticDecoratorConfiguration,
  decoratorSymbol?: symbol,
): (target: any, key: string | number | symbol) => void;
/**
 * Helper function used to create a custom decoorator.
 *
 * Creating a decorator with proxy hooks, which will work only on EnTTified classes:
 *
 * ```ts
 * function MyDynamicPropertyDecorator(data: any) {
 *   return createCustomDecorator(
 *     {
 *       onPropertyGet?: (target, prop) => target[prop],
 *       onPropertySet?: (target, prop, value) => (target[prop] = value),
 *       setDecoratorDefinitionData: definition => data, // Returned data which will be stored in decorator definition once decorator is used to decorate a property
 *     },
 *     Symbol('My property decorator symbol')
 *   );
 * }
 * class MyClass {
 *   @MyDynamicPropertyDecorator({ my: 'configuration' })
 *   public myProperty: any;
 * }
 * ```
 *
 * @param configuration Decorator configuration with a callback function returning data to be stored within the decorator definition
 * and optional proxy hooks to be called when underlying decorated object is being accessed.
 * @param decoratorSymbol (Optional) Unique symbol used to identity a particular decorator
 * @returns Dynamic decorator
 */
export function createCustomDecorator<TInstance extends object, TValOuter, TValInner>(
  configuration: CustomDynamicDecoratorConfiguration<TInstance, TValOuter, TValInner>,
  decoratorSymbol?: symbol,
): (target: any, key: string | number | symbol) => void;
export function createCustomDecorator<TInstance extends object, TOuter, TInner>(
  configuration?: CustomStaticDecoratorConfiguration | CustomDynamicDecoratorConfiguration<TInstance, TOuter, TInner>,
  decoratorSymbol: symbol = Symbol(),
): (target: Class<TInstance>, key: string | number | symbol, descriptor: PropertyDescriptor) => void {
  // TODO: Need I update `target: any` to `target: TNew<T>`???
  return (target: Class<TInstance>, key: string | number | symbol, descriptor: PropertyDescriptor) => {
    // Get decorator definition for the property
    const definition = getDecoratedClassPropertyDecoratorDefinition(target, key, decoratorSymbol);

    // Process static decorator with only definition update provided and no EnTT proxy hooks
    if (configuration && typeof configuration === 'function') {
      // Update definition for the property
      definition.data = configuration(definition);
      // Register decorator definition
      customDecorators[decoratorSymbol] = new CustomDecoratorDefinition();
    }
    // Process dynamic decorator with EnTT proxy hooks
    else if (configuration && typeof configuration === 'object') {
      // Update definition for the property
      definition.data = configuration?.setDecoratorDefinitionData?.(definition);
      // Register decorator definition
      customDecorators[decoratorSymbol] = new CustomDecoratorDefinition(configuration?.onPropertyGet, configuration?.onPropertySet);
      // If decorator requires a EnTTified model, queue up verification if the model was indeed EnTTified
      if (configuration.whenUsedOnNotEnttified) {
        // Register class as requiring EnTTification
        validationQueueForClassesRequiringEnttification.push({
          target,
          callback: () => {
            configuration.whenUsedOnNotEnttified(target, key);
          },
        });
      }
    }
  };
}

/**
 * Filters a definition to only contain info on the filtering decorator
 * @param definition EnttDefinition to be filtered
 * @param decoratorSymbol Unique decorator symbol signifying the decorator to filter by
 * @returns Filtered EnttDefinition. Returned EnttDefinition will only be left containin properties to which the filtering decorator was applied.
 */
export function filterDefinition(definition: EnttDefinition, decoratorSymbol: symbol): EnttDefinition;
/**
 * Filters hashmap of definitions to only contain info on the filtering decorator
 * @param definition EnttPropertyDefinition hashmap to be filtered.
 * @param decoratorSymbol Unique decorator symbol signifying the decorator to filter by
 * @returns Filtered EnttPropertyDefinition hashmap. Returned EnttPropertyDefinition hashmap will only be left containin properties to which the filtering decorator
 * was applied and each EnttPropertyDefinition in the hashmap will only contain decorator definitions for the filtering decorator.
 */
export function filterDefinition(
  definition: Record<string | number | symbol, EnttPropertyDefinition>,
  decoratorSymbol: symbol,
): Record<string | number | symbol, EnttPropertyDefinition>;
/**
 * Filters a definition to only contain info on the filtering decorator
 * @param definition EnttPropertyDefinition to be filtered.
 * @param decoratorSymbol Unique decorator symbol signifying the decorator to filter by
 * @returns Filtered EnttPropertyDefinition. Returned EnttPropertyDefinition will only contain decorator definitions for the filtering decorator.
 */
export function filterDefinition(definition: EnttPropertyDefinition, decoratorSymbol: symbol): EnttPropertyDefinition;
export function filterDefinition(
  definition: EnttDefinition | Record<string | number | symbol, EnttPropertyDefinition> | EnttPropertyDefinition,
  decoratorSymbol: symbol,
): EnttDefinition | Record<string | number | symbol, EnttPropertyDefinition> | EnttPropertyDefinition {
  // Filter entity definition
  if (definition instanceof EnttDefinition) {
    const filteredDefinition = new EnttDefinition(definition.owner);
    filteredDefinition.properties = filterDefinition(definition.properties, decoratorSymbol);
    return filteredDefinition;
  }

  // Filter array of property definitions
  else if (definition instanceof Object && Object.values(definition).reduce((valid, def) => valid && def instanceof EnttPropertyDefinition, true)) {
    const castDefinition = definition as Record<string | number | symbol, EnttPropertyDefinition>;
    const propertyDefinitions: Record<string | number | symbol, EnttPropertyDefinition> = Object.keys(definition).reduce(
      (filteredPropertyDefinitions: Record<string | number | symbol, EnttPropertyDefinition>, key) => {
        const filteredPropertyDefinition = filterDefinition(castDefinition[key], decoratorSymbol);
        if (filteredPropertyDefinition.decorators.byOrderOfApplication.length) {
          filteredPropertyDefinitions[key] = filteredPropertyDefinition;
        }
        return filteredPropertyDefinitions;
      },
      {},
    );
    return propertyDefinitions;
  }

  // Filter entity property definition
  else if (definition instanceof EnttPropertyDefinition) {
    const filteredPropertyDefinition = new EnttPropertyDefinition(definition.owner, definition.ownerPropertyKey);
    // Filter decorators.byOrderOfApplication
    filteredPropertyDefinition.decorators.byOrderOfApplication = definition.decorators.byOrderOfApplication.filter(
      decorator => decorator.ownerPropertyDecoratorSymbol === decoratorSymbol,
    );
    // Copy decorators.bySymbol
    if (definition.decorators.bySymbol[decoratorSymbol]) {
      filteredPropertyDefinition.decorators.bySymbol[decoratorSymbol] = new EnttPropertyDecoratorDefinition(
        definition.owner,
        definition.ownerPropertyKey,
        decoratorSymbol,
      );
      filteredPropertyDefinition.decorators.bySymbol[decoratorSymbol].data = definition.decorators.bySymbol[decoratorSymbol].data;
    }
    return filteredPropertyDefinition;
  }
}

/**
 * Runs post declaration and decoration verification of all applied decorators:
 * - Verify all classes using decorators requiring EnTTification were EnTTified
 */
export function verifyDecoratorUsage() {
  // Verify all classes using decorators requiring EnTTification were EnTTified
  validationQueueForClassesRequiringEnttification.forEach(v => {
    if (!enttifiedClassesByUnderlyingClass.has(v.target)) {
      v.callback();
    }
  });
}

// #endregion

// #region EnTT dynamic functionality via EnTT proxy

/**
 * Holds references to all classes that were EnTTified
 */
const enttifiedClassesByUnderlyingClass: WeakMap<Class<any>, Class<EnttInstance<any>>> = new WeakMap();
/**
 * Holds references to all instances that were EnTTified
 */
const underlyingInstancesByEnttifiedInstance: WeakMap<EnttInstance<any>, any> = new WeakMap();

/**
 * Wraps a class into a proxy which will hook into the constructor and replace the constructed instance with a proxy to
 * the instance implementing the dynamic EnTT functionality
 * @param TargetClass The class being wrapped
 * @returns A proxy to the class
 */
export function enttify<T extends object>(TargetClass: Class<T>): Class<EnttInstance<T>> {
  // Wrap a class into a proxy which will hook into the constructor and replace the constructed instance with a proxy to
  // the instance implementing the dynamic EnTT functionality
  const alreadyEnTTified = enttifiedClassesByUnderlyingClass.has(TargetClass);
  const ProxyClass = alreadyEnTTified
    ? enttifiedClassesByUnderlyingClass.get(TargetClass)
    : (new Proxy(TargetClass, {
        // Intercept constructng an instance
        construct: (_TargetClass: Class<T>, args: any[]): EnttInstance<T> => {
          // Run original constructor and get original instance of the class
          const target = new _TargetClass(...args);
          const handler = createProxyhandlerForEnttInstance(target);
          // Process all initially set property values
          for (const key of Object.keys(target)) {
            target[key] = handler.set(target, key, target[key], undefined);
          }
          // Compose a proxy to the original instance, implementing dynamic EnTT functionality
          const proxy = new Proxy(target, handler) as EnttInstance<T>;
          // Register original instance by the proxy
          underlyingInstancesByEnttifiedInstance.set(proxy, target);
          // Return a proxy to the original instance
          return proxy;
        },
      }) as Class<EnttInstance<T>>);
  // Register original class by the proxy
  if (!alreadyEnTTified) {
    enttifiedClassesByUnderlyingClass.set(TargetClass.prototype, ProxyClass);
  }
  // Return proxy to the original class
  return ProxyClass;
}

/**
 * Given an EnTTified object instance, finds the underlying object instance that was EnTTified
 * @param proxy EnTTified object instance
 * @returns Underlying object instance that was EnTTified
 */
export function getUnderlyingEnttifiedInstance<T extends object>(proxy: EnttInstance<T>): T {
  return underlyingInstancesByEnttifiedInstance.get(proxy);
}

/**
 * Generates proxy handler to a newly constructed, original class instance implementing dynamic EnTT functionality
 * @param target Newly constructed, original instance being wrapped by the proxy
 * @returns Proxy handler definition
 */
function createProxyhandlerForEnttInstance<T extends object>(target: T): ProxyHandler<T> {
  return {
    /**
     * Intercepts get access to the underlyng object property
     * @param target Underlying object baing proxied
     * @param key Key of the property being accessed
     * @returns Value to be returned from the getter, having been intercepted
     */
    get: (target: T, key: string | number | symbol) => {
      // Get property definition
      const definition = getDecoratedClassPropertyDefinition(target, key);
      // Process value through all registered getter hooks
      let processed = target[key];
      for (const propertyDecooratorDefinition of definition.decorators.byOrderOfApplication) {
        const decoratorDefinition = customDecorators[propertyDecooratorDefinition.ownerPropertyDecoratorSymbol];
        if (decoratorDefinition.onPropertyGet) {
          processed = decoratorDefinition.onPropertyGet(processed);
        }
      }
      // Return processed value
      return processed;
    },
    /**
     * Intercepts set access to the underlyng object property
     * @param target Underlying object baing proxied
     * @param key Key of the property being accessed
     * @returns Value that was set, having intercepted it and set it to the underlying proxied object
     */
    set: (target: T, key: string | number | symbol, value: any) => {
      // Get property definition
      const definition = getDecoratedClassPropertyDefinition(target, key);
      // Process value through all registered setter hooks
      let processedTarget = target;
      let processedKey = key;
      let processedValue = value;
      for (const propertyDecooratorDefinition of definition.decorators.byOrderOfApplication) {
        const decoratorDefinition = customDecorators[propertyDecooratorDefinition.ownerPropertyDecoratorSymbol];
        if (decoratorDefinition.onPropertySet) {
          const v = decoratorDefinition.onPropertySet({ target: processedTarget, key: processedKey, value: processedValue });
          processedTarget = v.target || processedTarget;
          processedKey = v.key || processedKey;
          processedValue = v.value || processedValue;
        }
      }
      // Set and return processed value
      return (processedTarget[processedKey] = processedValue);
    },
  };
}

// #endregion
