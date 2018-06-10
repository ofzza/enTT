'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // =====================================================================================================================
// ENTITY: Extensions initialization
// =====================================================================================================================

// Import dependencies


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _entt = require('../entt');

var _entt2 = _interopRequireDefault(_entt);

var _enttext = require('../enttext');

var _enttext2 = _interopRequireDefault(_enttext);

var _cache = require('../utils/cache');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Entity extensions
 * @export
 * @class Extensions
 */
var Extensions = function () {
  _createClass(Extensions, null, [{
    key: 'getEntityExtensions',


    /**
     * Retrieves extensions for an Entity instance or class
     * @static
     * @param {any} entity Entity instance or EnTT extending class to get extensions for
     * @returns {any} EnTT Extensions
     * @memberof Extensions
     */
    value: function getEntityExtensions(entity) {
      // Check if entity passed as instance or class
      if (entity instanceof _entt2.default) {
        // Return property configuration from instance
        return _cache.ConfigurationCache.get(entity).extensions;
      } else if (_lodash2.default.isFunction(entity) && entity.prototype instanceof _entt2.default) {
        // Return property configuration from class
        return _cache.ConfigurationCache.get(new entity()).extensions;
      }
    }

    /**
     * Creates an instance of Extensions.
     * @param {any} extensions Array of class extensions
     * @memberof Extensions
     */

  }]);

  function Extensions(extensions) {
    _classCallCheck(this, Extensions);

    // Preprocess extensions; convert classes into instances
    var processed = _lodash2.default.map(extensions, function (extension) {
      if (extension instanceof _enttext2.default) {
        // Return extension instance
        return extension;
      } else if (_lodash2.default.isFunction(extension) && extension.prototype instanceof _enttext2.default) {
        // Return newly instantiated extension class
        return new extension();
      } else {
        // Throw error
        throw new Error('EnTT class\' static ".includes" property needs to return only instances of EnTTExt class, or extended classes!');
      }
    });

    // Store extensions
    this.extensions = processed;
  }

  /**
   * Initializes the extensions manager with methods tailored to proxy between the extensions' methods and the entity internal workflow
   * @param {any} entity Reference to the parent entity instance
   * @memberof Extensions
   */


  _createClass(Extensions, [{
    key: 'initializeWithoutProperties',
    value: function initializeWithoutProperties(_ref) {
      var entity = _ref.entity;


      // Initialize a managed call to extensions' .processShorthandPropertyConfiguration(...) method
      processShorthandPropertyConfiguration.bind(this)({ entity: entity });
    }

    /**
     * Initializes the extensions manager with methods tailored to proxy between the extensions' methods and the entity internal workflow
     * @param {any} entity Reference to the parent entity instance
     * @param {any} properties Properties configuration
     * @memberof Extensions
     */

  }, {
    key: 'initializeWithProperties',
    value: function initializeWithProperties(_ref2) {
      var entity = _ref2.entity,
          properties = _ref2.properties;


      // Initialize a managed call to extensions' .updatePropertyConfiguration(...) method
      updatePropertyConfiguration.bind(this)({ entity: entity, properties: properties });
      // Initialize a managed call to extensions' .onEntityInstantiate(...) method
      onEntityInstantiate.bind(this)({ entity: entity, properties: properties });
      // Initialize a managed call to extensions' .onChangeDetected(...) method
      onChangeDetected.bind(this)({ entity: entity, properties: properties });
      // Initialize a managed call to extensions' .afterChangeProcessed(...) method
      afterChangeProcessed.bind(this)({ entity: entity, properties: properties });
      // Initialize a managed call to extensions' .interceptPropertySet(...) method
      interceptPropertySet.bind(this)({ entity: entity, properties: properties });
      // Initialize a managed call to extensions' .interceptPropertyGet(...) method
      interceptPropertyGet.bind(this)({ entity: entity, properties: properties });
    }
  }]);

  return Extensions;
}();

/**
 * Creates a method used to call all extensions' .processShorthandPropertyConfiguration(...) method when needed (if the extension is implementing it)
 */


exports.default = Extensions;
function processShorthandPropertyConfiguration() {

  // Fetch extensions implementing .processShorthandPropertyConfiguration(...) method
  var extensions = _lodash2.default.filter(this.extensions, function (extension) {
    return extension.implemented.processShorthandPropertyConfiguration;
  });

  // Create a proxy .processShorthandPropertyConfiguration(...) method
  this.processShorthandPropertyConfiguration = function (propertyConfiguration) {
    // Execute all extensions' .processShorthandPropertyConfiguration(...) method and update configuration
    _lodash2.default.forEach(extensions, function (extension) {
      propertyConfiguration = extension.processShorthandPropertyConfiguration(propertyConfiguration);
    });
    // Return updated configuration
    return propertyConfiguration;
  };
}

/**
 * Creates a method used to call all extensions' .updatePropertyConfiguration(...) method when needed (if the extension is implementing it)
 */
function updatePropertyConfiguration() {

  // Fetch extensions implementing .updatePropertyConfiguration(...) method
  var extensions = _lodash2.default.filter(this.extensions, function (extension) {
    return extension.implemented.updatePropertyConfiguration;
  });

  // Create a proxy .updatePropertyConfiguration(...) method
  this.updatePropertyConfiguration = function (propertyConfiguration) {
    // Execute all extensions' .updatePropertyConfiguration(...) method
    _lodash2.default.forEach(extensions, function (extension) {
      extension.updatePropertyConfiguration(propertyConfiguration);
    });
  };
}

/**
 * Creates a method used to call all extensions' .onEntityInstantiate(...) method when needed (if the extension is implementing it)
 * @param {any} entity Reference to the parent entity instance
 * @param {any} properties Properties configuration
 */
function onEntityInstantiate(_ref3) {
  var entity = _ref3.entity,
      properties = _ref3.properties;


  // Fetch extensions implementing .onEntityInstantiate(...) method
  var extensions = _lodash2.default.filter(this.extensions, function (extension) {
    return extension.implemented.onEntityInstantiate;
  });

  // Create a proxy .onEntityInstantiate(...) method
  this.onEntityInstantiate = function () {
    // Execute all extensions' .onEntityInstantiate(...) method
    _lodash2.default.forEach(extensions, function (extension) {
      extension.onEntityInstantiate(entity, properties);
    });
  };
}

/**
 * Creates a method used to call all extensions' .onChangeDetected(...) method when needed (if the extension is implementing it)
 * @param {any} entity Reference to the parent entity instance
 * @param {any} properties Properties configuration
 */
function onChangeDetected(_ref4) {
  var entity = _ref4.entity,
      properties = _ref4.properties;


  // Fetch extensions implementing .onChangeDetected(...) method
  var extensions = _lodash2.default.filter(this.extensions, function (extension) {
    return extension.implemented.onChangeDetected;
  });

  // Create a proxy .onChangeDetected(...) method
  this.onChangeDetected = function (event) {
    // Execute all extensions' .onChangeDetected(...) method
    _lodash2.default.forEach(extensions, function (extension) {
      extension.onChangeDetected(entity, properties, event);
    });
  };
}

/**
 * Creates a method used to call all extensions' .afterChangeProcessed(...) method when needed (if the extension is implementing it)
 * @param {any} entity Reference to the parent entity instance
 * @param {any} properties Properties configuration
 */
function afterChangeProcessed(_ref5) {
  var entity = _ref5.entity,
      properties = _ref5.properties;


  // Fetch extensions implementing .afterChangeProcessed(...) method
  var extensions = _lodash2.default.filter(this.extensions, function (extension) {
    return extension.implemented.afterChangeProcessed;
  });

  // Create a proxy .afterChangeProcessed(...) method
  this.afterChangeProcessed = function (event) {
    // Execute all extensions' .afterChangeProcessed(...) method
    _lodash2.default.forEach(extensions, function (extension) {
      extension.afterChangeProcessed(entity, properties, event);
    });
  };
}

/**
 * Creates a method used to call all extensions' .interceptPropertySet(...) method when needed (if the extension is implementing it)
 * @param {any} entity Reference to the parent entity instance
 * @param {any} properties Properties configuration
 */
function interceptPropertySet(_ref6) {
  var _this = this;

  var entity = _ref6.entity,
      properties = _ref6.properties;

  // Create a proxy .interceptPropertySet(...) methods, per property
  this.interceptPropertySet = _lodash2.default.reduce(properties, function (interceptPropertySet, propertyConfiguration, propertyName) {

    // Fetch extensions implementing .interceptPropertySet(...) method for this property's interceptor functions
    var setterInterceptors = _lodash2.default.compact(_lodash2.default.map(_this.extensions, function (extension) {
      // Check if implementing .interceptPropertySet(...) method
      if (extension.implemented.interceptPropertySet) {
        // Return the setter interceptor function (if returned for this property)
        return extension.interceptPropertySet(propertyName, propertyConfiguration);
      }
    }));

    // Initialize a per-property setter intercepting function and returns the updated value
    interceptPropertySet[propertyName] = function (currentValue, newValue) {

      // Initialize the EnTTExtValueEvent event
      var changes = [currentValue, newValue],
          event = new _enttext.EnTTExtValueEvent({
        changes: changes,
        currentValue: currentValue,
        value: newValue
      });

      // Cycle through all the setter interceptors
      _lodash2.default.forEach(setterInterceptors, function (setterInterceptor) {
        // Execute the extensino intercaptor
        setterInterceptor(entity, properties, event);
        // Update the changes array for the next interceptor
        changes.push(event.value);
      });

      // Return the updated value
      return event.value;
    };

    // Return composed interceptors
    return interceptPropertySet;
  }, {});
}

/**
 * Creates a method used to call all extensions' .interceptPropertyGet(...) method when needed (if the extension is implementing it)
 * @param {any} entity Reference to the parent entity instance
 * @param {any} properties Properties configuration
 */
function interceptPropertyGet(_ref7) {
  var _this2 = this;

  var entity = _ref7.entity,
      properties = _ref7.properties;

  // Create a proxy .interceptPropertyGet(...) methods, per property
  this.interceptPropertyGet = _lodash2.default.reduce(properties, function (interceptPropertyGet, propertyConfiguration, propertyName) {

    // Fetch extensions implementing .interceptPropertyGet(...) method for this property's interceptor functions
    var getterInterceptors = _lodash2.default.compact(_lodash2.default.map(_this2.extensions, function (extension) {
      // Check if implementing .interceptPropertyGet(...) method
      if (extension.implemented.interceptPropertyGet) {
        // Return the setter interceptor function (if returned for this property)
        return extension.interceptPropertyGet(propertyName, propertyConfiguration);
      }
    }));

    // Initialize a per-property setter intercepting function and returns the updated value
    interceptPropertyGet[propertyName] = function (currentValue, newValue) {

      // Initialize the EnTTExtValueEvent event
      var changes = [currentValue, newValue],
          event = new _enttext.EnTTExtValueEvent({
        changes: changes,
        currentValue: currentValue,
        value: newValue
      });

      // Cycle through all the setter interceptors
      _lodash2.default.forEach(getterInterceptors, function (getterInterceptor) {
        // Execute the extensino intercaptor
        getterInterceptor(entity, properties, event);
        // Update the changes array for the next interceptor
        changes.push(event.value);
      });

      // Return the updated value
      return event.value;
    };

    // Return composed interceptors
    return interceptPropertyGet;
  }, {});
}
//# sourceMappingURL=extensions.js.map
