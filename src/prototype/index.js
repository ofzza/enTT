// =====================================================================================================================
// ENTITY: Basic class prototype
// TODO: Allow subscribing to changes (via setters or manual updated notification)
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import { castAsEntity, castCollectionAsEntity } from './casting';
import fetchAllFromPrototypeChain from './initialization';
import initializeManagedProperties from './properties';
import { NotImplementedError } from '../modules';
import Debug from './debug';
import Watchers from './watchers';

/**
 * Entity prototype class
 * @export
 * @class EntityPrototype
 */
export default class EntityPrototype {

  /**
   * Debugging status (When debugging, some extra properties are exposed)
   * @static
   * @memberof EntityPrototype
   */
  static get debug () { return Debug.debug; }
  static set debug (value) { Debug.debug = value; }

  /**
   * Casts value as entity by copying content of all properties found on both
   * @static
   * @param {any} value Value to cast
   * @param {any} EntityClass Target casting Entity class
   * @returns {any} Cast instance of required Entity class
   * @memberof Watchers
   */
  static cast (value, EntityClass) { return castAsEntity.bind(this)(value, EntityClass); }
  /**
   * Casts collection of values as a collection of entities by casting each mamber of the collection
   * @static
   * @param {any} collection Collection to cast
   * @param {any} EntityClass Target casting Entity class
   * @returns {any} Cast collection
   * @memberof Entity
   */
  static castCollection (collection, EntityClass) { return castCollectionAsEntity.bind(this)(collection, EntityClass); }
  /**
   * Creates an instance of EntityPrototype.
   * @memberof EntityPrototype
   */
  constructor () {

    // Check if class neing directly instantiated
    if (this.constructor === EntityPrototype) {
      throw new Error('EntityPrototype class is not meant to be instantiated directly - extend it with your own class!');
    }

    // Check if prototype contains static definition property - if so validate and process it
    let { modules, propertyDefinitions } = fetchAllFromPrototypeChain.bind(this)();

    // Initialize watchers repository
    const watchers = new Watchers(this);

    // Initialize managed properties based on definitions
    let cache = initializeManagedProperties.bind(this)(modules, propertyDefinitions, watchers);

    // Initialize modules
    _.forEach(modules, (module) => {
      try {
        // Extract property definitions for this module
        let formal = _.reduce(propertyDefinitions, (formal, def, name) => {
          formal[name] = def[module.constructor.name];
          return formal;
        }, {});
        // Initializie module
        module.initializePrototype.bind(this)(formal);
      } catch (err) {
        // Check if not implemented, or if legitimate error
        if (err !== NotImplementedError) { throw err; }
      }
    });

    // Expose watch method
    Object.defineProperty(this, 'watch', {
      configurable: false,
      enumerable: false,
      get: () => {

        /**
         * Sets a callback that triggers when watched property changes
         * @param {any} callback Callback fruntion triggered on detected changes:
         *              (e = { entity, property }) => { ... code acting on change ...}
         * @param {any} properties Name of the property (or array  of names) that is being watched;
         *              If no property name specified, all changes on the entity instance will trigger callback
         * @returns {function} Function which when called, cancels the set watcher
         * @memberof EntityPrototype
         */
        return (callback, properties = null) => { return watchers.registerWatcher(callback, properties); };

      }
    });

    // Expose update method
    Object.defineProperty(this, 'update', {
      configurable: false,
      enumerable: false,
      get: () => {

        /**
         * Executes the provided function (meant to be manually applying changes to the entity instance)
         * and when done triggers watchers.
         * If function returns a property name or an array of property names, watchers will only trigger for those proeprties.
         * @param {any} fn Function meant to be manually applying changes to the entity instance
         * @memberof Watchers
         */
        return (fn) => {
          // Run update function
          watchers.manualUpdate(() => {

            // Run custom update function
            let updated = fn();

            // Let modules react to update
            _.forEach(modules, (module) => {
              try {
                module.afterUpdate.bind(this)(updated, cache[module.constructor.name]);
              } catch (err) {
                // Check if not implemented, or if legitimate error
                if (err !== NotImplementedError) { throw err; }
              }
            });

            // Return updated
            return updated;

          });
        };

      }
    });

  }

}
