// =====================================================================================================================
// ENTITY: Entity Key Data Management Module
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EntityModule from '../';

/**
 * Provides full-entity getter, setter and clone functionality
 * @export
 * @class DataManagementModule
 * @extends {EntityModule}
 */
export default class DataManagementModule extends EntityModule {

  initializePrototype () {

    // Expose full-entity get method
    Object.defineProperty(this, 'set', {
      configurable: false,
      get: () => {
        /**
         * Imports properties from a provided object onto the entity
         * @param {any} value Value to import properties from
         * @returns {any} A reference to the entity instance baing set
         */
        return (value) => {
          // Import value properties
          _.forEach(value, (value, name) => {
            this[name] = value;
          });
          // Return reference to the entity instance
          return this;
        };
      }
    });

    // Expose full-entity get method
    Object.defineProperty(this, 'get', {
      configurable: false,
      enumerable: false,
      get: () => {
        /**
         * Exports properties from the entity onto a raw object
         * @returns {any} Raw object with same properties as the entity
         */
        return () => {
          // Export own properties
          return _.reduce(this, (result, value, name) => {
            result[name] = value;
            return result;
          }, {});
        };
      }
    });

    // Expose full-entity get method
    Object.defineProperty(this, 'clone', {
      configurable: false,
      enumerable: false,
      get: () => {
        /**
         * Instantiates a new entity of same type and copies over values of all properties from the existing entity
         * @returns {any} A cloned instance of the entity
         */
        return () => {
          // Clone the entity instance
          return (new this.constructor()).set(this.get());
        };
      }
    });

  }

}
