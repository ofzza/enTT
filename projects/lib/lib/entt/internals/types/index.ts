// enTT lib types
// ----------------------------------------------------------------------------

// #region Utility types

/**
 * A class which constructs instances of type T
 */
export type Class<T> = new (...args: any[]) => T;

/**
 * Value can be used as property name
 */
export type PropertyName = string | number | symbol;

// #endregion

// #region EnTT types

/**
 * A transparent proxy to the underlying class instance with dynamic EnTT functionality attached
 */
export type EnttInstance<T extends object> = T & {};

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

/**
 * Definition for a decorator, holding all its proxy hooks
 */
export class CustomDecoratorDefinition<TTarget, TValOuter, TValInner> {
  /**
   * Constructor
   * @param onPropertyGet Proxy hook to be called when property value is being requested
   * @param onPropertySet Proxy hook to be called when property value is being set
   */
  constructor(
    public onPropertyGet?: (v: TValInner) => TValOuter,
    public onPropertySet?: (v: FullPathPropertyValue<TTarget, TValOuter>) => FullPathPropertyValue<TTarget, TValInner>,
  ) {}
}

/**
 * Callback function expected to return data which will be stored within a property's decorator definition once decorator is used to decorate a property
 */
export type CustomStaticDecoratorConfiguration = (definition: EnttPropertyDecoratorDefinition) => any;

/**
 * Definition for custom dynamic decorator configuration
 */
export type CustomDynamicDecoratorConfiguration<TInstance, TValInner, TValOuter> = {
  /**
   * Callback function expected to return data which will be stored within a property's decorator definition once decorator is used to decorate a property
   */
  setDecoratorDefinitionData?: (definition: EnttPropertyDecoratorDefinition) => any;
  /**
   * Callback function called when accessing (getting) a property of an EnTTified instance. The callback is expected to transform the value being returned
   * before it is passed on ...
   */
  onPropertyGet?: (value: TValInner) => TValOuter;
  /**
   * Callback function called when accessing (setting) a property of an EnTTified instance. The callback is expected to transform the value being stored
   * before it is passed on ...
   */
  onPropertySet?: (value: FullPathPropertyValue<TInstance, TValOuter>) => FullPathPropertyValue<TInstance, TValInner>;
};

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
    bySymbol: Record<symbol, EnttPropertyDecoratorDefinition>;
  } = { symbolsInOrderOfApplication: [], bySymbol: {} };
}
/**
 * Definition for a single EnTT decorator an entity property has been decorated with
 */
export class EnttPropertyDecoratorDefinition {
  /**
   * Constructor
   * @param owner Stores the parent class this definition refers to
   * @param ownerPropertyKey Name of the property this definition refers to
   * @param ownerPropertyDecoratorSymbol Unique symbol of the decorator this definition refers to
   */
  constructor(public readonly owner: Class<object>, public readonly ownerPropertyKey: PropertyName, public readonly ownerPropertyDecoratorSymbol: symbol) {}
  /**
   * Holds data the decorator was configured with for the property it is decorating
   */
  data: any;
}

// #endregion
