// enTT HYDRATION decorators and services
// ----------------------------------------------------------------------------

// Import dependencies
import { Class, ClassInstance } from '@ofzza/ts-std/types/corejs/class';
import { EnttPropertyDefinition, Decorator, ClassDecorator, PropertyDecorator } from '../../lib';
import { createClassCustomDecorator, createPropertyCustomDecorator, getDecoratedClassDefinition, filterDefinition } from '../../lib';
import { deepCloneObject } from '../../utils';

// #region Utility types

/**
 * A raw object containing the same properties as class instance of type T,
 * or anything returned by @bind class's decorators conversion callback
 */
export type DehydratedInstance<T> = Record<PropertyKey, any> | any;

// #endregion

// #region Hydration @bind decorator

/**
 * Bind class decorator factory, creates a binding class decorator
 * @param config Binding configuration provides custom callback functions to be used during the dehydration and (re)hydration process
 * @returns Class decorator
 */
export function bind<TInstance extends ClassInstance>(
  config: HydrationBindingConstructorArgumentsConfiguration<TInstance, TInstance, any>,
): ClassDecorator<TInstance>;
/**
 * Bind class property decorator factory, creates a binding class property decorator, binding the property during the dehydration and (re)hydration process
 * to a target property of the same name
 * @returns Property decorator
 */
export function bind<TInstance extends ClassInstance>(): PropertyDecorator<TInstance>;
/**
 * Bind class property decorator factory, creates a binding class property decorator, binding the property during the dehydration and (re)hydration process
 * to a target property of a configured name
 * @param config Name of the target property to be used as binding target during the dehydration and (re)hydration process
 * @returns Property decorator
 */
export function bind<TInstance extends ClassInstance>(config: string): PropertyDecorator<TInstance>;
/**
 * Bind class property decorator factory, creates a binding class property decorator, binding the property during the dehydration and (re)hydration process
 * to a target property of a configured name
 * @param config Binding configuration provides:
 * - name of the target property to be used as binding target during the dehydration and (re)hydration process
 * - custom callback functions to be used during the dehydration and (re)hydration process
 * @returns Property decorator
 */
export function bind<TInstance extends ClassInstance, TValRehydrated, TValDehydrated>(
  config: HydrationBindingPropertyConfiguration<TValRehydrated, TValDehydrated>,
): PropertyDecorator<TInstance>;
/**
 * Common decorator factory for both bindConstructorArguments and bindProperty, depending on condifuration provided
 * @param config Configuration object
 * @returns Class or Property decorator
 */
export function bind<TInstance extends ClassInstance, TValRehydrated, TValDehydrated>(
  config?:
    | string
    | HydrationBindingConstructorArgumentsConfiguration<TInstance, TInstance, any>
    | HydrationBindingPropertyConfiguration<TValRehydrated, TValDehydrated>,
): Decorator<TInstance> {
  // Cache decorators once created
  let bindConstructorArgumentsDecorator: ReturnType<typeof bindConstructorArguments<TInstance>>;
  let bindPropertyDecorator: ReturnType<typeof bindProperty<TInstance, TValRehydrated, TValDehydrated>>;

  // Return an undetermined decorator, later to be determined if used to decorate a class or a property
  return (target: Class<TInstance> | ClassInstance<TInstance>, key?: PropertyKey) => {
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
      bindPropertyDecorator(target as ClassInstance<TInstance>, key);
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
const bindClassSymbol = Symbol('@bind(class) symbol');

/**
 * When dehydrating/rehydrating a class instance, this property decorator configures explicit conversion methods to be used to convert
 * between a dehydrated value into a (re)gydrated instance when dehydrating/(re)hydrating
 * @param config (Optional) Configuration object defining conversion methods to be used for dehydration/(re)hydration
 * @returns Class decorator
 */
function bindConstructorArguments<TInstance extends ClassInstance>(
  config: HydrationBindingConstructorArgumentsConfiguration<TInstance, TInstance, any>,
): ClassDecorator<TInstance> {
  return createClassCustomDecorator<TInstance, HydrationBindingConstructorArgumentsConfiguration<TInstance, TInstance, any>>(() => config, bindClassSymbol);
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
const bindPropertySymbol = Symbol('@bind(property) symbol');
/**
 * When dehydrating/rehydrating a class instance, this property decorator configures the property as needing to be
 * dehydrated/(re)hydrated from/to a propertyx of the same name without any value conversion.
 * @returns Property decorator
 */
function bindProperty<TInstance extends ClassInstance>(): PropertyDecorator<TInstance>;
/**
 * When dehydrating/rehydrating a class instance, this property decorator configures the target name of the dehydraeted property
 * this property needs to be dehydrated/(re)hydrated to/from without any value conversion.
 * @param config Name of the dehydrated property this property needs to be dehydrated/(re)hydrated to/from.
 * @returns Property decorator
 */
function bindProperty<TInstance extends ClassInstance>(config: string): PropertyDecorator<TInstance>;
/**
 * When dehydrating/rehydrating a class instance, this property decorator configures the target name of the dehydraeted property
 * this property needs to be dehydrated/(re)hydrated to/from and defines callback functions handling data conversion in either direction.
 * @param config (Optional) Configuration object defining the dehydrated property this property needs to be dehydrated/(re)hydrated to/from.
 * and callback functions handling data conversion in either direction.
 * @returns Property decorator
 */
function bindProperty<TInstance extends ClassInstance, TValRehydrated, TValDehydrated>(
  config: HydrationBindingPropertyConfiguration<TValRehydrated, TValDehydrated>,
): PropertyDecorator<TInstance>;
function bindProperty<TInstance extends ClassInstance, TValRehydrated, TValDehydrated>(
  config?: string | HydrationBindingPropertyConfiguration<TValRehydrated, TValDehydrated>,
): PropertyDecorator<TInstance> {
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
    bindPropertySymbol,
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
export type HydrationCastingConfiguration<T extends ClassInstance, TCastAs extends CastAs = CastAs> = {
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
const castSymbol = Symbol('@cast symbol');
/**
 * When rehydrating a class instance, this property decorator configures how the property value will be cast before storing it
 * @param targetEnttType Class to be cast into when hydrating
 * @param targetStructure (Optional) Structure to the data should be interpreted as before casting (single instance | array of instances | hashmap of instances)
 * @param options (Optional) Hydration options controling fine tuning of the hydration process
 * @returns Property decorator
 */
export function cast<THostInstance extends ClassInstance, TCastInstance extends ClassInstance = ClassInstance>(
  targetEnttType: Class<TCastInstance>,
  targetStructure: CastAs = CastAs.SingleInstance,
  options?: HydrationCastingConfigurationOptions,
): PropertyDecorator<THostInstance> {
  // Create and return decorator
  return createPropertyCustomDecorator<THostInstance, HydrationCastingConfiguration<TCastInstance>>(
    () => ({ targetEnttType, targetStructure, options: { ...hydrationCastingConfigurationOptionsDefaults, ...options } }),
    castSymbol,
  );
}

// #endregion

// #region Hydration services: Dehydrate service

/**
 * Dehydrates an instance of a class taking into account configuration provided via @bind and @cast decorators
 * @param instance Instance of an EnTT class to be dehydrated
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns A dehydrated objet
 */
export function dehydrate<TInstance extends ClassInstance>(
  instance: ClassInstance<TInstance>,
  props: HydrationProperties = HydrationStrategy.OnlyBoundClassProperties,
  options?: HydrationCastingExecutionOptions,
): DehydratedInstance<TInstance> {
  return dehydrateAsInstanceOfClass(instance, instance, props, appendHydrationCastingExecutionOptionsDefaults(options));
}

/**
 * Dehydrates an object treating it as an instance of a class taking into account configuration provided via @bind and @cast decorators
 * @param value Object to be dehydrated
 * @param target Instance of a class or class decorated with @bind and @cast decorators, used to dehydrate the provided object
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns A dehydrated objet
 */
function dehydrateAsInstanceOfClass<TValue extends object, TInstance extends ClassInstance>(
  value: TValue,
  target: Class<TInstance> | ClassInstance<TInstance>,
  props: HydrationProperties = HydrationStrategy.OnlyBoundClassProperties,
  options?: HydrationCastingExecutionOptions,
): DehydratedInstance<TInstance> {
  // Check if instance belongs to a class decorated with @bind decorator
  target;
  // ^?
  const decoratedClassDefinition = getDecoratedClassDefinition(target);
  const classBindingDecoratorConfigurations = decoratedClassDefinition.decorators.bySymbol[bindClassSymbol];
  const dehydratedViaClassBindingConfiguration =
    classBindingDecoratorConfigurations?.length > 0 ? classBindingDecoratorConfigurations[0].data.conversion.dehydrate(value) : undefined;

  // Ready an empty raw object to dehydrate into
  const dehydrated: DehydratedInstance<TInstance> = dehydratedViaClassBindingConfiguration || {};

  // Collect property names to use for dehydration
  const hydratingPropertiesDefinitions = collectHydratingPropertyDecoratorDefinitions(target, props);

  // Copy (and process if needed) all values for all the properties being dehydrated
  for (const key of Object.keys(hydratingPropertiesDefinitions) as Array<keyof TInstance>) {
    // Check if property exists on dehydrating object
    if (!value.hasOwnProperty(key)) {
      continue;
    }

    // Get property definition
    const definition = hydratingPropertiesDefinitions[key as keyof typeof hydratingPropertiesDefinitions];
    // If no definition for the property, assume defaults and copy unprocessed value to same property name
    if (!definition) {
      dehydrated[key] = deepCloneObject((value as unknown as TInstance)[key]);
    }
    // If definition for the property found, use defined dehydrated property name and processing callbacks to convert and set value
    else {
      // Resolve bound property name on the dehydrated target object
      const targetPropertyName =
        (definition.decorators.bySymbol[bindPropertySymbol]?.[0]?.data as HydrationBindingPropertyConfiguration<unknown, unknown>)?.propertyName || key;
      // Get value to be dehydrated
      let propertyValue = (value as unknown as TInstance)[key];

      // Get casting definition
      const castingDefinition = definition.decorators.bySymbol[castSymbol]?.[0]?.data;

      // Uncast the value to be dehydrated
      let uncastValue;
      // If no casting decorator, do not cast
      if (!castingDefinition) {
        // Keep value without casting
        uncastValue = propertyValue;
      }
      // If undefined, skip setting property
      else if (propertyValue === undefined && !definition.decorators.bySymbol[bindPropertySymbol]?.[0]?.data?.conversion?.dehydrate) {
        continue;
      }
      // Uncast value
      else {
        uncastValue =
          propertyValue === undefined
            ? undefined
            : uncast(propertyValue as any, castingDefinition, props, appendHydrationCastingExecutionOptionsDefaults(options));
      }

      // If no custom binding, use unprocessed value
      if (!definition.decorators.bySymbol[bindPropertySymbol]?.[0]?.data?.conversion?.dehydrate) {
        // Set unprocessed property value
        dehydrated[targetPropertyName] = uncastValue;
      }
      // ... or process value via provided custom, dehydration callback
      else {
        try {
          dehydrated[targetPropertyName] = definition.decorators.bySymbol[bindPropertySymbol]?.[0]?.data?.conversion?.dehydrate(uncastValue);
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
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Uncast value
 */
function uncast<TValue extends ClassInstance, TUncast extends ClassInstance>(
  value: undefined,
  castDefinition: HydrationCastingConfiguration<TUncast, CastAs>,
  props?: HydrationProperties,
  options?: HydrationCastingExecutionOptions,
): undefined;
/**
 * Uncasting a value according to casting definition for a single instance cast will uncast as a single object
 * @param value Value to uncast
 * @param castDefinition Casting definition to apply when uncasting
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Uncast value
 */
function uncast<TValue extends ClassInstance, TUncast extends ClassInstance>(
  value: TValue,
  castDefinition: HydrationCastingConfiguration<TUncast, CastAs.SingleInstance>,
  props?: HydrationProperties,
  options?: HydrationCastingExecutionOptions,
): TUncast;
/**
 * Uncasting a value according to casting definition for a instance array cast will uncast as an array of objects
 * @param value Array of instances to uncast
 * @param castDefinition Casting definition to apply when uncasting
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Attay of uncast values
 */
function uncast<TValue extends ClassInstance, TValueArray extends Array<TValue>, TUncast extends ClassInstance>(
  value: TValueArray,
  castDefinition: HydrationCastingConfiguration<TUncast, CastAs.ArrayOfInstances>,
  props?: HydrationProperties,
  options?: HydrationCastingExecutionOptions,
): Array<TUncast>;
/**
 * Uncasting a value according to casting definition for a instance hashmap cast will uncast as a hashmap of objects
 * @param value Hashmap of instances to uncast
 * @param castDefinition Casting definition to apply when uncasting
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Hashmap of uncast values
 */
function uncast<TValue extends ClassInstance, TValueRecord extends Record<PropertyKey, TValue>, TUncast extends ClassInstance>(
  value: TValueRecord,
  castDefinition: HydrationCastingConfiguration<TUncast, CastAs.HashmapOfInstances>,
  props?: HydrationProperties,
  options?: HydrationCastingExecutionOptions,
): Record<keyof TValueRecord, TUncast>;
/**
 * Uncasting a value according to casting definition
 * @param value Instance, array of instances or a hashmap of instances to uncast
 * @param castDefinition Casting definition to apply when uncasting
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Uncast instance, array of instances of hashmap of instances
 */
function uncast<
  TValue extends ClassInstance,
  TValueArray extends Array<TValue>,
  TValueRecord extends Record<PropertyKey, TValue>,
  TUncast extends ClassInstance,
>(
  value: undefined | TValue | TValueArray | TValueRecord,
  castDefinition: HydrationCastingConfiguration<TUncast>,
  props: HydrationProperties = HydrationStrategy.OnlyBoundClassProperties,
  options?: HydrationCastingExecutionOptions,
): undefined | TUncast | Array<TUncast> | Record<keyof TValueRecord, TUncast> {
  // If cast defined as a cast to single instance
  if (castDefinition.targetStructure === CastAs.SingleInstance) {
    // If value being cast is compatible with the cast
    if (value instanceof castDefinition.targetEnttType) {
      // Uncast by dehydrating an instance of expected class
      return dehydrateAsInstanceOfClass(value, castDefinition.targetEnttType, props, appendHydrationCastingExecutionOptionsDefaults(options));
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
        uncast(value, { ...castDefinition, targetStructure: CastAs.SingleInstance }, props, appendHydrationCastingExecutionOptionsDefaults(options)),
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
          props,
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
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Hydrated EnTT class instance hydrated from provided data
 */
export function rehydrate<TInstance extends ClassInstance>(
  value: DehydratedInstance<TInstance>,
  instance: Class<TInstance> | ClassInstance<TInstance>,
  props: HydrationProperties = HydrationStrategy.OnlyBoundClassProperties,
  options?: HydrationCastingExecutionOptions,
): ClassInstance<TInstance> {
  // Check if instance belongs to a class decorated with @bind decorator
  const decoratedClassDefinition = getDecoratedClassDefinition(instance);
  const classBindingDecoratorConfigurations = decoratedClassDefinition.decorators.bySymbol[bindClassSymbol];
  const rehydratedViaClassBindingConfiguration =
    classBindingDecoratorConfigurations?.length > 0 ? classBindingDecoratorConfigurations[0].data.conversion.rehydrate(value) : undefined;

  // Ready an empty instance to (re)hydrate into
  const rehydrated: ClassInstance<TInstance> =
    typeof instance === 'function' ? rehydratedViaClassBindingConfiguration || new (instance as Class<TInstance>)() : instance;

  // Collect property names to use for (re)hydration
  const hydratingPropertiesDefinitions = collectHydratingPropertyDecoratorDefinitions(rehydrated, props);

  // Copy (and process if needed) all values for all the properties being dehydrated
  for (const key of Object.keys(hydratingPropertiesDefinitions) as Array<keyof TInstance>) {
    // Get property definition
    const definition = hydratingPropertiesDefinitions[key];
    // If no definition for the property, assume defaults and copy unprocessed value to same property name
    if (!definition) {
      rehydrated[key as keyof typeof rehydrated] = deepCloneObject(value[key]);
    }
    // If definition for the property found, use defined dehydrated property name and processing callbacks to convert and set value
    else {
      // Resolve bound property name on the (re)hydrated target object
      const targetPropertyName =
        (definition.decorators.bySymbol[bindPropertySymbol]?.[0]?.data as HydrationBindingPropertyConfiguration<unknown, unknown>)?.propertyName || key;
      // Get value to be (re)hydrated
      const propertyValue = value instanceof Object ? (value as unknown as TInstance)[targetPropertyName as keyof TInstance] : undefined;

      // Process value if needed
      let processedValue: undefined | TInstance[keyof TInstance];
      // Use unprocessed value
      if (!definition.decorators.bySymbol[bindPropertySymbol]?.[0]?.data?.conversion?.rehydrate) {
        // Store unprocessed property value
        processedValue = propertyValue;
      }
      // ... or process value via provided custom, (re)hydration callback
      else {
        try {
          processedValue = definition.decorators.bySymbol[bindPropertySymbol]?.[0]?.data?.conversion?.rehydrate(propertyValue);
        } catch (err: any) {
          throw new Error(
            `Error thrown while calling the provided @bind(conversion.rehydrate) callback function on Class ${
              rehydrated.constructor.name
            }'s ${key.toString()} property: ${err?.message}`,
          );
        }
      }

      // Get casting definition
      const castingDefinition = definition.decorators.bySymbol[castSymbol]?.[0]?.data;

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
        castValue = recast(processedValue as any, castingDefinition, props, appendHydrationCastingExecutionOptionsDefaults(options));
      }

      // Store cast value
      rehydrated[key as keyof typeof rehydrated] = castValue as unknown as typeof rehydrated[keyof typeof rehydrated];
    }
  }

  // Return (re)hydrated instance
  return rehydrated;
}

/**
 * Recasting an undefined value will use behavior defined by the "undefined" option
 * @param value Value to cast
 * @param castDefinition Casting definition to apply when casting
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Cast instances
 */
function recast<TValue extends object, TCast extends ClassInstance>(
  value: undefined,
  castDefinition: HydrationCastingConfiguration<TCast, CastAs.SingleInstance>,
  props?: HydrationProperties,
  options?: HydrationCastingExecutionOptions,
): undefined;
/**
 * Casting a value according to casting definition for a single instance cast will cast as a single instance
 * @param value Value to cast
 * @param castDefinition Casting definition to apply when casting
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Cast instances
 */
function recast<TValue extends object, TCast extends ClassInstance>(
  value: TValue,
  castDefinition: HydrationCastingConfiguration<TCast, CastAs.SingleInstance>,
  props?: HydrationProperties,
  options?: HydrationCastingExecutionOptions,
): TCast;
/**
 * Casting a value according to casting definition for a instance array cast will cast as an array of instances
 * @param value Object to cast
 * @param castDefinition Casting definition to apply when casting
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Attay of cast instances
 */
function recast<TValue extends object, TValueArray extends Array<TValue>, TCast extends ClassInstance>(
  value: TValueArray,
  castDefinition: HydrationCastingConfiguration<TCast, CastAs.ArrayOfInstances>,
  props?: HydrationProperties,
  options?: HydrationCastingExecutionOptions,
): Array<TCast>;
/**
 * Casting a value according to casting definition for a instance hashmap cast will cast as a hashmap of instances
 * @param value Array of objects to cast
 * @param castDefinition Casting definition to apply when casting
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Hashmap of cast instances
 */
function recast<TValue extends object, TValueRecord extends Record<PropertyKey, TValue>, TCast extends ClassInstance>(
  value: TValueRecord,
  castDefinition: HydrationCastingConfiguration<TCast, CastAs.HashmapOfInstances>,
  props?: HydrationProperties,
  options?: HydrationCastingExecutionOptions,
): Record<keyof TValueRecord, TCast>;
/**
 * Casting a value according to casting definition
 * @param value Object, array of objects or hashmap of objects to cast
 * @param castDefinition Casting definition to apply when casting
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @param options Hydration options controling fine tuning of the hydration process
 * @returns Cast instance, array of instances or hashmap of instances
 */
function recast<TValue extends object, TValueArray extends Array<TValue>, TValueRecord extends Record<PropertyKey, TValue>, TCast extends ClassInstance>(
  value: undefined | TValue | TValueArray | TValueRecord,
  castDefinition: HydrationCastingConfiguration<TCast>,
  props: HydrationProperties = HydrationStrategy.OnlyBoundClassProperties,
  options?: HydrationCastingExecutionOptions,
): undefined | TCast | Array<TCast> | Record<keyof TValueRecord, TCast> {
  // If cast defined as a cast to single instance
  if (castDefinition.targetStructure === CastAs.SingleInstance) {
    // Cast by dehydrating an instance of expected class
    return rehydrate(value, castDefinition.targetEnttType, props, appendHydrationCastingExecutionOptionsDefaults(options)) as TCast;
  }

  // If cast defined as a cast to array of instances
  else if (castDefinition.targetStructure === CastAs.ArrayOfInstances) {
    if (value instanceof Array) {
      // Filter out any undefined values from the array before casting
      const filteredValues = value.filter(value => value !== undefined);
      // Cast each member of the array
      return filteredValues.map(value =>
        recast(value, { ...castDefinition, targetStructure: CastAs.SingleInstance }, props, appendHydrationCastingExecutionOptionsDefaults(options)),
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
          props,
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
 * Type describing an expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 */
export type HydrationProperties = HydrationStrategy | Array<PropertyKey | HydrationStrategy>;

/**
 * Collects property names for properties which should be dehydrated/(re)hydrated based on the source and target of hydration
 * and the strategy chosed
 * @param instance (Re)Hydrated class or class instance
 * @param props Expression for determining hydration properties either via a strategy, direct property names, or a combination of both
 * @returns Array of property names that should participate in the hydration process
 */
function collectHydratingPropertyDecoratorDefinitions<TInstance extends ClassInstance>(
  instance: Class<TInstance> | ClassInstance<TInstance>,
  props: HydrationProperties,
): Record<keyof TInstance, false | EnttPropertyDefinition<TInstance>> {
  // Get instance's class's decorator definitions
  const allDecoratedPropertiesDefinitions = getDecoratedClassDefinition(instance);
  const onlyBoundPropertiesDefinitions = filterDefinition(allDecoratedPropertiesDefinitions, bindPropertySymbol);
  const allPropertiesKeys = [...new Set([...Object.keys(allDecoratedPropertiesDefinitions.properties), ...Object.keys(instance)])];

  // Collect property definitions depending on the selected strategy
  const properties: Record<PropertyKey, false | EnttPropertyDefinition<TInstance>> = {};
  for (const prop of props instanceof Array ? props : [props]) {
    // Get properties via "AllClassProperties" strategy
    if (prop === HydrationStrategy.AllClassProperties) {
      for (const key of allPropertiesKeys) {
        if (!properties[key]) {
          properties[key] = allDecoratedPropertiesDefinitions.properties[key];
        }
      }
    }
    // Get properties via "AllDecoratedClassProperties" strategy
    else if (prop === HydrationStrategy.AllDecoratedClassProperties) {
      for (const key of Object.keys(allDecoratedPropertiesDefinitions.properties)) {
        if (!properties[key]) {
          properties[key] = allDecoratedPropertiesDefinitions.properties[key];
        }
      }
    }
    // Get properties via "OnlyBoundClassProperties" strategy
    else if (prop === HydrationStrategy.OnlyBoundClassProperties) {
      for (const key of Object.keys(onlyBoundPropertiesDefinitions.properties)) {
        if (!properties[key]) {
          properties[key] = allDecoratedPropertiesDefinitions.properties[key];
        }
      }
    }
    // Get properties via "OnlyBoundClassProperties" strategy
    else if (typeof prop === 'string') {
      if (!properties[prop]) {
        properties[prop] = allDecoratedPropertiesDefinitions.properties[prop];
      }
    }
    // Unsupported property expression
    else {
      throw new Error(`"${prop.toString()}" is not a supported property expression! Only HydrationStrategy members or explicit property names are allowed.`);
    }
  }

  // Return collected property definitions
  return properties;
}

// #endregion
