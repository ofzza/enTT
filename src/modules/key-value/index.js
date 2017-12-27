// =====================================================================================================================
// ENTITY: Entity Key Value Module
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EntityModule from '../';

/**
 * Key value module, included directly into Entity base class,
 * provides support marking properties as key proeprties, uniquely identifying the entity
 * @export
 * @class KeyValueEntityModule
 * @extends {EntityModule}
 */
export default class KeyValueEntityModule extends EntityModule {

  initializePrototype (formal) {
    // Expose uniqueId method
    Object.defineProperty(this, 'uniqueKey', {
      configurable: false,
      enumerable: false,
      get: () => {

        // Collect unique key properties' values
        let primaryKeys = _.reduce(formal, (primaryKeys, def, name) => {
          if (def.key) { primaryKeys[name] = this[name] || null; }
          return primaryKeys;
        }, {});

        // Construct a unique identifier from primary keys
        return (_.keys(primaryKeys).length ? JSON.stringify(primaryKeys) : undefined);

      }
    });
  }

  processProperty (name, def) {
    // Initialize formal definition
    const formal = {};
    // Check for default value
    if (def && def.key) { formal.key = true; }
    // Return formal definition
    return formal;
  }

}
