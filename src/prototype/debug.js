// =====================================================================================================================
// ENTITY PROTOTYPE Internals: Debug status
// =====================================================================================================================

// Define internal variables
let debug = false;        // Holds EntityPrototype debugging status

/**
 * Manages static debugging status
 * @export
 * @class Debug
 */
export default class Debug {

  /**
   * Debugging status (When debugging, some extra properties are exposed)
   * @static
   * @memberof EntityPrototype
   */
  static get debug () { return debug; }
  static set debug (value) { debug = value; }

}
