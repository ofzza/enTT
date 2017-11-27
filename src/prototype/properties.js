// =====================================================================================================================
// ENTITY PROTOTYPE Internals: Property processing and initialization functions
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EntityPrototype from './';
import { NotImplementedError } from '../modules';

/**
 * Initializes managed properties, based on property definitions, calling all modules as part of getter/setter
 * @param {any} modules Array of modules applied to this class
 * @param {any} propertyDefinitions Collection of formalized property definitions for this class (property names used as keys)
 * @param {any} watchers Repository of entity instance's registered watchers
 * @returns {any} Modules cache object
 */
export default function initializeManagedProperties (modules, propertyDefinitions, watchers) {

  // Filter modules by implemented methods
  let getterModules = _.filter(modules, (module) => { try { module.get(); return true; } catch (err) { return (err !== NotImplementedError); } }),
      setterModules = _.filter(modules, (module) => { try { module.set(); return true; } catch (err) { return (err !== NotImplementedError); } }),
      afterSetterModules = _.filter(modules, (module) => { try { module.afterSet(); return true; } catch (err) { return (err !== NotImplementedError); } });

  // Process managed properties and formalize their definitions per included module
  let storage = {},
      cache = _.reduce(modules, (cache, module) => {
        cache[module.constructor.name] = {};
        return cache;
      }, {});
  _.forEach(propertyDefinitions, (def, name) => {
    // Initialize values (course undefined to null)
    _.forEach(modules, (module) => {
      try {
        // Try initialization if implemented
        let initializedValue = module.initialize.bind(this)(name, storage[name], def[module.constructor.name], cache[module.constructor.name]);
        if (!_.isUndefined(initializedValue)) {
          storage[name] = initializedValue;
        } else if (_.isUndefined(storage[name])) {
          storage[name] = null;
        }
      } catch (err) {
        // Check if not implemented, or if legitimate error
        if (err !== NotImplementedError) { throw err; }
      }
    });

    // Initialize property
    Object.defineProperty(this, name, {
      configurable: false,
      enumerable: true,

      get: (() => {
        // Return composed getter function
        return () => {
          // Get value from storage
          let value = storage[name];
          // Let modules process set value
          _.forEach(getterModules, (module) => {
            try {
              let updatedValue = module.get.bind(this)(name, value, def[module.constructor.name], cache[module.constructor.name]);
              if (!_.isUndefined(updatedValue)) { value = updatedValue; }
            } catch (err) {
              // Check if not implemented, or if legitimate error
              if (err !== NotImplementedError) { throw err; }
            }
          });
          // Return processed value (course undefined to null)
          return (!_.isUndefined(value) ? value : null);
        };
      })(),

      set: (() => {
        // Return composed setter function
        return (value) => {
          // Let modules process set value
          _.forEach(setterModules, (module) => {
            try {
              let updatedValue = module.set.bind(this)(name, value, def[module.constructor.name], cache[module.constructor.name]);
              if (!_.isUndefined(updatedValue)) { value = updatedValue; }
            } catch (err) {
              // Check if not implemented, or if legitimate error
              if (err !== NotImplementedError) { throw err; }
            }
          });
          // Check if value changed
          let newValue = (!_.isUndefined(value) ? value : null);
          if (newValue !== storage[name]) {
            // Store processed value (course undefined to null)
            storage[name] = (!_.isUndefined(value) ? value : null);
            // Let modules process value after having set it
            _.forEach(afterSetterModules, (module) => {
              try {
                module.afterSet.bind(this)(name, value, def[module.constructor.name], cache[module.constructor.name]);
              } catch (err) {
                // Check if not implemented, or if legitimate error
                if (err !== NotImplementedError) { throw err; }
              }
            });
            // In case setting an Entity, watch for it's changes
            watchers.watchChildEntity(name, value);
            // Trigger watchers
            watchers.triggerChangeEvent(name);
          }
        };
      })()

    });

  });

  // Expose storage (if debugging)
  if (EntityPrototype.debug) {
    Object.defineProperty(this, '__storage', {
      configurable: false,
      enumerable: false,
      get: () => {
        if (EntityPrototype.debug) {
          return storage;
        } else {
          throw new Error('Access denied!');
        }
      }
    });
  }

  // Return modules cache
  return cache;

}
