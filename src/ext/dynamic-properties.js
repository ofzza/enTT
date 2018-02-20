// =====================================================================================================================
// ENTITY: Dynamic Properties Extension
// Adds support for read-only, dynamically generated properties that generate their value based on other
// existing properties' values
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EnTT from '../entt';
import { EnTTBypassEverythingValue } from '../entt/properties';
import EnTTExt from '../enttext';

/**
 * Dynamic Properties Extension
 * Adds support for read-only, dynamically generated properties that generate their value based on other
 * existing properties' values
 * @export
 * @class Extensions
 */
export default class DynamicPropertiesExtension extends EnTTExt {

  /**
   * Creates an instance of DynamicPropertiesExtension.
   * @param {any} deferred If true, the dynamic property value will be generated each time the property getter is called instead of on change detection
   * @memberof DynamicPropertiesExtension
   */
  constructor ({ deferred = false } = {}) {
    super({
      processShorthandPropertyConfiguration: true,
      updatePropertyConfiguration: true,
      // If not deferred, regenerate dynamic property value on initialization and change detected
      onEntityInstantiate: !deferred,
      onChangeDetected: !deferred,
      // If deferred, regenerate dynamic property value on get
      interceptPropertyGet: deferred
    });
  }

  /**
   * Processes property configuration looking for dynamic property short-hand configuration (non-constructor function)
   * @param {any} propertyConfiguration Single property configuration to be processed
   * @returns {any} Processed property configuration
   * @memberof EnTTExt
   */
  processShorthandPropertyConfiguration (propertyConfiguration) {
    // Check if short-hand dynamic property configuration (a non constructor function)
    if (_.isFunction(propertyConfiguration) && propertyConfiguration !== EnTT) {
      return { dynamic: propertyConfiguration };
    } else {
      // Keep configuration as is
      return propertyConfiguration;
    }
  }

  /**
   * Updates property's configuration - if a dynamic property, make it read-only
   * @param {any} propertyConfiguration Single property configuration to be updated
   * @memberof EnTTExt
   */
  updatePropertyConfiguration (propertyConfiguration) {
    if (isDynamicProperty(propertyConfiguration)) {
      // Make property read-only
      propertyConfiguration.readOnly = true;
    }
  }

  /**
   * Modifies the entity instance right after it is constructed - recalculate dynamic property values on intialization
   * @param {any} entity Entity instance
   * @param {any} properties Entity's properties' configuration
   * @memberof EnTTExt
   */
  onEntityInstantiate (entity, properties) { recalculateAllDynamicProperties.bind(this)(entity, properties); }

  /**
   * Notifies the extension that the entity instance being extended has had a property change detected - recalculate dynamic property values
   * @param {any} entity Entity instance
   * @param {any} properties Entity's properties' configuration
   * @memberof EnTTExt
   */
  onChangeDetected (entity, properties) { recalculateAllDynamicProperties.bind(this)(entity, properties); }

  /**
   * Generates a function to process every value being fetched from the particular property
   * @param {any} propertyName Name of the property being processed
   * @param {any} propertyConfiguration Property configuration
   * @returns {function} Function processing every value being fetched from this property (If no function returned, extension won't intercept getter for this property)
   * @memberof EnTTExt
   */
  interceptPropertyGet (propertyName, propertyConfiguration) {
    // Check if dynamic property
    if (isDynamicProperty(propertyConfiguration)) {
      /**
       * Called before returning a fetched property value, allows the extension to modify the value being fetched
       * @param {any} entity Entity instance
       * @param {any} properties Entity's properties' configuration
       * @param {any} event EnTTExtGetValueEvent instance
       * @memberof EnTTExt
       */
      return (entity, properties, event) => {
        // Recalculate dynamic property value
        event.value = propertyConfiguration.dynamic(entity);
      };
    }
  }

}

/**
 * Checks if property is defined as a dynamic property
 * @param {any} propertyConfiguration Property configuration
 * @returns {bool} If property is defined as a dynamic property
 */
function isDynamicProperty (propertyConfiguration) {
  return propertyConfiguration
      // Is defined as dynamic
      && propertyConfiguration.dynamic
      // Dynamic option value is a function
      && _.isFunction(propertyConfiguration.dynamic)
      // Dynamic option value is not a EnTT class
      && (propertyConfiguration.dynamic !== EnTT);
}

/**
 * Recalculate dynamic property values
 * @param {any} entity Entity instance
 * @param {any} properties Entity's properties' configuration
 * @memberof EnTTExt
 */
function recalculateAllDynamicProperties (entity, properties) {
  // Find all dynamic properties
  _.forEach(properties, (propertyConfiguration, propertyName) => {
    if (isDynamicProperty(propertyConfiguration)) {
      // Recalculate dynamic property value
      const dynamicValue = propertyConfiguration.dynamic(entity);
      // Set updated dynamic value (wrap into EnTTBypassEverythingValue to bypass read-only restriction)
      entity[propertyName] = new EnTTBypassEverythingValue(dynamicValue);
    }
  });
}
