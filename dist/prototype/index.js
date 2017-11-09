'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // =====================================================================================================================
// ENTITY: Basic class prototype
// TODO: Allow subscribing to changes (via setters or manual updated notification)
// =====================================================================================================================

// Import dependencies


var _casting = require('./casting');

var _initialization = require('./initialization');

var _initialization2 = _interopRequireDefault(_initialization);

var _properties = require('./properties');

var _properties2 = _interopRequireDefault(_properties);

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

var _watchers = require('./watchers');

var _watchers2 = _interopRequireDefault(_watchers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Entity prototype class
 * @export
 * @class EntityPrototype
 */
var EntityPrototype = function () {
  _createClass(EntityPrototype, null, [{
    key: 'cast',


    /**
     * Casts value as entity by copying content of all properties found on both
     * @static
     * @param {any} value Value to cast
     * @param {any} EntityClass Target casting Entity class
     * @returns {any} Cast instance of required Entity class
     * @memberof Watchers
     */
    value: function cast(value, EntityClass) {
      return _casting.castAsEntity.bind(this)(value, EntityClass);
    }
    /**
     * Casts collection of values as a collection of entities by casting each mamber of the collection
     * @static
     * @param {any} collection Collection to cast
     * @param {any} EntityClass Target casting Entity class
     * @returns {any} Cast collection
     * @memberof Entity
     */

  }, {
    key: 'castCollection',
    value: function castCollection(collection, EntityClass) {
      return _casting.castCollectionAsEntity.bind(this)(collection, EntityClass);
    }
    /**
     * Creates an instance of EntityPrototype.
     * @memberof EntityPrototype
     */

  }, {
    key: 'debug',


    /**
     * Debugging status (When debugging, some extra properties are exposed)
     * @static
     * @memberof EntityPrototype
     */
    get: function get() {
      return _debug2.default.debug;
    },
    set: function set(value) {
      _debug2.default.debug = value;
    }
  }]);

  function EntityPrototype() {
    _classCallCheck(this, EntityPrototype);

    // Check if class neing directly instantiated
    if (this.constructor === EntityPrototype) {
      throw new Error('EntityPrototype class is not meant to be instantiated directly - extend it with your own class!');
    }

    // Check if prototype contains static definition property - if so validate and process it

    var _fetchAllFromPrototyp = _initialization2.default.bind(this)(),
        modules = _fetchAllFromPrototyp.modules,
        propertyDefinitions = _fetchAllFromPrototyp.propertyDefinitions;

    // Initialize watchers repository


    var watchers = new _watchers2.default(this);
    // Expose watch method
    Object.defineProperty(this, 'watch', {
      configurable: false,
      enumerable: false,
      get: function get() {

        /**
         * Sets a callback that triggers when watched property changes
         * @param {any} callback Callback fruntion triggered on detected changes:
         *              (e = { entity, property }) => { ... code acting on change ...}
         * @param {any} properties Name of the property (or array  of names) that is being watched;
         *              If no property name specified, all changes on the entity instance will trigger callback
         * @returns {function} Function which when called, cancels the set watcher
         * @memberof EntityPrototype
         */
        return function (callback) {
          var properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
          return watchers.registerWatcher(callback, properties);
        };
      }
    });
    // Expose update method
    Object.defineProperty(this, 'update', {
      configurable: false,
      enumerable: false,
      get: function get() {

        /**
         * Executes the provided function (meant to be manually applying changes to the entity instance)
         * and when done triggers watchers.
         * If function returns a property name or an array of property names, watchers will only trigger for those proeprties.
         * @param {any} fn Function meant to be manually applying changes to the entity instance
         * @memberof Watchers
         */
        return function (fn) {
          watchers.manualUpdate(fn);
        };
      }
    });

    // Initialize managed properties based on definitions
    _properties2.default.bind(this)(modules, propertyDefinitions, watchers);
  }

  return EntityPrototype;
}();

exports.default = EntityPrototype;
//# sourceMappingURL=index.js.map
