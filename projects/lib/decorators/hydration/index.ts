// enTT HYDRATION decorators and services
// ----------------------------------------------------------------------------

// Import dependencies
import { Class, ClassInstance, EnttPropertyDefinition } from '../../lib';
import { deepCloneObject } from '../../utils';
import { createPropertyCustomDecorator, getDecoratedClassDefinition, filterDefinition } from '../../lib';

// #region Utility types

/**
 * A raw object containing the same properties as class instance of type T
 */
export type DehydratedInstance = Record<PropertyKey, any>;

// #endregion

// #region Hydration @bind decorator

/**
 * Hydration binding decorator configuration definition
 */
export type HydrationBindingConfiguration<TValRehydrated, TValDehydrated> = {
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
    dehydrate: (v: TValRehydrated) => TValDehydrated;
    /**
     * Converts the dehydrated value of the decorated property into the (re)hydrated value
     * @param v Dehydrated value of the decorated property
     * @returns (Re)Hydrated value of the decorated property
     */
    rehydrate: (v: TValDehydrated) => TValRehydrated;
  };
};

// Unique identifier symbol identifying the Hydratable binding decorator
const hydrationBindingDecoratorSymbol = Symbol('Hydration binding property decorator');
/**
 * When dehydrating/rehydrating a class instance, this property decorator configures the property as needing to be
 * dehydrated/(re)hydrated from/to a propertyx of the same name without any value conversion.
 * @returns Property decorator
 */
export function bind<TInstance extends object, TValRehydrated, TValDehydrated>(): (target: ClassInstance<TInstance>, key: PropertyKey) => void;
/**
 * When dehydrating/rehydrating a class instance, this property decorator configures the target name of the dehydraeted property
 * this property needs to be dehydrated/(re)hydrated to/from without any value conversion.
 * @param config Name of the dehydrated property this property needs to be dehydrated/(re)hydrated to/from.
 * @returns Property decorator
 */
export function bind<TInstance extends object, TValRehydrated, TValDehydrated>(config: string): (target: ClassInstance<TInstance>, key: PropertyKey) => void;
/**
 * When dehydrating/rehydrating a class instance, this property decorator configures the target name of the dehydraeted property
 * this property needs to be dehydrated/(re)hydrated to/from and defines callback functions handling data conversion in either direction.
 * @param config (Optional) Configuration object defining the dehydrated property this property needs to be dehydrated/(re)hydrated to/from.
 * and callback functions handling data conversion in either direction.
 * @returns Property decorator
 */
export function bind<TInstance extends object, TValRehydrated, TValDehydrated>(
  config: HydrationBindingConfiguration<TValRehydrated, TValDehydrated>,
): (target: ClassInstance<TInstance>, key: PropertyKey) => void;
export function bind<TInstance extends object, TValRehydrated, TValDehydrated>(
  config?: string | HydrationBindingConfiguration<TValRehydrated, TValDehydrated>,
): (target: ClassInstance<TInstance>, key: PropertyKey) => void {
  // Conpose full configuration object
  let composedConfig: HydrationBindingConfiguration<TValRehydrated, TValDehydrated>;
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
  return createPropertyCustomDecorator<TInstance, HydrationBindingConfiguration<TValRehydrated, TValDehydrated>>(
    () => composedConfig,
    hydrationBindingDecoratorSymbol,
  );
}

// #endregion

// #region Hydration @cast decorator

/**
 * Casting structure (single instance | array of instances | hashmap of instances)
 */
export enum CastAs {
  SingleInstance = 'SingleInstance',
  ArrayOfInstances = 'ArrayOfInstances',
  HashmapOfInstances = 'HAshmapOfInstances',
}

/**
 * Hydration casting decorator configuration definition
 */
export type HydrationCastingConfiguration<T, TCastAs extends CastAs = CastAs> = {
  /**
   * Entity class being cast to
   */
  targetEnttType: Class<T>;
  /**
   * Structure being cast
   */
  targetStructure: TCastAs;
  /**
   * Strict
   */
  strict:
    | boolean
    | {
        dehydrate: boolean;
        rehydrate: boolean;
      };
};

// Unique identifier symbol identifying the Hydratable casting decorator
const hydrationCastingDecoratorSymbol = Symbol('Hydration casting property decorator');
/**
 * When rehydrating a class instance, this property decorator configures how the property value will be cast before storing it
 * @param targetEnttType Class to be cast into when hydrating
 * @param targetStructure (Optional) Structure to the data should be interpreted as before casting (single instance | array of instances | hashmap of instances)
 * @param strict (Optional) If strict mode needs to be used (always, or per hydration/rehydration only)
 * @returns Property decorator
 */
export function cast<TInstance extends object>(
  targetEnttType: Class<TInstance>,
  targetStructure: CastAs = CastAs.SingleInstance,
  strict:
    | boolean
    | {
        dehydrate: boolean;
        rehydrate: boolean;
      } = true,
): (target: ClassInstance<TInstance>, key: PropertyKey) => void {
  // Create and return decorator
  return createPropertyCustomDecorator<TInstance, HydrationCastingConfiguration<TInstance>>(
    () => ({ targetEnttType, targetStructure, strict }),
    hydrationCastingDecoratorSymbol,
  );
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
): DehydratedInstance {
  return dehydrateAsInstanceOfClass(instance, instance, strategy);
}

/**
 * Dehydrates an object treating it as an instance of a class taking into account configuration provided via @bind and @cast decorators
 * @param value Object to be dehydrated
 * @param instance Instance of a class or class decorated with @bind and @cast decorators, used to dehydrate the provided object
 * @param strategy Hydration strategy to use when choosing which properties to dehydrate
 * @returns A dehydrated objet
 */
function dehydrateAsInstanceOfClass<TValue extends object, TInstance extends object>(
  value: TValue,
  instance: Class<TInstance> | ClassInstance<TInstance>,
  strategy: HydrationStrategy = HydrationStrategy.OnlyBoundClassProperties,
): DehydratedInstance {
  // Ready an empty raw object to dehydrate into
  const dehydrated: DehydratedInstance = {};

  // Collect property names to use for dehydration
  const hydratingPropertiesDefinitions = collectHydratingPropertyDecoratorDefinitions(instance, strategy);

  // Copy (and process if needed) all values for all the properties being dehydrated
  for (const key of Object.keys(hydratingPropertiesDefinitions) as Array<keyof TInstance>) {
    // Check if property exists on dehydrating object
    if (!value.hasOwnProperty(key)) {
      continue;
    }
    // Get property definition
    const definition = hydratingPropertiesDefinitions[key];
    // If no definition for the property, assume defaults and copy unprocessed value to same property name
    if (!definition) {
      dehydrated[key] = deepCloneObject((value as unknown as TInstance)[key]);
    }
    // If definition for the property found, use defined dehydrated property name and processing callbacks to convert and set value
    else {
      // Resolve bound property name on the dehydrated target object
      const targetPropertyName = definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data?.propertyName || key;
      // Get value to be dehydrated
      const propertyValue = (value as unknown as TInstance)[key];
      // Uncast the value to be dehydrated
      const uncastValue = uncast(propertyValue as any, definition.decorators.bySymbol[hydrationCastingDecoratorSymbol]?.[0]?.data);
      // Use unprocessed value (uncast if needed)
      if (!definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data?.conversion?.dehydrate) {
        dehydrated[targetPropertyName] = uncastValue;
      }
      // Process value (uncast if needed)
      else {
        try {
          dehydrated[targetPropertyName] = definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data?.conversion?.dehydrate(uncastValue);
        } catch (err: any) {
          throw new Error(
            `Error thrown while calling the provided @bind(conversion.dehydrate) callback function on Class ${
              value.constructor.name
            }'s ${key.toString()} property: ${err?.message}`,
          );
        }
      }
    }
  }

  // Return dehydrated object
  return dehydrated;
}

/**
 * Uncasting a value with no casting definintion will keep the value unchanged
 * @param value Value to uncast
 * @returns Uncast value
 */
function uncast(value: any): any;
/**
 * Uncasting a value accorfing to casting definition for a single instance cast will uncast as a single object
 * @param value Value to uncast
 * @param castDefinition Casting definition to apply when uncasting
 * @param strategy Hydration strategy to use when choosing which properties to dehydrate
 * @returns Uncast value
 */
function uncast<TValue extends ClassInstance<object>, TUncast extends object>(
  value: TValue,
  castDefinition: HydrationCastingConfiguration<TUncast, CastAs.SingleInstance>,
  strategy?: HydrationStrategy,
): TUncast;
/**
 * Uncasting a value accorfing to casting definition for a instance array cast will uncast as an array of objects
 * @param value Object to uncast
 * @param castDefinition Casting definition to apply when uncasting
 * @param strategy Hydration strategy to use when choosing which properties to dehydrate
 * @returns Attay of uncast values value
 */
function uncast<TValue extends ClassInstance<object>, TValueArray extends Array<TValue>, TUncast extends object>(
  value: TValueArray,
  castDefinition: HydrationCastingConfiguration<TUncast, CastAs.ArrayOfInstances>,
  strategy?: HydrationStrategy,
): Array<TUncast>;
/**
 * Uncasting a value accorfing to casting definition for a instance hashmap cast will uncast as a hashmap of objects
 * @param value Array of objects to uncast
 * @param castDefinition Casting definition to apply when uncasting
 * @param strategy Hydration strategy to use when choosing which properties to dehydrate
 * @returns Hashmap of uncast values
 */
function uncast<TValue extends ClassInstance<object>, TValueRecord extends Record<PropertyKey, TValue>, TUncast extends object>(
  value: TValueRecord,
  castDefinition: HydrationCastingConfiguration<TUncast, CastAs.HashmapOfInstances>,
  strategy?: HydrationStrategy,
): Record<keyof TValueRecord, TUncast>;
/**
 * TODO: ...
 * @param value Hashmap of objeczs to uncast
 * @param castDefinition Casting definition to apply when uncasting
 * @param strategy Hydration strategy to use when choosing which properties to dehydrate
 * @returns Uncast value
 */
function uncast<
  TValue extends ClassInstance<object>,
  TValueArray extends Array<TValue>,
  TValueRecord extends Record<PropertyKey, TValue>,
  TUncast extends object,
>(
  value: any | TValue | TValueArray | TValueRecord,
  castDefinition?: HydrationCastingConfiguration<TUncast>,
  strategy: HydrationStrategy = HydrationStrategy.OnlyBoundClassProperties,
): any | TUncast | Array<TUncast> | Record<keyof TValueRecord, TUncast> {
  // If no cast definition, return unchanged
  if (!castDefinition) {
    return value;
  }

  // If cast defined as a cast to single instance
  else if (castDefinition.targetStructure === CastAs.SingleInstance) {
    // If value being cast is compatible with the cast
    if (value instanceof castDefinition.targetEnttType) {
      // Uncast by dehydrating an instance of expected class
      return dehydrateAsInstanceOfClass(value, castDefinition.targetEnttType, strategy);
    }
    // If value being cast is incompatible and cast is being performed in strict mode
    else if (castDefinition.strict === true || (castDefinition.strict instanceof Object && castDefinition.strict?.dehydrate === true)) {
      // Throw error for trying a strict mode cast of unexpected value
      throw new Error(
        `Failed uncasting value. In strict mode the value being uncast needs to be an instance of the class specified as the @cast target class!`,
      );
    }
    // If value being cast is incompatible, but cast-able and cast is being performed in non-strict mode
    else if (
      value instanceof Object &&
      (castDefinition.strict === false || (castDefinition.strict instanceof Object && castDefinition.strict?.dehydrate === false))
    ) {
      // Uncast by dehydrating an instance of an unexpected class
      return dehydrateAsInstanceOfClass(value, castDefinition.targetEnttType, strategy);
    }
    // If value being cast is incompatible, and is not cast-able and cast is being performed in non-strict mode
    else if (
      !(value instanceof Object) &&
      (castDefinition.strict === false || (castDefinition.strict instanceof Object && castDefinition.strict?.dehydrate === false))
    ) {
      // Uncast as undefined
      return undefined;
    }
  }

  // If cast defined as a cast to array of instances
  else if (castDefinition.targetStructure === CastAs.ArrayOfInstances) {
    // If value being cast is compatible with the cast
    if (value instanceof Array) {
      // Uncast each member of the array
      return value.map(value => uncast(value, { ...castDefinition, targetStructure: CastAs.SingleInstance }, strategy)) as Array<TUncast>;
    }
    // If value being cast is incompatible and cast is being performed in strict mode
    else if (castDefinition.strict === true || (castDefinition.strict instanceof Object && castDefinition.strict?.dehydrate === true)) {
      // Throw error for trying a strict mode cast of unexpected value
      throw new Error(
        `Failed uncasting value. In strict mode the value being uncast needs to be an instance of the class specified as the @cast target class!`,
      );
    }
    // If value being cast is incompatible and cast is being performed in non-strict mode
    else if (castDefinition.strict === false || (castDefinition.strict instanceof Object && castDefinition.strict?.dehydrate === false)) {
      // Uncast as an empty array
      return [];
    }
  }

  // If cast defined as a cast to hashmap of instances
  else if (castDefinition.targetStructure === CastAs.HashmapOfInstances) {
    // If value being cast is compatible with the cast
    if (value instanceof Object) {
      // Uncast each member of the hashmap
      return (Object.keys(value) as Array<keyof TValue>).reduce((result: Record<keyof TValue, TUncast>, key) => {
        result[key] = uncast(value[key], { ...castDefinition, targetStructure: CastAs.SingleInstance }, strategy) as TUncast;
        return result;
      }, {} as Record<keyof TValue, TUncast>);
    }
    // If value being cast is incompatible and cast is being performed in strict mode
    else if (castDefinition.strict === true || (castDefinition.strict instanceof Object && castDefinition.strict?.dehydrate === true)) {
      // Throw error for trying a strict mode cast of unexpected value
      throw new Error(
        `Failed uncasting value. In strict mode the value being uncast needs to be an instance of the class specified as the @cast target class!`,
      );
    }
    // If value being cast is incompatible and cast is being performed in non-strict mode
    else if (castDefinition.strict === false || (castDefinition.strict instanceof Object && castDefinition.strict?.dehydrate === false)) {
      // Uncast as an empty hashmap
      return {} as Record<keyof TValue, TUncast>;
    }
  }

  // It should be impossible to receive a casting definition without a known CastAs value
  throw new Error(`Failed uncasting value. The provided casting definition's target structure is unknown: "${castDefinition.targetStructure}"!`);
}

/**
 * (Re)Hydrates an instance of a class taking into account configuration provided via @bind and @cast decorators
 * @param obj An object to (re)hydrate data from
 * @param instance EnTT class or class instance to hydrate with provided data
 * @param strategy Hydration strategy to use when choosing which properties to (re)hydrate
 * @returns Hydrated EnTT class instance hydrated from provided data
 */
export function rehydrate<TInstance extends object>(
  obj: DehydratedInstance,
  instance: Class<TInstance> | ClassInstance<TInstance>,
  strategy: HydrationStrategy = HydrationStrategy.OnlyBoundClassProperties,
): TInstance {
  // Check if using instance of class to rehydrate
  if (typeof instance === 'function') {
    return rehydrate(obj, new (instance as Class<TInstance>)(), strategy);
  }

  // Collect property names to use for (re)hydration
  const hydratingPropertiesDefinitions = collectHydratingPropertyDecoratorDefinitions(instance, strategy);

  // Copy (and process if needed) all values for all the properties being dehydrated
  for (const key of Object.keys(hydratingPropertiesDefinitions) as Array<keyof TInstance>) {
    const definition = hydratingPropertiesDefinitions[key];
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
            `Error thrown while calling the provided @bind(conversion.rehydrate) callback function on Class ${
              instance.constructor.name
            }'s ${key.toString()} property: ${err?.message}`,
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
 * @param strategy Strategy to use when selecting properties to participate in hydration
 * @returns Array of property names that should participate in the hydration process
 */
function collectHydratingPropertyDecoratorDefinitions<TInstance extends object>(
  instance: Class<TInstance> | ClassInstance<TInstance>,
  strategy: HydrationStrategy,
): Record<keyof TInstance, false | EnttPropertyDefinition> {
  // Get instance's class's decorator definitions
  const allDecoratedPropertiesDefinitions = getDecoratedClassDefinition(instance);
  const onlyBoundPropertiesDefinitions = filterDefinition(allDecoratedPropertiesDefinitions, hydrationBindingDecoratorSymbol);
  const allPropertiesKeys = Object.keys(instance);

  // Collect property definitions depending on the selected strategy
  const properties: Record<PropertyKey, false | EnttPropertyDefinition> = {};
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
      properties[key] = allDecoratedPropertiesDefinitions.properties[key];
    }
  }

  // Return collected property definitions
  return properties;
}

// #endregion
