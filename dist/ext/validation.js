'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _enttext = require('../enttext');

var _enttext2 = _interopRequireDefault(_enttext);

var _properties = require('../entt/properties');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // =====================================================================================================================
// ENTITY: Validation Extension
// Adds support for validating values as they are assigned to properties
// =====================================================================================================================

// Import dependencies


/**
 * Validation Extension
 * Adds support for validating values as they are assigned to properties
 * @export
 * @class ValidationExtension
 */
var ValidationExtension = function (_EnTTExt) {
  _inherits(ValidationExtension, _EnTTExt);

  /**
   * Creates an instance of ValidationExtension.
   * @param {bool} reject If true, invalid values won't be assigned to the property
   * @memberof ValidationExtension
   */
  function ValidationExtension() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$reject = _ref.reject,
        reject = _ref$reject === undefined ? false : _ref$reject;

    _classCallCheck(this, ValidationExtension);

    // Store configuration
    var _this = _possibleConstructorReturn(this, (ValidationExtension.__proto__ || Object.getPrototypeOf(ValidationExtension)).call(this, {
      onEntityInstantiate: true,
      onChangeDetected: true
    }));

    _this.rejectInvalidValues = reject;
    return _this;
  }

  /**
   * Modifies the entity instance right after it is constructed - appends instance with the validation property
   * @param {any} entity Entity instance
   * @param {any} properties Entity's properties' configuration
   * @memberof EnTTExt
   */


  _createClass(ValidationExtension, [{
    key: 'onEntityInstantiate',
    value: function onEntityInstantiate(entity, properties) {

      // Initialize validation errors storage
      var errors = {};

      // Initialize the .validation property on the instance
      Object.defineProperty(entity, 'validation', {
        configurable: false,
        enumerable: false,
        get: function get() {
          return errors;
        }
      });

      // Validate default property values
      validateProperties.bind(this)(entity, properties);
    }

    /**
     * Notifies the extension that the entity instance being extended has had a property change detected - reevaluate property validity
     * @param {any} entity Entity instance
     * @param {any} properties Entity's properties' configuration
     * @param {any} event EntityChangedEvent instance
     * @memberof EnTTExt
     */

  }, {
    key: 'onChangeDetected',
    value: function onChangeDetected(entity, properties, event) {
      // Validate updated properties
      validateProperties.bind(this)(entity, properties, event.propertyName, event.newValue, event.oldValue);
    }
  }]);

  return ValidationExtension;
}(_enttext2.default);

/**
 * Checks if property is defined as needing validation
 * @param {any} propertyConfiguration Property configuration
 * @returns {bool} If property is defined as needing validation
 */


exports.default = ValidationExtension;
function isValidationProperty(propertyConfiguration) {
  return propertyConfiguration
  // Is defined as dynamic
  && propertyConfiguration.validate
  // Dynamic option value is a function
  && _lodash2.default.isFunction(propertyConfiguration.validate);
}

/**
 * Performs property validation and outputs results to errors object
 * @param {any} entity Entity instance
 * @param {any} properties Entity's properties' configuration
 * @param {any} changedPropertyName Name of the property being validated
 * @param {any} changedPropertyValue Value being validated
 * @param {any} currentPropertyValue Current property value
 */
function validateProperties(entity, properties, changedPropertyName, changedPropertyValue, currentPropertyValue) {
  var _this2 = this;

  // Validate default property values
  _lodash2.default.forEach(properties, function (propertyConfiguration, propertyName) {
    if (isValidationProperty(propertyConfiguration)) {
      // Run validation function
      var validatedValue = propertyName !== changedPropertyName ? entity[propertyName] : changedPropertyValue,
          resetValue = propertyName !== changedPropertyName ? null : currentPropertyValue,
          validation = propertyConfiguration.validate(validatedValue, entity);
      // Check if validation successful
      if (validation === undefined) {
        // Reset validation error
        delete entity.validation[propertyName];
      } else {
        // Store validation error
        entity.validation[propertyName] = new ValidationOutput({
          property: propertyName,
          value: validatedValue,
          message: validation
        });
        // If rejecting invalid values, reset value to current value
        if (_this2.rejectInvalidValues) {
          // Unset default value (wrap into EnTTBypassEverythingValue to bypass validation and watchers)
          entity[propertyName] = new _properties.EnTTBypassEverythingValue(resetValue);
        }
      }
    }
  });
}

/**
 * Holds validation output information
 * @class ValidationOutput
 */

var ValidationOutput =
/**
 * Creates an instance of ValidationError.
 * @param {any} property Name of the property being validated
 * @param {any} value Value being validated
 * @param {any} message Validation message
 * @memberof ValidationOutput
 */
function ValidationOutput(_ref2) {
  var property = _ref2.property,
      value = _ref2.value,
      message = _ref2.message;

  _classCallCheck(this, ValidationOutput);

  // Store properties
  this.property = property;
  this.value = value;
  this.message = message;
};
//# sourceMappingURL=validation.js.map
