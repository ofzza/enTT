// =====================================================================================================================
// ENTITY: Entity Dynamic Value Module
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EntityModule from '../';
import EntityPrototype from '../../prototype';

/**
 * Dynamic value module, included directly into Entity base class,
 * provides support for read-only, dynamically generated properties
 * @export
 * @class DynamicValueEntityModule
 * @extends {EntityModule}
 */
export default class DynamicValueEntityModule extends EntityModule {

  processProperty (name, def) {
    // Initialize formal definition
    const formal = {};
    // Check for dynamic value function value
    if (def && def.dynamic && _.isFunction(def.dynamic)) {

      // Assign explicitly defined function
      formal.dynamic = def.dynamic;
      formal.dependencies = (_.isArray(def.dependencies) ? def.dependencies : false);

    } else if (_.isFunction(def) && (!def.prototype || !(def.prototype instanceof EntityPrototype))) {
      // Assign short-hand definition
      formal.dynamic = def;
    }
    // Return formal definition
    return formal;
  }

  initialize (name, value, formal) {
    // If dynamic property
    if (formal.dynamic) {

      // Initialize a storage for calculated dynamic values and listeners
      // TODO: Drop $dyn as an exposed property!!!
      let storage = this.$dyn = (this.$dyn || {
        values: {},
        listeners: {
          all: {},
          byDependency: {}
        }
      });

      // Initialize calculated values storage
      let recalculateFn = () => { storage.values[name] = formal.dynamic.bind(this)(); };
      recalculateFn();

      // Process dependencies and store listeners
      storage.listeners.all[name] = recalculateFn;
      _.forEach((formal.dependencies || ['*']), (dependency) => {
        if (!storage.listeners.byDependency[dependency]) { storage.listeners.byDependency[dependency] = {}; }
        storage.listeners.byDependency[dependency][name] = recalculateFn;
      });

    }
  }

  afterSet (name) {
    // If dynamic property
    if (this.$dyn) {

      // Get storage
      let storage = this.$dyn;
      // Trigger dynamic property recalculation and storage for properties with this dependency
      if (storage.listeners.byDependency && storage.listeners.byDependency[name]) {
        _.forEach(storage.listeners.byDependency[name], (recalcPropertyFn) => { recalcPropertyFn(); });
      }
      // Trigger dynamic property recalculation and storage for properties with no defined dependencies
      if (storage.listeners.byDependency) {
        _.forEach(storage.listeners.byDependency['*'], (recalcPropertyFn) => { recalcPropertyFn(); });
      }

    }
  }

  get (name, value, formal) {
    // If dynamic property
    if (this.$dyn) {

      // Get storage
      let storage = this.$dyn;
      // If defined as dynamic property, use dynamic function to calculate value
      if (formal.dynamic) {
        // Check if calculated value
        if (storage.values[name]) {
          // Return calculated value
          return storage.values[name];
        } else {
          // Calculate value
          return (storage.values[name] = formal.dynamic.bind(this)());
        }
      }

    }
  }

  update (updated = null) {
    // If dynamic property
    if (this.$dyn) {

      // Get storage
      let storage = this.$dyn;
      // Check if specified updated properties
      if (updated) {

        // Trigger dynamic property recalculation for properties with updated dependencies
        if (storage.listeners.byDependency && storage.listeners.byDependency[name]) {
          _.forEach((_.isArray(updated) ? updated : [ updated ]), (name) => {
            _.forEach(storage.listeners.byDependency[name], (recalcPropertyFn) => { recalcPropertyFn(); });
          });
        }
        // Trigger dynamic property recalculation and storage for properties with no defined dependencies
        if (storage.listeners.byDependency) {
          _.forEach(storage.listeners.byDependency['*'], (recalcPropertyFn) => { recalcPropertyFn(); });
        }

      } else {

        // Trigger dynamic property recalculation for all dynamic properties
        if (storage.listeners.all) {
          _.forEach(storage.listeners.all, (recalcPropertyFn) => { recalcPropertyFn(); });
        }

      }

    }
  }

}
