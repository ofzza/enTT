// =====================================================================================================================
// ENTITY PROTOTYPE Internals: Property processing and initialization functions
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import Cache from './cache';


/**
 * Initializes managed properties, based on schema definitions, calling all modules as part of getter/setter
 * @param {any} modules Array of modules applied to this class
 * @param {any} schema Collection of formalized property definitions for this class (property names used as keys)
 * @param {any} watchers Repository of entity instance's registered watchers
 */
export default function initializeManagedProperties (modules, schema, watchers) {

  // Initialize value storage (or get already processed from class' cache)
  let storage = Cache.fetch(this, 'storage');

  // If not loaded from cache, initialize managed properties
  if (!storage) {

    // Process managed properties and formalize their definitions per included module
    storage = {};
    _.forEach(schema, (def, name) => {
      // Initialize values (course undefined to null)
      _.forEach(modules, (module) => {
        let initializedValue = module.initialize.bind(this)(storage[name], def[module.constructor.name]);
        if (!_.isUndefined(initializedValue)) {
          storage[name] = initializedValue;
        } else if (_.isUndefined(storage[name])) {
          storage[name] = null;
        }
      });

      // Initialize property
      Object.defineProperty(this, name, {
        configurable: false,
        enumerable: true,
        get: () => {
          // Get value from storage
          let value = storage[name];
          // Let modules process value
          _.forEach(modules, (module) => {
            let updatedValue = module.get.bind(this)(value, def[module.constructor.name]);
            if (!_.isUndefined(updatedValue)) { value = updatedValue; }
          });
          // Return processed value (course undefined to null)
          return (!_.isUndefined(value) ? value : null);
        },
        set: (value) => {
          // Let modules process value
          _.forEach(modules, (module) => {
            let updatedValue = module.set.bind(this)(value, def[module.constructor.name]);
            if (!_.isUndefined(updatedValue)) { value = updatedValue; }
          });
          // Check if value changed
          let newValue = (!_.isUndefined(value) ? value : null);
          if (newValue !== storage[name]) {
            // Store processed value (course undefined to null)
            storage[name] = (!_.isUndefined(value) ? value : null);
            // In case setting an Entity, watch for it's changes
            watchers.watchChildEntity(name, value);
            // Trigger watchers
            watchers.triggerChangeEvent(name);
          }
        }
      });

    });

    // Cache for future instances
    Cache.store(this, 'storage', storage);

  }

  // Expose storage (read-only, returns a cloned object to prevent tampering)
  Object.defineProperty(this, 'storage', {
    configurable: false,
    enumerable: false,
    get: () => { return _.clone(storage); }
  });

}
