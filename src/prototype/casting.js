// =====================================================================================================================
// ENTITY PROTOTYPE Internals: Casting
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EntityPrototype from './';

/**
 * Casts value as entity by copying content of all properties found on both
 * @param {any} value Value to cast
 * @param {any} EntityClass Target casting Entity class
 * @returns {any} Cast instance of required Entity class
 */
export function castAsEntity (value, EntityClass) {

  // Verify target entity class
  if (!EntityClass || !(EntityClass.prototype instanceof EntityPrototype)) {
    throw new Error('Only casting to classes extending the Entity base class is allowed!');
  }

  // Initialize casting target
  const entity = new EntityClass();

  // Attempt copying properties from casting source
  if (value) {
    _.forEach(entity, (none, key) => {
      // Copy value if property exists on source
      if (!_.isUndefined(value[key])) { entity[key] = value[key]; }
    });
  }

  // Return cast entity
  return entity;

}

/**
 * Casts collection of values as a collection of entities by casting each mamber of the collection
 * @param {any} collection Collection to cast
 * @param {any} EntityClass Target casting Entity class
 * @returns {any} Cast collection
 */
export function castCollectionAsEntity (collection, EntityClass) {

  // Verify target entity class
  if (!EntityClass || !(EntityClass.prototype instanceof EntityPrototype)) {
    throw new Error('Only casting to classes extending the Entity base class is allowed!');
  }

  // Check collection type (array/hashtable)
  if (_.isArray(collection)) {
    // Cast as array
    return _.map(collection, (value) => { return castAsEntity(value, EntityClass); });
  } else {
    // Cast as hashtable
    return _.reduce(collection, (collection, value, key) => {
      collection[key] = castAsEntity(value, EntityClass);
      return collection;
    }, {});
  }

}
