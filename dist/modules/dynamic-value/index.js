'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

var _prototype = require('../../prototype');

var _prototype2 = _interopRequireDefault(_prototype);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // =====================================================================================================================
// ENTITY: Entity Dynamic Value Module
// =====================================================================================================================

// Import dependencies


/**
 * Dynamic value module, included directly into Entity base class,
 * provides support for read-only, dynamically generated properties
 * @export
 * @class DynamicValueEntityModule
 * @extends {EntityModule}
 */
var DynamicValueEntityModule = function (_EntityModule) {
  _inherits(DynamicValueEntityModule, _EntityModule);

  function DynamicValueEntityModule() {
    _classCallCheck(this, DynamicValueEntityModule);

    return _possibleConstructorReturn(this, (DynamicValueEntityModule.__proto__ || Object.getPrototypeOf(DynamicValueEntityModule)).apply(this, arguments));
  }

  _createClass(DynamicValueEntityModule, [{
    key: 'processProperty',
    value: function processProperty(name, def) {
      // Initialize formal definition
      var formal = {};
      // Check for dynamic property function value
      if (def && def.dynamic && _lodash2.default.isFunction(def.dynamic)) {

        // Assign explicitly defined function
        formal.dynamic = def.dynamic;
        formal.dependencies = _lodash2.default.isArray(def.dependencies) ? def.dependencies : false;
      } else if (_lodash2.default.isFunction(def) && (!def.prototype || !(def.prototype instanceof _prototype2.default))) {
        // Assign short-hand definition
        formal.dynamic = def;
      }
      // Return formal definition
      return formal;
    }
  }, {
    key: 'initializePropertyValue',
    value: function initializePropertyValue(name, value, formal, cache) {
      var _this2 = this;

      // If dynamic property
      if (formal.dynamic) {

        // Initialize a cached storage for calculated dynamic values and listeners
        if (!cache.initialized) {
          _lodash2.default.merge(cache, {
            initialized: true,
            values: {},
            listeners: {
              all: {},
              byDependency: {}
            }
          });
        }

        // Initialize calculated values storage
        var recalculateFn = function recalculateFn() {
          cache.values[name] = formal.dynamic.bind(_this2)();
        };
        recalculateFn();

        // Process dependencies and store listeners
        cache.listeners.all[name] = recalculateFn;
        _lodash2.default.forEach(formal.dependencies || ['*'], function (dependency) {
          if (!cache.listeners.byDependency[dependency]) {
            cache.listeners.byDependency[dependency] = {};
          }
          cache.listeners.byDependency[dependency][name] = recalculateFn;
        });
      }
    }
  }, {
    key: 'afterSetPropertyValue',
    value: function afterSetPropertyValue(name, value, formal, cache) {
      // If dynamic property
      if (cache.initialized) {

        // Trigger dynamic property recalculation and storage for properties with this dependency
        if (cache.listeners.byDependency && cache.listeners.byDependency[name]) {
          _lodash2.default.forEach(cache.listeners.byDependency[name], function (recalcPropertyFn) {
            recalcPropertyFn();
          });
        }

        // Trigger dynamic property recalculation and storage for properties with no defined dependencies
        if (cache.listeners.byDependency) {
          _lodash2.default.forEach(cache.listeners.byDependency['*'], function (recalcPropertyFn) {
            recalcPropertyFn();
          });
        }
      }
    }
  }, {
    key: 'getPropertyValue',
    value: function getPropertyValue(name, value, formal, cache) {
      // If dynamic property
      if (cache.initialized) {

        // If defined as dynamic property, use dynamic function to calculate value
        if (formal.dynamic) {
          // Check if calculated value
          if (cache.values[name]) {
            // Return calculated value
            return cache.values[name];
          } else {
            // Calculate value
            return cache.values[name] = formal.dynamic.bind(this)();
          }
        }
      }
    }
  }, {
    key: 'afterUpdate',
    value: function afterUpdate() {
      var updated = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var cache = arguments[1];

      // If dynamic property
      if (cache.initialized) {

        // Check if specified updated properties
        if (updated) {

          // Trigger dynamic property recalculation for properties with updated dependencies
          if (cache.listeners.byDependency && cache.listeners.byDependency[name]) {
            _lodash2.default.forEach(_lodash2.default.isArray(updated) ? updated : [updated], function (name) {
              _lodash2.default.forEach(cache.listeners.byDependency[name], function (recalcPropertyFn) {
                recalcPropertyFn();
              });
            });
          }

          // Trigger dynamic property recalculation and storage for properties with no defined dependencies
          if (cache.listeners.byDependency) {
            _lodash2.default.forEach(cache.listeners.byDependency['*'], function (recalcPropertyFn) {
              recalcPropertyFn();
            });
          }
        } else {

          // Trigger dynamic property recalculation for all dynamic properties
          if (cache.listeners.all) {
            _lodash2.default.forEach(cache.listeners.all, function (recalcPropertyFn) {
              recalcPropertyFn();
            });
          }
        }
      }
    }
  }]);

  return DynamicValueEntityModule;
}(_3.default);

exports.default = DynamicValueEntityModule;
//# sourceMappingURL=index.js.map
