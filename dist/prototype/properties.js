'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initializeManagedProperties;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _2 = require('./');

var _3 = _interopRequireDefault(_2);

var _modules = require('../modules');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Initializes managed properties, based on property definitions, calling all modules as part of getter/setter
 * @param {any} modules Array of modules applied to this class
 * @param {any} propertyDefinitions Collection of formalized property definitions for this class (property names used as keys)
 * @param {any} watchers Repository of entity instance's registered watchers
 */
function initializeManagedProperties(modules, propertyDefinitions, watchers) {
  var _this = this;

  // Filter modules by implemented methods
  var getterModules = _lodash2.default.filter(modules, function (module) {
    try {
      module.get();return true;
    } catch (err) {
      return err !== _modules.NotImplementedError;
    }
  }),
      setterModules = _lodash2.default.filter(modules, function (module) {
    try {
      module.set();return true;
    } catch (err) {
      return err !== _modules.NotImplementedError;
    }
  }),
      afterSetterModules = _lodash2.default.filter(modules, function (module) {
    try {
      module.afterSet();return true;
    } catch (err) {
      return err !== _modules.NotImplementedError;
    }
  });

  // Process managed properties and formalize their definitions per included module
  var storage = {};
  _lodash2.default.forEach(propertyDefinitions, function (def, name) {
    // Initialize values (course undefined to null)
    _lodash2.default.forEach(modules, function (module) {
      try {
        // Try initialization if implemented
        var initializedValue = module.initialize.bind(_this)(name, storage[name], def[module.constructor.name]);
        if (!_lodash2.default.isUndefined(initializedValue)) {
          storage[name] = initializedValue;
        } else if (_lodash2.default.isUndefined(storage[name])) {
          storage[name] = null;
        }
      } catch (err) {
        // Check if not implemented, or if legitimate error
        if (err !== _modules.NotImplementedError) {
          throw err;
        }
      }
    });

    // Initialize property
    Object.defineProperty(_this, name, {
      configurable: false,
      enumerable: true,

      get: function () {
        // Return composed getter function
        return function () {
          // Get value from storage
          var value = storage[name];
          // Let modules process set value
          _lodash2.default.forEach(getterModules, function (module) {
            try {
              var updatedValue = module.get.bind(_this)(name, value, def[module.constructor.name]);
              if (!_lodash2.default.isUndefined(updatedValue)) {
                value = updatedValue;
              }
            } catch (err) {
              // Check if not implemented, or if legitimate error
              if (err !== _modules.NotImplementedError) {
                throw err;
              }
            }
          });
          // Return processed value (course undefined to null)
          return !_lodash2.default.isUndefined(value) ? value : null;
        };
      }(),

      set: function () {
        // Return composed setter function
        return function (value) {
          // Let modules process set value
          _lodash2.default.forEach(setterModules, function (module) {
            try {
              var updatedValue = module.set.bind(_this)(name, value, def[module.constructor.name]);
              if (!_lodash2.default.isUndefined(updatedValue)) {
                value = updatedValue;
              }
            } catch (err) {
              // Check if not implemented, or if legitimate error
              if (err !== _modules.NotImplementedError) {
                throw err;
              }
            }
          });
          // Check if value changed
          var newValue = !_lodash2.default.isUndefined(value) ? value : null;
          if (newValue !== storage[name]) {
            // Store processed value (course undefined to null)
            storage[name] = !_lodash2.default.isUndefined(value) ? value : null;
            // Let modules process value after having set it
            _lodash2.default.forEach(afterSetterModules, function (module) {
              try {
                module.afterSet.bind(_this)(name, value, def[module.constructor.name]);
              } catch (err) {
                // Check if not implemented, or if legitimate error
                if (err !== _modules.NotImplementedError) {
                  throw err;
                }
              }
            });
            // In case setting an Entity, watch for it's changes
            watchers.watchChildEntity(name, value);
            // Trigger watchers
            watchers.triggerChangeEvent(name);
          }
        };
      }()

    });
  });

  // Expose storage (if debugging)
  if (_3.default.debug) {
    Object.defineProperty(this, '__storage', {
      configurable: false,
      enumerable: false,
      get: function get() {
        if (_3.default.debug) {
          return storage;
        } else {
          throw new Error('Access denied!');
        }
      }
    });
  }
} // =====================================================================================================================
// ENTITY PROTOTYPE Internals: Property processing and initialization functions
// =====================================================================================================================

// Import dependencies
//# sourceMappingURL=properties.js.map
