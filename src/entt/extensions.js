// =====================================================================================================================
// ENTITY: Extensions initialization
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EnTT from '../entt';
import EnTTExt from '../enttext';
import { EnTTExtValueEvent } from '../enttext';
import { ConfigurationCache } from  '../utils/cache';

/**
 * Entity extensions
 * @export
 * @class Extensions
 */
export default class Extensions {

  /**
   * Retrieves extensions for an Entity instance or class
   * @static
   * @param {any} entity Entity instance or EnTT extending class to get extensions for
   * @returns {any} EnTT Extensions
   * @memberof Extensions
   */
  static getEntityExtensions (entity) {
    // Check if entity passed as instance or class
    if (entity instanceof EnTT) {
      // Return property configuration from instance
      return ConfigurationCache.get(entity).extensions;
    } else if (_.isFunction(entity) && (entity.prototype instanceof EnTT)) {
      // Return property configuration from class
      return ConfigurationCache.get(new entity()).extensions;
    }
  }

  /**
   * Creates an instance of Extensions.
   * @param {any} extensions Array of class extensions
   * @memberof Extensions
   */
  constructor (extensions) {

    // Preprocess extensions; convert classes into instances
    const processed = _.map(extensions, (extension) => {
      if (extension instanceof EnTTExt) {
        // Return extension instance
        return extension;
      } else if (_.isFunction(extension) && (extension.prototype instanceof EnTTExt)) {
        // Return newly instantiated extension class
        return new extension();
      } else {
        // Throw error
        throw new Error(`EnTT class' static ".includes" property needs to return only instances of EnTTExt class, or extended classes!`);
      }
    });

    // Store extensions
    this.extensions = processed;

  }

  /**
   * Initializes the extensions manager with methods tailored to proxy between the extensions' methods and the entity internal workflow
   * @param {any} entity Reference to the parent entity instance
   * @memberof Extensions
   */
  initializeWithoutProperties ({ entity }) {

    // Initialize a managed call to extensions' .processShorthandPropertyConfiguration(...) method
    processShorthandPropertyConfiguration.bind(this)({ entity });

  }

  /**
   * Initializes the extensions manager with methods tailored to proxy between the extensions' methods and the entity internal workflow
   * @param {any} entity Reference to the parent entity instance
   * @param {any} properties Properties configuration
   * @memberof Extensions
   */
  initializeWithProperties ({ entity, properties }) {

    // Initialize a managed call to extensions' .updatePropertyConfiguration(...) method
    updatePropertyConfiguration.bind(this)({ entity, properties });
    // Initialize a managed call to extensions' .onEntityInstantiate(...) method
    onEntityInstantiate.bind(this)({ entity, properties });
    // Initialize a managed call to extensions' .onChangeDetected(...) method
    onChangeDetected.bind(this)({ entity, properties });
    // Initialize a managed call to extensions' .afterChangeProcessed(...) method
    afterChangeProcessed.bind(this)({ entity, properties });
    // Initialize a managed call to extensions' .interceptPropertySet(...) method
    interceptPropertySet.bind(this)({ entity, properties });
    // Initialize a managed call to extensions' .interceptPropertyGet(...) method
    interceptPropertyGet.bind(this)({ entity, properties });

  }

}

/**
 * Creates a method used to call all extensions' .processShorthandPropertyConfiguration(...) method when needed (if the extension is implementing it)
 */
function processShorthandPropertyConfiguration () {

  // Fetch extensions implementing .processShorthandPropertyConfiguration(...) method
  let extensions = _.filter(this.extensions, (extension) => {
    return extension.implemented.processShorthandPropertyConfiguration;
  });

  // Create a proxy .processShorthandPropertyConfiguration(...) method
  this.processShorthandPropertyConfiguration =  (propertyConfiguration) => {
    // Execute all extensions' .processShorthandPropertyConfiguration(...) method and update configuration
    _.forEach(extensions, (extension) => {
      propertyConfiguration = extension.processShorthandPropertyConfiguration(propertyConfiguration);
    });
    // Return updated configuration
    return propertyConfiguration;
  };

}

/**
 * Creates a method used to call all extensions' .updatePropertyConfiguration(...) method when needed (if the extension is implementing it)
 */
function updatePropertyConfiguration () {

  // Fetch extensions implementing .updatePropertyConfiguration(...) method
  let extensions = _.filter(this.extensions, (extension) => {
    return extension.implemented.updatePropertyConfiguration;
  });

  // Create a proxy .updatePropertyConfiguration(...) method
  this.updatePropertyConfiguration =  (propertyConfiguration) => {
    // Execute all extensions' .updatePropertyConfiguration(...) method
    _.forEach(extensions, (extension) => {
      extension.updatePropertyConfiguration(propertyConfiguration);
    });
  };

}

/**
 * Creates a method used to call all extensions' .onEntityInstantiate(...) method when needed (if the extension is implementing it)
 * @param {any} entity Reference to the parent entity instance
 * @param {any} properties Properties configuration
 */
function onEntityInstantiate ({ entity, properties }) {

  // Fetch extensions implementing .onEntityInstantiate(...) method
  let extensions = _.filter(this.extensions, (extension) => {
    return extension.implemented.onEntityInstantiate;
  });

  // Create a proxy .onEntityInstantiate(...) method
  this.onEntityInstantiate =  () => {
    // Execute all extensions' .onEntityInstantiate(...) method
    _.forEach(extensions, (extension) => {
      extension.onEntityInstantiate(entity, properties);
    });
  };

}

/**
 * Creates a method used to call all extensions' .onChangeDetected(...) method when needed (if the extension is implementing it)
 * @param {any} entity Reference to the parent entity instance
 * @param {any} properties Properties configuration
 */
function onChangeDetected ({ entity, properties }) {

  // Fetch extensions implementing .onChangeDetected(...) method
  let extensions = _.filter(this.extensions, (extension) => {
    return extension.implemented.onChangeDetected;
  });

  // Create a proxy .onChangeDetected(...) method
  this.onChangeDetected =  (event) => {
    // Execute all extensions' .onChangeDetected(...) method
    _.forEach(extensions, (extension) => {
      extension.onChangeDetected(entity, properties, event);
    });
  };

}

/**
 * Creates a method used to call all extensions' .afterChangeProcessed(...) method when needed (if the extension is implementing it)
 * @param {any} entity Reference to the parent entity instance
 * @param {any} properties Properties configuration
 */
function afterChangeProcessed ({ entity, properties }) {

  // Fetch extensions implementing .afterChangeProcessed(...) method
  let extensions = _.filter(this.extensions, (extension) => {
    return extension.implemented.afterChangeProcessed;
  });

  // Create a proxy .afterChangeProcessed(...) method
  this.afterChangeProcessed =  (event) => {
    // Execute all extensions' .afterChangeProcessed(...) method
    _.forEach(extensions, (extension) => {
      extension.afterChangeProcessed(entity, properties, event);
    });
  };

}

/**
 * Creates a method used to call all extensions' .interceptPropertySet(...) method when needed (if the extension is implementing it)
 * @param {any} entity Reference to the parent entity instance
 * @param {any} properties Properties configuration
 */
function interceptPropertySet ({ entity, properties }) {
  // Create a proxy .interceptPropertySet(...) methods, per property
  this.interceptPropertySet = _.reduce(properties, (interceptPropertySet, propertyConfiguration, propertyName) => {

    // Fetch extensions implementing .interceptPropertySet(...) method for this property's interceptor functions
    let setterInterceptors = _.compact(
      _.map(this.extensions, (extension) => {
        // Check if implementing .interceptPropertySet(...) method
        if (extension.implemented.interceptPropertySet) {
          // Return the setter interceptor function (if returned for this property)
          return extension.interceptPropertySet(propertyName, propertyConfiguration);
        }
      })
    );

    // Initialize a per-property setter intercepting function and returns the updated value
    interceptPropertySet[propertyName] = (currentValue, newValue) => {

      // Initialize the EnTTExtValueEvent event
      let changes = [ currentValue, newValue ],
          event = new EnTTExtValueEvent({
        changes,
        currentValue,
        value: newValue,
      });

      // Cycle through all the setter interceptors
      _.forEach(setterInterceptors, (setterInterceptor) => {
        // Execute the extensino intercaptor
        setterInterceptor(entity, properties, event);
        // Update the changes array for the next interceptor
        changes.push(event.value);
      });

      // Return the updated value
      return event.value;

    };

    // Return composed interceptors
    return interceptPropertySet;

  }, {});
}

/**
 * Creates a method used to call all extensions' .interceptPropertyGet(...) method when needed (if the extension is implementing it)
 * @param {any} entity Reference to the parent entity instance
 * @param {any} properties Properties configuration
 */
function interceptPropertyGet ({ entity, properties }) {
  // Create a proxy .interceptPropertyGet(...) methods, per property
  this.interceptPropertyGet = _.reduce(properties, (interceptPropertyGet, propertyConfiguration, propertyName) => {

    // Fetch extensions implementing .interceptPropertyGet(...) method for this property's interceptor functions
    let getterInterceptors = _.compact(
      _.map(this.extensions, (extension) => {
        // Check if implementing .interceptPropertyGet(...) method
        if (extension.implemented.interceptPropertyGet) {
          // Return the setter interceptor function (if returned for this property)
          return extension.interceptPropertyGet(propertyName, propertyConfiguration);
        }
      })
    );

    // Initialize a per-property setter intercepting function and returns the updated value
    interceptPropertyGet[propertyName] = (currentValue, newValue) => {

      // Initialize the EnTTExtValueEvent event
      let changes = [ currentValue, newValue ],
          event = new EnTTExtValueEvent({
        changes,
        currentValue,
        value: newValue,
      });

      // Cycle through all the setter interceptors
      _.forEach(getterInterceptors, (getterInterceptor) => {
        // Execute the extensino intercaptor
        getterInterceptor(entity, properties, event);
        // Update the changes array for the next interceptor
        changes.push(event.value);
      });

      // Return the updated value
      return event.value;

    };

    // Return composed interceptors
    return interceptPropertyGet;

  }, {});
}
