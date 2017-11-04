// =====================================================================================================================
// ENTITY: Entity Custom Module class
// =====================================================================================================================

/**
 * Entity module class
 * @export
 * @class EntityModule
 */
export default class EntityModule {

  /**
   * Called on every property definition in the schema, method should formalize and return relevant parts of the property definition. This
   * formalized definition will be passed to all other methods of the module when they get called.
   * @param {any} def User property definition
   * @returns {any} Formalized property definition
   * @memberof EntityModule
   */
  processProperty (def) { return (() => { def; throw new Error('Not implemented!'); })(); }

  /**
   * Initializes entity instance right after instantiation; If returning undefined, value will be ignored
   * @param {any} value Currently initalized value
   * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
   * @returns {any} Initialized property value
   * @memberof EntityModule
   */
  initialize (value, formal) { formal; value; return undefined; }

  /**
   * Processes value being fetched from storage via a managed property; If returning undefined, value will be ignored
   * @param {any} value Value being fetched and already processed by higher priority modules
   * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
   * @returns {any} Processed value
   * @memberof EntityModule
   */
  get (value, formal) { formal; value; return undefined; }

  /**
   * Processes value being stored via a managed property; If returning undefined, value will be ignored
   * @param {any} value Value being stored and already processed by higher priority modules
   * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
   * @returns {any} Processed value
   * @memberof EntityModule
   */
  set (value, formal) { formal; value; return undefined; }

}
