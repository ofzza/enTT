// =====================================================================================================================
// ENTITY: Basic class prototype
// TODO: Allow subscribing to changes (via setters or manual updated notification)
// =====================================================================================================================

// Import dependencies
import castAsEntity from './casting';
import fetchAllFromPrototypeChain from './initialization';
import initializeManagedProperties from './properties';
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
   * @param {any} entityClass Target casting Entity class
   * @returns {any} Cast instance of required Entity class
   * @memberof Watchers
   */
  static cast (value, entityClass) { return castAsEntity.bind(this)(value, entityClass); }

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
    let { modules, schema } = fetchAllFromPrototypeChain.bind(this)();

    // Initialize watchers repository
    const watchers = new Watchers(this);
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
        return (fn) => { watchers.manualUpdate(fn); };

      }
    });

    // Initialize managed properties based on schema definition
    initializeManagedProperties.bind(this)(modules, schema, watchers);

  }

}
