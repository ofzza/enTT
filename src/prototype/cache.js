// =====================================================================================================================
// ENTITY PROTOTYPE Internals: Entity class static cache
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';

// Define internal constants
const cache = { };        // Holds cached values by type name and type class reference

/**
 * Manages storing and fetching class specific, static data
 * @class Cache
 */
export default class Cache {

  /**
   * Stores data by type name, type class reference and key
   * @static
   * @param {any} t "this" in the context of the instantiated object
   * @param {any} key Key to store data under
   * @param {any} value Data to store
   * @memberof Cache
   */
  static store (t, key, value) {
    let constructor = t.constructor,
        constructorName = t.constructor.name;
    if (!cache[constructorName]) { cache[constructorName] = []; }
    let existingIndex = _.findIndex(cache[constructorName], (stored) => { return (stored.constructor === constructor); });
    if (existingIndex !== -1) {
      cache[constructorName][existingIndex].key = value;
    } else {
      cache[constructorName].push({ constructor, [key]: value });
    }
  }

  /**
   * Fetches data by type name, type class reference and key
   * @static
   * @param {any} t "this" in the context of the instantiated object
   * @param {any} key Key to fetch data from
   * @returns {any} Stored data
   * @memberof Cache
   */
  static fetch (t, key) {
    let constructor = t.constructor,
        constructorName = t.constructor.name;
    if (cache[constructorName]) {
      let existingStored = _.find(cache[constructorName], (stored) => { return (stored.constructor === constructor); });
      if (existingStored) { return existingStored[key]; }
    }
  }

}
