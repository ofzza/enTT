'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _entt = require('../entt');

var _entt2 = _interopRequireDefault(_entt);

var _properties = require('../entt/properties');

var _enttext = require('../enttext');

var _enttext2 = _interopRequireDefault(_enttext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // =====================================================================================================================
// ENTITY: Dynamic Properties Extension
// Adds support for read-only, dynamically generated properties that generate their value based on other
// existing properties' values
// =====================================================================================================================

// Import dependencies


/**
 * Dynamic Properties Extension
 * Adds support for read-only, dynamically generated properties that generate their value based on other
 * existing properties' values
 * @export
 * @class Extensions
 */
var DynamicPropertiesExtension = function (_EnTTExt) {
  _inherits(DynamicPropertiesExtension, _EnTTExt);

  /**
   * Creates an instance of DynamicPropertiesExtension.
   * @param {any} deferred If true, the dynamic property value will be generated each time the property getter is called instead of on change detection
   * @memberof DynamicPropertiesExtension
   */
  function DynamicPropertiesExtension() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$deferred = _ref.deferred,
        deferred = _ref$deferred === undefined ? false : _ref$deferred;

    _classCallCheck(this, DynamicPropertiesExtension);

    return _possibleConstructorReturn(this, (DynamicPropertiesExtension.__proto__ || Object.getPrototypeOf(DynamicPropertiesExtension)).call(this, {
      processShorthandPropertyConfiguration: true,
      updatePropertyConfiguration: true,
      // If not deferred, regenerate dynamic property value on initialization and change detected
      onEntityInstantiate: !deferred,
      onChangeDetected: !deferred,
      // If deferred, regenerate dynamic property value on get
      interceptPropertyGet: deferred
    }));
  }

  /**
   * Processes property configuration looking for dynamic property short-hand configuration (non-constructor function)
   * @param {any} propertyConfiguration Single property configuration to be processed
   * @returns {any} Processed property configuration
   * @memberof EnTTExt
   */


  _createClass(DynamicPropertiesExtension, [{
    key: 'processShorthandPropertyConfiguration',
    value: function processShorthandPropertyConfiguration(propertyConfiguration) {
      // Check if short-hand dynamic property configuration (a non constructor function)
      if (_lodash2.default.isFunction(propertyConfiguration) && propertyConfiguration !== _entt2.default) {
        return { dynamic: propertyConfiguration };
      } else {
        // Keep configuration as is
        return propertyConfiguration;
      }
    }

    /**
     * Updates property's configuration - if a dynamic property, make it read-only
     * @param {any} propertyConfiguration Single property configuration to be updated
     * @memberof EnTTExt
     */

  }, {
    key: 'updatePropertyConfiguration',
    value: function updatePropertyConfiguration(propertyConfiguration) {
      if (isDynamicProperty(propertyConfiguration)) {
        // Make property read-only
        propertyConfiguration.readOnly = true;
      }
    }

    /**
     * Modifies the entity instance right after it is constructed - recalculate dynamic property values on intialization
     * @param {any} entity Entity instance
     * @param {any} properties Entity's properties' configuration
     * @memberof EnTTExt
     */

  }, {
    key: 'onEntityInstantiate',
    value: function onEntityInstantiate(entity, properties) {
      recalculateAllDynamicProperties.bind(this)(entity, properties);
    }

    /**
     * Notifies the extension that the entity instance being extended has had a property change detected - recalculate dynamic property values
     * @param {any} entity Entity instance
     * @param {any} properties Entity's properties' configuration
     * @memberof EnTTExt
     */

  }, {
    key: 'onChangeDetected',
    value: function onChangeDetected(entity, properties) {
      recalculateAllDynamicProperties.bind(this)(entity, properties);
    }

    /**
     * Generates a function to process every value being fetched from the particular property
     * @param {any} propertyName Name of the property being processed
     * @param {any} propertyConfiguration Property configuration
     * @returns {function} Function processing every value being fetched from this property (If no function returned, extension won't intercept getter for this property)
     * @memberof EnTTExt
     */

  }, {
    key: 'interceptPropertyGet',
    value: function interceptPropertyGet(propertyName, propertyConfiguration) {
      // Check if dynamic property
      if (isDynamicProperty(propertyConfiguration)) {
        /**
         * Called before returning a fetched property value, allows the extension to modify the value being fetched
         * @param {any} entity Entity instance
         * @param {any} properties Entity's properties' configuration
         * @param {any} event EnTTExtGetValueEvent instance
         * @memberof EnTTExt
         */
        return function (entity, properties, event) {
          // Recalculate dynamic property value
          event.value = propertyConfiguration.dynamic(entity);
        };
      }
    }
  }]);

  return DynamicPropertiesExtension;
}(_enttext2.default);

/**
 * Checks if property is defined as a dynamic property
 * @param {any} propertyConfiguration Property configuration
 * @returns {bool} If property is defined as a dynamic property
 */


exports.default = DynamicPropertiesExtension;
function isDynamicProperty(propertyConfiguration) {
  return propertyConfiguration
  // Is defined as dynamic
  && propertyConfiguration.dynamic
  // Dynamic option value is a function
  && _lodash2.default.isFunction(propertyConfiguration.dynamic)
  // Dynamic option value is not a EnTT class
  && propertyConfiguration.dynamic !== _entt2.default;
}

/**
 * Recalculate dynamic property values
 * @param {any} entity Entity instance
 * @param {any} properties Entity's properties' configuration
 * @memberof EnTTExt
 */
function recalculateAllDynamicProperties(entity, properties) {
  // Find all dynamic properties
  _lodash2.default.forEach(properties, function (propertyConfiguration, propertyName) {
    if (isDynamicProperty(propertyConfiguration)) {
      // Recalculate dynamic property value
      var dynamicValue = propertyConfiguration.dynamic(entity);
      // Set updated dynamic value (wrap into EnTTBypassEverythingValue to bypass read-only restriction)
      entity[propertyName] = new _properties.EnTTBypassEverythingValue(dynamicValue);
    }
  });
}
//# sourceMappingURL=dynamic-properties.js.map
