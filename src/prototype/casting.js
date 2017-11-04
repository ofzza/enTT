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
export default function castAsEntity (value, EntityClass) {

  // Verify target entity class
  if (!EntityClass || !(EntityClass.prototype instanceof EntityPrototype)) {
    throw new Error('Only casting to classes extending the Entity base class is allowed!');
  }

  // Initialize casting target
  const entity = new EntityClass();

  // Attempt copying properties from casting source
  if (value) {
    _.forEach(entity, (none, key) => {
      // Copy value if  property exists on source
      if (!_.isUndefined(value[key])) { entity[key] = value[key]; }
    });
  }

  // Return cast entity
  return entity;

}
