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
    key: 'processProperty',


    /**
     * Called on every property definition, method should formalize and return relevant parts of the property definition. This
     * formalized definition will be passed to all other methods of the module when they get called.
     * @param {any} name Property name
     * @param {any} def User property definition
     * @returns {any} Formalized property definition
     * @memberof EntityModule
     */
    value: function processProperty(name, def) {
      return function () {
        def;throw NotImplementedError;
      }();
    }

    /**
     * Initializes entity instance right after instantiation; If returning undefined, value will be ignored
     * ... when called: this = Entity baing processed
     * @param {any} name Property name
     * @param {any} value Currently initalized value
     * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
     * @param {any} cache Shared module cache object for this Entity instance, used to pass vaues between methods of the module
     * @returns {any} Initialized property value
     * @memberof EntityModule
     */

  }, {
    key: 'initialize',
    value: function initialize(name, value, formal, cache) {
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
    key: 'get',
    value: function get(name, value, formal, cache) {
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
     * @returns {any} Processed value
     * @memberof EntityModule
     */

  }, {
    key: 'set',
    value: function set(name, value, formal, cache) {
      return function () {
        value;formal;cache;throw NotImplementedError;
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
    key: 'afterSet',
    value: function afterSet(name, value, formal, cache) {
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
    key: 'update',
    value: function update() {
      var updated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var cache = arguments[1];
      return function () {
        updated;cache;throw NotImplementedError;
      }();
    }
  }]);

  return EntityModule;
}();

exports.default = EntityModule;
//# sourceMappingURL=index.js.map
