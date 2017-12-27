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
   * Runs once, when entity instance constructed; used to initialize additional methods or state on the entity prototype
   * @param {any} formal Formalized property definitions constructed by "processProperty" calls earlier
   * @memberof EntityModule
   */
  initializePrototype (formal) { formal; throw NotImplementedError; }

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
   * Called on every property definition, method should initialize a property; If returning undefined, value will be ignored
   * ... when called: this = Entity baing processed
   * @param {any} name Property name
   * @param {any} value Currently initalized value
   * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
   * @param {any} cache Shared module cache object for this Entity instance, used to pass vaues between methods of the module
   * @returns {any} Initialized property value
   * @memberof EntityModule
   */
  initializePropertyValue (name, value, formal, cache) { return (() => { value; formal; cache; throw NotImplementedError; })(); }

  /**
   * Processes value being fetched from storage via a managed property; If returning undefined, value will be ignored
   * ... when called: this = Entity baing processed
   * @param {any} name Property name
   * @param {any} value Value being fetched and already processed by higher priority modules
   * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
   * @param {any} cache Shared module cache object for this Entity instance, used to pass vaues between methods of the module
   * @returns {any} Processed value
   * @memberof EntityModule
   */
  getPropertyValue (name, value, formal, cache) { return (() => { value; formal; cache; throw NotImplementedError; })(); }

  /**
   * Processes value being stored via a managed property; If returning undefined, value will be ignored
   * ... when called: this = Entity baing processed
   * @param {any} name Property name
   * @param {any} value Value being stored and already processed by higher priority modules
   * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
   * @param {any} cache Shared module cache object for this Entity instance, used to pass vaues between methods of the module
   * @param {any} e Instance of SetPropertyValueEvent used to track any changes made to the set value
   * @returns {any} Processed value
   * @memberof EntityModule
   */
  setPropertyValue (name, value, formal, cache, e) { return (() => { value; formal; cache; e; throw NotImplementedError; })(); }
  /**
   * Called after property value being stored
   * ... when called: this = Entity baing processed
   * @param {any} name Property name
   * @param {any} value Value that was stored
   * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
   * @param {any} cache Shared module cache object for this Entity instance, used to pass vaues between methods of the module
   * @returns {any} Processed value
   * @memberof EntityModule
   */
  afterSetPropertyValue (name, value, formal, cache) { return (() => { value; formal; cache; throw NotImplementedError; })(); }

  /**
   * Processes values after a custom update triggered
   * ... when called: this = Entity baing processed
   * @param {any} updated Name or list of names of updated properties
   * @param {any} cache Shared module cache object for this Entity instance, used to pass vaues between methods of the module
   * @returns {any} Processed value
   * @memberof EntityModule
   */
  afterUpdate (updated = null, cache) { return (() => { updated;cache;  throw NotImplementedError; })(); }

}

/**
 * Keeps track of property value being set by multiple modules
 * @export
 * @class SetPropertyValueEvent
 */
export class SetPropertyValueEvent {
  /**
   * Creates an instance of SetPropertyValueEvent.
   * @memberof SetPropertyValueEvent
   */
  constructor () {
    this.changed = false;
  }
}
