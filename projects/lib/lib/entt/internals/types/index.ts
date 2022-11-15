// enTT lib types
// ----------------------------------------------------------------------------

// #region Utility types

/**
 * A class which constructs instances of type T
 */
export type Class<T> = new (...args: any[]) => T;
/**
 * An instance of type T of a class which constructs instances of type T
 */
export type ClassInstance<T> = InstanceType<Class<T>>;

/**
 * Value can be used as property name
 */
export type PropertyName = string | number | symbol;

// #endregion

// #region EnTT types: Helper types

/**
 * A transparent proxy to the underlying class instance with dynamic EnTT functionality attached
 */
export type EnttInstance<T extends object> = T & {};

/**
 * Describes a property and all the information needed to address that property
 */
export type FullPathProperty<T> = {
  /**
   * Parent instance containing the property containing the value
   */
  target: T;
  /**
   * Name of the property containing the value
   */
  key: PropertyName;
};

/**
 * Describes a property value and all the information needed to get/set that value
 */
export type FullPathPropertyValue<T, V> = {
  /**
   * Parent instance containing the property containing the value
   */
  target: T;
  /**
   * Name of the property containing the value
   */
  key: PropertyName;
  /**
   * Value being get/set
   */
  value: V;
};

// #endregion

// #region EnTT types: Custom class decorator types

/**
 * Definition for a class decorator, holding all its proxy hooks
 */
export class CustomClassDecoratorDefinition<TTarget> {
  /**
   * Constructor
   * @param onPropertyGet Proxy hook to be called when any property value is being requested
   * @param onPropertySet Proxy hook to be called when any property value is being set
   */
  constructor(public onPropertyGet?: (v: FullPathProperty<TTarget>) => any, public onPropertySet?: (v: FullPathPropertyValue<TTarget, any>) => any) {}
}

/**
 * Callback function expected to return data which will be stored within a class's decorator definition once decorator is used to decorate a class
 */
export type CustomStaticClassDecoratorConfiguration = (definition: EnttDecoratorDefinition) => any;

/**
 * Definition for custom dynamic decorator configuration
 */
export type CustomDynamicClassDecoratorConfiguration<TInstance> = {
  /**
   * Callback function expected to return data which will be stored within a class's decorator definition once decorator is used to decorate a class
   */
  setDecoratorDefinitionData?: (definition: EnttDecoratorDefinition) => any;
  /**
   * Callback function called when accessing (getting) any property of an EnTTified instance. The callback is expected to transform the value being returned
   * before it is passed on ...
   */
  onPropertyGet?: (value: FullPathProperty<TInstance>) => any;
  /**
   * Callback function called when accessing (setting) any property of an EnTTified instance. The callback is expected to transform the value being stored
   * before it is passed on ...
   */
  onPropertySet?: (value: FullPathPropertyValue<TInstance, any>) => any;
};

// #endregion

// #region EnTT types: Custom property decorator types

/**
 * Definition for a property decorator, holding all its proxy hooks
 */
export class CustomPropertyDecoratorDefinition<TTarget, TValOuter, TValInner> {
  /**
   * Constructor
   * @param onPropertyGet Proxy hook to be called when property value is being requested
   * @param onPropertySet Proxy hook to be called when property value is being set
   */
  constructor(public onPropertyGet?: (v: TValInner) => TValOuter, public onPropertySet?: (v: FullPathPropertyValue<TTarget, TValOuter>) => TValInner) {}
}

/**
 * Callback function expected to return data which will be stored within a property's decorator definition once decorator is used to decorate a property
 */
export type CustomStaticPropertyDecoratorConfiguration = (definition: EnttDecoratorDefinition) => any;

/**
 * Definition for custom dynamic decorator configuration
 */
export type CustomDynamicPropertyDecoratorConfiguration<TInstance, TValInner, TValOuter> = {
  /**
   * Callback function expected to return data which will be stored within a property's decorator definition once decorator is used to decorate a property
   */
  setDecoratorDefinitionData?: (definition: EnttDecoratorDefinition) => any;
  /**
   * Callback function called when accessing (getting) a property of an EnTTified instance. The callback is expected to transform the value being returned
   * before it is passed on ...
   */
  onPropertyGet?: (value: TValInner) => TValOuter;
  /**
   * Callback function called when accessing (setting) a property of an EnTTified instance. The callback is expected to transform the value being stored
   * before it is passed on ...
   */
  onPropertySet?: (value: FullPathPropertyValue<TInstance, TValOuter>) => TValInner;
};

// #endregion

// #region EnTT types: Decorator definitions

/**
 * Definition for an entity carrying properties decorated with EnTT functionality
 */
export class EnttDefinition {
  /**
   * Constructor
   * @param owner Stores the parent class this definition refers to
   */
  constructor(public readonly owner: Class<object>) {}
  /**
   * Holds class decorator definitions for decorators applied to this class
   */
  public decorators: {
    symbolsInOrderOfApplication: symbol[];
    bySymbol: Record<symbol, EnttDecoratorDefinition>;
  } = { symbolsInOrderOfApplication: [], bySymbol: {} };
  /**
   * Holds property definitions for this entity
   */
  public properties: Record<PropertyName, EnttPropertyDefinition> = {};
}
/**
 * Definition for an entity property carrying properties decorated with EnTT functionality
 */
export class EnttPropertyDefinition {
  /**
   * Constructor
   * @param owner Stores the parent class this definition refers to
   * @param ownerPropertyKey Name of the property this definition refers to
   */
  constructor(public readonly owner: Class<object>, public readonly ownerPropertyKey: PropertyName) {}
  /**
   * Holds property decorator definitions for decorators applied to this property
   */
  public decorators: {
    symbolsInOrderOfApplication: symbol[];
    bySymbol: Record<symbol, EnttDecoratorDefinition>;
  } = { symbolsInOrderOfApplication: [], bySymbol: {} };
}
/**
 * Definition for a single EnTT decorator used on an EnTT class or one of its constituents
 */
export class EnttDecoratorDefinition {
  /**
   * Constructor
   * @param decoratorSymbol Unique symbol of the decorator this definition refers to
   * @param owner Stores the parent class this definition refers to
   * @param ownerPropertyKey Name of the property this definition refers to
   */
  constructor(public readonly decoratorSymbol: symbol, public readonly owner: Class<object>, public readonly ownerPropertyKey?: PropertyName) {}
  /**
   * Holds data the decorator was configured with for the property it is decorating
   */
  data: any;
}

// #endregion
