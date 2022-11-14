// enTT HYDRATION decorators and services
// ----------------------------------------------------------------------------

// Import dependencies
import { isProduction, Class, PropertyName, createPropertyCustomDecorator } from '../../lib';

// #region @Hydratable decorator

// Unique identifier symbol identifying the Hydratable decorator
const hydratableDecoratorSymbol = Symbol('Hydratable property decorator');

/**
 * Hydratable decorator configuration type
 */
type HydratableDecoratorConfiguration = {
  binding?: PropertyName;
  castAs: Class<object> | Class<object>[] | Record<PropertyName, Class<object>>;
};

/**
 * Hydratable decorator
 * @param config Hydration configuration for the decorated property
 * @returns Property decorator
 */
export function Hydratable(config: HydratableDecoratorConfiguration) {
  return createPropertyCustomDecorator(() => config, hydratableDecoratorSymbol);
}

// #endregion

// #region (Re)Hydrate / Dehydrate services

export enum HydrationStrategy {
  OnlyHydratableClassProperties = 'OnlyDecoratedProperties',
  AllClassProperties = 'AllClassProperties',
  AllProperties = 'AllProperties',
}

// TODO: ...
export function dehydrate(target: object, strategy: HydrationStrategy = HydrationStrategy.OnlyHydratableClassProperties): object {
  return {};
}

// TODO: ...
export function rehydrate(target: object, data: object, strategy: HydrationStrategy = HydrationStrategy.OnlyHydratableClassProperties) {
  /**/
}

// #endregion
