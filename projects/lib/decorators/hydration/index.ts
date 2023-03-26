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
export type DehydratedInstance<T> = Record<PropertyKey, any>;

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
  /**
   * Single instance of casting target class
   */
  SingleInstance = 'SingleInstance',
  /**
   * Array of instancea of casting target class
   */
  ArrayOfInstances = 'ArrayOfInstances',
  /**
   * Hashmap of instances of casting target class
   */
  HashmapOfInstances = 'HashmapOfInstances',
}

/**
 * Rules for casting undefined values
 */
export enum CastUndefined {
  /**
   * Properties with undefined values will be explicitly set as undefined
   */
  Preserve = 'Preserve',
  /**
   * Properties with undefined values will be left out of dehydration and (re)hydration, keeping values set by other means
   */
  Skip = 'Skip',
  /**
   * Properties with undefined values will have their values coersed into defaut casting targets
   * - For CastAs.SingleInstance:     new()
   * - For CastAs.ArrayOfInstances:   []: Array<new()>
   * - For CastAs.HashmapOfInstances: {}: Record<PropertyKey, new()>
   */
  CoerseIntoCastingDefault = 'CoerseIntoCastingDefault',
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
   * Hydration options controling fine tuning of the hydration process
   */
  options: HydrationCastingConfigurationOptions;
};
/**
 * Hydration casting decorator configuration options definition
 */
export type HydrationCastingConfigurationOptions = {
  /**
   * Strictness, in strict mode only instances of expected class will be allowed to be dehydrated and only objects will be attempted to be (re)hydrated
   */
  strict: HydrationCastingConfigurationStrictness;
};
/**
 * Hydration casting decorator configuration options definition
 */
export type HydrationCastingConfigurationStrictness =
  | boolean
  | {
      dehydrate: boolean;
      rehydrate: boolean;
    };
/**
 * Default hydration casting decorator configuration options
 */
const hydrationCastingConfigurationOptionsDefaults: HydrationCastingConfigurationOptions = { strict: true };

/**
 * Hydration casting decorator configuration options definition
 */
export type HydrationCastingExecutionOptions = {
  /**
   * Strictness, in strict mode only instances of expected class (and undefined) will be allowed to be dehydrated
   * and only objects (and undefined) will be attempted to be (re)hydrated; everything else will throw an error.
   * Outside of strict mode, objects that are not instances of expected class can also be dehydrated.
   */
  strict?: boolean;
  /**
   * Rules for handling undefined values when casting during dehydration or (re)hydration
   */
  undefined?: CastUndefined;
};
/**
 * Default hydration casting decorator configuration options
 */
const hydrationCastingExecutionOptionsDefaults: HydrationCastingExecutionOptions = { undefined: CastUndefined.Preserve };

// Unique identifier symbol identifying the Hydratable casting decorator
const hydrationCastingDecoratorSymbol = Symbol('Hydration casting property decorator');
/**
 * When rehydrating a class instance, this property decorator configures how the property value will be cast before storing it
 * @param targetEnttType Class to be cast into when hydrating
 * @param targetStructure (Optional) Structure to the data should be interpreted as before casting (single instance | array of instances | hashmap of instances)
 * @param options (Optional) Hydration options controling fine tuning of the hydration process
 * @returns Property decorator
 */
export function cast<TInstance extends object>(
  targetEnttType: Class<TInstance>,
  targetStructure: CastAs = CastAs.SingleInstance,
  options?: HydrationCastingConfigurationOptions,
): (target: ClassInstance<TInstance>, key: PropertyKey) => void {
  // Create and return decorator
  return createPropertyCustomDecorator<TInstance, HydrationCastingConfiguration<TInstance>>(
    () => ({ targetEnttType, targetStructure, options: { ...hydrationCastingConfigurationOptionsDefaults, ...options } }),
    hydrationCastingDecoratorSymbol,
  );
}

// #endregion

// #region Hydration services: Dehydrate service

/**
 * Dehydrates an instance of a class taking into account configuration provided via @bind and @cast decorators
 * @param instance Instance of an EnTT class to be dehydrated
 * @param strategy Hydration strategy to use when choosing which properties to dehydrate
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns A dehydrated objet
 */
export function dehydrate<TInstance extends object>(
  instance: ClassInstance<TInstance>,
  strategy: HydrationStrategy = HydrationStrategy.OnlyBoundClassProperties,
  options?: HydrationCastingExecutionOptions,
): DehydratedInstance<TInstance> {
  return dehydrateAsInstanceOfClass(instance, instance, strategy, { ...hydrationCastingExecutionOptionsDefaults, ...options });
}

/**
 * Dehydrates an object treating it as an instance of a class taking into account configuration provided via @bind and @cast decorators
 * @param value Object to be dehydrated
 * @param instance Instance of a class or class decorated with @bind and @cast decorators, used to dehydrate the provided object
 * @param strategy Hydration strategy to use when choosing which properties to dehydrate
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns A dehydrated objet
 */
function dehydrateAsInstanceOfClass<TValue extends object, TInstance extends object>(
  value: TValue,
  instance: ClassInstance<TInstance>,
  strategy: HydrationStrategy = HydrationStrategy.OnlyBoundClassProperties,
  options?: HydrationCastingExecutionOptions,
): DehydratedInstance<TInstance> {
  // Ready an empty raw object to dehydrate into
  const dehydrated: DehydratedInstance<TInstance> = {};

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
      const targetPropertyName =
        (definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data as HydrationBindingConfiguration<unknown, unknown>)?.propertyName || key;
      // Get value to be dehydrated
      const propertyValue = (value as unknown as TInstance)[key];
      // Uncast the value to be dehydrated
      const castingDefinition = definition.decorators.bySymbol[hydrationCastingDecoratorSymbol]?.[0]?.data;
      const uncastValue = !castingDefinition ? propertyValue : uncast(propertyValue as any, castingDefinition, strategy, options);
      // Use unprocessed value (uncast if needed)
      if (!definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data?.conversion?.dehydrate) {
        dehydrated[targetPropertyName] = uncastValue;
      }
      // ... or process value via provided custom, dehydration callback (uncast if needed)
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
 * Uncasting an undefined value will use behavior defined by the "undefined" option
 * @param value Value to uncast
 * @param castDefinition Casting definition to apply when uncasting
 * @param strategy Hydration strategy to use when choosing which properties to dehydrate
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Uncast value
 */
function uncast<TValue extends ClassInstance<object>, TUncast extends object>(
  value: undefined,
  castDefinition: HydrationCastingConfiguration<TUncast, CastAs>,
  strategy?: HydrationStrategy,
  options?: HydrationCastingExecutionOptions,
): undefined; // TODO: infer "undefined" handling and only then set return type as undefined
/**
 * Uncasting a value according to casting definition for a single instance cast will uncast as a single object
 * @param value Value to uncast
 * @param castDefinition Casting definition to apply when uncasting
 * @param strategy Hydration strategy to use when choosing which properties to dehydrate
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Uncast value
 */
function uncast<TValue extends ClassInstance<object>, TUncast extends object>(
  value: TValue,
  castDefinition: HydrationCastingConfiguration<TUncast, CastAs.SingleInstance>,
  strategy?: HydrationStrategy,
  options?: HydrationCastingExecutionOptions,
): TUncast;
/**
 * Uncasting a value according to casting definition for a instance array cast will uncast as an array of objects
 * @param value Array of instances to uncast
 * @param castDefinition Casting definition to apply when uncasting
 * @param strategy Hydration strategy to use when choosing which properties to dehydrate
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Attay of uncast values
 */
function uncast<TValue extends ClassInstance<object>, TValueArray extends Array<TValue>, TUncast extends object>(
  value: TValueArray,
  castDefinition: HydrationCastingConfiguration<TUncast, CastAs.ArrayOfInstances>,
  strategy?: HydrationStrategy,
  options?: HydrationCastingExecutionOptions,
): Array<TUncast>;
/**
 * Uncasting a value according to casting definition for a instance hashmap cast will uncast as a hashmap of objects
 * @param value Hashmap of instances to uncast
 * @param castDefinition Casting definition to apply when uncasting
 * @param strategy Hydration strategy to use when choosing which properties to dehydrate
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Hashmap of uncast values
 */
function uncast<TValue extends ClassInstance<object>, TValueRecord extends Record<PropertyKey, TValue>, TUncast extends object>(
  value: TValueRecord,
  castDefinition: HydrationCastingConfiguration<TUncast, CastAs.HashmapOfInstances>,
  strategy?: HydrationStrategy,
  options?: HydrationCastingExecutionOptions,
): Record<keyof TValueRecord, TUncast>;
/**
 * Uncasting a value according to casting definition
 * @param value Instance, array of instances or a hashmap of instances to uncast
 * @param castDefinition Casting definition to apply when uncasting
 * @param strategy Hydration strategy to use when choosing which properties to dehydrate
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Uncast instance, array of instances of hashmap of instances
 */
function uncast<
  TValue extends ClassInstance<object>,
  TValueArray extends Array<TValue>,
  TValueRecord extends Record<PropertyKey, TValue>,
  TUncast extends object,
>(
  value: undefined | TValue | TValueArray | TValueRecord,
  castDefinition: HydrationCastingConfiguration<TUncast>,
  strategy: HydrationStrategy = HydrationStrategy.OnlyBoundClassProperties,
  options?: HydrationCastingExecutionOptions,
): undefined | TUncast | Array<TUncast> | Record<keyof TValueRecord, TUncast> {
  // Check if preserving an undefined value and if so leave it as undefined
  if (options?.undefined === CastUndefined.Preserve && value === undefined) {
    return undefined;
  }

  // Determine strictess mode
  const strict =
    options?.strict !== undefined
      ? !!options?.strict
      : castDefinition.options.strict === true || (castDefinition.options.strict instanceof Object && castDefinition.options.strict?.dehydrate === true);

  // If cast defined as a cast to single instance
  if (castDefinition.targetStructure === CastAs.SingleInstance) {
    // If value being cast is compatible with the cast
    if (value instanceof castDefinition.targetEnttType) {
      // Uncast by dehydrating an instance of expected class
      return dehydrateAsInstanceOfClass(value, castDefinition.targetEnttType, strategy, options);
    }
    // If value being cast is incompatible and cast is being performed in strict mode
    else if (strict) {
      // Throw error for trying a strict mode cast of unexpected value
      throw new Error(
        `Failed uncasting value. In strict mode when casting as CastAs.SingleInstance the value being uncast needs to be an instance of the class specified as the @cast target class!`,
      );
    }
    // If value being cast is incompatible, but cast-able and cast is being performed in non-strict mode
    else if (value instanceof Object && !strict) {
      // Uncast by dehydrating an instance of an unexpected class
      return dehydrateAsInstanceOfClass(value, castDefinition.targetEnttType, strategy, options);
    }
    // If value being cast is incompatible, and is not cast-able and cast is being performed in non-strict mode
    else if (!(value instanceof Object) && !strict) {
      // Uncast as undefined
      return undefined;
    }
  }

  // If cast defined as a cast to array of instances
  else if (castDefinition.targetStructure === CastAs.ArrayOfInstances) {
    // If value being cast is compatible with the cast
    if (value instanceof Array) {
      // Uncast each member of the array
      return value.map(value => uncast(value, { ...castDefinition, targetStructure: CastAs.SingleInstance }, strategy, options)) as Array<TUncast>;
    }
    // If value being cast is incompatible and cast is being performed in strict mode
    else if (strict) {
      // Throw error for trying a strict mode cast of unexpected value
      throw new Error(
        `Failed uncasting value. In strict mode when casting as CastAs.ArrayOfInstances the value being uncast needs to be an array of instances of the class specified as the @cast target class!`,
      );
    }
    // If value being cast is incompatible and cast is being performed in non-strict mode
    else if (!strict) {
      // Uncast as an empty array
      return [];
    }
  }

  // If cast defined as a cast to hashmap of instances
  else if (castDefinition.targetStructure === CastAs.HashmapOfInstances) {
    // If value being cast is compatible with the cast
    if (value instanceof Object) {
      // Uncast each member of the hashmap
      return (Object.keys(value) as Array<keyof TValue>).reduce((result: Record<keyof TValueRecord, TUncast>, key) => {
        result[key] = uncast((value as TValueRecord)[key], { ...castDefinition, targetStructure: CastAs.SingleInstance }, strategy, options) as TUncast;
        return result;
      }, {} as Record<keyof TValueRecord, TUncast>);
    }
    // If value being cast is incompatible and cast is being performed in strict mode
    else if (strict) {
      // Throw error for trying a strict mode cast of unexpected value
      throw new Error(
        `Failed uncasting value. In strict mode when casting as CastAs.HashmapOfInstances the value being uncast needs to be a hashmap of instances of the class specified as the @cast target class!`,
      );
    }
    // If value being cast is incompatible and cast is being performed in non-strict mode
    else if (!strict) {
      // Uncast as an empty hashmap
      return {} as Record<keyof TValueRecord, TUncast>;
    }
  }

  // It should be impossible to receive a casting definition without a known CastAs value
  throw new Error(`Failed uncasting value. The provided casting definition's target structure is unknown: "${castDefinition?.targetStructure}"!`);
}

// #endregion

// #region Hydration services: (Re)Hydrate service

/**
 * (Re)Hydrates an instance of a class taking into account configuration provided via @bind and @cast decorators
 * @param value An object to (re)hydrate data from
 * @param instance EnTT class or class instance to hydrate with provided data
 * @param strategy Hydration strategy to use when choosing which properties to (re)hydrate
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Hydrated EnTT class instance hydrated from provided data
 */
export function rehydrate<TInstance extends object>(
  value: DehydratedInstance<TInstance>,
  instance: Class<TInstance> | ClassInstance<TInstance>,
  strategy: HydrationStrategy = HydrationStrategy.OnlyBoundClassProperties,
  options?: HydrationCastingExecutionOptions,
): TInstance {
  // Ready an empty instance to (re)hydrate into
  const rehydrated: ClassInstance<TInstance> = typeof instance === 'function' ? new (instance as Class<TInstance>)() : instance;

  // Collect property names to use for (re)hydration
  const hydratingPropertiesDefinitions = collectHydratingPropertyDecoratorDefinitions(rehydrated, strategy);

  // Copy (and process if needed) all values for all the properties being dehydrated
  for (const key of Object.keys(hydratingPropertiesDefinitions) as Array<keyof TInstance>) {
    const definition = hydratingPropertiesDefinitions[key];
    // If no definition for the property, assume defaults and copy unprocessed value to same property name
    if (!definition) {
      rehydrated[key as keyof TInstance] = deepCloneObject(value[key]);
    }
    // If definition for the property found, use defined dehydrated property name and processing callbacks to convert and set value
    else {
      // Resolve bound property name on the (re)hydrated target object
      const targetPropertyName =
        (definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data as HydrationBindingConfiguration<unknown, unknown>)?.propertyName || key;
      // Get value to be (re)hydrated
      const propertyValue = (value as unknown as TInstance)[targetPropertyName as keyof TInstance];

      // Process value if needed
      let processedValue: TInstance[keyof TInstance];
      // Use unprocessed value
      if (!definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data?.conversion?.rehydrate) {
        // Store unprocessed value
        processedValue = propertyValue;
      }
      // ... or process value via provided custom, (re)hydration callback
      else {
        try {
          processedValue = definition.decorators.bySymbol[hydrationBindingDecoratorSymbol]?.[0]?.data?.conversion?.rehydrate(propertyValue);
        } catch (err: any) {
          throw new Error(
            `Error thrown while calling the provided @bind(conversion.rehydrate) callback function on Class ${
              rehydrated.constructor.name
            }'s ${key.toString()} property: ${err?.message}`,
          );
        }
      }

      // Cast the value to be (re)hydrated
      const castingDefinition = definition.decorators.bySymbol[hydrationCastingDecoratorSymbol]?.[0]?.data;
      const castValue = !castingDefinition
        ? processedValue
        : recast(processedValue as any, castingDefinition, strategy, { ...hydrationCastingExecutionOptionsDefaults, ...options });

      // Store cast value
      rehydrated[key as keyof TInstance] = castValue as TInstance[keyof TInstance];
    }
  }

  // Return (re)hydrated instance
  return rehydrated;
}

/**
 * Recasting an undefined value will use behavior defined by the "undefined" option
 * @param value Value to cast
 * @param castDefinition Casting definition to apply when casting
 * @param strategy Hydration strategy to use when choosing which properties to (re)hydrate
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Cast instances
 */
function recast<TValue extends object, TCast extends ClassInstance<object>>(
  value: undefined,
  castDefinition: HydrationCastingConfiguration<TCast, CastAs.SingleInstance>,
  strategy?: HydrationStrategy,
  options?: HydrationCastingExecutionOptions,
): undefined; // TODO: infer "undefined" handling and only then set return type as undefined
/**
 * Casting a value according to casting definition for a single instance cast will cast as a single instance
 * @param value Value to cast
 * @param castDefinition Casting definition to apply when casting
 * @param strategy Hydration strategy to use when choosing which properties to (re)hydrate
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Cast instances
 */
function recast<TValue extends object, TCast extends ClassInstance<object>>(
  value: undefined | TValue,
  castDefinition: HydrationCastingConfiguration<TCast, CastAs.SingleInstance>,
  strategy?: HydrationStrategy,
  options?: HydrationCastingExecutionOptions,
): TCast;
/**
 * Casting a value according to casting definition for a instance array cast will cast as an array of instances
 * @param value Object to cast
 * @param castDefinition Casting definition to apply when casting
 * @param strategy Hydration strategy to use when choosing which properties to (re)hydrate
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Attay of cast instances
 */
function recast<TValue extends object, TValueArray extends Array<TValue>, TCast extends ClassInstance<object>>(
  value: undefined | TValueArray,
  castDefinition: HydrationCastingConfiguration<TCast, CastAs.ArrayOfInstances>,
  strategy?: HydrationStrategy,
  options?: HydrationCastingExecutionOptions,
): Array<TCast>;
/**
 * Casting a value according to casting definition for a instance hashmap cast will cast as a hashmap of instances
 * @param value Array of objects to cast
 * @param castDefinition Casting definition to apply when casting
 * @param strategy Hydration strategy to use when choosing which properties to (re)hydrate
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Hashmap of cast instances
 */
function recast<TValue extends object, TValueRecord extends Record<PropertyKey, TValue>, TCast extends ClassInstance<object>>(
  value: undefined | TValueRecord,
  castDefinition: HydrationCastingConfiguration<TCast, CastAs.HashmapOfInstances>,
  strategy?: HydrationStrategy,
  options?: HydrationCastingExecutionOptions,
): Record<keyof TValueRecord, TCast>;
/**
 * Casting a value according to casting definition
 * @param value Object, array of objects or hashmap of objects to cast
 * @param castDefinition Casting definition to apply when casting
 * @param strategy Hydration strategy to use when choosing which properties to (re)hydrate
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Cast instance, array of instances or hashmap of instances
 */
function recast<
  TValue extends object,
  TValueArray extends Array<TValue>,
  TValueRecord extends Record<PropertyKey, TValue>,
  TCast extends ClassInstance<object>,
>(
  value: undefined | TValue | TValueArray | TValueRecord,
  castDefinition: HydrationCastingConfiguration<TCast>,
  strategy: HydrationStrategy = HydrationStrategy.OnlyBoundClassProperties,
  options?: HydrationCastingExecutionOptions,
): undefined | TCast | Array<TCast> | Record<keyof TValueRecord, TCast> {
  // Check if preserving an undefined value and if so leave it as undefined
  if (options?.undefined === CastUndefined.Preserve && value === undefined) {
    return undefined;
  }

  // Determine strictess mode
  const strict =
    options?.strict !== undefined
      ? !!options?.strict
      : castDefinition.options.strict === true || (castDefinition.options.strict instanceof Object && castDefinition.options.strict?.rehydrate === true);

  // If cast defined as a cast to single instance
  if (castDefinition.targetStructure === CastAs.SingleInstance) {
    // If value being cast if undefined
    if (value === undefined) {
      // Cast from undefined (TODO: Reconsider allowing undefined in strict mode)
      return new castDefinition.targetEnttType();
    }
    // If value being cast is compatible with the cast
    else if (value && value instanceof Object) {
      // Cast by dehydrating an instance of expected class
      return rehydrate(value, castDefinition.targetEnttType, strategy, options);
    }
    // If value being cast is incompatible and cast is being performed in strict mode
    else if (strict) {
      // Throw error for trying a strict mode cast of unexpected value
      throw new Error(
        `Failed casting value. In strict mode when casting as CastAs.SingleInstance the value being cast needs to be an object which can be cast into a class instance specified as the @cast target class!`,
      );
    }
    // If value being cast is incompatible, cast is being performed in non-strict mode
    else if (!strict) {
      // Cast from undefined
      return new castDefinition.targetEnttType();
    }
  }

  // If cast defined as a cast to array of instances
  else if (castDefinition.targetStructure === CastAs.ArrayOfInstances) {
    // If value being cast if undefined
    if (value === undefined) {
      // Cast from undefined (TODO: Reconsider allowing undefined in strict mode)
      return [];
    }
    // If value being cast is compatible with the cast
    else if (value instanceof Array) {
      // Cast each member of the array
      return value.map(value => recast(value, { ...castDefinition, targetStructure: CastAs.SingleInstance }, strategy, options)) as Array<TCast>;
    }
    // If value being cast is incompatible and cast is being performed in strict mode
    else if (strict) {
      // Throw error for trying a strict mode cast of unexpected value
      throw new Error(
        `Failed casting value. In strict mode when casting as CastAs.ArrayOfInstances the value being cast needs to be an array of objects which can be cast into an array of class instances specified as the @cast target class!`,
      );
    }
    // If value being cast is incompatible and cast is being performed in non-strict mode
    else if (!strict) {
      // Cast from undefined
      return [];
    }
  }

  // If cast defined as a cast to hashmap of instances
  else if (castDefinition.targetStructure === CastAs.HashmapOfInstances) {
    // If value being cast if undefined (TODO: Reconsider allowing undefined in strict mode)
    if (value === undefined) {
      // Cast from undefined
      return {} as Record<keyof TValueRecord, TCast>;
    }
    // If value being cast is compatible with the cast
    else if (value instanceof Object) {
      // Cast each member of the hashmap
      return (Object.keys(value) as Array<keyof TValue>).reduce((result: Record<keyof TValueRecord, TCast>, key) => {
        result[key] = recast((value as TValueRecord)[key], { ...castDefinition, targetStructure: CastAs.SingleInstance }, strategy, options) as TCast;
        return result;
      }, {} as Record<keyof TValueRecord, TCast>);
    }
    // If value being cast is incompatible and cast is being performed in strict mode
    else if (strict) {
      // Throw error for trying a strict mode cast of unexpected value
      throw new Error(
        `Failed casting value. In strict mode when casting as CastAs.HashmapOfInstances the value being cast needs to be a hashmap of objects which can be cast into a hashmap of class instances specified as the @cast target class!`,
      );
    }
    // If value being cast is incompatible and cast is being performed in non-strict mode
    else if (!strict) {
      // Cast from undefined
      return {} as Record<keyof TValueRecord, TCast>;
    }
  }

  // It should be impossible to receive a casting definition without a known CastAs value
  throw new Error(`Failed casting value. The provided casting definition's target structure is unknown: "${castDefinition.targetStructure}"!`);
}

// #endregion

// #region Hydration services: Hydration services, common

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
 * Collects property names for properties which should be dehydrated/(re)hydrated based on the source and target of hydration
 * and the strategy chosed
 * @param instance (Re)Hydrated class instance
 * @param strategy Strategy to use when selecting properties to participate in hydration
 * @returns Array of property names that should participate in the hydration process
 */
function collectHydratingPropertyDecoratorDefinitions<TInstance extends object>(
  instance: ClassInstance<TInstance>,
  strategy: HydrationStrategy,
): Record<keyof TInstance, false | EnttPropertyDefinition> {
  // Get instance's class's decorator definitions
  const allDecoratedPropertiesDefinitions = getDecoratedClassDefinition(instance);
  const onlyBoundPropertiesDefinitions = filterDefinition(allDecoratedPropertiesDefinitions, hydrationBindingDecoratorSymbol);
  const allPropertiesKeys = [...new Set([...Object.keys(allDecoratedPropertiesDefinitions.properties), ...Object.keys(instance)])];

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
