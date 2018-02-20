// =====================================================================================================================
// ENTITY: Class configuration cache
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';

// Holds cached values
const cache = {
  classes: {}
};

/**
 * Caches Entity inheriting classes' configuration
 * @export
 * @class ConfigurationCache
 */
export class ConfigurationCache {

  /**
   * Stores values into cache based on provided instance's class
   * @static
   * @param {any} instance Instance to index stored values by
   * @param {any} properties Class properties configuration
   * @param {any} extensions Class extensions
   * @memberof ConfigurationCache
   */
  static set (instance, { properties, extensions } = { })   {
    // Get instance's class name and constructor
    const constructor = instance.constructor,
          className   = instance.constructor.name;
    // Find existing or initialize new storage
    if (!cache.classes[className]) { cache.classes[className] = []; }
    let storage = _.find(cache.classes[className], (storage) => { return (storage.constructor === constructor); });
    if (!storage) { cache.classes[className].push(storage = { constructor, values: { } }); }
    // Store values
    if (properties) { storage.values.properties = properties; }
    if (extensions) { storage.values.extensions = extensions; }
  }

  /**
   * Returnes cached values for the requested instance's class
   * @static
   * @param {any} instance Instance by which stored values were indexed by
   * @returns {any} Stored values
   * @memberof ConfigurationCache
   */
  static get (instance) {
    // Get instance's class name and constructor
    const constructor = instance.constructor,
          className   = instance.constructor.name;
    // Search for storage
    let storage = cache.classes[className] && _.find(cache.classes[className], (storage) => { return (storage.constructor === constructor); });
    // Return storage if found
    return (storage ? storage.values : {});
  }

}
