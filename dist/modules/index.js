'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// =====================================================================================================================
// ENTITY: Entity Custom Module class
// =====================================================================================================================

// Not implemented error
var NotImplementedError = exports.NotImplementedError = new Error('Module method not implemented');

/**
 * Entity module class
 * @export
 * @class EntityModule
 */

var EntityModule = function () {
  function EntityModule() {
    _classCallCheck(this, EntityModule);
  }

  _createClass(EntityModule, [{
    key: 'initializePrototype',


    /**
     * Runs once, when entity instance constructed; used to initialize additional methods or state on the entity prototype
     * @param {any} formal Formalized property definitions constructed by "processProperty" calls earlier
     * @memberof EntityModule
     */
    value: function initializePrototype(formal) {
      formal;throw NotImplementedError;
    }

    /**
     * Called on every property definition, method should formalize and return relevant parts of the property definition. This
     * formalized definition will be passed to all other methods of the module when they get called.
     * @param {any} name Property name
     * @param {any} def User property definition
     * @returns {any} Formalized property definition
     * @memberof EntityModule
     */

  }, {
    key: 'processProperty',
    value: function processProperty(name, def) {
      return function () {
        def;throw NotImplementedError;
      }();
    }

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

  }, {
    key: 'initializePropertyValue',
    value: function initializePropertyValue(name, value, formal, cache) {
      return function () {
        value;formal;cache;throw NotImplementedError;
      }();
    }

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

  }, {
    key: 'getPropertyValue',
    value: function getPropertyValue(name, value, formal, cache) {
      return function () {
        value;formal;cache;throw NotImplementedError;
      }();
    }

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

  }, {
    key: 'setPropertyValue',
    value: function setPropertyValue(name, value, formal, cache, e) {
      return function () {
        value;formal;cache;e;throw NotImplementedError;
      }();
    }
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

  }, {
    key: 'afterSetPropertyValue',
    value: function afterSetPropertyValue(name, value, formal, cache) {
      return function () {
        value;formal;cache;throw NotImplementedError;
      }();
    }

    /**
     * Processes values after a custom update triggered
     * ... when called: this = Entity baing processed
     * @param {any} updated Name or list of names of updated properties
     * @param {any} cache Shared module cache object for this Entity instance, used to pass vaues between methods of the module
     * @returns {any} Processed value
     * @memberof EntityModule
     */

  }, {
    key: 'afterUpdate',
    value: function afterUpdate() {
      var updated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var cache = arguments[1];
      return function () {
        updated;cache;throw NotImplementedError;
      }();
    }
  }]);

  return EntityModule;
}();

/**
 * Keeps track of property value being set by multiple modules
 * @export
 * @class SetPropertyValueEvent
 */


exports.default = EntityModule;

var SetPropertyValueEvent =
/**
 * Creates an instance of SetPropertyValueEvent.
 * @memberof SetPropertyValueEvent
 */
exports.SetPropertyValueEvent = function SetPropertyValueEvent() {
  _classCallCheck(this, SetPropertyValueEvent);

  this.changed = false;
};
//# sourceMappingURL=index.js.map
