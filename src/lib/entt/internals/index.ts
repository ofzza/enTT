// enTT lib main, base functionality
// ----------------------------------------------------------------------------

// #region Utility types

/**
 * A class which constructs instances of type T
 */
export type TNew<T> = new (...args: any[]) => T;

// #endregion

// #region EnTT types

/**
 * A transparent proxy to the underlying class instance with dynamic EnTT functionality attached
 */
type EnttInstance<T extends object> = T & {};

/**
 * Definition for an entity carrying properties decorated with EnTT functionality
 */
class EnttDefinition {
  constructor(public readonly owner: TNew<object>) {}
  public properties: Record<string | number | symbol, EnttPropertyDefinition> = {};
}
/**
 * Definition for an entity property carrying properties decorated with EnTT functionality
 */
class EnttPropertyDefinition {
  constructor(public readonly owner: TNew<object>, public readonly ownerPropertyKey: string | number | symbol) {}
  public decorators: Record<symbol, EnttPropertyDecoratorDefinition> = {};
}
/**
 * Definition for a single EnTT decorator an entity property has been decorated with
 */
class EnttPropertyDecoratorDefinition {
  constructor(
    public readonly owner: TNew<object>,
    public readonly ownerPropertyKey: string | number | symbol,
    public readonly ownerPropertyDecoratorSymbol: symbol,
  ) {}
  data: any;
}

// #endregion

// #region EnTT decorator helpers: Manage definitions

/**
 * All class carrying properties decorated with EnTT functionality
 */
const decoratedClasses: WeakMap<TNew<Object>, EnttDefinition> = new WeakMap();

/**
 * Gets (and first registers if necesarry) definitions for a class carrying properties decorated with EnTT functionality
 * @param target A class (or instance of a class) carrying properties decorated with EnTT functionality
 * @returns Definition of associated EnTT functionality for the class
 */
export function getDecoratedClassDefinition<T extends object>(target: T): EnttDefinition;
export function getDecoratedClassDefinition<T extends object>(target: TNew<T>): EnttDefinition;
export function getDecoratedClassDefinition<T extends object>(target: TNew<T> | T): EnttDefinition {
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
export function getDecoratedClassPropertyDefinition<T extends object>(target: TNew<T>, propertyKey: string | number | symbol): EnttPropertyDefinition;
export function getDecoratedClassPropertyDefinition<T extends object>(target: TNew<T> | T, propertyKey: string | number | symbol): EnttPropertyDefinition {
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
  target: TNew<T>,
  propertyKey: string | number | symbol,
  decoratorSymbol: symbol,
): EnttPropertyDecoratorDefinition;
export function getDecoratedClassPropertyDecoratorDefinition<T extends object>(
  target: TNew<T> | T,
  propertyKey: string | number | symbol,
  decoratorSymbol: symbol,
): EnttPropertyDecoratorDefinition {
  // Check if using instance of class to get definition
  if (typeof target !== 'function') {
    return getDecoratedClassPropertyDecoratorDefinition(target.constructor, propertyKey, decoratorSymbol);
  }

  // Get definition for target property
  const definition = getDecoratedClassPropertyDefinition(target, propertyKey);
  // Return (first register if required) property decorator definition
  return (
    definition.decorators[decoratorSymbol] ||
    (definition.decorators[decoratorSymbol] = new EnttPropertyDecoratorDefinition(target, propertyKey, decoratorSymbol))
  );
}

// #endregion

// #region EnTT decorator helpers: Implement a custom decorator

/**
 * Helper function used to create a custom static decoorator. Usage:
 * ```js
 * function StaticPropertyDecorator(data: any) {
 *   return createCustomStaticDecorator(decoratorSymbol, definition => {
 *     definition.data = data; // Update decorator definition here
 *   });
 * }
 * ```
 * @param configuratorCallback Callback function, passed a definition instance, used to set what ever data the decorator needs to be held within the definition
 * @param decoratorSymbol (Optional) Unique symbol used to identity a particular decorator
 * @returns Static decorator
 */
export function createCustomStaticDecorator(configuratorCallback: (definition: EnttPropertyDecoratorDefinition) => void, decoratorSymbol: symbol = Symbol()) {
  return (target: any, key: string | number | symbol) => {
    // TODO: Need to update `target: any` to `target: TNew<T>`

    // Get decorator definition for the property
    const definition = getDecoratedClassPropertyDecoratorDefinition(target, key, decoratorSymbol);
    // Update definition for the property
    configuratorCallback(definition);
  };
}

/**
 * TODO: ...
 * @param definition
 * @param decoratorSymbol
 */
export function filterDefinition(definition: EnttDefinition, decoratorSymbol: symbol): EnttDefinition;
export function filterDefinition(definition: EnttPropertyDefinition, decoratorSymbol: symbol): EnttPropertyDefinition;
export function filterDefinition(
  definition: EnttDefinition | EnttPropertyDefinition | EnttPropertyDecoratorDefinition,
  decoratorSymbol: symbol,
): EnttDefinition | EnttPropertyDefinition {
  // Filter entity definition
  if (definition instanceof EnttDefinition) {
    const filteredDefinition = new EnttDefinition(definition.owner);
    for (const propertyKey of Object.keys(definition.properties)) {
      const propertyDefinition = definition.properties[propertyKey];
      // If property has correct decorator definition, copy decorator definition and property definition onto filtered entity definition
      if (propertyDefinition.decorators[decoratorSymbol]) {
        filteredDefinition.properties[propertyKey] = new EnttPropertyDefinition(definition.owner, propertyKey); // TODO: Do recursive call instead of duplicating code
        filteredDefinition.properties[propertyKey].decorators[decoratorSymbol] = new EnttPropertyDecoratorDefinition(
          definition.owner,
          propertyKey,
          decoratorSymbol,
        );
        filteredDefinition.properties[propertyKey].decorators[decoratorSymbol].data = propertyDefinition.decorators[decoratorSymbol].data; // TODO: Consider doing  a deep copy of decorator definition data
      }
    }
    return filteredDefinition;
  }

  // Filter entity property definition
  else if (definition instanceof EnttPropertyDefinition) {
    const filteredPropertyDefinition = new EnttPropertyDefinition(definition.owner, definition.ownerPropertyKey);
    if (definition.decorators[decoratorSymbol]) {
      filteredPropertyDefinition.decorators[decoratorSymbol] = new EnttPropertyDecoratorDefinition(
        definition.owner,
        definition.ownerPropertyKey,
        decoratorSymbol,
      );
      filteredPropertyDefinition.decorators[decoratorSymbol].data = definition.decorators[decoratorSymbol].data; // TODO: Consider doing  a deep copy of decorator definition data
    }
    return filteredPropertyDefinition;
  }
}

// #endregion

// #region EnTT dynamic functionality via EnTT proxy

/**
 * Wraps a class into a proxy which will hook into the constructor and replace the constructed instance with a proxy to
 * the instance implementing the dynamic EnTT functionality
 * @param _TargetClass The class being wrapped
 * @returns A proxy to the class
 */
function enttify<T extends object>(_TargetClass: TNew<T>): TNew<EnttInstance<T>> {
  // Wrap a class into a proxy which will hook into the constructor and replace the constructed instance with a proxy to
  // the instance implementing the dynamic EnTT functionality
  return new Proxy(_TargetClass, {
    // Intercept constructng an instance
    construct: (_TargetClass: TNew<T>, args: any[]): EnttInstance<T> => {
      // Run original constructor and get original instance of the class
      const target = new _TargetClass(...args);
      // Return a proxy to the original instance, implementing dynamic EnTT functionality
      return new Proxy(target, createProxyhandlerForEnttInstance(target)) as EnttInstance<T>;
    },
  }) as TNew<EnttInstance<T>>;
}

/**
 * Generates proxy handler to a newly constructed, original class instance implementing dynamic EnTT functionality
 * @param target Newly constructed, original instance being wrapped by the proxy
 * @returns Proxy handler definition
 */
function createProxyhandlerForEnttInstance<T extends object>(target: T): ProxyHandler<T> {
  return {
    get: (_: T, key: string) => target[key],
    set: (_: T, key: string, value: any) => (target[key] = value),
  };
}

// #endregion
