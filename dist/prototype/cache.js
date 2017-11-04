'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // =====================================================================================================================
// ENTITY PROTOTYPE Internals: Entity class static cache
// =====================================================================================================================

// Import dependencies


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Define internal constants
var cache = {}; // Holds cached values by type name and type class reference

/**
 * Manages storing and fetching class specific, static data
 * @class Cache
 */

var Cache = function () {
  function Cache() {
    _classCallCheck(this, Cache);
  }

  _createClass(Cache, null, [{
    key: 'store',


    /**
     * Stores data by type name, type class reference and key
     * @static
     * @param {any} t "this" in the context of the instantiated object
     * @param {any} key Key to store data under
     * @param {any} value Data to store
     * @memberof Cache
     */
    value: function store(t, key, value) {
      var constructor = t.constructor,
          constructorName = t.constructor.name;
      if (!cache[constructorName]) {
        cache[constructorName] = [];
      }
      var existingIndex = _lodash2.default.findIndex(cache[constructorName], function (stored) {
        return stored.constructor === constructor;
      });
      if (existingIndex !== -1) {
        cache[constructorName][existingIndex].key = value;
      } else {
        cache[constructorName].push(_defineProperty({ constructor: constructor }, key, value));
      }
    }

    /**
     * Fetches data by type name, type class reference and key
     * @static
     * @param {any} t "this" in the context of the instantiated object
     * @param {any} key Key to fetch data from
     * @returns {any} Stored data
     * @memberof Cache
     */

  }, {
    key: 'fetch',
    value: function fetch(t, key) {
      var constructor = t.constructor,
          constructorName = t.constructor.name;
      if (cache[constructorName]) {
        var existingStored = _lodash2.default.find(cache[constructorName], function (stored) {
          return stored.constructor === constructor;
        });
        if (existingStored) {
          return existingStored[key];
        }
      }
    }
  }]);

  return Cache;
}();

exports.default = Cache;
//# sourceMappingURL=cache.js.map
