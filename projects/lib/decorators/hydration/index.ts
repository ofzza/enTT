// enTT HYDRATION decorators and services
// ----------------------------------------------------------------------------

// Import dependencies
import { Class, ClassInstance, PropertyName, EnttPropertyDefinition } from '../../lib';
import { deepCloneObject } from '../../utils';
import { createPropertyCustomDecorator, getDecoratedClassDefinition, filterDefinition } from '../../lib';

// #region Utility types

/**
 * A raw object containing the same properties as class instance of type T
 */
export type DehydratedInstance<T> = Record<PropertyName, any>;

// #endregion

// #region Hydration @bind decorator

/**
 * Hydration binding decorator configuration definition
 */
export type HydrationBindingConfiguration<TValInner, TValOuter> = {
  /**
   * Name of the dehydrated object's property the decorated property loads/stores data to when dehydrating/(re)hydrating
   */
  propertyName?: string;
  /**
   * Conversion functions used to transform the property value when dehydrating/(re)hydrating
   */
  conversion?: {
    /**
     * Converts the (re)hydrated value of the decorated property into the dehydrated value
     * @param v (Re)Hydrated value of the decorated property
     * @returns Dehydrated value of the decorated property
     */
    dehydrate: (v: TValOuter) => TValInner;
    /**
     * Converts the dehydrated value of the decorated property into the (re)hydrated value
     * @param v Dehydrated value of the decorated property
     * @returns (Re)Hydrated value of the decorated property
     */
    rehydrate: (v: TValInner) => TValOuter;
  };
};

// Unique identifier symbol identifying the Hydratable binding decorator
const hydrationBindingDecoratorSymbol = Symbol('Hydration binding property decorator');
/**
 * When dehydrating/rehydrating a class instance, this property decorator configures the property as needing to be
 * dehydrated/(re)hydrated from/to a propertyx of the same name without any value conversion.
 * @returns Property decorator
 */
export function bind<TInstance extends object, TValInner, TValOuter>(): (target: ClassInstance<TInstance>, key: PropertyName) => void;
/**
 * When dehydrating/rehydrating a class instance, this property decorator configures the target name of the dehydraeted property
 * this property needs to be dehydrated/(re)hydrated to/from without any value conversion.
 * @param config Name of the dehydrated property this property needs to be dehydrated/(re)hydrated to/from.
 * @returns Property decorator
 */
export function bind<TInstance extends object, TValInner, TValOuter>(config: string): (target: ClassInstance<TInstance>, key: PropertyName) => void;
/**
 * When dehydrating/rehydrating a class instance, this property decorator configures the target name of the dehydraeted property
 * this property needs to be dehydrated/(re)hydrated to/from and defines callback functions handling data conversion in either direction.
 * @param config (Optional) Configuration object defining the dehydrated property this property needs to be dehydrated/(re)hydrated to/from.
 * and callback functions handling data conversion in either direction.
 * @returns Property decorator
 */
export function bind<TInstance extends object, TValInner, TValOuter>(
  config: HydrationBindingConfiguration<TValInner, TValOuter>,
): (target: ClassInstance<TInstance>, key: PropertyName) => void;
export function bind<TInstance extends object, TValInner, TValOuter>(
  config?: string | HydrationBindingConfiguration<TValInner, TValOuter>,
): (target: ClassInstance<TInstance>, key: PropertyName) => void {
  // Conpose full configuration object
  let composedConfig: HydrationBindingConfiguration<TValInner, TValOuter>;
  // If full configuration provided, use as is
  if (config instanceof Object) {
    composedConfig = config;
  }
  // If config provided as string, wrap in a proper configuration
  else if (typeof config === 'string') {
    composedConfig = { propertyName: config };
  }
  // If no config provided, use empty configuration
  else {
    composedConfig = {};
  }

  // Create and return decorator
  return createPropertyCustomDecorator<TInstance>(() => composedConfig, hydrationBindingDecoratorSymbol);
}

// #endregion

// #region Hydration @cast decorator

/**
 * Hydration casting decorator configuration definition
 */
export type HydrationCastingConfiguration = any;

// Unique identifier symbol identifying the Hydratable casting decorator
const hydrationCastingDecoratorSymbol = Symbol('Hydration casting property decorator');
/**
 * When rehydrating a class instance, this property decorator configures TODO: ...
 * @param config (Optional)  TODO: ...
 * @returns Property decorator
 */
export function cast<TInstance extends object>(config: HydrationCastingConfiguration): (target: ClassInstance<TInstance>, key: PropertyName) => void {
  // Create and return decorator
  return createPropertyCustomDecorator<TInstance>(() => config, hydrationCastingDecoratorSymbol);
}

// #endregion

// #region Hydration services

/**
 * Enumerated strategies available to be used when dehydrating/(re)hydrating an object
 */
export enum HydrationStrategy {
  /**
   * Only properties decorated with the @bind decorator will be processed
   */
  OnlyBoundClassProperties = 'OnlyBoundProperties',
  /**
   * All properties decorated with any EnTT decorators will be processed
   */
  AllDecoratedClassProperties = 'AllDecoratedProperties',
  /**
   * All properties found on a fresh instance of the class being dehydrated/(re)hydrated will be processed
   */
  AllClassProperties = 'AllClassProperties',
}

/**
 * Dehydrates an instance of a class taking into account configuration provided via @bind and @cast decorators
 * @param instance Instance of an EnTT class to be dehydrated
 * @param strategy Hydration strategy to use when choosing which properties to dehydrate
 * @returns A dehydrated objet
 */
export function dehydrate<TInstance extends object>(
  instance: ClassInstance<TInstance>,
  strategy: HydrationStrategy = HydrationStrategy.OnlyBoundClassProperties,
): DehydratedInstance<TInstance> {
  // Ready an empty raw object to dehydrate into
  const obj: DehydratedInstance<TInstance> = {};

  // Collect property names to use for dehydration
  const hydratingPropertiesDefnitions = collectHydratingPropertyDecoratorDefinitions(instance, obj, strategy);

  // Copy (and process if needed) all values for all the properties being dehydrated
  for (const key of Object.keys(hydratingPropertiesDefnitions)) {
    const definition = hydratingPropertiesDefnitions[key];
    // If no definition for the property, assume defaults and copy unprocessed value to same property name
    if (!definition) {
      obj[key] = deepCloneObject(instance[key as keyof TInstance]);
    }
    // If definition for the property found, use defined dehydrated property name and processing callbacks to convert and set value
    else {
      const targetPropertyName = definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data?.propertyName || key;
      const clonedValue = deepCloneObject(instance[key as keyof TInstance]);
      // Use unprocessed value
      if (!definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data?.conversion?.dehydrate) {
        obj[targetPropertyName] = clonedValue;
      }
      // Process value
      else {
        try {
          obj[targetPropertyName] = definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data?.conversion?.dehydrate(clonedValue);
        } catch (err: any) {
          throw new Error(
            `Error thrown while calling the provided @bind(conversion.dehydrate) callback function on Class ${instance.constructor.name}'s ${key} property: ${err?.message}`,
          );
        }
      }
    }
  }

  // Return dehydrated object
  return obj;
}

/**
 * (Re)Hydrates an instance of a class taking into account configuration provided via @bind and @cast decorators
 * @param obj An object to (re)hydrate data from
 * @param instance EnTT class or class instance to hydrate with provided data
 * @param strategy Hydration strategy to use when choosing which properties to (re)hydrate
 * @returns Hydrated EnTT class instance hydrated from provided data
 */
export function rehydrate<TInstance extends object>(
  obj: DehydratedInstance<TInstance>,
  instance: Class<TInstance> | ClassInstance<TInstance>,
  strategy: HydrationStrategy = HydrationStrategy.OnlyBoundClassProperties,
): TInstance {
  // Check if using instance of class to rehydrate
  if (typeof instance === 'function') {
    return rehydrate(obj, new (instance as Class<TInstance>)(), strategy);
  }

  // Collect property names to use for (re)hydration
  const hydratingPropertiesDefnitions = collectHydratingPropertyDecoratorDefinitions(instance, obj, strategy);

  // Copy (and process if needed) all values for all the properties being dehydrated
  for (const key of Object.keys(hydratingPropertiesDefnitions)) {
    const definition = hydratingPropertiesDefnitions[key];
    // If no definition for the property, assume defaults and copy unprocessed value to same property name
    if (!definition) {
      instance[key as keyof TInstance] = deepCloneObject(obj[key]);
    }
    // If definition for the property found, use defined dehydrated property name and processing callbacks to convert and set value
    else {
      const targetPropertyName = definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data?.propertyName || key;
      const clonedValue = deepCloneObject(obj[targetPropertyName]);
      // Use unprocessed value
      if (!definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data?.conversion?.rehydrate) {
        instance[key as keyof TInstance] = clonedValue;
      }
      // Process value
      else {
        try {
          instance[key as keyof TInstance] = definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data?.conversion?.rehydrate(clonedValue);
        } catch (err: any) {
          throw new Error(
            `Error thrown while calling the provided @bind(conversion.rehydrate) callback function on Class ${instance.constructor.name}'s ${key} property: ${err?.message}`,
          );
        }
      }
    }
  }

  // Return (re)hydrated instance
  return instance;
}

/**
 * Collects property names for properties which should be dehydrated/(re)hydrated based on the source and target of hydration
 * and the strategy chosed
 * @param instance (Re)Hydrated class instance
 * @param obj Dehydrated object
 * @param strategy Strategy to use when selecting properties to participate in hydration
 * @returns Array of property names that should participate in the hydration process
 */
function collectHydratingPropertyDecoratorDefinitions<TInstance extends object>(
  instance: ClassInstance<TInstance>,
  obj: DehydratedInstance<TInstance>,
  strategy: HydrationStrategy,
): Record<PropertyName, false | EnttPropertyDefinition> {
  // Get instance's class's decorator definitions
  const allDecoratedPropertiesDefinitions = getDecoratedClassDefinition(instance);
  const onlyBoundPropertiesDefinitions = filterDefinition(allDecoratedPropertiesDefinitions, hydrationBindingDecoratorSymbol);
  const allPropertiesKeys = Object.keys(instance);

  // Collect property definitions depending on the selected strategy
  const properties: Record<PropertyName, false | EnttPropertyDefinition> = {};
  if (strategy === HydrationStrategy.AllClassProperties) {
    for (const key of allPropertiesKeys) {
      properties[key] = allDecoratedPropertiesDefinitions.properties[key] || false;
    }
  } else if (strategy === HydrationStrategy.AllDecoratedClassProperties) {
    for (const key of Object.keys(allDecoratedPropertiesDefinitions.properties)) {
      properties[key] = allDecoratedPropertiesDefinitions.properties[key];
    }
  } else if (strategy === HydrationStrategy.OnlyBoundClassProperties) {
    for (const key of Object.keys(onlyBoundPropertiesDefinitions.properties)) {
      properties[key] = onlyBoundPropertiesDefinitions.properties[key];
    }
  }

  // Return collected property definitions
  return properties;
}

// #endregion
