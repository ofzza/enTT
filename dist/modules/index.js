'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// =====================================================================================================================
// ENTITY: Entity Custom Module class
// =====================================================================================================================

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
     * @param {any} def User property definition
     * @returns {any} Formalized property definition
     * @memberof EntityModule
     */
    value: function processProperty(def) {
      return function () {
        def;throw new Error('not-implemented');
      }();
    }

    /**
     * Initializes entity instance right after instantiation; If returning undefined, value will be ignored
     * @param {any} value Currently initalized value
     * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
     * @returns {any} Initialized property value
     * @memberof EntityModule
     */

  }, {
    key: 'initialize',
    value: function initialize(value, formal) {
      return function () {
        value;formal;throw new Error('not-implemented');
      }();
    }

    /**
     * Processes value being fetched from storage via a managed property; If returning undefined, value will be ignored
     * @param {any} value Value being fetched and already processed by higher priority modules
     * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
     * @returns {any} Processed value
     * @memberof EntityModule
     */

  }, {
    key: 'get',
    value: function get(value, formal) {
      return function () {
        value;formal;throw new Error('not-implemented');
      }();
    }

    /**
     * Processes value being stored via a managed property; If returning undefined, value will be ignored
     * @param {any} value Value being stored and already processed by higher priority modules
     * @param {any} formal Formalized property definition constructed by "processProperty" call earlier
     * @returns {any} Processed value
     * @memberof EntityModule
     */

  }, {
    key: 'set',
    value: function set(value, formal) {
      return function () {
        value;formal;throw new Error('not-implemented');
      }();
    }
  }]);

  return EntityModule;
}();

exports.default = EntityModule;
//# sourceMappingURL=index.js.map
