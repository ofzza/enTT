// enTT HYDRATION decorators and services
// ----------------------------------------------------------------------------

// Import dependencies
import { Class, ClassInstance, EnttPropertyDefinition } from '../../lib';
import { deepCloneObject } from '../../utils';
import { createClassCustomDecorator, createPropertyCustomDecorator, getDecoratedClassDefinition, filterDefinition } from '../../lib';

// #region Utility types

/**
 * A raw object containing the same properties as class instance of type T,
 * or anything returned by @bind class's decorators conversion callback
 */
export type DehydratedInstance<T> = Record<PropertyKey, any> | any;

// #endregion

// #region Hydration @bind decorator

/**
 * TODO: ...
 * @param config
 * @returns Class decorator
 */
export function bind<TInstance extends object>(
  config: HydrationBindingConstructorArgumentsConfiguration<TInstance, TInstance, any>,
): (target: Class<TInstance>) => void;
/**
 * TODO: ...
 * @param config
 * @returns Property decorator
 */
export function bind<TInstance extends object>(): (target: ClassInstance<TInstance>, key: PropertyKey) => void;
/**
 * TODO: ...
 * @param config
 * @returns Property decorator
 */
export function bind<TInstance extends object>(config: string): (target: ClassInstance<TInstance>, key: PropertyKey) => void;
/**
 * TODO: ...
 * @param config
 * @returns Property decorator
 */
export function bind<TInstance extends object, TValRehydrated, TValDehydrated>(
  config: HydrationBindingPropertyConfiguration<TValRehydrated, TValDehydrated>,
): (target: ClassInstance<TInstance>, key: PropertyKey) => void;
/**
 * Common decorator factory for both bindConstructorArguments and bindProperty, depending on condifuration provided
 * @param config Configuration object
 * @returns Class or Property decorator
 */
export function bind<TInstance extends object, TValRehydrated, TValDehydrated>(
  config?:
    | string
    | HydrationBindingConstructorArgumentsConfiguration<TInstance, TInstance, any>
    | HydrationBindingPropertyConfiguration<TValRehydrated, TValDehydrated>,
): ((target: Class<TInstance>) => void) | ((target: ClassInstance<TInstance>, key: PropertyKey) => void) {
  // Cache decorators once created
  let bindConstructorArgumentsDecorator: ReturnType<typeof bindConstructorArguments<TInstance>>;
  let bindPropertyDecorator: ReturnType<typeof bindProperty<TInstance, TValRehydrated, TValDehydrated>>;

  // Return an undetermined decorator, later to be determined if used to decorate a class or a property
  return (target: Class<TInstance>, key?: PropertyKey) => {
    // If decorating a class use class decorator
    if (!key) {
      // If not alreafy initialized, initialize decorator
      if (!bindConstructorArgumentsDecorator) {
        bindConstructorArgumentsDecorator = bindConstructorArguments(config as HydrationBindingConstructorArgumentsConfiguration<TInstance, TInstance, any>);
      }
      // Apply decorator
      bindConstructorArgumentsDecorator(target as Class<TInstance>);
    }
    // If decorating a property use property decorator
    else {
      // If not alreafy initialized, initialize decorator
      if (!bindPropertyDecorator) {
        bindPropertyDecorator = bindProperty<TInstance, TValRehydrated, TValDehydrated>(
          config as HydrationBindingPropertyConfiguration<TValRehydrated, TValDehydrated>,
        );
      }
      // Apply decorator
      bindPropertyDecorator(target as TInstance, key);
    }
  };
}

// #endregion

// #region Hydration @bind class constructor arguments decorator

/**
 * Hydration binding decorator configuration definition
 */
export type HydrationBindingConstructorArgumentsConfiguration<TInstance, TValRehydrated = TInstance, TValDehydrated = any> = {
  /**
   * Conversion functions used to transform between a dehydrated value into a (re)gydrated instance when dehydrating/(re)hydrating
   */
  conversion: {
    /**
     * Converts the (re)hydrated instance of the decorated class into the dehydrated value
     * @param v (Re)Hydrated value of the decorated class instance
     * @returns Dehydrated value of the decorated class instance
     */
    dehydrate: (v: TValRehydrated) => TValDehydrated;
    /**
     * Converts the dehydrated value of the decorated class instance into the (re)hydrated instance
     * @param v Dehydrated value of the decorated class instance
     * @returns (Re)Hydrated value of the decorated class instance
     */
    rehydrate: (v: TValDehydrated) => TValRehydrated;
  };
};

// Unique identifier symbol identifying the Hydratable binding decorator
const hydrationBindingConstructorArgumentsDecoratorSymbol = Symbol('Hydration binding constructor arguments decorator');

/**
 * When dehydrating/rehydrating a class instance, this property decorator configures explicit conversion methods to be used to convert
 * between a dehydrated value into a (re)gydrated instance when dehydrating/(re)hydrating
 * @param config (Optional) Configuration object defining conversion methods to be used for dehydration/(re)hydration
 * @returns Class decorator
 */
function bindConstructorArguments<TInstance extends object>(
  config: HydrationBindingConstructorArgumentsConfiguration<TInstance, TInstance, any>,
): (target: Class<TInstance>) => void {
  return createClassCustomDecorator<TInstance, HydrationBindingConstructorArgumentsConfiguration<TInstance, TInstance, any>>(
    () => config,
    hydrationBindingConstructorArgumentsDecoratorSymbol,
  );
}

// #endregion

// #region Hydration @bind class property decorator

/**
 * Hydration binding decorator configuration definition
 */
export type HydrationBindingPropertyConfiguration<TValRehydrated, TValDehydrated> = {
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
const hydrationBindingPropertyDecoratorSymbol = Symbol('Hydration binding property decorator');
/**
 * When dehydrating/rehydrating a class instance, this property decorator configures the property as needing to be
 * dehydrated/(re)hydrated from/to a propertyx of the same name without any value conversion.
 * @returns Property decorator
 */
function bindProperty<TInstance extends object>(): (target: ClassInstance<TInstance>, key: PropertyKey) => void;
/**
 * When dehydrating/rehydrating a class instance, this property decorator configures the target name of the dehydraeted property
 * this property needs to be dehydrated/(re)hydrated to/from without any value conversion.
 * @param config Name of the dehydrated property this property needs to be dehydrated/(re)hydrated to/from.
 * @returns Property decorator
 */
function bindProperty<TInstance extends object>(config: string): (target: ClassInstance<TInstance>, key: PropertyKey) => void;
/**
 * When dehydrating/rehydrating a class instance, this property decorator configures the target name of the dehydraeted property
 * this property needs to be dehydrated/(re)hydrated to/from and defines callback functions handling data conversion in either direction.
 * @param config (Optional) Configuration object defining the dehydrated property this property needs to be dehydrated/(re)hydrated to/from.
 * and callback functions handling data conversion in either direction.
 * @returns Property decorator
 */
function bindProperty<TInstance extends object, TValRehydrated, TValDehydrated>(
  config: HydrationBindingPropertyConfiguration<TValRehydrated, TValDehydrated>,
): (target: ClassInstance<TInstance>, key: PropertyKey) => void;
function bindProperty<TInstance extends object, TValRehydrated, TValDehydrated>(
  config?: string | HydrationBindingPropertyConfiguration<TValRehydrated, TValDehydrated>,
): (target: ClassInstance<TInstance>, key: PropertyKey) => void {
  // Conpose full configuration object
  let composedConfig: HydrationBindingPropertyConfiguration<TValRehydrated, TValDehydrated>;
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
  return createPropertyCustomDecorator<TInstance, HydrationBindingPropertyConfiguration<TValRehydrated, TValDehydrated>>(
    () => composedConfig,
    hydrationBindingPropertyDecoratorSymbol,
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
export type HydrationCastingConfigurationOptions = {};
/**
 * Default hydration casting decorator configuration options
 */
const hydrationCastingConfigurationOptionsDefaults: HydrationCastingConfigurationOptions = {};

/**
 * Hydration casting decorator configuration options definition
 */
export type HydrationCastingExecutionOptions = {};
/**
 * Default hydration casting decorator configuration options
 */
const hydrationCastingExecutionOptionsDefaults: HydrationCastingExecutionOptions = {};
/**
 * Appends default hydration casting decorator configuration options to provided options
 * @param options Options to append defaults onto
 * @returns Default hydration casting decorator configuration options with appendeddefaults
 */
function appendHydrationCastingExecutionOptionsDefaults(options?: HydrationCastingExecutionOptions) {
  return { ...hydrationCastingExecutionOptionsDefaults, ...(options || {}) } as HydrationCastingExecutionOptions;
}

// Unique identifier symbol identifying the Hydratable casting decorator
const hydrationCastingDecoratorSymbol = Symbol('Hydration casting property decorator');
/**
 * When rehydrating a class instance, this property decorator configures how the property value will be cast before storing it
 * @param targetEnttType Class to be cast into when hydrating
 * @param targetStructure (Optional) Structure to the data should be interpreted as before casting (single instance | array of instances | hashmap of instances)
 * @param options (Optional) Hydration options controling fine tuning of the hydration process
 * @returns Property decorator
 */
export function cast<THostInstance extends object, TCastInstance = any>(
  targetEnttType: Class<TCastInstance>,
  targetStructure: CastAs = CastAs.SingleInstance,
  options?: HydrationCastingConfigurationOptions,
): (target: ClassInstance<THostInstance>, key: PropertyKey) => void {
  // Create and return decorator
  return createPropertyCustomDecorator<THostInstance, HydrationCastingConfiguration<TCastInstance>>(
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
  return dehydrateAsInstanceOfClass(instance, instance, strategy, appendHydrationCastingExecutionOptionsDefaults(options));
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
  // Check if instance belongs to a class decorated with @bind decorator
  const decoratedClassDefinition = getDecoratedClassDefinition(instance);
  const classBindingDecoratorConfigurations = decoratedClassDefinition.decorators.bySymbol[hydrationBindingConstructorArgumentsDecoratorSymbol];
  const dehydratedViaClassBindingConfiguration =
    classBindingDecoratorConfigurations?.length > 0 ? classBindingDecoratorConfigurations[0].data.conversion.dehydrate(value) : undefined;

  // Ready an empty raw object to dehydrate into
  const dehydrated: DehydratedInstance<TInstance> = dehydratedViaClassBindingConfiguration || {};

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
        (definition.decorators.bySymbol[hydrationBindingPropertyDecoratorSymbol]?.[0]?.data as HydrationBindingPropertyConfiguration<unknown, unknown>)
          ?.propertyName || key;
      // Get value to be dehydrated
      let propertyValue = (value as unknown as TInstance)[key];

      // Get casting definition
      const castingDefinition = definition.decorators.bySymbol[hydrationCastingDecoratorSymbol]?.[0]?.data;

      // Uncast the value to be dehydrated
      let uncastValue;
      // If no casting decorator, do not cast
      if (!castingDefinition) {
        // Keep value without casting
        uncastValue = propertyValue;
      }
      // If undefined, skip setting property
      else if (propertyValue === undefined && !definition.decorators.bySymbol[hydrationBindingPropertyDecoratorSymbol]?.[0]?.data?.conversion?.dehydrate) {
        continue;
      }
      // Uncast value
      else {
        uncastValue =
          propertyValue === undefined
            ? undefined
            : uncast(propertyValue as any, castingDefinition, strategy, appendHydrationCastingExecutionOptionsDefaults(options));
      }

      // If no custom binding, use unprocessed value
      if (!definition.decorators.bySymbol[hydrationBindingPropertyDecoratorSymbol]?.[0]?.data?.conversion?.dehydrate) {
        // Set unprocessed property value
        dehydrated[targetPropertyName] = uncastValue;
      }
      // ... or process value via provided custom, dehydration callback
      else {
        try {
          dehydrated[targetPropertyName] =
            definition.decorators.bySymbol[hydrationBindingPropertyDecoratorSymbol]?.[0]?.data?.conversion?.dehydrate(uncastValue);
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
): undefined;
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
  // If cast defined as a cast to single instance
  if (castDefinition.targetStructure === CastAs.SingleInstance) {
    // If value being cast is compatible with the cast
    if (value instanceof castDefinition.targetEnttType) {
      // Uncast by dehydrating an instance of expected class
      return dehydrateAsInstanceOfClass(value, castDefinition.targetEnttType, strategy, appendHydrationCastingExecutionOptionsDefaults(options));
    }
    // If value being cast is incompatible
    else {
      // Throw error for trying a cast of unexpected value
      throw new Error(`Failed uncasting value. The value being uncast needs to be an instance of the class specified as the @cast target class!`);
    }
  }

  // If cast defined as a cast to array of instances
  else if (castDefinition.targetStructure === CastAs.ArrayOfInstances) {
    // If value being cast is compatible with the cast
    if (value instanceof Array) {
      // Filter out any undefined values from the array before casting
      const filteredValues = value.filter(value => value !== undefined);
      // Uncast each member of the array
      return filteredValues.map(value =>
        uncast(value, { ...castDefinition, targetStructure: CastAs.SingleInstance }, strategy, appendHydrationCastingExecutionOptionsDefaults(options)),
      );
    }
    // If value being cast is incompatible
    else {
      // Throw error for trying a cast of unexpected value
      throw new Error(`Failed uncasting value. The value being uncast needs to be an array of instances of the class specified as the @cast target class!`);
    }
  }

  // If cast defined as a cast to hashmap of instances
  else if (castDefinition.targetStructure === CastAs.HashmapOfInstances) {
    // If value being cast is compatible with the cast
    if (value instanceof Object) {
      // Filter out any undefined vlaues from the array before casting
      const filteredKeys = (Object.keys(value) as Array<keyof TValue>).filter(key => (value as TValueRecord)[key] !== undefined);
      // Uncast each member of the hashmap
      return (filteredKeys as Array<keyof TValue>).reduce((result: Record<keyof TValueRecord, TUncast>, key) => {
        // Uncast value
        result[key] = uncast(
          (value as TValueRecord)[key],
          { ...castDefinition, targetStructure: CastAs.SingleInstance },
          strategy,
          appendHydrationCastingExecutionOptionsDefaults(options),
        ) as TUncast;
        // Return reduced result
        return result;
      }, {} as Record<keyof TValueRecord, TUncast>);
    }
    // If value being cast is incompatible
    else {
      // Throw error for trying a cast of unexpected value
      throw new Error(`Failed uncasting value. The value being uncast needs to be a hashmap of instances of the class specified as the @cast target class!`);
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
  // Check if instance belongs to a class decorated with @bind decorator
  const decoratedClassDefinition = getDecoratedClassDefinition(instance);
  const classBindingDecoratorConfigurations = decoratedClassDefinition.decorators.bySymbol[hydrationBindingConstructorArgumentsDecoratorSymbol];
  const rehydratedViaClassBindingConfiguration =
    classBindingDecoratorConfigurations?.length > 0 ? classBindingDecoratorConfigurations[0].data.conversion.rehydrate(value) : undefined;

  // Ready an empty instance to (re)hydrate into
  const rehydrated: ClassInstance<TInstance> =
    typeof instance === 'function' ? rehydratedViaClassBindingConfiguration || new (instance as Class<TInstance>)() : instance;

  // Collect property names to use for (re)hydration
  const hydratingPropertiesDefinitions = collectHydratingPropertyDecoratorDefinitions(rehydrated, strategy);

  // Copy (and process if needed) all values for all the properties being dehydrated
  for (const key of Object.keys(hydratingPropertiesDefinitions) as Array<keyof TInstance>) {
    // Get property definition
    const definition = hydratingPropertiesDefinitions[key];
    // If no definition for the property, assume defaults and copy unprocessed value to same property name
    if (!definition) {
      rehydrated[key as keyof TInstance] = deepCloneObject(value[key]);
    }
    // If definition for the property found, use defined dehydrated property name and processing callbacks to convert and set value
    else {
      // Resolve bound property name on the (re)hydrated target object
      const targetPropertyName =
        (definition.decorators.bySymbol[hydrationBindingPropertyDecoratorSymbol]?.[0]?.data as HydrationBindingPropertyConfiguration<unknown, unknown>)
          ?.propertyName || key;
      // Get value to be (re)hydrated
      const propertyValue = value instanceof Object ? (value as unknown as TInstance)[targetPropertyName as keyof TInstance] : undefined;

      // Process value if needed
      let processedValue: undefined | TInstance[keyof TInstance];
      // Use unprocessed value
      if (!definition.decorators.bySymbol[hydrationBindingPropertyDecoratorSymbol]?.[0]?.data?.conversion?.rehydrate) {
        // Store unprocessed property value
        processedValue = propertyValue;
      }
      // ... or process value via provided custom, (re)hydration callback
      else {
        try {
          processedValue = definition.decorators.bySymbol[hydrationBindingPropertyDecoratorSymbol]?.[0]?.data?.conversion?.rehydrate(propertyValue);
        } catch (err: any) {
          throw new Error(
            `Error thrown while calling the provided @bind(conversion.rehydrate) callback function on Class ${
              rehydrated.constructor.name
            }'s ${key.toString()} property: ${err?.message}`,
          );
        }
      }

      // Get casting definition
      const castingDefinition = definition.decorators.bySymbol[hydrationCastingDecoratorSymbol]?.[0]?.data;

      // Cast the value to be (re)hydrated
      let castValue;
      // If no casting decorator, do not cast
      if (!castingDefinition) {
        castValue = processedValue;
      }
      // If undefined, skip setting property
      else if (processedValue === undefined) {
        continue;
      }
      // Recast value
      else {
        castValue = recast(processedValue as any, castingDefinition, strategy, appendHydrationCastingExecutionOptionsDefaults(options));
      }

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
  // If cast defined as a cast to single instance
  if (castDefinition.targetStructure === CastAs.SingleInstance) {
    // Cast by dehydrating an instance of expected class
    return rehydrate(value, castDefinition.targetEnttType, strategy, appendHydrationCastingExecutionOptionsDefaults(options));
  }

  // If cast defined as a cast to array of instances
  else if (castDefinition.targetStructure === CastAs.ArrayOfInstances) {
    if (value instanceof Array) {
      // Filter out any undefined values from the array before casting
      const filteredValues = value.filter(value => value !== undefined);
      // Cast each member of the array
      return filteredValues.map(value =>
        recast(value, { ...castDefinition, targetStructure: CastAs.SingleInstance }, strategy, appendHydrationCastingExecutionOptionsDefaults(options)),
      ) as Array<TCast>;
    }
    // If value being cast is incompatible
    else {
      // Throw error for trying cast of unexpected value
      throw new Error(`Failed (re)casting value ${value} as ${castDefinition?.targetStructure}`);
    }
  }

  // If cast defined as a cast to hashmap of instances
  else if (castDefinition.targetStructure === CastAs.HashmapOfInstances) {
    if (value instanceof Object) {
      // Filter out any undefined vlaues from the array before casting
      const filteredKeys = (Object.keys(value) as Array<keyof TValue>).filter(key => (value as TValueRecord)[key] !== undefined);
      // Cast each member of the hashmap
      return filteredKeys.reduce((result: Record<keyof TValueRecord, TCast>, key) => {
        result[key] = recast(
          (value as TValueRecord)[key],
          { ...castDefinition, targetStructure: CastAs.SingleInstance },
          strategy,
          appendHydrationCastingExecutionOptionsDefaults(options),
        ) as TCast;
        // Return reduced result
        return result;
      }, {} as Record<keyof TValueRecord, TCast>);
    }
    // If value being cast is incompatible
    else {
      // Throw error for trying cast of unexpected value
      throw new Error(`Failed (un)casting value ${value} as ${castDefinition?.targetStructure}`);
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
  const onlyBoundPropertiesDefinitions = filterDefinition(allDecoratedPropertiesDefinitions, hydrationBindingPropertyDecoratorSymbol);
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
