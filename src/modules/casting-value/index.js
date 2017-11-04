// =====================================================================================================================
// ENTITY: Entity Casting Value Module
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EntityModule from '../';
import EntityPrototype from '../../prototype';

/**
 * Casting value module, included directly into Entity base class,
 * provides support for properties which will attempt to cast their value as an Entity instance of a given type
 * @export
 * @class CastingValueEntityModule
 * @extends {EntityModule}
 */
export default class CastingValueEntityModule extends EntityModule {

  processProperty (def) {
    // Initialize formal definition
    const formal = {};
    // Check for casting definition
    if (def && def.castAs && def.castAs.prototype instanceof EntityPrototype) {
      // Assign explicitly defined casting
      formal.castAs = def.castAs;
      formal.collection = (def.collection ? true : false);
    } else {
      // Parse value, and check if representing a cast definition
      def = def.castAs || def;
      if (def && def.prototype instanceof EntityPrototype) {
        // Formalize single casting
        formal.castAs = def;
        formal.collection = false;
      } else if (_.isArray(def) && def.length === 1 && def[0].prototype instanceof EntityPrototype) {
        // Formalize collection casting
        formal.castAs = def[0];
        formal.collection = true;
      }
    }
    // Return formal definition
    return formal;
  }

  set (value, formal) {
    if (formal.castAs) {
      if (_.isNil(value)) {
        // If setting null, allow null value
        return null;
      } else if (!formal.collection) {
        // Check if already cast
        if (value instanceof formal.castAs) {
          // Keep current casting
          return value;
        } else {
          // Attempt casting value directly
          return EntityPrototype.cast(value, formal.castAs);
        }
      } else {
        // Attempt casting value as a collection of castable values
        return _.reduce(value, (collection, value, key) => {
          // Check if already cast
          if (value instanceof formal.castAs) {
            // Keep current casting
            collection[key] = value;
          } else {
            // Attempt casting value
            collection[key] = EntityPrototype.cast(value, formal.castAs);
          }
          return collection;
        }, (_.isArray(value) ? [] : {}));
      }
    }
  }

}
