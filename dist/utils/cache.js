'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfigurationCache = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // =====================================================================================================================
// ENTITY: Class configuration cache
// =====================================================================================================================

// Import dependencies


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Holds cached values
var cache = {
  classes: {}
};

/**
 * Caches Entity inheriting classes' configuration
 * @export
 * @class ConfigurationCache
 */

var ConfigurationCache = exports.ConfigurationCache = function () {
  function ConfigurationCache() {
    _classCallCheck(this, ConfigurationCache);
  }

  _createClass(ConfigurationCache, null, [{
    key: 'set',


    /**
     * Stores values into cache based on provided instance's class
     * @static
     * @param {any} instance Instance to index stored values by
     * @param {any} properties Class properties configuration
     * @param {any} extensions Class extensions
     * @memberof ConfigurationCache
     */
    value: function set(instance) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          properties = _ref.properties,
          extensions = _ref.extensions;

      // Get instance's class name and constructor
      var constructor = instance.constructor,
          className = instance.constructor.name;
      // Find existing or initialize new storage
      if (!cache.classes[className]) {
        cache.classes[className] = [];
      }
      var storage = _lodash2.default.find(cache.classes[className], function (storage) {
        return storage.constructor === constructor;
      });
      if (!storage) {
        cache.classes[className].push(storage = { constructor: constructor, values: {} });
      }
      // Store values
      if (properties) {
        storage.values.properties = properties;
      }
      if (extensions) {
        storage.values.extensions = extensions;
      }
    }

    /**
     * Returnes cached values for the requested instance's class
     * @static
     * @param {any} instance Instance by which stored values were indexed by
     * @returns {any} Stored values
     * @memberof ConfigurationCache
     */

  }, {
    key: 'get',
    value: function get(instance) {
      // Get instance's class name and constructor
      var constructor = instance.constructor,
          className = instance.constructor.name;
      // Search for storage
      var storage = cache.classes[className] && _lodash2.default.find(cache.classes[className], function (storage) {
        return storage.constructor === constructor;
      });
      // Return storage if found
      return storage ? storage.values : {};
    }
  }]);

  return ConfigurationCache;
}();
//# sourceMappingURL=cache.js.map
