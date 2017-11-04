'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initializeManagedProperties;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Initializes managed properties, based on schema definitions, calling all modules as part of getter/setter
 * @param {any} modules Array of modules applied to this class
 * @param {any} schema Collection of formalized property definitions for this class (property names used as keys)
 * @param {any} watchers Repository of entity instance's registered watchers
 */
// =====================================================================================================================
// ENTITY PROTOTYPE Internals: Property processing and initialization functions
// =====================================================================================================================

// Import dependencies
function initializeManagedProperties(modules, schema, watchers) {
  var _this = this;

  // Initialize value storage (or get already processed from class' cache)
  var storage = _cache2.default.fetch(this, 'storage');

  // If not loaded from cache, initialize managed properties
  if (!storage) {

    // Process managed properties and formalize their definitions per included module
    storage = {};
    _lodash2.default.forEach(schema, function (def, name) {
      // Initialize values (course undefined to null)
      _lodash2.default.forEach(modules, function (module) {
        var initializedValue = module.initialize.bind(_this)(storage[name], def[module.constructor.name]);
        if (!_lodash2.default.isUndefined(initializedValue)) {
          storage[name] = initializedValue;
        } else if (_lodash2.default.isUndefined(storage[name])) {
          storage[name] = null;
        }
      });

      // Initialize property
      Object.defineProperty(_this, name, {
        configurable: false,
        enumerable: true,
        get: function get() {
          // Get value from storage
          var value = storage[name];
          // Let modules process value
          _lodash2.default.forEach(modules, function (module) {
            var updatedValue = module.get.bind(_this)(value, def[module.constructor.name]);
            if (!_lodash2.default.isUndefined(updatedValue)) {
              value = updatedValue;
            }
          });
          // Return processed value (course undefined to null)
          return !_lodash2.default.isUndefined(value) ? value : null;
        },
        set: function set(value) {
          // Let modules process value
          _lodash2.default.forEach(modules, function (module) {
            var updatedValue = module.set.bind(_this)(value, def[module.constructor.name]);
            if (!_lodash2.default.isUndefined(updatedValue)) {
              value = updatedValue;
            }
          });
          // Check if value changed
          var newValue = !_lodash2.default.isUndefined(value) ? value : null;
          if (newValue !== storage[name]) {
            // Store processed value (course undefined to null)
            storage[name] = !_lodash2.default.isUndefined(value) ? value : null;
            // In case setting an Entity, watch for it's changes
            watchers.watchChildEntity(name, value);
            // Trigger watchers
            watchers.triggerChangeEvent(name);
          }
        }
      });
    });

    // Cache for future instances
    _cache2.default.store(this, 'storage', storage);
  }

  // Expose storage (read-only, returns a cloned object to prevent tampering)
  Object.defineProperty(this, 'storage', {
    configurable: false,
    enumerable: false,
    get: function get() {
      return _lodash2.default.clone(storage);
    }
  });
}
//# sourceMappingURL=properties.js.map
