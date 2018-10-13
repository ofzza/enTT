// =====================================================================================================================
// ENTITY: Validation Extension
// Adds support for validating values as they are assigned to properties
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import * as symbols from '../symbols';
import EnTTExt from '../enttext';
import { EnTTBypassEverythingValue } from '../entt/properties';

/**
 * Validation Extension
 * Adds support for validating values as they are assigned to properties
 * @export
 * @class ValidationExtension
 */
export default class ValidationExtension extends EnTTExt {

  /**
   * Creates an instance of ValidationExtension.
   * @param {bool} reject If true, invalid values won't be assigned to the property
   * @memberof ValidationExtension
   */
  constructor ({ reject = false } = {}) {
    super({
      onEntityInstantiate: true,
      onChangeDetected: true
    });

    // Store configuration
    this.rejectInvalidValues = reject;
  }

  /**
   * Modifies the entity instance right after it is constructed - appends instance with the validation property
   * @param {any} entity Entity instance
   * @param {any} properties Entity's properties' configuration
   * @memberof EnTTExt
   */
  onEntityInstantiate (entity, properties) {

    // Initialize validation errors storage
    const errors = {};

    // Export public .validation getter && [symbols.privateNamespace].getValidation() method
    const validationFn = entity[symbols.privateNamespace].getValidation = () => {
      return errors;
    };
    Object.defineProperty(entity, 'validation', {
      configurable: false,
      enumerable: false,
      get: () => { return validationFn(); }
    });

    // Validate default property values
    validateProperties.bind(this)(entity, properties);

  }

  /**
   * Notifies the extension that the entity instance being extended has had a property change detected - reevaluate property validity
   * @param {any} entity Entity instance
   * @param {any} properties Entity's properties' configuration
   * @param {any} event EntityChangedEvent instance
   * @memberof EnTTExt
   */
  onChangeDetected (entity, properties, event) {
    // Validate updated properties
    validateProperties.bind(this)(entity, properties, event.propertyName, event.newValue, event.oldValue);
  }

}

/**
 * Checks if property is defined as needing validation
 * @param {any} propertyConfiguration Property configuration
 * @returns {bool} If property is defined as needing validation
 */
function isValidationProperty (propertyConfiguration) {
  return propertyConfiguration
      // Is defined as dynamic
      && propertyConfiguration.validate
      // Dynamic option value is a function
      && _.isFunction(propertyConfiguration.validate);
}

/**
 * Performs property validation and outputs results to errors object
 * @param {any} entity Entity instance
 * @param {any} properties Entity's properties' configuration
 * @param {any} changedPropertyName Name of the property being validated
 * @param {any} changedPropertyValue Value being validated
 * @param {any} currentPropertyValue Current property value
 */
function validateProperties (entity, properties, changedPropertyName, changedPropertyValue, currentPropertyValue) {

  // Validate default property values
  _.forEach(properties, (propertyConfiguration, propertyName) => {
    if (isValidationProperty(propertyConfiguration)) {
      // Run validation function
      const validatedValue = (propertyName !== changedPropertyName ? entity[propertyName] : changedPropertyValue),
            resetValue = (propertyName !== changedPropertyName ? null : currentPropertyValue),
            validation = propertyConfiguration.validate(validatedValue, entity);
      // Check if validation successful
      if (validation === undefined) {
        // Reset validation error
        delete entity[symbols.privateNamespace].getValidation()[propertyName];
      } else {
        // Store validation error
        entity[symbols.privateNamespace].getValidation()[propertyName] = new ValidationOutput({
          property: propertyName,
          value: validatedValue,
          message: validation
        });
        // If rejecting invalid values, reset value to current value
        if (this.rejectInvalidValues) {
          // Unset default value (wrap into EnTTBypassEverythingValue to bypass validation and watchers)
          entity[propertyName] = new EnTTBypassEverythingValue(resetValue);
        }
      }
    }
  });

}

/**
 * Holds validation output information
 * @class ValidationOutput
 */
export class ValidationOutput {
  /**
   * Creates an instance of ValidationError.
   * @param {any} property Name of the property being validated
   * @param {any} value Value being validated
   * @param {any} message Validation message
   * @memberof ValidationOutput
   */
  constructor ({ property, value, message }) {
    // Store properties
    this.property = property;
    this.value = value;
    this.message = message;
  }
}
