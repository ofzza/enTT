// enTT lib main, base functionality
// ----------------------------------------------------------------------------

// Import and (re)export production mode functionality
import { isProduction, setProduction } from './internals';
export { isProduction, setProduction };
// Import and (re)export logging functionality
import { Logger, Warning, Info, log, setLogging } from './internals';
export { Logger, Warning, Info, log, setLogging };
// Import and (re)export types
import {
  Class,
  PropertyName,
  EnttInstance,
  FullPathPropertyValue,
  CustomDecoratorDefinition,
  CustomStaticDecoratorConfiguration,
  CustomDynamicDecoratorConfiguration,
  EnttDefinition,
  EnttPropertyDefinition,
  EnttPropertyDecoratorDefinition,
} from './internals';
export {
  Class,
  PropertyName,
  EnttInstance,
  FullPathPropertyValue,
  CustomDecoratorDefinition,
  CustomStaticDecoratorConfiguration,
  CustomDynamicDecoratorConfiguration,
  EnttDefinition,
  EnttPropertyDefinition,
  EnttPropertyDecoratorDefinition,
};

/**
 * Run verification after initial tick importing all dependencies and models:
 * - Verify all classes using decorators requiring EnTTification were EnTTified
 */
setTimeout(() => !isProduction() && verifyDecoratorUsage());

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
export function getDecoratedClassPropertyDefinition<T extends object>(target: T, propertyKey: PropertyName): EnttPropertyDefinition;
export function getDecoratedClassPropertyDefinition<T extends object>(target: Class<T>, propertyKey: PropertyName): EnttPropertyDefinition;
export function getDecoratedClassPropertyDefinition<T extends object>(target: Class<T> | T, propertyKey: PropertyName): EnttPropertyDefinition {
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
  propertyKey: PropertyName,
  decoratorSymbol: symbol,
): EnttPropertyDecoratorDefinition;
export function getDecoratedClassPropertyDecoratorDefinition<T extends object>(
  target: Class<T>,
  propertyKey: PropertyName,
  decoratorSymbol: symbol,
): EnttPropertyDecoratorDefinition;
export function getDecoratedClassPropertyDecoratorDefinition<T extends object>(
  target: Class<T> | T,
  propertyKey: PropertyName,
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
    definition.decorators.bySymbol[decoratorSymbol] = decorator;
  }
  // Register decorator application order
  definition.decorators.symbolsInOrderOfApplication.splice(0, 0, decoratorSymbol);

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
const validationQueueForClassesRequiringEnttification: { target: Class<object>; message: Info | Warning | Error }[] = [];

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
export function createCustomDecorator(): (target: any, key: PropertyName) => void;
export function createCustomDecorator(configuration: undefined, decoratorSymbol?: symbol): (target: any, key: PropertyName) => void;
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
export function createCustomDecorator(configuration: CustomStaticDecoratorConfiguration, decoratorSymbol?: symbol): (target: any, key: PropertyName) => void;
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
): (target: any, key: PropertyName) => void;
export function createCustomDecorator<TInstance extends object, TOuter, TInner>(
  configuration?: CustomStaticDecoratorConfiguration | CustomDynamicDecoratorConfiguration<TInstance, TOuter, TInner>,
  decoratorSymbol: symbol = Symbol(),
): (target: Class<TInstance>, key: PropertyName, descriptor: PropertyDescriptor) => void {
  // TODO: Need I update `target: any` to `target: TNew<T>`???
  return (target: Class<TInstance>, key: PropertyName, descriptor: PropertyDescriptor) => {
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
      if (configuration.onPropertyGet || configuration.onPropertySet) {
        // Register class as requiring EnTTification
        validationQueueForClassesRequiringEnttification.push({
          target,
          message: new Warning(`An EnTT decorator, applied to ${target.constructor.name}.${key.toString()}, requires the class to be EnTTified before usage!`),
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
  definition: Record<PropertyName, EnttPropertyDefinition>,
  decoratorSymbol: symbol,
): Record<PropertyName, EnttPropertyDefinition>;
/**
 * Filters a definition to only contain info on the filtering decorator
 * @param definition EnttPropertyDefinition to be filtered.
 * @param decoratorSymbol Unique decorator symbol signifying the decorator to filter by
 * @returns Filtered EnttPropertyDefinition. Returned EnttPropertyDefinition will only contain decorator definitions for the filtering decorator.
 */
export function filterDefinition(definition: EnttPropertyDefinition, decoratorSymbol: symbol): EnttPropertyDefinition;
export function filterDefinition(
  definition: EnttDefinition | Record<PropertyName, EnttPropertyDefinition> | EnttPropertyDefinition,
  decoratorSymbol: symbol,
): EnttDefinition | Record<PropertyName, EnttPropertyDefinition> | EnttPropertyDefinition {
  // Filter entity definition
  if (definition instanceof EnttDefinition) {
    const filteredDefinition = new EnttDefinition(definition.owner);
    filteredDefinition.properties = filterDefinition(definition.properties, decoratorSymbol);
    return filteredDefinition;
  }

  // Filter array of property definitions
  else if (definition instanceof Object && Object.values(definition).reduce((valid, def) => valid && def instanceof EnttPropertyDefinition, true)) {
    const castDefinition = definition as Record<PropertyName, EnttPropertyDefinition>;
    const propertyDefinitions: Record<PropertyName, EnttPropertyDefinition> = Object.keys(definition).reduce(
      (filteredPropertyDefinitions: Record<PropertyName, EnttPropertyDefinition>, key) => {
        const filteredPropertyDefinition = filterDefinition(castDefinition[key], decoratorSymbol);
        if (filteredPropertyDefinition.decorators.symbolsInOrderOfApplication.length) {
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
    // Filter decorators.symbolsInOrderOfApplication
    filteredPropertyDefinition.decorators.symbolsInOrderOfApplication = definition.decorators.symbolsInOrderOfApplication.filter(
      symbol => symbol === decoratorSymbol,
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
 * Verification:
 * - Verify all classes using decorators requiring EnTTification were EnTTified
 * @params logger (Optional) Logger instance to use instead of the global one
 */
export function verifyDecoratorUsage(logger?: Logger) {
  // Verify all classes using decorators requiring EnTTification were EnTTified
  validationQueueForClassesRequiringEnttification.forEach(v => {
    if (!enttifiedClassesByUnderlyingClass.has(v.target)) {
      (logger || log)(v.message);
    }
  });
}

// #endregion

// #region Base decorators

export const def = createCustomDecorator(undefined);

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
    get: (target: T, key: PropertyName) => {
      // Get property definition
      const definition = getDecoratedClassPropertyDefinition(target, key);
      // Process value through all registered getter hooks
      let processed = target[key];
      for (const propertyDecooratorSymbol of definition.decorators.symbolsInOrderOfApplication) {
        const decoratorDefinition = customDecorators[propertyDecooratorSymbol];
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
    set: (target: T, key: PropertyName, value: any) => {
      // Get property definition
      const definition = getDecoratedClassPropertyDefinition(target, key);
      // Process value through all registered setter hooks
      let processedTarget = target;
      let processedKey = key;
      let processedValue = value;
      for (const propertyDecooratorSymbol of [...definition.decorators.symbolsInOrderOfApplication].reverse()) {
        const decoratorDefinition = customDecorators[propertyDecooratorSymbol];
        if (decoratorDefinition.onPropertySet) {
          const v = decoratorDefinition.onPropertySet({ target: processedTarget, key: processedKey, value: processedValue });
          processedTarget = v.target || processedTarget;
          processedKey = v.key || processedKey;
          processedValue = v.value;
        }
      }
      // Set and return processed value
      return (processedTarget[processedKey] = processedValue);
    },
  };
}

// #endregion
