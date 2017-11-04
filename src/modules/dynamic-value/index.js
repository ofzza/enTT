// =====================================================================================================================
// ENTITY: Entity Dynamic Value Module
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EntityModule from '../';
import EntityPrototype from '../../prototype';

/**
 * Dynamic value module, included directly into Entity base class,
 * provides support for read-only, dynamically generated properties
 * @export
 * @class DynamicValueEntityModule
 * @extends {EntityModule}
 */
export default class DynamicValueEntityModule extends EntityModule {

  processProperty (def) {
    // Initialize formal definition
    const formal = {};
    // Check for dynamic value function value
    if (def && def.dynamic) {
      // Assign explicitly defined function
      formal.dynamic = def.dynamic;
    } else if (_.isFunction(def) && (!def.prototype || !(def.prototype instanceof EntityPrototype))) {
      // Assign short-hand definition
      formal.dynamic = def;
    }
    // Return formal definition
    return formal;
  }

  get (value, formal) {
    // If defined as dynamic property, use dynamic function to calculate value
    if (formal.dynamic) { return formal.dynamic.bind(this)(); }
  }

  set (value, formal) {
    // If defined as dynamic property, block setting a value
    if (formal.dynamic) { return null; }
  }

}
