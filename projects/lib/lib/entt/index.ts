// enTT lib main, base functionality
// ----------------------------------------------------------------------------

// Import and (re)export types
import {
  Class,
  ClassInstance,
  EnttInstance,
  FullPathPropertyValue,
  CustomClassDecoratorImplementation,
  CustomStaticClassDecoratorConfiguration,
  CustomDynamicClassDecoratorConfiguration,
  CustomPropertyDecoratorImplementation,
  CustomStaticPropertyDecoratorConfiguration,
  CustomDynamicPropertyDecoratorConfiguration,
  EnttDefinition,
  EnttPropertyDefinition,
  EnttDecoratorDefinition,
} from './internals';
export {
  Class,
  ClassInstance,
  EnttInstance,
  FullPathPropertyValue,
  CustomClassDecoratorImplementation,
  CustomStaticClassDecoratorConfiguration,
  CustomDynamicClassDecoratorConfiguration,
  CustomPropertyDecoratorImplementation,
  CustomStaticPropertyDecoratorConfiguration,
  CustomDynamicPropertyDecoratorConfiguration,
  EnttDefinition,
  EnttPropertyDefinition,
  EnttDecoratorDefinition as EnttPropertyDecoratorDefinition,
};
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
const decoratedClasses: WeakMap<Class<Object>, EnttDefinition> = new WeakMap();

/**
 * Gets (and first registers if necesarry) definitions for a class decorated by or carrying properties decorated with EnTT functionality
 * @param target A class (or instance of a class) decorated by or  carrying properties decorated with EnTT functionality
 * @returns Definition of associated EnTT functionality for the class
 */
export function getDecoratedClassDefinition<T extends object>(target: ClassInstance<T>): EnttDefinition;
export function getDecoratedClassDefinition<T extends object>(target: Class<T>): EnttDefinition;
export function getDecoratedClassDefinition<T extends object>(target: Class<T> | ClassInstance<T>): EnttDefinition {
  // Check if using instance of class to get definition
  if (typeof target !== 'function') {
    return getDecoratedClassDefinition(target.constructor);
  }

  // Initialize definitions
  const composedDefinition: EnttDefinition = new EnttDefinition(target as Class<T>);
  const definitions: Array<EnttDefinition> = [];

  // Collect definitions for the class and all it's inherited classes
  let current = target;
  do {
    definitions.push(registerDecoratedClassDefinition(current, false));
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
function registerDecoratedClassDefinition<T extends object>(target: ClassInstance<T>, isCalledFromDecoratorRegistration?: boolean): EnttDefinition;
function registerDecoratedClassDefinition<T extends object>(target: Class<T>, isCalledFromDecoratorRegistration?: boolean): EnttDefinition;
function registerDecoratedClassDefinition<T extends object>(
  target: Class<T> | ClassInstance<T>,
  isCalledFromDecoratorRegistration: boolean = true,
): EnttDefinition {
  // Check if using instance of class to get definition
  if (typeof target !== 'function') {
    return registerDecoratedClassDefinition(target.constructor, isCalledFromDecoratorRegistration);
  }

  // Check if already registered
  const definition = decoratedClasses.get(target as Class<T>);
  if (definition) {
    return definition;
  }
  // ... and register if not
  else {
    const definition = new EnttDefinition(target as Class<T>);
    decoratedClasses.set(target as Class<T>, definition);
    return definition;
  }
}

/**
 * Gets (and first registers if necesarry) a definition for a single EnTT decorator a class has been decorated with
 * @param target A class (or instance of a class) decorated with EnTT functionality
 * @param decoratorSymbol Unique symbol identifying EnTT decorator the has been decorated with
 * @returns Definitions of associated EnTT functionality for the class
 */
export function getDecoratedClassDecoratorDefinition<T extends object>(target: ClassInstance<T>, decoratorSymbol: symbol): Array<EnttDecoratorDefinition>;
export function getDecoratedClassDecoratorDefinition<T extends object>(target: Class<T>, decoratorSymbol: symbol): Array<EnttDecoratorDefinition>;
export function getDecoratedClassDecoratorDefinition<T extends object>(
  target: Class<T> | ClassInstance<T>,
  decoratorSymbol: symbol,
): Array<EnttDecoratorDefinition> {
  // Check if using instance of class to get definition
  if (typeof target !== 'function') {
    return getDecoratedClassDecoratorDefinition(target.constructor, decoratorSymbol);
  }

  // Initialize definitions
  const definitions: Array<EnttDecoratorDefinition> = [];
  // Collect definitions for the class and all it's inherited classes
  let current = target;
  do {
    definitions.splice(0, 0, ...registerDecoratedClassDecoratorDefinition(current, decoratorSymbol, false));
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
function registerDecoratedClassDecoratorDefinition<T extends object>(
  target: ClassInstance<T>,
  decoratorSymbol: symbol,
  isCalledFromDecoratorRegistration?: boolean,
): Array<EnttDecoratorDefinition>;
function registerDecoratedClassDecoratorDefinition<T extends object>(
  target: Class<T>,
  decoratorSymbol: symbol,
  isCalledFromDecoratorRegistration?: boolean,
): Array<EnttDecoratorDefinition>;
function registerDecoratedClassDecoratorDefinition<T extends object>(
  target: Class<T> | ClassInstance<T>,
  decoratorSymbol: symbol,
  isCalledFromDecoratorRegistration: boolean = true,
): Array<EnttDecoratorDefinition> {
  // Check if using instance of class to get definition
  if (typeof target !== 'function') {
    return registerDecoratedClassDecoratorDefinition(target.constructor, decoratorSymbol, isCalledFromDecoratorRegistration);
  }

  // Get definition for target property
  const definition = registerDecoratedClassDefinition(target, isCalledFromDecoratorRegistration);

  // Only register additional decorator if being called from decorator registration function
  if (isCalledFromDecoratorRegistration) {
    // Create decorator definition
    const decorator = new EnttDecoratorDefinition(decoratorSymbol, target as Class<T>);
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
export function getDecoratedClassPropertyDefinition<T extends object>(target: ClassInstance<T>, propertyKey: PropertyKey): EnttPropertyDefinition;
export function getDecoratedClassPropertyDefinition<T extends object>(target: Class<T>, propertyKey: PropertyKey): EnttPropertyDefinition;
export function getDecoratedClassPropertyDefinition<T extends object>(target: Class<T> | ClassInstance<T>, propertyKey: PropertyKey): EnttPropertyDefinition {
  // Check if using instance of class to get definition
  if (typeof target !== 'function') {
    return getDecoratedClassPropertyDefinition(target.constructor, propertyKey);
  }

  // Initialize definitions
  const composedDefinition: EnttPropertyDefinition = new EnttPropertyDefinition(target as Class<T>, propertyKey);
  const definitions: Array<EnttPropertyDefinition> = [];

  // Collect definitions for the class and all it's inherited classes
  let current = target;
  do {
    definitions.push(registerDecoratedClassPropertyDefinition(current, propertyKey, false));
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
function registerDecoratedClassPropertyDefinition<T extends object>(
  target: ClassInstance<T>,
  propertyKey: PropertyKey,
  isCalledFromDecoratorRegistration?: boolean,
): EnttPropertyDefinition;
function registerDecoratedClassPropertyDefinition<T extends object>(
  target: Class<T>,
  propertyKey: PropertyKey,
  isCalledFromDecoratorRegistration?: boolean,
): EnttPropertyDefinition;
function registerDecoratedClassPropertyDefinition<T extends object>(
  target: Class<T> | ClassInstance<T>,
  propertyKey: PropertyKey,
  isCalledFromDecoratorRegistration: boolean = true,
): EnttPropertyDefinition {
  // Check if using instance of class to get definition
  if (typeof target !== 'function') {
    return registerDecoratedClassPropertyDefinition(target.constructor, propertyKey, isCalledFromDecoratorRegistration);
  }

  // Get definition for target class
  const definition = registerDecoratedClassDefinition(target, isCalledFromDecoratorRegistration);
  // Return (first register if required) property definition
  return definition.properties[propertyKey] || (definition.properties[propertyKey] = new EnttPropertyDefinition(target as Class<T>, propertyKey));
}

/**
 * Gets (and first registers if necesarry) a definition for a single EnTT decorator a class property has been decorated with
 * @param target A class (or instance of a class) carrying properties decorated with EnTT functionality
 * @param propertyKey Name of the property decorated with EnTT functionality
 * @param decoratorSymbol Unique symbol identifying EnTT decorator the property has been decorated with
 * @returns Definitions of associated EnTT functionality for the class property decorator
 */
export function getDecoratedClassPropertyDecoratorDefinition<T extends object>(
  target: ClassInstance<T>,
  propertyKey: PropertyKey,
  decoratorSymbol: symbol,
): Array<EnttDecoratorDefinition>;
export function getDecoratedClassPropertyDecoratorDefinition<T extends object>(
  target: Class<T>,
  propertyKey: PropertyKey,
  decoratorSymbol: symbol,
): Array<EnttDecoratorDefinition>;
export function getDecoratedClassPropertyDecoratorDefinition<T extends object>(
  target: Class<T> | ClassInstance<T>,
  propertyKey: PropertyKey,
  decoratorSymbol: symbol,
): Array<EnttDecoratorDefinition> {
  // Check if using instance of class to get definition
  if (typeof target !== 'function') {
    return getDecoratedClassPropertyDecoratorDefinition(target.constructor, propertyKey, decoratorSymbol);
  }

  // Initialize definitions
  const definitions: Array<EnttDecoratorDefinition> = [];
  // Collect definitions for the class and all it's inherited classes
  let current = target;
  do {
    definitions.splice(0, 0, ...registerDecoratedClassPropertyDecoratorDefinition(current, propertyKey, decoratorSymbol, false));
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
function registerDecoratedClassPropertyDecoratorDefinition<T extends object>(
  target: ClassInstance<T>,
  propertyKey: PropertyKey,
  decoratorSymbol: symbol,
  isCalledFromDecoratorRegistration?: boolean,
): Array<EnttDecoratorDefinition>;
function registerDecoratedClassPropertyDecoratorDefinition<T extends object>(
  target: Class<T>,
  propertyKey: PropertyKey,
  decoratorSymbol: symbol,
  isCalledFromDecoratorRegistration?: boolean,
): Array<EnttDecoratorDefinition>;
function registerDecoratedClassPropertyDecoratorDefinition<T extends object>(
  target: Class<T> | ClassInstance<T>,
  propertyKey: PropertyKey,
  decoratorSymbol: symbol,
  isCalledFromDecoratorRegistration: boolean = true,
): Array<EnttDecoratorDefinition> {
  // Check if using instance of class to get definition
  if (typeof target !== 'function') {
    return registerDecoratedClassPropertyDecoratorDefinition(target.constructor, propertyKey, decoratorSymbol, isCalledFromDecoratorRegistration);
  }

  // Get definition for target property
  const definition = registerDecoratedClassPropertyDefinition(target, propertyKey, isCalledFromDecoratorRegistration);

  // Only register additional decorator if being called from decorator registration function
  if (isCalledFromDecoratorRegistration) {
    // Create decorator definition
    const decorator = new EnttDecoratorDefinition(decoratorSymbol, target as Class<T>, propertyKey);
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
export function filterDefinition(definition: EnttDefinition, decoratorSymbol: symbol): EnttDefinition;
/**
 * Filters hashmap of definitions to only contain info on the filtering decorator
 * @param definition EnttPropertyDefinition hashmap to be filtered.
 * @param decoratorSymbol Unique decorator symbol signifying the decorator to filter by
 * @returns Filtered EnttPropertyDefinition hashmap. Returned EnttPropertyDefinition hashmap will only be left containin properties to which the filtering decorator
 * was applied and each EnttPropertyDefinition in the hashmap will only contain decorator definitions for the filtering decorator.
 */
export function filterDefinition(definition: Record<PropertyKey, EnttPropertyDefinition>, decoratorSymbol: symbol): Record<PropertyKey, EnttPropertyDefinition>;
/**
 * Filters a definition to only contain info on the filtering decorator
 * @param definition EnttPropertyDefinition to be filtered.
 * @param decoratorSymbol Unique decorator symbol signifying the decorator to filter by
 * @returns Filtered EnttPropertyDefinition. Returned EnttPropertyDefinition will only contain decorator definitions for the filtering decorator.
 */
export function filterDefinition(definition: EnttPropertyDefinition, decoratorSymbol: symbol): EnttPropertyDefinition;
export function filterDefinition(
  definition: EnttDefinition | Record<PropertyKey, EnttPropertyDefinition> | EnttPropertyDefinition,
  decoratorSymbol: symbol,
): EnttDefinition | Record<PropertyKey, EnttPropertyDefinition> | EnttPropertyDefinition {
  // Filter entity definition
  if (definition && definition instanceof EnttDefinition) {
    const filteredDefinition = new EnttDefinition(definition.owner);
    // Filter decorators.all
    filteredDefinition.decorators.all = definition.decorators.all.filter(d => d.decoratorSymbol === decoratorSymbol);
    // Copy decorators.bySymbol
    if (definition.decorators.bySymbol[decoratorSymbol]) {
      filteredDefinition.decorators.bySymbol[decoratorSymbol] = definition.decorators.bySymbol[decoratorSymbol].map(d => {
        const definition = new EnttDecoratorDefinition(d.decoratorSymbol, d.owner);
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
    const castDefinition = definition as Record<PropertyKey, EnttPropertyDefinition>;
    const propertyDefinitions: Record<PropertyKey, EnttPropertyDefinition> = Object.keys(definition).reduce(
      (filteredPropertyDefinitions: Record<PropertyKey, EnttPropertyDefinition>, key) => {
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
    const filteredPropertyDefinition = new EnttPropertyDefinition(definition.owner, definition.ownerPropertyKey);
    // Filter decorators.all
    filteredPropertyDefinition.decorators.all = definition.decorators.all.filter(d => d.decoratorSymbol === decoratorSymbol);
    // Copy decorators.bySymbol
    if (definition.decorators.bySymbol[decoratorSymbol]) {
      filteredPropertyDefinition.decorators.bySymbol[decoratorSymbol] = definition.decorators.bySymbol[decoratorSymbol].map(d => {
        const definition = new EnttDecoratorDefinition(d.decoratorSymbol, d.owner, d.ownerPropertyKey);
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
const validationQueueForClassesRequiringEnttification: Array<{ target: Class<object>; message: Info | Warning | Error }> = [];

/**
 * Registers a target decorated (with class or property decorators) class for verification to make sure any class using EnTT-ification dependent decorators was EnTTified
 * @param configuration Decorator configuiration
 * @param target Decorated class
 * @param key (Optional) Decorated property
 */
function registerDecoratedClassForVerification<TInstance extends object, TValOuter, TValInner, TPayload>(
  configuration:
    | CustomStaticClassDecoratorConfiguration<TPayload>
    | CustomDynamicClassDecoratorConfiguration<TInstance, TPayload>
    | CustomStaticPropertyDecoratorConfiguration<TPayload>
    | CustomDynamicPropertyDecoratorConfiguration<TInstance, TValOuter, TValInner, TPayload>,
  target: Class<TInstance>,
  key?: PropertyKey,
) {
  // If decorator requires a EnTTified model, queue up verification if the model was indeed EnTTified
  if (configuration && typeof configuration === 'object' && (configuration.onPropertyGet || configuration.onPropertySet)) {
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
export function createClassCustomDecorator<TInstance extends object>(): (target: Class<TInstance>) => void;
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
export function createClassCustomDecorator<TInstance extends object>(configuration: undefined, decoratorSymbol: symbol): (target: Class<TInstance>) => void;
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
export function createClassCustomDecorator<TInstance extends object, TPayload>(
  configuration: CustomStaticClassDecoratorConfiguration<TPayload>,
  decoratorSymbol: symbol,
): (target: Class<TInstance>) => void;
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
export function createClassCustomDecorator<TInstance extends object, TPayload>(
  configuration: CustomDynamicClassDecoratorConfiguration<TInstance, TPayload>,
  decoratorSymbol: symbol,
): (target: Class<TInstance>) => void;
/**
 * TODO: ...
 * @param configuration
 * @param decoratorSymbol
 * @returns
 */
export function createClassCustomDecorator<TInstance extends object, TPayload>(
  configuration?: CustomStaticClassDecoratorConfiguration<TPayload> | CustomDynamicClassDecoratorConfiguration<TInstance, TPayload>,
  decoratorSymbol: symbol = Symbol(),
): (target: Class<TInstance>) => void {
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
    const definitions = registerDecoratedClassDecoratorDefinition(target, decoratorSymbol);
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
      definition.implementation = new CustomClassDecoratorImplementation<TInstance>(configuration?.onPropertyGet, configuration?.onPropertySet);
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
export function createPropertyCustomDecorator<TInstance extends object>(): (target: ClassInstance<TInstance>, key: PropertyKey) => void;
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
export function createPropertyCustomDecorator<TInstance extends object>(
  configuration: undefined,
  decoratorSymbol?: symbol,
): (target: ClassInstance<TInstance>, key: PropertyKey) => void;
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
export function createPropertyCustomDecorator<TInstance extends object, TPayload>(
  configuration: CustomStaticPropertyDecoratorConfiguration<TPayload>,
  decoratorSymbol?: symbol,
): (target: ClassInstance<TInstance>, key: PropertyKey) => void;
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
export function createPropertyCustomDecorator<TInstance extends object, TPayload, TValInner = any, TValOuter = any>(
  configuration: CustomDynamicPropertyDecoratorConfiguration<TInstance, TPayload, TValInner, TValOuter>,
  decoratorSymbol?: symbol,
): (target: ClassInstance<TInstance>, key: PropertyKey) => void;
export function createPropertyCustomDecorator<TInstance extends object, TPayload, TValInner = any, TValOuter = any>(
  configuration?: CustomStaticPropertyDecoratorConfiguration<TPayload> | CustomDynamicPropertyDecoratorConfiguration<TInstance, TPayload, TValInner, TValOuter>,
  decoratorSymbol: symbol = Symbol(),
): (target: ClassInstance<TInstance>, key: PropertyKey, descriptor: PropertyDescriptor) => void {
  return <TInstanceInternal extends TInstance>(target: ClassInstance<TInstanceInternal>, key: PropertyKey, _descriptor: PropertyDescriptor) => {
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
 * Holds references to all classes that were EnTTified
 */
const enttifiedClassesByUnderlyingClass: WeakMap<Class<object>, Class<EnttInstance<object>>> = new WeakMap();
/**
 * Holds references to all instances that were EnTTified
 */
const underlyingInstancesByEnttifiedInstance: WeakMap<EnttInstance<object>, any> = new WeakMap();

/**
 * Wraps a class into a proxy which will hook into the constructor and replace the constructed instance with a proxy to
 * the instance implementing the dynamic EnTT functionality
 * @param TargetClass The class being wrapped
 * @returns A proxy to the class
 */
export function enttify<T extends ClassInstance<object>>(TargetClass: Class<T>): Class<EnttInstance<T>> {
  // Wrap a class into a proxy which will hook into the constructor and replace the constructed instance with a proxy to
  // the instance implementing the dynamic EnTT functionality
  const alreadyEnTTified = enttifiedClassesByUnderlyingClass.has(TargetClass);
  const ProxyClass = alreadyEnTTified
    ? (enttifiedClassesByUnderlyingClass.get(TargetClass) as Class<EnttInstance<T>>)
    : (new Proxy(TargetClass, {
        // Intercept constructng an instance
        construct: (_TargetClass: Class<T>, args: Array<any>): EnttInstance<T> => {
          // Run original constructor and get original instance of the class
          const target = new _TargetClass(...args);
          const handler = createProxyhandlerForEnttInstance(target);
          // Process all initially set property values
          for (const key of Object.keys(target)) {
            (target as any)[key] = handler.set?.(target, key, (target as any)[key], undefined);
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
    enttifiedClassesByUnderlyingClass.set(TargetClass.prototype.constructor, ProxyClass);
  }
  // Return proxy to the original class
  return ProxyClass;
}

/**
 * Given an EnTTified object instance, finds the underlying object instance that was EnTTified
 * @param proxy EnTTified object instance
 * @returns Underlying object instance that was EnTTified
 */
export function getUnderlyingEnttifiedInstance<T extends object>(proxy: EnttInstance<T>): ClassInstance<T> {
  return underlyingInstancesByEnttifiedInstance.get(proxy);
}

/**
 * Generates proxy handler to a newly constructed, original class instance implementing dynamic EnTT functionality
 * @param target Newly constructed, original instance being wrapped by the proxy
 * @returns Proxy handler definition
 */
function createProxyhandlerForEnttInstance<T extends object>(target: T): ProxyHandler<ClassInstance<T>> {
  return {
    /**
     * Intercepts get access to the underlyng object property
     * @param target Underlying object baing proxied
     * @param key Key of the property being accessed
     * @returns Value to be returned from the getter, having been intercepted
     */
    get: (target: ClassInstance<T>, key: PropertyKey) => {
      // Initialize getting value
      let processed = (target as any)[key];
      // Get class definition
      const classDefinition = registerDecoratedClassDefinition(target);
      // Process value through all registered getter hooks
      for (const decoratorDefinition of [...classDefinition.decorators.all].reverse()) {
        if (decoratorDefinition.implementation) {
          const decoratorImplementation = decoratorDefinition.implementation as CustomClassDecoratorImplementation<T>;
          if (decoratorImplementation.onPropertyGet) {
            processed = decoratorImplementation.onPropertyGet({ target, key, value: processed });
          }
        }
      }
      // Get property definition
      const propDefinition = registerDecoratedClassPropertyDefinition(target, key);
      // Process value through all registered getter hooks
      for (const decoratorDefinition of [...propDefinition.decorators.all].reverse()) {
        if (decoratorDefinition.implementation) {
          const decoratorImplementation = decoratorDefinition.implementation as CustomPropertyDecoratorImplementation<T, any, any>;
          if (decoratorImplementation.onPropertyGet) {
            processed = decoratorImplementation.onPropertyGet({ target, key, value: processed });
          }
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
    set: (target: ClassInstance<T>, key: PropertyKey, value: any) => {
      // Initialize setting value
      let processed = value;
      // Get property definition
      const propDefinition = registerDecoratedClassPropertyDefinition(target, key);
      // Process value through all registered setter hooks
      for (const decoratorDefinition of [...propDefinition.decorators.all]) {
        if (decoratorDefinition.implementation) {
          const decoratorImplementation = decoratorDefinition.implementation as CustomPropertyDecoratorImplementation<T, any, any>;
          if (decoratorImplementation.onPropertySet) {
            processed = decoratorImplementation.onPropertySet({ target, key, value: processed });
          }
        }
      }
      // Get class definition
      const classDefinition = registerDecoratedClassDefinition(target);
      // Process value through all registered setter hooks
      for (const decoratorDefinition of [...classDefinition.decorators.all]) {
        if (decoratorDefinition.implementation) {
          const decoratorImplementation = decoratorDefinition.implementation as CustomClassDecoratorImplementation<T>;
          if (decoratorImplementation.onPropertySet) {
            processed = decoratorImplementation.onPropertySet({ target, key, value: processed });
          }
        }
      }
      // Set and return processed value
      return ((target as any)[key] = processed);
    },
  };
}

// #endregion
