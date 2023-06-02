// enTT lib main, base functionality
// ----------------------------------------------------------------------------

// Import and (re)export types
import { Class, ClassInstance } from '@ofzza/ts-std/types/corejs/class';
import {
  EnttClassInstance,
  ClassDecorator,
  PropertyDecorator,
  ICustomDecoratorImplementation,
  OnPropertyInterceptionCallback,
  OnPropertyTransformationCallback,
  CustomClassDecoratorImplementation,
  CustomStaticClassDecoratorConfiguration,
  CustomDynamicClassDecoratorConfiguration,
  CustomPropertyDecoratorImplementation,
  CustomStaticPropertyDecoratorConfiguration,
  CustomDynamicPropertyDecoratorConfiguration,
  EnttDefinition,
  EnttClassDecoratorDefinition,
  EnttPropertyDefinition,
  EnttPropertyDecoratorDefinition,
} from './internals/types';
export * from './internals/types';
// Import and (re)export production mode functionality
import { isProduction, setProduction } from './internals';
export { isProduction, setProduction };
// Import and (re)export logging functionality
import { Logger, Warning, Info, log, setLogging } from './internals';
export { Logger, Warning, Info, log, setLogging };

// #region EnTT decorator helpers: Manage definitions

/**
 * All classes carrying properties decorated with EnTT functionality
 */
const decoratedClasses: WeakMap<Class, EnttDefinition<ClassInstance>> = new WeakMap();

/**
 * Gets (and first registers if necesarry) definitions for a class decorated by or carrying properties decorated with EnTT functionality
 * @param target A class (or instance of a class) decorated by or  carrying properties decorated with EnTT functionality
 * @returns Definition of associated EnTT functionality for the class
 */
export function getDecoratedClassDefinition<T extends ClassInstance>(target: ClassInstance<T>): EnttDefinition<T>;
export function getDecoratedClassDefinition<T extends ClassInstance>(target: Class<T>): EnttDefinition<T>;
export function getDecoratedClassDefinition<T extends ClassInstance>(target: Class<T> | ClassInstance<T>): EnttDefinition<T>;
export function getDecoratedClassDefinition<T extends ClassInstance>(target: Class<T> | ClassInstance<T>): EnttDefinition<T> {
  // Check if proxy of a class
  if (target && (target as unknown as any)[EnttClassProxySymbol]) {
    return getDecoratedClassDefinition((target as unknown as any)[EnttClassProxySymbol]);
  }
  // Check if proxy of a class instance
  if (target && (target as unknown as any)[EnttClassInstanceProxySymbol]) {
    return getDecoratedClassDefinition((target as unknown as any)[EnttClassInstanceProxySymbol]);
  }
  // Check if using instance of class to get definition
  if (typeof target !== 'function' && target?.constructor) {
    return getDecoratedClassDefinition<T>(target.constructor as Class<T>);
  }

  // If target is not a class, return empty definition
  if (typeof target !== 'function') {
    return new EnttDefinition(target as unknown as Class<T>);
  }

  // Initialize definitions
  const composedDefinition: EnttDefinition<T> = new EnttDefinition(target as Class<T>);
  const definitions: Array<EnttDefinition<T>> = [];

  // Collect definitions for the class and all it's inherited classes
  let current = target;
  do {
    definitions.push(registerDecoratedClassDefinition<T>(current as Class<T>, false));
  } while ((current = Object.getPrototypeOf(current)));

  // Join definitions for the class and all it's inherited classes
  for (const definition of definitions) {
    // Join class decorator definitions for the class and all it's inherited classes
    for (const decoratorDefinition of definition.decorators.all) {
      composedDefinition.decorators.all.splice(0, 0, decoratorDefinition);
      if (!composedDefinition.decorators.bySymbol[decoratorDefinition.decoratorSymbol]) {
        composedDefinition.decorators.bySymbol[decoratorDefinition.decoratorSymbol] = [];
      }
      composedDefinition.decorators.bySymbol[decoratorDefinition.decoratorSymbol].splice(0, 0, decoratorDefinition);
    }

    // Join class property decorator definitions for the class and all it's inherited classes
    for (const key of Object.keys(definition.properties)) {
      for (const decoratorDefinition of definition.properties[key].decorators.all) {
        if (!composedDefinition.properties[key]) {
          composedDefinition.properties[key] = new EnttPropertyDefinition(target as Class<T>, key);
        }
        composedDefinition.properties[key].decorators.all.splice(0, 0, decoratorDefinition);
        if (!composedDefinition.decorators.bySymbol[decoratorDefinition.decoratorSymbol]) {
          composedDefinition.properties[key].decorators.bySymbol[decoratorDefinition.decoratorSymbol] = [];
        }
        composedDefinition.properties[key].decorators.bySymbol[decoratorDefinition.decoratorSymbol].splice(0, 0, decoratorDefinition);
      }
    }
  }

  // Return collected definitions
  return composedDefinition;
}
/**
 * Gets (and first registers if necesarry) definitions for a class decorated by or carrying properties decorated with EnTT functionality
 * @param target A class (or instance of a class) decorated by or carrying properties decorated with EnTT functionality
 * @param isCalledFromDecoratorRegistration If executed from a decorator being registered
 * @returns Definition of associated EnTT functionality for the class
 */
function registerDecoratedClassDefinition<T extends ClassInstance>(target: ClassInstance<T>, isCalledFromDecoratorRegistration?: boolean): EnttDefinition<T>;
function registerDecoratedClassDefinition<T extends ClassInstance>(target: Class<T>, isCalledFromDecoratorRegistration?: boolean): EnttDefinition<T>;
function registerDecoratedClassDefinition<T extends ClassInstance>(
  target: Class<T> | ClassInstance<T>,
  isCalledFromDecoratorRegistration: boolean = true,
): EnttDefinition<T> {
  // Check if using instance of class to get definition
  if (typeof target !== 'function' && target?.constructor) {
    return registerDecoratedClassDefinition<T>(target.constructor as Class<T>, isCalledFromDecoratorRegistration);
  }

  // If target is not a class, return empty definition
  if (typeof target !== 'function') {
    return new EnttDefinition(target as unknown as Class<T>);
  }

  // Get definition
  let definition = decoratedClasses.get(target as Class<T>);
  // Register definition if doesn't already exist
  if (!definition) {
    definition = new EnttDefinition(target as Class<T>);
    decoratedClasses.set(target as Class<T>, definition);
  }

  // Return definition
  return definition;
}

/**
 * Gets (and first registers if necesarry) a definition for a single EnTT decorator a class has been decorated with
 * @param target A class (or instance of a class) decorated with EnTT functionality
 * @param decoratorSymbol Unique symbol identifying EnTT decorator the has been decorated with
 * @returns Definitions of associated EnTT functionality for the class
 */
export function getDecoratedClassDecoratorDefinition<T extends ClassInstance>(
  target: ClassInstance<T>,
  decoratorSymbol: symbol,
): Array<EnttClassDecoratorDefinition<T>>;
export function getDecoratedClassDecoratorDefinition<T extends ClassInstance>(
  target: Class<T>,
  decoratorSymbol: symbol,
): Array<EnttClassDecoratorDefinition<T>>;
export function getDecoratedClassDecoratorDefinition<T extends ClassInstance>(
  target: Class<T> | ClassInstance<T>,
  decoratorSymbol: symbol,
): Array<EnttClassDecoratorDefinition<T>> {
  // Check if proxy of a class
  if (target && (target as unknown as any)[EnttClassProxySymbol]) {
    return getDecoratedClassDecoratorDefinition((target as unknown as any)[EnttClassProxySymbol], decoratorSymbol);
  }
  // Check if proxy of a class instance
  if (target && (target as unknown as any)[EnttClassInstanceProxySymbol]) {
    return getDecoratedClassDecoratorDefinition((target as unknown as any)[EnttClassInstanceProxySymbol], decoratorSymbol);
  }
  // Check if using instance of class to get definition
  if (typeof target !== 'function' && target?.constructor) {
    return getDecoratedClassDecoratorDefinition<T>(target.constructor as Class<T>, decoratorSymbol);
  }

  // If target is not a class, return empty definition
  if (typeof target !== 'function') {
    return [];
  }

  // Initialize definitions
  const definitions: Array<EnttClassDecoratorDefinition<T>> = [];
  // Collect definitions for the class and all it's inherited classes
  let current = target;
  do {
    definitions.splice(0, 0, ...registerDecoratedClassDecoratorDefinition<T>(current as Class<T>, decoratorSymbol, false));
  } while ((current = Object.getPrototypeOf(current)));
  // Return collected definitions
  return definitions;
}
/**
 * Gets (and first registers if necesarry) a definition for a single EnTT decorator a class has been decorated with
 * @param target A class (or instance of a class) decorated with EnTT functionality
 * @param isCalledFromDecoratorRegistration If executed from a decorator being registered
 * @param decoratorSymbol Unique symbol identifying EnTT decorator the has been decorated with
 * @returns Definition of associated EnTT functionality for the class
 */
function registerDecoratedClassDecoratorDefinition<T extends ClassInstance>(
  target: ClassInstance<T>,
  decoratorSymbol: symbol,
  isCalledFromDecoratorRegistration?: boolean,
): Array<EnttClassDecoratorDefinition<T>>;
function registerDecoratedClassDecoratorDefinition<T extends ClassInstance>(
  target: Class<T>,
  decoratorSymbol: symbol,
  isCalledFromDecoratorRegistration?: boolean,
): Array<EnttClassDecoratorDefinition<T>>;
function registerDecoratedClassDecoratorDefinition<T extends ClassInstance>(
  target: Class<T> | ClassInstance<T>,
  decoratorSymbol: symbol,
  isCalledFromDecoratorRegistration: boolean = true,
): Array<EnttClassDecoratorDefinition<T>> {
  // Check if using instance of class to get definition
  if (typeof target !== 'function' && target?.constructor) {
    return registerDecoratedClassDecoratorDefinition<T>(target.constructor as Class<T>, decoratorSymbol, isCalledFromDecoratorRegistration);
  }

  // If target is not a class, return empty definition
  if (typeof target !== 'function') {
    return [];
  }

  // Get definition for target property
  const definition = registerDecoratedClassDefinition<T>(target as Class<T>, isCalledFromDecoratorRegistration);

  // Only register additional decorator if being called from decorator registration function
  if (isCalledFromDecoratorRegistration) {
    // Create decorator definition
    const decorator = new EnttClassDecoratorDefinition(decoratorSymbol, target as Class<T>);
    // Register decorator definition
    if (!definition.decorators.bySymbol[decoratorSymbol]) {
      definition.decorators.bySymbol[decoratorSymbol] = [];
    }
    definition.decorators.bySymbol[decoratorSymbol].push(decorator);
    definition.decorators.all.push(decorator);
  }

  // Return definition
  return definition.decorators.bySymbol[decoratorSymbol] || [];
}

/**
 * Gets (and first registers if necesarry) definitions for a class property decorated with EnTT functionality
 * @param target A class (or instance of a class) carrying properties decorated with EnTT functionality
 * @param propertyKey Name of the property decorated with EnTT functionality
 * @returns Definition of associated EnTT functionality for the class property
 */
export function getDecoratedClassPropertyDefinition<T extends ClassInstance>(target: ClassInstance<T>, propertyKey: PropertyKey): EnttPropertyDefinition<T>;
export function getDecoratedClassPropertyDefinition<T extends ClassInstance>(target: Class<T>, propertyKey: PropertyKey): EnttPropertyDefinition<T>;
export function getDecoratedClassPropertyDefinition<T extends ClassInstance>(
  target: Class<T> | ClassInstance<T>,
  propertyKey: PropertyKey,
): EnttPropertyDefinition<T> {
  // Check if proxy of a class
  if (target && (target as unknown as any)[EnttClassProxySymbol]) {
    return getDecoratedClassPropertyDefinition((target as unknown as any)[EnttClassProxySymbol], propertyKey);
  }
  // Check if proxy of a class instance
  if (target && (target as unknown as any)[EnttClassInstanceProxySymbol]) {
    return getDecoratedClassPropertyDefinition((target as unknown as any)[EnttClassInstanceProxySymbol], propertyKey);
  }
  // Check if using instance of class to get definition
  if (typeof target !== 'function' && target?.constructor) {
    return getDecoratedClassPropertyDefinition<T>(target.constructor as Class<T>, propertyKey);
  }

  // If target is not a class, return empty definition
  if (typeof target !== 'function') {
    return new EnttPropertyDefinition(target as unknown as Class<T>, propertyKey);
  }

  // Initialize definitions
  const composedDefinition: EnttPropertyDefinition<T> = new EnttPropertyDefinition(target as Class<T>, propertyKey);
  const definitions: Array<EnttPropertyDefinition<T>> = [];

  // Collect definitions for the class and all it's inherited classes
  let current = target;
  do {
    definitions.push(registerDecoratedClassPropertyDefinition<T>(current as Class<T>, propertyKey, false));
  } while ((current = Object.getPrototypeOf(current)));

  // Join definitions for the class and all it's inherited classes
  for (const definition of definitions) {
    // Join class decorator definitions for the class and all it's inherited classes
    for (const decoratorDefinition of definition.decorators.all) {
      composedDefinition.decorators.all.splice(0, 0, decoratorDefinition);
      if (!composedDefinition.decorators.bySymbol[decoratorDefinition.decoratorSymbol]) {
        composedDefinition.decorators.bySymbol[decoratorDefinition.decoratorSymbol] = [];
      }
      composedDefinition.decorators.bySymbol[decoratorDefinition.decoratorSymbol].splice(0, 0, decoratorDefinition);
    }
  }

  // Return collected definitions
  return composedDefinition;
}
/**
 * Gets (and first registers if necesarry) definitions for a class property decorated with EnTT functionality
 * @param target A class (or instance of a class) carrying properties decorated with EnTT functionality
 * @param propertyKey Name of the property decorated with EnTT functionality
 * @param isCalledFromDecoratorRegistration If executed from a decorator being registered
 * @returns Definition of associated EnTT functionality for the class property
 */
function registerDecoratedClassPropertyDefinition<T extends ClassInstance>(
  target: ClassInstance<T>,
  propertyKey: PropertyKey,
  isCalledFromDecoratorRegistration?: boolean,
): EnttPropertyDefinition<T>;
function registerDecoratedClassPropertyDefinition<T extends ClassInstance>(
  target: Class<T>,
  propertyKey: PropertyKey,
  isCalledFromDecoratorRegistration?: boolean,
): EnttPropertyDefinition<T>;
function registerDecoratedClassPropertyDefinition<T extends ClassInstance>(
  target: Class<T> | ClassInstance<T>,
  propertyKey: PropertyKey,
  isCalledFromDecoratorRegistration: boolean = true,
): EnttPropertyDefinition<T> {
  // Check if using instance of class to get definition
  if (typeof target !== 'function' && target?.constructor) {
    return registerDecoratedClassPropertyDefinition<T>(target.constructor as Class<T>, propertyKey, isCalledFromDecoratorRegistration);
  }

  // If target is not a class, return empty definition
  if (typeof target !== 'function') {
    return new EnttPropertyDefinition(target as unknown as Class<T>, propertyKey);
  }

  // Get definition for target class
  const definition = registerDecoratedClassDefinition<T>(target as Class<T>, isCalledFromDecoratorRegistration);
  // Return (first register if required) property definition
  return {}.hasOwnProperty.bind(definition.properties)(propertyKey) // Digging down to potentially occluded "hasOwnProperty" method
    ? definition.properties[propertyKey]
    : (definition.properties[propertyKey] = new EnttPropertyDefinition(target as Class<T>, propertyKey));
}

/**
 * Gets (and first registers if necesarry) a definition for a single EnTT decorator a class property has been decorated with
 * @param target A class (or instance of a class) carrying properties decorated with EnTT functionality
 * @param propertyKey Name of the property decorated with EnTT functionality
 * @param decoratorSymbol Unique symbol identifying EnTT decorator the property has been decorated with
 * @returns Definitions of associated EnTT functionality for the class property decorator
 */
export function getDecoratedClassPropertyDecoratorDefinition<T extends ClassInstance>(
  target: ClassInstance<T>,
  propertyKey: PropertyKey,
  decoratorSymbol: symbol,
): Array<EnttPropertyDecoratorDefinition<T>>;
export function getDecoratedClassPropertyDecoratorDefinition<T extends ClassInstance>(
  target: Class<T>,
  propertyKey: PropertyKey,
  decoratorSymbol: symbol,
): Array<EnttPropertyDecoratorDefinition<T>>;
export function getDecoratedClassPropertyDecoratorDefinition<T extends ClassInstance>(
  target: Class<T> | ClassInstance<T>,
  propertyKey: PropertyKey,
  decoratorSymbol: symbol,
): Array<EnttPropertyDecoratorDefinition<T>> {
  // Check if proxy of a class
  if (target && (target as unknown as any)[EnttClassProxySymbol]) {
    return getDecoratedClassPropertyDecoratorDefinition((target as unknown as any)[EnttClassProxySymbol], propertyKey, decoratorSymbol);
  }
  // Check if proxy of a class instance
  if (target && (target as unknown as any)[EnttClassInstanceProxySymbol]) {
    return getDecoratedClassPropertyDecoratorDefinition((target as unknown as any)[EnttClassInstanceProxySymbol], propertyKey, decoratorSymbol);
  }
  // Check if using instance of class to get definition
  if (typeof target !== 'function' && target?.constructor) {
    return getDecoratedClassPropertyDecoratorDefinition<T>(target.constructor as Class<T>, propertyKey, decoratorSymbol);
  }

  // If target is not a class, return empty definition
  if (typeof target !== 'function') {
    return [];
  }

  // Initialize definitions
  const definitions: Array<EnttPropertyDecoratorDefinition<T>> = [];
  // Collect definitions for the class and all it's inherited classes
  let current = target;
  do {
    definitions.splice(0, 0, ...registerDecoratedClassPropertyDecoratorDefinition<T>(current as Class<T>, propertyKey, decoratorSymbol, false));
  } while ((current = Object.getPrototypeOf(current)));
  // Return collected definitions
  return definitions;
}
/**
 * Gets (and first registers if necesarry) a definition for a single EnTT decorator a class property has been decorated with
 * @param target A class (or instance of a class) carrying properties decorated with EnTT functionality
 * @param propertyKey Name of the property decorated with EnTT functionality
 * @param decoratorSymbol Unique symbol identifying EnTT decorator the property has been decorated with
 * @param isCalledFromDecoratorRegistration If executed from a decorator being registered
 * @returns Definitions of associated EnTT functionality for the class property decorator
 */
function registerDecoratedClassPropertyDecoratorDefinition<T extends ClassInstance>(
  target: ClassInstance<T>,
  propertyKey: PropertyKey,
  decoratorSymbol: symbol,
  isCalledFromDecoratorRegistration?: boolean,
): Array<EnttPropertyDecoratorDefinition<T>>;
function registerDecoratedClassPropertyDecoratorDefinition<T extends ClassInstance>(
  target: Class<T>,
  propertyKey: PropertyKey,
  decoratorSymbol: symbol,
  isCalledFromDecoratorRegistration?: boolean,
): Array<EnttPropertyDecoratorDefinition<T>>;
function registerDecoratedClassPropertyDecoratorDefinition<T extends ClassInstance>(
  target: Class<T> | ClassInstance<T>,
  propertyKey: PropertyKey,
  decoratorSymbol: symbol,
  isCalledFromDecoratorRegistration: boolean = true,
): Array<EnttPropertyDecoratorDefinition<T>> {
  // Check if using instance of class to get definition
  if (typeof target !== 'function' && target?.constructor) {
    return registerDecoratedClassPropertyDecoratorDefinition<T>(
      target.constructor as Class<T>,
      propertyKey,
      decoratorSymbol,
      isCalledFromDecoratorRegistration,
    );
  }

  // If target is not a class, return empty definition
  if (typeof target !== 'function') {
    return [];
  }

  // Get definition for target property
  const definition = registerDecoratedClassPropertyDefinition<T>(target as Class<T>, propertyKey, isCalledFromDecoratorRegistration);

  // Only register additional decorator if being called from decorator registration function
  if (isCalledFromDecoratorRegistration) {
    // Create decorator definition
    const decorator = new EnttPropertyDecoratorDefinition(decoratorSymbol, target as Class<T>, propertyKey);
    // Register decorator definition
    if (!definition.decorators.bySymbol[decoratorSymbol]) {
      definition.decorators.bySymbol[decoratorSymbol] = [];
    }
    definition.decorators.bySymbol[decoratorSymbol].push(decorator);
    definition.decorators.all.push(decorator);
  }

  // Return definition
  return definition.decorators.bySymbol[decoratorSymbol] || [];
}

/**
 * Filters a definition to only contain info on the filtering decorator
 * @param definition EnttDefinition to be filtered
 * @param decoratorSymbol Unique decorator symbol signifying the decorator to filter by
 * @returns Filtered EnttDefinition. Returned EnttDefinition will only be left containin properties to which the filtering decorator was applied.
 */
export function filterDefinition<T extends ClassInstance>(definition: EnttDefinition<T>, decoratorSymbol: symbol): EnttDefinition<T>;
/**
 * Filters hashmap of definitions to only contain info on the filtering decorator
 * @param definition EnttPropertyDefinition hashmap to be filtered.
 * @param decoratorSymbol Unique decorator symbol signifying the decorator to filter by
 * @returns Filtered EnttPropertyDefinition hashmap. Returned EnttPropertyDefinition hashmap will only be left containin properties to which the filtering decorator
 * was applied and each EnttPropertyDefinition in the hashmap will only contain decorator definitions for the filtering decorator.
 */
export function filterDefinition<T extends ClassInstance>(
  definition: Record<PropertyKey, EnttPropertyDefinition<T>>,
  decoratorSymbol: symbol,
): Record<PropertyKey, EnttPropertyDefinition<T>>;
/**
 * Filters a definition to only contain info on the filtering decorator
 * @param definition EnttPropertyDefinition to be filtered.
 * @param decoratorSymbol Unique decorator symbol signifying the decorator to filter by
 * @returns Filtered EnttPropertyDefinition. Returned EnttPropertyDefinition will only contain decorator definitions for the filtering decorator.
 */
export function filterDefinition<T extends ClassInstance>(definition: EnttPropertyDefinition<T>, decoratorSymbol: symbol): EnttPropertyDefinition<T>;
export function filterDefinition<T extends ClassInstance>(
  definition: EnttDefinition<T> | Record<PropertyKey, EnttPropertyDefinition<T>> | EnttPropertyDefinition<T>,
  decoratorSymbol: symbol,
): EnttDefinition<T> | Record<PropertyKey, EnttPropertyDefinition<T>> | EnttPropertyDefinition<T> {
  // Filter entity definition
  if (definition && definition instanceof EnttDefinition) {
    const filteredDefinition = new EnttDefinition<T>(definition.owner);
    // Filter decorators.all
    filteredDefinition.decorators.all = definition.decorators.all.filter(d => d.decoratorSymbol === decoratorSymbol);
    // Copy decorators.bySymbol
    if (definition.decorators.bySymbol[decoratorSymbol]) {
      filteredDefinition.decorators.bySymbol[decoratorSymbol] = definition.decorators.bySymbol[decoratorSymbol].map(d => {
        const definition = new EnttClassDecoratorDefinition(d.decoratorSymbol, d.owner);
        definition.data = d.data;
        return definition;
      });
    }
    // Filter properties
    filteredDefinition.properties = filterDefinition(definition.properties, decoratorSymbol);
    return filteredDefinition;
  }

  // Filter array of property definitions
  else if (
    definition &&
    definition instanceof Object &&
    Object.values(definition).reduce((valid, def) => valid && def instanceof EnttPropertyDefinition, true)
  ) {
    const castDefinition = definition as Record<PropertyKey, EnttPropertyDefinition<T>>;
    const propertyDefinitions: Record<PropertyKey, EnttPropertyDefinition<T>> = Object.keys(definition).reduce(
      (filteredPropertyDefinitions: Record<PropertyKey, EnttPropertyDefinition<T>>, key) => {
        const filteredPropertyDefinition = filterDefinition(castDefinition[key], decoratorSymbol);
        if (filteredPropertyDefinition.decorators.all.length) {
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
    const filteredPropertyDefinition = new EnttPropertyDefinition<T>(definition.owner, definition.ownerPropertyKey);
    // Filter decorators.all
    filteredPropertyDefinition.decorators.all = definition.decorators.all.filter(d => d.decoratorSymbol === decoratorSymbol);
    // Copy decorators.bySymbol
    if (definition.decorators.bySymbol[decoratorSymbol]) {
      filteredPropertyDefinition.decorators.bySymbol[decoratorSymbol] = definition.decorators.bySymbol[decoratorSymbol].map(d => {
        const definition = new EnttPropertyDecoratorDefinition(d.decoratorSymbol, d.owner, d.ownerPropertyKey);
        definition.data = d.data;
        return definition;
      });
    }
    return filteredPropertyDefinition;
  }

  // In case wrong input passed
  else {
    throw new Error(
      'Calling filterDefinition() not supported with provided definition argument! Only EnttDefinition | Record<PropertyName, EnttPropertyDefinition> | EnttPropertyDefinition are supported.',
    );
  }
}

// #endregion

// #region EnTT decorator helpers: Verify classes EnTTified

/**
 * Array of classes requiring enttification, queued for verification if they were EnTTified
 */
const validationQueueForClassesRequiringEnttification: Array<{ target: Class; message: Info | Warning | Error }> = [];

/**
 * Registers a target decorated (with class or property decorators) class for verification to make sure any class using EnTT-ification dependent decorators was EnTTified
 * @param configuration Decorator configuiration
 * @param target Decorated class
 * @param key (Optional) Decorated property
 */
function registerDecoratedClassForVerification<TInstance extends ClassInstance, TValOuter, TValInner, TPayload>(
  configuration:
    | CustomStaticClassDecoratorConfiguration<TPayload>
    | CustomDynamicClassDecoratorConfiguration<TInstance, TPayload>
    | CustomStaticPropertyDecoratorConfiguration<TPayload>
    | CustomDynamicPropertyDecoratorConfiguration<TInstance, TValOuter, TValInner, TPayload>,
  target: Class<TInstance>,
  key?: PropertyKey,
) {
  // If decorator requires a EnTTified model, queue up verification if the model was indeed EnTTified
  if (
    configuration &&
    typeof configuration === 'object' &&
    ((configuration as CustomDynamicClassDecoratorConfiguration<TInstance, TPayload>).onConstruct ||
      (
        configuration as
          | CustomDynamicClassDecoratorConfiguration<TInstance, TPayload>
          | CustomDynamicPropertyDecoratorConfiguration<TInstance, TValOuter, TValInner, TPayload>
      ).onPropertyGet ||
      (
        configuration as
          | CustomDynamicClassDecoratorConfiguration<TInstance, TPayload>
          | CustomDynamicPropertyDecoratorConfiguration<TInstance, TValOuter, TValInner, TPayload>
      ).onPropertySet)
  ) {
    // Register class as requiring EnTTification
    validationQueueForClassesRequiringEnttification.push({
      target,
      message: new Warning(
        `An EnTT decorator, applied to ${target?.name}${!key ? '' : `.${key.toString()}`}, requires the class to be EnTTified before usage!`,
      ),
    });
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

/**
 * Run verification after initial tick importing all dependencies and models:
 * - Verify all classes using decorators requiring EnTTification were EnTTified
 */
setTimeout(() => !isProduction() && verifyDecoratorUsage());

// #endregion

// #region EnTT decorator helpers: Implement a custom class decorator

/**
 * Helper function used to create a custom decoorator.
 *
 * Creating a class decorator which will work even on classes that were not EnTTified:
 *
 * ```ts
 * function MyStaticClassDecorator(data: any) {
 *   return createClassCustomDecorator();
 * }
 * @MyStaticClassDecorator({ my: 'configuration' })
 * class MyClass { }
 * ```
 *
 * @returns Static decorator
 */
export function createClassCustomDecorator<TInstance extends ClassInstance>(): ClassDecorator<TInstance>;
/**
 * Helper function used to create a custom decoorator.
 *
 * Creating a class decorator which will work even on classes that were not EnTTified:
 *
 * ```ts
 * function MyStaticClassDecorator(data: any) {
 *   return createClassCustomDecorator(
 *     undefined
 *     Symbol('My class decorator symbol')
 *   );
 * }
 * @MyStaticClassDecorator({ my: 'configuration' })
 * class MyClass { }
 * ```
 *
 * @param decoratorSymbol (Optional) Unique symbol used to identity a particular decorator
 * @returns Static decorator
 */
export function createClassCustomDecorator<TInstance extends ClassInstance>(configuration: undefined, decoratorSymbol: symbol): ClassDecorator<TInstance>;
/**
 * Helper function used to create a custom decoorator.
 *
 * Creating a class decorator which will work even on classes that were not EnTTified:
 *
 * ```ts
 * function MyStaticClassDecorator(data: any) {
 *   return createClassCustomDecorator(
 *     () => data, // Returned data which will be stored in decorator definition once decorator is used to decorate a class
 *     Symbol('My class decorator symbol')
 *   );
 * }
 * @MyStaticClassDecorator({ my: 'configuration' })
 * class MyClass { }
 * ```
 *
 * @param configuration A Callback function expected to return data which will be stored within a class's decorator definition once decorator is used to decorate a class
 * @param decoratorSymbol (Optional) Unique symbol used to identity a particular decorator
 * @returns Static decorator
 */
export function createClassCustomDecorator<TInstance extends ClassInstance, TPayload>(
  configuration: CustomStaticClassDecoratorConfiguration<TPayload>,
  decoratorSymbol: symbol,
): ClassDecorator<TInstance>;
/**
 * Helper function used to create a custom decoorator.
 *
 * Creating a class decorator with proxy hooks, which will work only on EnTTified classes:
 *
 * ```ts
 * function MyDynamicClassDecorator(data: any) {
 *   return createClassCustomDecorator(
 *     {
 *       onPropertyGet?: (target, prop) => target[prop],
 *       onPropertySet?: (target, prop, value) => (target[prop] = value),
 *       composeDecoratorDefinitionPayload: () => data, // Returned data which will be stored in decorator definition once decorator is used to decorate a class
 *     },
 *     Symbol('My class decorator symbol')
 *   );
 * }
 * @MyDynamicClassDecorator({ my: 'configuration' })
 * class MyClass { }
 * ```
 *
 * @param configuration Decorator configuration with a callback function returning data to be stored within the decorator definition
 * and optional proxy hooks to be called when underlying decorated object is being accessed.
 * @param decoratorSymbol (Optional) Unique symbol used to identity a particular decorator
 * @returns Dynamic decorator
 */
export function createClassCustomDecorator<TInstance extends ClassInstance, TPayload>(
  configuration: CustomDynamicClassDecoratorConfiguration<TInstance, TPayload>,
  decoratorSymbol: symbol,
): ClassDecorator<TInstance>;
/**
 * Helper function used to create a custom decoorator.
 * @param configuration (Optional) Decorator configuration on form of:
 * - either a Callback function expected to return data which will be stored within a class's decorator definition once decorator is used to
 *   decorate a class
 * - or decorator configuration object with a callback function returning data to be stored within the decorator definition and optional proxy
 *   hooks to be called when underlying decorated object is being accessed.
 * @param decoratorSymbol (Optional) Unique symbol used to identity a particular decorator
 * @returns Decorator
 */
export function createClassCustomDecorator<TInstance extends ClassInstance, TPayload>(
  configuration?: CustomStaticClassDecoratorConfiguration<TPayload> | CustomDynamicClassDecoratorConfiguration<TInstance, TPayload>,
  decoratorSymbol: symbol = Symbol(),
): ClassDecorator<TInstance> {
  return <TInstanceInternal extends TInstance>(target: Class<TInstanceInternal>) => {
    // Check if multiple usages of the same decorator and if permitted
    if (configuration && configuration instanceof Object) {
      const classDefinitions = getDecoratedClassDecoratorDefinition(target, decoratorSymbol);
      const permissionCallback = (configuration as CustomDynamicClassDecoratorConfiguration<TInstance, TPayload>).composeDecoratorMultipleUsagePermission;
      if (classDefinitions.length && (!permissionCallback || !permissionCallback())) {
        throw new Error(`Multiple usage of "${decoratorSymbol.description}" decorator on the same ${target.name} class not allowed!!!`);
      }
    }

    // Get decorator definition for the class
    const definitions = registerDecoratedClassDecoratorDefinition<TInstance>(target, decoratorSymbol);
    const definition = definitions.at(-1);
    if (!definition) {
      throw new Error('Definition registration failed!');
    }

    // Process static decorator with only definition update provided and no EnTT proxy hooks
    if (configuration && typeof configuration === 'function') {
      // Update definition for the class
      definition.data = configuration();
      // Register decorator definition
      definition.implementation = new CustomClassDecoratorImplementation<TInstance>();
    }
    // Process dynamic decorator with EnTT proxy hooks
    else if (configuration && typeof configuration === 'object') {
      // Update definition for the class
      definition.data = configuration?.composeDecoratorDefinitionPayload?.();
      // Register decorator definition
      definition.implementation = new CustomClassDecoratorImplementation<TInstance>(
        configuration?.onConstruct,
        configuration?.onPropertyKeys,
        configuration?.onPropertyGet,
        configuration?.onPropertySet,
      );
      // If decorator requires a EnTTified model, queue up verification if the model was indeed EnTTified
      registerDecoratedClassForVerification(configuration, target);
    }
  };
}

// #endregion

// #region EnTT decorator helpers: Implement a custom property decorator

/**
 * Helper function used to create a custom decoorator.
 *
 * Creating a property decorator which will work even on classes that were not EnTTified:
 *
 * ```ts
 * function MyStaticPropertyDecorator(data: any) {
 *   return createPropertyCustomDecorator();
 * }
 * class MyClass {
 *   @MyStaticPropertyDecorator({ my: 'configuration' })
 *   public myProperty: any;
 * }
 * ```
 *
 * @returns Static decorator
 */
export function createPropertyCustomDecorator<TInstance extends ClassInstance>(): PropertyDecorator<TInstance>;
/**
 * Helper function used to create a custom decoorator.
 *
 * Creating a property decorator which will work even on classes that were not EnTTified:
 *
 * ```ts
 * function MyStaticPropertyDecorator(data: any) {
 *   return createPropertyCustomDecorator(
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
 * @param decoratorSymbol (Optional) Unique symbol used to identity a particular decorator
 * @returns Static decorator
 */
export function createPropertyCustomDecorator<TInstance extends ClassInstance>(
  configuration: undefined,
  decoratorSymbol?: symbol,
): PropertyDecorator<TInstance>;
/**
 * Helper function used to create a custom decoorator.
 *
 * Creating a property decorator which will work even on classes that were not EnTTified:
 *
 * ```ts
 * function MyStaticPropertyDecorator(data: any) {
 *   return createPropertyCustomDecorator(
 *     () => data, // Returned data which will be stored in decorator definition once decorator is used to decorate a property
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
export function createPropertyCustomDecorator<TInstance extends ClassInstance, TPayload>(
  configuration: CustomStaticPropertyDecoratorConfiguration<TPayload>,
  decoratorSymbol?: symbol,
): PropertyDecorator<TInstance>;
/**
 * Helper function used to create a custom decoorator.
 *
 * Creating a property decorator with proxy hooks, which will work only on EnTTified classes:
 *
 * ```ts
 * function MyDynamicPropertyDecorator(data: any) {
 *   return createPropertyCustomDecorator(
 *     {
 *       onPropertyGet?: (target, prop) => target[prop],
 *       onPropertySet?: (target, prop, value) => (target[prop] = value),
 *       composeDecoratorDefinitionPayload: () => data, // Returned data which will be stored in decorator definition once decorator is used to decorate a property
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
export function createPropertyCustomDecorator<TInstance extends ClassInstance, TPayload, TValInner = any, TValOuter = any>(
  configuration: CustomDynamicPropertyDecoratorConfiguration<TInstance, TPayload, TValInner, TValOuter>,
  decoratorSymbol?: symbol,
): PropertyDecorator<TInstance>;
export function createPropertyCustomDecorator<TInstance extends ClassInstance, TPayload, TValInner = any, TValOuter = any>(
  configuration?: CustomStaticPropertyDecoratorConfiguration<TPayload> | CustomDynamicPropertyDecoratorConfiguration<TInstance, TPayload, TValInner, TValOuter>,
  decoratorSymbol: symbol = Symbol(),
): PropertyDecorator<TInstance> {
  return <TInstanceInternal extends TInstance>(target: ClassInstance<TInstanceInternal>, key: PropertyKey, _descriptor?: PropertyDescriptor) => {
    // Check if multiple usages of the same decorator and if permitted
    if (configuration && configuration instanceof Object) {
      const propertyDefinitions = getDecoratedClassPropertyDecoratorDefinition(target, key, decoratorSymbol);
      const permissionCallback = (configuration as CustomDynamicClassDecoratorConfiguration<TInstance, TPayload>).composeDecoratorMultipleUsagePermission;
      if (propertyDefinitions.length && (!permissionCallback || !permissionCallback())) {
        throw new Error(
          `Multiple usage of "${decoratorSymbol.description}" decorator on the same ${
            target.constructor.name
          } class's ${key.toString()} property not allowed!!!`,
        );
      }
    }

    // Get decorator definition for the property
    const definitions = registerDecoratedClassPropertyDecoratorDefinition(target, key, decoratorSymbol);
    const definition = definitions.at(-1);
    if (!definition) {
      throw new Error('Definition registration failed!');
    }

    // Process static decorator with only definition update provided and no EnTT proxy hooks
    if (configuration && typeof configuration === 'function') {
      // Update definition for the property
      definition.data = configuration();
      // Register decorator definition
      definition.implementation = new CustomPropertyDecoratorImplementation<TInstance, TValInner, TValOuter>();
    }
    // Process dynamic decorator with EnTT proxy hooks
    else if (configuration && typeof configuration === 'object') {
      // Update definition for the property
      definition.data = configuration?.composeDecoratorDefinitionPayload?.();
      // Register decorator definition
      definition.implementation = new CustomPropertyDecoratorImplementation<TInstance, TValInner, TValOuter>(
        configuration?.onPropertyGet,
        configuration?.onPropertySet,
      );
      // If decorator requires a EnTTified model, queue up verification if the model was indeed EnTTified
      registerDecoratedClassForVerification(configuration, target.constructor as Class<TInstanceInternal>, key);
    }
  };
}

// #endregion

// #region EnTT dynamic functionality via EnTT proxy

/**
 * Symbol used to access a "hidden" property intended to identify Enttified classes' Proxies
 */
const EnttClassProxySymbol = Symbol('Property key used to identify class Proxies');
/**
 * Symbol used to access a "hidden" property intended to identify Enttified class instances' Proxies
 */
const EnttClassInstanceProxySymbol = Symbol('Property key used to identify class instance Proxies');

/**
 * Holds references to all classes that were EnTTified
 */
const enttifiedClassesByUnderlyingClass: WeakMap<Class, Class<EnttClassInstance<ClassInstance>>> = new WeakMap();
/**
 * Holds references to all classes that were EnTTified
 */
const underlyingClassesByEnttifiedClass: WeakMap<Class<EnttClassInstance<ClassInstance>>, Class> = new WeakMap();
/**
 * Holds references to all instances that were EnTTified
 */
const underlyingInstancesByEnttifiedInstance: WeakMap<EnttClassInstance<ClassInstance>, ClassInstance> = new WeakMap();

/**
 * Wraps a class into a proxy which will hook into the constructor and replace the constructed instance with a proxy to
 * the instance implementing the dynamic EnTT functionality
 * @param TargetClass The class being wrapped
 * @returns A proxy to the class
 */
export function enttify<T extends ClassInstance>(TargetClass: Class<T>): Class<EnttClassInstance<T>> {
  // Wrap a class into a proxy which will hook into the constructor and replace the constructed instance with a proxy to
  // the instance implementing the dynamic EnTT functionality
  const alreadyEnTTified = enttifiedClassesByUnderlyingClass.has(TargetClass);
  const ProxyClass = alreadyEnTTified
    ? (enttifiedClassesByUnderlyingClass.get(TargetClass) as Class<EnttClassInstance<T>>)
    : (new Proxy(TargetClass, {
        /**
         * Intercept constructng an instance
         * @param _TargetClass
         * @param args
         * @returns
         */
        construct: (_TargetClass: Class<T>, args: Array<any>): EnttClassInstance<T> => {
          // Get class definition
          const classDefinition = registerDecoratedClassDefinition(_TargetClass);
          // Run original constructor and get original instance of the class
          const target = new _TargetClass(...args) as ClassInstance<Class<T>>;
          const handler = createProxyhandlerForEnttInstance(target);

          // Compose a proxy to the original instance, implementing dynamic EnTT functionality
          const proxy = new Proxy(target, handler) as unknown as EnttClassInstance<T>;
          // Register original instance by the proxy
          underlyingInstancesByEnttifiedInstance.set(proxy, target);

          // Process all initially set property values
          for (const key of Object.keys(target)) {
            (proxy as any)[key] = (target as any)[key];
          }

          // Process EnTTified instance through all registered constructor hooks
          for (const decoratorDefinition of [...classDefinition.decorators.all].reverse()) {
            if (decoratorDefinition.implementation) {
              const decoratorImplementation = decoratorDefinition.implementation as CustomClassDecoratorImplementation<T>;
              if (decoratorImplementation) {
                // Execute simple callback
                decoratorImplementation.onConstruct?.(proxy);
              }
            }
          }

          // Return a proxy to the original instance
          return proxy;
        },
        /**
         * Intercepts get access to the underlyng object property
         * @param _TargetClass Underlying object baing proxied
         * @param key Key of the property being accessed
         * @returns If checking "hidden" property intended to identify Enttified classes' Proxies, return original proxyied class
         * to confirm self as proxy, else returns property value
         */
        get: (_TargetClass: Class<T>, key: PropertyKey) => {
          // If checking "hidden" property intended to identify Enttified classes' Proxies, return original proxyied class to confirm self as proxy
          return key === EnttClassProxySymbol ? _TargetClass : (_TargetClass as unknown as any)[key];
        },
      }) as Class<EnttClassInstance<T>>);
  // Register original class by the proxy
  if (!alreadyEnTTified) {
    enttifiedClassesByUnderlyingClass.set(TargetClass.prototype.constructor, ProxyClass);
    underlyingClassesByEnttifiedClass.set(ProxyClass, TargetClass.prototype.constructor);
  }
  // Return proxy to the original class
  return ProxyClass;
}

/**
 * Given an EnTTified class, finds the underlying class that was EnTTified
 * @param TargetClass EnTTified class
 * @returns Underlying class that was EnTTified
 */
export function getUnderlyingEnttifiedClass<T extends ClassInstance>(TargetClass: Class<EnttClassInstance<T>>): Class<T> | undefined {
  return underlyingClassesByEnttifiedClass.get(TargetClass) as Class<T> | undefined;
}

/**
 * Given an EnTTified object instance, finds the underlying object instance that was EnTTified
 * @param proxy EnTTified object instance
 * @returns Underlying object instance that was EnTTified
 */
export function getUnderlyingEnttifiedInstance<T extends ClassInstance>(proxy: EnttClassInstance<T>): ClassInstance<T> | undefined {
  return underlyingInstancesByEnttifiedInstance.get(proxy) as ClassInstance<T> | undefined;
}

/**
 * Generates proxy handler to a newly constructed, original class instance implementing dynamic EnTT functionality
 * @param target Newly constructed, original instance being wrapped by the proxy
 * @returns Proxy handler definition
 */
function createProxyhandlerForEnttInstance<T extends ClassInstance>(_: ClassInstance<T>): ProxyHandler<ClassInstance<T>> {
  return {
    /**
     * Intercepts queries for available property keys of the instance, such as when executing the `in` operator
     * @param _ Underlying object baing proxied
     * @param key Key of the property being queried
     * @returns If property is found
     */
    has: (target: EnttClassInstance<T>, key: PropertyKey) => {
      // Get class definition
      const classDefinition = registerDecoratedClassDefinition<T>(target);
      // Check all relevang onPropertyKeys callbacks, any if any doesn't agree property doesn't exist, return property doesn'r exist
      let onPropertyKeysHas = false;
      for (const decoratorDefinition of [...classDefinition.decorators.all].reverse()) {
        if (decoratorDefinition.implementation) {
          const decoratorImplementation = decoratorDefinition.implementation;
          if (decoratorImplementation.onPropertyKeys) {
            onPropertyKeysHas = true;
            if (decoratorImplementation.onPropertyKeys.has(target, key)) {
              return true;
            }
          }
        }
      }
      // Check if property was processed by onPropertyKeys.has(...) callback, or if not check if it exists directly
      return onPropertyKeysHas ? false : key in target;
    },
    /**
     * Intercepts queries for available and owned property keys of the instance, such as when executing `Object.keys()`, `Reflect.ownKeys()`, etc.
     * @param _ Underlying object baing proxied
     * @returns Array of owned property keys
     */
    ownKeys: (target: EnttClassInstance<T>) => {
      // Get class definition
      const classDefinition = registerDecoratedClassDefinition(target);
      // Check all relevang onPropertyKeys callbacks, any if any doesn't agree property doesn't exist, return property doesn'r exist
      let onPropertyKeysOwnKeys = false;
      let onPropertyKeysOwnKeysCommonPropertyKeys = new Set<string | symbol>();
      for (const decoratorDefinition of [...classDefinition.decorators.all].reverse()) {
        if (decoratorDefinition.implementation) {
          const decoratorImplementation = decoratorDefinition.implementation;
          if (decoratorImplementation.onPropertyKeys) {
            onPropertyKeysOwnKeys = true;
            const propertyKeys = decoratorImplementation.onPropertyKeys.ownKeys(target);
            for (const propertyKey of propertyKeys) {
              onPropertyKeysOwnKeysCommonPropertyKeys.add(propertyKey);
            }
          }
        }
      }
      // Check if property was processed by onPropertyKeys.ownKeys(...) callback, or if not check for owned properties directly
      return onPropertyKeysOwnKeys ? [...onPropertyKeysOwnKeysCommonPropertyKeys] : Reflect.ownKeys(target);
    },
    /**
     * Intercepts get access to the underlyng object property
     * @param _ Underlying object baing proxied
     * @param key Key of the property being accessed
     * @returns Value to be returned from the getter, having been intercepted.
     * (If checking "hidden" property intended to identify Enttified class instances' Proxies, return original proxyied class to confirm self as proxy)
     */
    get: (target: EnttClassInstance<T>, key: PropertyKey) => {
      // If checking "hidden" property intended to identify Enttified classes return undefined
      if (key === EnttClassProxySymbol) {
        return undefined;
      }
      // If checking "hidden" property intended to identify Enttified classes' Proxies, return original proxyied class to confirm self as proxy
      if (key === EnttClassInstanceProxySymbol) {
        return target.constructor as Class<T>;
      }

      // Initialize getting value
      let processed = (target as any)[key];

      // Get class definition
      const classDefinition = registerDecoratedClassDefinition(target);
      // Get property definition
      const propDefinition = registerDecoratedClassPropertyDefinition(target, key);

      // Collect all relevang onPropertyGet callbacks
      const onPropertyGetCallbacks = {
        before: [] as Array<OnPropertyInterceptionCallback<T>>,
        transform: [] as Array<OnPropertyTransformationCallback<T>>,
        after: [] as Array<OnPropertyInterceptionCallback<T>>,
      };
      for (const decoratorDefinition of [...[...classDefinition.decorators.all].reverse(), ...[...propDefinition.decorators.all].reverse()]) {
        if (decoratorDefinition.implementation) {
          const decoratorImplementation = decoratorDefinition.implementation as ICustomDecoratorImplementation<T>;
          if (decoratorImplementation.onPropertyGet) {
            // Register simple transform callback
            if (typeof decoratorImplementation.onPropertyGet === 'function') {
              onPropertyGetCallbacks.transform.push(decoratorImplementation.onPropertyGet as OnPropertyTransformationCallback<T>);
            }
            // Register interception and staged callbacks
            else if (decoratorImplementation.onPropertyGet instanceof Object) {
              // Register staged callbacks: before
              if ('before' in decoratorImplementation.onPropertyGet && decoratorImplementation.onPropertyGet.before) {
                onPropertyGetCallbacks.before.push(decoratorImplementation.onPropertyGet.before);
              }
              // Register staged callbacks: transform
              if ('transform' in decoratorImplementation.onPropertyGet && decoratorImplementation.onPropertyGet.transform) {
                onPropertyGetCallbacks.transform.push(decoratorImplementation.onPropertyGet.transform);
              }
              // Register staged callbacks: after
              if ('after' in decoratorImplementation.onPropertyGet && decoratorImplementation.onPropertyGet.after) {
                onPropertyGetCallbacks.after.push(decoratorImplementation.onPropertyGet.after);
              }
            }
          }
        }
      }

      // Execute all getter "before" hooks
      for (const beforeCallbackFn of onPropertyGetCallbacks.before) {
        beforeCallbackFn({ target, key, value: processed });
      }
      // Execute all getter "transform" hooks
      for (const transformCallbackFn of onPropertyGetCallbacks.transform) {
        processed = transformCallbackFn({ target, key, value: processed });
      }
      // Execute all getter "after" hooks
      for (const afterCallbackFn of onPropertyGetCallbacks.after) {
        afterCallbackFn({ target, key, value: processed });
      }

      // Return processed value
      return processed;
    },
    /**
     * Intercepts set access to the underlyng object property
     * @param _ Underlying object baing proxied
     * @param key Key of the property being accessed
     * @returns Value that was set, having intercepted it and set it to the underlying proxied object
     */
    set: (target: EnttClassInstance<T>, key: PropertyKey, value: any) => {
      // Initialize setting value
      let processed = value;

      // Get property definition
      const propDefinition = registerDecoratedClassPropertyDefinition(target, key);
      // Get class definition
      const classDefinition = registerDecoratedClassDefinition(target);

      // Collect all relevang onPropertyGet callbacks
      const onPropertySetCallbacks = {
        intercept: [] as Array<OnPropertyInterceptionCallback<T>>,
        before: [] as Array<OnPropertyInterceptionCallback<T>>,
        transform: [] as Array<OnPropertyTransformationCallback<T>>,
        after: [] as Array<OnPropertyInterceptionCallback<T>>,
      };
      for (const decoratorDefinition of [...propDefinition.decorators.all, ...classDefinition.decorators.all]) {
        if (decoratorDefinition.implementation) {
          const decoratorImplementation = decoratorDefinition.implementation as ICustomDecoratorImplementation<T>;
          if (decoratorImplementation.onPropertySet) {
            // Register simple transform callback
            if (typeof decoratorImplementation.onPropertySet === 'function') {
              onPropertySetCallbacks.transform.push(decoratorImplementation.onPropertySet as OnPropertyTransformationCallback<T>);
            }
            // Register interception and staged callbacks
            else if (decoratorImplementation.onPropertySet instanceof Object) {
              // Register staged callbacks: before
              if ('before' in decoratorImplementation.onPropertySet && decoratorImplementation.onPropertySet.before) {
                onPropertySetCallbacks.before.push(decoratorImplementation.onPropertySet.before);
              }
              // Register staged callbacks: transform
              if ('transform' in decoratorImplementation.onPropertySet && decoratorImplementation.onPropertySet.transform) {
                onPropertySetCallbacks.transform.push(decoratorImplementation.onPropertySet.transform);
              }
              // Register staged callbacks: after
              if ('after' in decoratorImplementation.onPropertySet && decoratorImplementation.onPropertySet.after) {
                onPropertySetCallbacks.after.push(decoratorImplementation.onPropertySet.after);
              }
            }
          }
        }
      }

      // Execute all getter "before" hooks
      for (const beforeCallbackFn of onPropertySetCallbacks.before) {
        beforeCallbackFn({ target, key, value: processed });
      }
      // Execute all getter "transform" hooks
      for (const transformCallbackFn of onPropertySetCallbacks.transform) {
        processed = transformCallbackFn({ target, key, value: processed });
      }
      // Execute all getter "after" hooks
      for (const afterCallbackFn of onPropertySetCallbacks.after) {
        afterCallbackFn({ target, key, value: processed });
      }

      // Set value
      (target as any)[key] = processed;

      // Return successful set operation
      return true;
    },
  };
}

// #endregion
