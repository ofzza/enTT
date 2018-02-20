// =====================================================================================================================
// ENTITY: Properties initialization
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EnTT from '../entt';
import DataManagement from './data-management';
import { EntityChangedEvent } from './change-detection';
import { ConfigurationCache } from  '../utils/cache';

/**
 * Entity properties
 * @export
 * @class Properties
 */
export default class Properties {

  /**
   * Retrieves property configuration from an Entity instance or class
   * @static
   * @param {any} entity Entity instance or EnTT extending class to get property configuration for
   * @returns {any} Property configuration
   * @memberof Properties
   */
  static getEntityPropertyConfiguration (entity) {
    // Check if entity passed as instance or class
    if (entity instanceof EnTT) {
      // Return property configuration from instance
      return ConfigurationCache.get(entity).properties;
    } else if (_.isFunction(entity) && (entity.prototype instanceof EnTT)) {
      // Return property configuration from class
      return ConfigurationCache.get(new entity()).properties;
    }
  }

  /**
   * Initializes configured properties with managed getters/setters
   * @param {any} entity Reference to the parent entity instance
   * @param {any} propertyManager Properties instance associated to the entity instance being handled
   * @param {any} properties Properties configuration
   * @returns {any} reference to internal property values storage (for further initialization)
   */
  static initialize ({ entity, propertyManager, properties }) {

    // Initialize instance's working store
    const store = {
      // Holds current entity values
      values: {},
      // Holds references to properties containing child entities' watcher cancelation functions
      embeddedEntityWatchers: {}
    };

    // Initialize properties' getters and setters
    _.forEach(properties, (propertyConfiguration, propertyName) => {
      // Set property initial value
      store.values[propertyName] = propertyConfiguration.value || null;
      // Initialize property getter/setter
      Object.defineProperty(entity, propertyName,
        _.merge(
          // Basic property configuration
          {
            configurable: false,
            enumerable: true
          },
          // Setter function (throws error if property is "read-only")
          {
            set: (value) => {
              // Check if allowed to write value
              if (value instanceof EnTTBypassEverythingValue) {
                // Write value directly into storage, regardless of read-only status bypassing any pre-processing and without triggering any watchers
                return (store.values[propertyName] = value.value);
              } else if (propertyConfiguration.readOnly) {
                // Don't write value to read-only property
                throw new Error(`Can't set a read-only EnTT property!`);
              } else {
                // Write value
                propertyManager.propertySetterFunction(store, propertyName, value);
              }
            }
          },
          // Getter function
          {
            get: () => {
              // Get value
              return propertyManager.propertyGetterFunction(store, propertyName);
            }
          }
        )
      );
    });

    // Return reference to internal values, to be used in further initialization
    return store.values;

  }

  /**
   * Creates an instance of Properties.
   * @param {any} entity Reference to the parent entity instance
   * @param {any} changeManager Changes watcher instance
   * @param {any} extensionsManager Extensions manager
   * @param {any} properties Properties configuration
   * @memberof Properties
   */
  constructor ({ entity, changeManager, extensionsManager, properties }) {
    // Store local properties
    this.entity = entity;
    this.changeManager = changeManager;
    this.extensionsManager = extensionsManager;
    this.properties = properties;
  }

  /**
   * Sets a property value
   * @param {any} store Working store
   * @param {any} key Property name
   * @param {any} value Property value
   */
  propertySetterFunction (store, key, value) {

    // Check if previously set value was an Entity, and if so disconnect instance watchers from the child entity
    if (store.values[key] instanceof EnTT) {
      // Cancel watcher on child entity
      store.embeddedEntityWatchers[key]();
      // Remove watcher cancel function
      if (!_.isUndefined(store.embeddedEntityWatchers[key])) {
        delete store.embeddedEntityWatchers[key];
      }
    }
    // Check if set value is an Entity, and if so connect instance watchers to the child entity
    if ((value instanceof EnTT) && (value !== this.entity)) {
      // Watch for changes to the child entity, and trigger own watcher on change
      const cancelWatcherFn = value.watch((e) => {
        // Check if changed entity is this one (nested in itself)
        if (e.source !== this.entity) {
          // Trigger watchers with the change to the property
          this.changeManager.triggerOnPropertyChange(
            new EntityChangedEvent({
              source: e.source,
              propertyName: key,
              innerEvent: e
            })
          );
        }
      });
      // Store watcher cancel function
      store.embeddedEntityWatchers[key] = cancelWatcherFn;
    }

    // Check if value needs to be cast
    const EntityCastingClass = this.properties[key].cast;
    if (EntityCastingClass) {
      // Cast value before storing it
      value = DataManagement.cast(value, EntityCastingClass);
    }

    // EXTENSIONS HOOK: .interceptPropertySet(...)
    // Lets extensions intercept and update the property value being set before it is committed to the entity instance
    value = this.extensionsManager.interceptPropertySet[key](store.values[key], value);

    // Set value
    const oldValue = store.values[key];
    store.values[key] = value;

    // Trigger watchers with the change to the property
    this.changeManager.triggerOnPropertyChange(
      new EntityChangedEvent({
        source: this.entity,
        propertyName: key,
        oldValue: oldValue,
        newValue: value
      })
    );
  }

  /**
   * Gets a property value
   * @param {any} store Working store
   * @param {any} key Property name
   * @returns {any} Property value
   */
  propertyGetterFunction (store, key) {

    // Get value
    let value = store.values[key];

    // EXTENSIONS HOOK: .interceptPropertyGet(...)
    // Lets extensions intercept and update the property value being fetched before it is returned
    value = this.extensionsManager.interceptPropertyGet[key](store.values[key], value);

    // Return value
    return value;

  }

}

/**
 * Encapsulates a value marking it as ready to be stored directly, without any checks (ignoring read-only), pre-processing (casting) or triggering any watchers
 * @export
 * @class EnTTReadonlyOverrideValue
 */
export class EnTTBypassEverythingValue {
  /**
   * Creates an instance of EnTTReadonlyOverrideValue.
   * @param {any} value Internal value to write
   * @memberof EnTTReadonlyOverrideValue
   */
  constructor (value) {
    // Store value
    this.value = value;
  }
}
