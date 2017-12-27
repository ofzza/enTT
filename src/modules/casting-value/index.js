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

  processProperty (name, def) {
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

  setPropertyValue (name, value, formal, e) {
    if (formal.castAs) {
      // Report as changed
      e.changed = true;
      // Update value
      if (_.isNil(value)) {
        // If setting null, allow null value
        return null;
      } else if (!formal.collection) {
        // Prepare value (cast if not cast already)
        let valueToCast = (value instanceof formal.castAs ? value : EntityPrototype.cast(value, formal.castAs));
        // Check if current value matches "uniqueKey" - if so, import properties, else overwrite with cast value
        let currentValue = this[name];
        if (currentValue && currentValue instanceof formal.castAs && currentValue.uniqueKey && currentValue.uniqueKey === valueToCast.uniqueKey) {
          _.forEach(valueToCast, (value, name) => { currentValue[name] = value; });
          return currentValue;
        } else {
          return valueToCast;
        }
      } else {
        // Update current collection, if exists
        let currentValue = this[name];
        // If current collection exists, extract existing members by "uniqueKey" values
        let existingByUniqueKey = _.reduce((_.isObject(currentValue) ? currentValue : {}), (existingByUniqueKey, value) => {
          let uniqueKey = value.uniqueKey;
          if (uniqueKey) { existingByUniqueKey[value.uniqueKey] = value; }
          return existingByUniqueKey;
        }, {});
        // Attempt casting value as a collection of castable values (reuse existing, matching entities if found by "uniqueKey" value)
        let updatedCollection = _.reduce(value, (collection, value, key) => {
          // Prepare value (cast if not cast already)
          let valueToCast = (value instanceof formal.castAs ? value : EntityPrototype.cast(value, formal.castAs)),
              uniqueKey = valueToCast.uniqueKey;
          // Check if matching entity already exists
          if (uniqueKey && existingByUniqueKey[uniqueKey]) {
            _.forEach(valueToCast, (value, name) => { existingByUniqueKey[uniqueKey][name] = value; });
            collection[key] = existingByUniqueKey[uniqueKey];
          } else {
            collection[key] = valueToCast;
          }
          return collection;
        }, (_.isArray(value) ? [] : {}));
        // Return cast value
        return updatedCollection;
      }
    }
  }

}
