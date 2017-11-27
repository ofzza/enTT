// =====================================================================================================================
// ENTITY: Entity Default Value Module
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EntityModule from '../';

/**
 * Default value module, included directly into Entity base class,
 * provides support for setting default, initial values for defined properties
 * @export
 * @class DefaultValueEntityModule
 * @extends {EntityModule}
 */
export default class DefaultValueEntityModule extends EntityModule {

  processProperty (name, def) {
    // Initialize formal definition
    const formal = {};
    // Check for default value
    if (def && def.value) { formal.value = def.value; }
    // Return formal definition
    return formal;
  }

  initialize (name, value, formal) {
    // If not initialized already, initialize to default value
    if (_.isUndefined(value)) { return formal.value; }
  }

}
