'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EnTTBypassEverythingValue = exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // =====================================================================================================================
// ENTITY: Properties initialization
// =====================================================================================================================

// Import dependencies


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _entt = require('../entt');

var _entt2 = _interopRequireDefault(_entt);

var _dataManagement = require('./data-management');

var _dataManagement2 = _interopRequireDefault(_dataManagement);

var _changeDetection = require('./change-detection');

var _cache = require('../utils/cache');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Entity properties
 * @export
 * @class Properties
 */
var Properties = function () {
  _createClass(Properties, null, [{
    key: 'getEntityPropertyConfiguration',


    /**
     * Retrieves property configuration from an Entity instance or class
     * @static
     * @param {any} entity Entity instance or EnTT extending class to get property configuration for
     * @returns {any} Property configuration
     * @memberof Properties
     */
    value: function getEntityPropertyConfiguration(entity) {
      // Check if entity passed as instance or class
      if (entity instanceof _entt2.default) {
        // Return property configuration from instance
        return _cache.ConfigurationCache.get(entity).properties;
      } else if (_lodash2.default.isFunction(entity) && entity.prototype instanceof _entt2.default) {
        // Return property configuration from class
        return _cache.ConfigurationCache.get(new entity()).properties;
      }
    }

    /**
     * Initializes configured properties with managed getters/setters
     * @param {any} entity Reference to the parent entity instance
     * @param {any} propertyManager Properties instance associated to the entity instance being handled
     * @param {any} properties Properties configuration
     * @returns {any} reference to internal property values storage (for further initialization)
     */

  }, {
    key: 'initialize',
    value: function initialize(_ref) {
      var entity = _ref.entity,
          propertyManager = _ref.propertyManager,
          properties = _ref.properties;


      // Initialize instance's working store
      var store = {
        // Holds current entity values
        values: {},
        // Holds references to properties containing child entities' watcher cancelation functions
        embeddedEntityWatchers: {}
      };

      // Initialize properties' getters and setters
      _lodash2.default.forEach(properties, function (propertyConfiguration, propertyName) {
        // Set property initial value
        store.values[propertyName] = propertyConfiguration.value || null;
        // Initialize property getter/setter
        Object.defineProperty(entity, propertyName, _lodash2.default.merge(
        // Basic property configuration
        {
          configurable: false,
          enumerable: true
        },
        // Setter function (throws error if property is "read-only")
        {
          set: function set(value) {
            // Check if allowed to write value
            if (value instanceof EnTTBypassEverythingValue) {
              // Write value directly into storage, regardless of read-only status bypassing any pre-processing and without triggering any watchers
              return store.values[propertyName] = value.value;
            } else if (propertyConfiguration.readOnly) {
              // Don't write value to read-only property
              throw new Error('Can\'t set a read-only EnTT property!');
            } else {
              // Write value
              propertyManager.propertySetterFunction(store, propertyName, value);
            }
          }
        },
        // Getter function
        {
          get: function get() {
            // Get value
            return propertyManager.propertyGetterFunction(store, propertyName);
          }
        }));
      });

      // Return reference to internal values, to be used in further initialization
      return store.values;
    }

    /**
     * Creates an instance of Properties.
     * @param {any} entity Reference to the parent entity instance
     * @param {any} changeManager Changes watcher instance
     * @param {any} extensionsManager Extensions manager
     * @param {any} properties Properties configuration
     * @memberof Properties
     */

  }]);

  function Properties(_ref2) {
    var entity = _ref2.entity,
        changeManager = _ref2.changeManager,
        extensionsManager = _ref2.extensionsManager,
        properties = _ref2.properties;

    _classCallCheck(this, Properties);

    // Store local properties
    this.entity = entity;
    this.changeManager = changeManager;
    this.extensionsManager = extensionsManager;
    this.properties = properties;
  }

  /**
   * Sets a property value
   * @param {any} store Working store
   * @param {any} key Property name
   * @param {any} value Property value
   */


  _createClass(Properties, [{
    key: 'propertySetterFunction',
    value: function propertySetterFunction(store, key, value) {
      var _this = this;

      // Check if previously set value was an Entity, and if so disconnect instance watchers from the child entity
      if (store.values[key] instanceof _entt2.default) {
        // Cancel watcher on child entity
        store.embeddedEntityWatchers[key]();
        // Remove watcher cancel function
        if (!_lodash2.default.isUndefined(store.embeddedEntityWatchers[key])) {
          delete store.embeddedEntityWatchers[key];
        }
      }
      // Check if set value is an Entity, and if so connect instance watchers to the child entity
      if (value instanceof _entt2.default && value !== this.entity) {
        // Watch for changes to the child entity, and trigger own watcher on change
        var cancelWatcherFn = value.watch(function (e) {
          // Check if changed entity is this one (nested in itself)
          if (e.source !== _this.entity) {
            // Trigger watchers with the change to the property
            _this.changeManager.triggerOnPropertyChange(new _changeDetection.EntityChangedEvent({
              source: e.source,
              propertyName: key,
              innerEvent: e
            }));
          }
        });
        // Store watcher cancel function
        store.embeddedEntityWatchers[key] = cancelWatcherFn;
      }

      // Check if value needs to be cast
      var EntityCastingClass = this.properties[key].cast;
      if (EntityCastingClass) {
        // Cast value before storing it
        value = _dataManagement2.default.cast(value, EntityCastingClass);
      }

      // EXTENSIONS HOOK: .interceptPropertySet(...)
      // Lets extensions intercept and update the property value being set before it is committed to the entity instance
      value = this.extensionsManager.interceptPropertySet[key](store.values[key], value);

      // Set value
      var oldValue = store.values[key];
      store.values[key] = value;

      // Trigger watchers with the change to the property
      this.changeManager.triggerOnPropertyChange(new _changeDetection.EntityChangedEvent({
        source: this.entity,
        propertyName: key,
        oldValue: oldValue,
        newValue: value
      }));
    }

    /**
     * Gets a property value
     * @param {any} store Working store
     * @param {any} key Property name
     * @returns {any} Property value
     */

  }, {
    key: 'propertyGetterFunction',
    value: function propertyGetterFunction(store, key) {

      // Get value
      var value = store.values[key];

      // EXTENSIONS HOOK: .interceptPropertyGet(...)
      // Lets extensions intercept and update the property value being fetched before it is returned
      value = this.extensionsManager.interceptPropertyGet[key](store.values[key], value);

      // Return value
      return value;
    }
  }]);

  return Properties;
}();

/**
 * Encapsulates a value marking it as ready to be stored directly, without any checks (ignoring read-only), pre-processing (casting) or triggering any watchers
 * @export
 * @class EnTTReadonlyOverrideValue
 */


exports.default = Properties;

var EnTTBypassEverythingValue =
/**
 * Creates an instance of EnTTReadonlyOverrideValue.
 * @param {any} value Internal value to write
 * @memberof EnTTReadonlyOverrideValue
 */
exports.EnTTBypassEverythingValue = function EnTTBypassEverythingValue(value) {
  _classCallCheck(this, EnTTBypassEverythingValue);

  // Store value
  this.value = value;
};
//# sourceMappingURL=properties.js.map
