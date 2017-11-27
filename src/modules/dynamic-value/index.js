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

  initialize (name, value, formal, cache) {
    // If dynamic property
    if (formal.dynamic) {

      // Initialize a cached storage for calculated dynamic values and listeners
      if (!cache.initialized) {
        _.merge(cache, {
          initialized: true,
          values: {},
          listeners: {
            all: {},
            byDependency: {}
          }
        });
      }

      // Initialize calculated values storage
      let recalculateFn = () => { cache.values[name] = formal.dynamic.bind(this)(); };
      recalculateFn();

      // Process dependencies and store listeners
      cache.listeners.all[name] = recalculateFn;
      _.forEach((formal.dependencies || ['*']), (dependency) => {
        if (!cache.listeners.byDependency[dependency]) { cache.listeners.byDependency[dependency] = {}; }
        cache.listeners.byDependency[dependency][name] = recalculateFn;
      });

    }
  }

  afterSet (name, value, formal, cache) {
    // If dynamic property
    if (cache.initialized) {

      // Trigger dynamic property recalculation and storage for properties with this dependency
      if (cache.listeners.byDependency && cache.listeners.byDependency[name]) {
        _.forEach(cache.listeners.byDependency[name], (recalcPropertyFn) => { recalcPropertyFn(); });
      }

      // Trigger dynamic property recalculation and storage for properties with no defined dependencies
      if (cache.listeners.byDependency) {
        _.forEach(cache.listeners.byDependency['*'], (recalcPropertyFn) => { recalcPropertyFn(); });
      }

    }
  }

  get (name, value, formal, cache) {
    // If dynamic property
    if (cache.initialized) {

      // If defined as dynamic property, use dynamic function to calculate value
      if (formal.dynamic) {
        // Check if calculated value
        if (cache.values[name]) {
          // Return calculated value
          return cache.values[name];
        } else {
          // Calculate value
          return (cache.values[name] = formal.dynamic.bind(this)());
        }
      }

    }
  }

  update (updated = null, cache) {
    // If dynamic property
    if (cache.initialized) {

      // Check if specified updated properties
      if (updated) {

        // Trigger dynamic property recalculation for properties with updated dependencies
        if (cache.listeners.byDependency && cache.listeners.byDependency[name]) {
          _.forEach((_.isArray(updated) ? updated : [ updated ]), (name) => {
            _.forEach(cache.listeners.byDependency[name], (recalcPropertyFn) => { recalcPropertyFn(); });
          });
        }

        // Trigger dynamic property recalculation and storage for properties with no defined dependencies
        if (cache.listeners.byDependency) {
          _.forEach(cache.listeners.byDependency['*'], (recalcPropertyFn) => { recalcPropertyFn(); });
        }

      } else {

        // Trigger dynamic property recalculation for all dynamic properties
        if (cache.listeners.all) {
          _.forEach(cache.listeners.all, (recalcPropertyFn) => { recalcPropertyFn(); });
        }

      }

    }
  }

}
