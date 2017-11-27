// =====================================================================================================================
// ENTITY: Entity Custom Module class
// =====================================================================================================================

// Not implemented error
export const NotImplementedError = new Error('Module method not implemented');

/**
 * Entity module class
 * @export
 * @class EntityModule
 */
export default class EntityModule {

  /**
   * Called on every property definition, method should formalize and return relevant parts of the property definition. This
   * formalized definition will be passed to all other methods of the module when they get called.
   * @param {any} name Property name
   * @param {any} def User property definition
   * @returns {any} Formalized property definition
   * @memberof EntityModule
   */
  processProperty (name, def) { return (() => { def; throw NotImplementedError; })(); }

  /**
   * Initializes entity instance right after instantiation; If returning undefined, value will be ignored
   * ... when called: this = Entity baing processed
   * @param {any} name Property name
   * @param {any} value Currently initalized value
   * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
   * @returns {any} Initialized property value
   * @memberof EntityModule
   */
  initialize (name, value, formal) { return (() => { value; formal; throw NotImplementedError; })(); }

  /**
   * Processes value being fetched from storage via a managed property; If returning undefined, value will be ignored
   * ... when called: this = Entity baing processed
   * @param {any} name Property name
   * @param {any} value Value being fetched and already processed by higher priority modules
   * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
   * @returns {any} Processed value
   * @memberof EntityModule
   */
  get (name, value, formal) { return (() => { value; formal; throw NotImplementedError; })(); }

  /**
   * Processes value being stored via a managed property; If returning undefined, value will be ignored
   * ... when called: this = Entity baing processed
   * @param {any} name Property name
   * @param {any} value Value being stored and already processed by higher priority modules
   * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
   * @returns {any} Processed value
   * @memberof EntityModule
   */
  set (name, value, formal) { return (() => { value; formal; throw NotImplementedError; })(); }
  /**
   * Called after property value being stored
   * ... when called: this = Entity baing processed
   * @param {any} name Property name
   * @param {any} value Value that was stored
   * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
   * @returns {any} Processed value
   * @memberof EntityModule
   */
  afterSet (name, value, formal) { return (() => { value; formal; throw NotImplementedError; })(); }

  /**
   * Processes values after a custom update triggered
   * ... when called: this = Entity baing processed
   * @param {any} updated Name or list of names of updated properties
   * @returns {any} Processed value
   * @memberof EntityModule
   */
  update (updated = null) { return (() => { updated; throw NotImplementedError; })(); }

}
