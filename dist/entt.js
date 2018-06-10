'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // =====================================================================================================================
// ENTITY: Base Class
// =====================================================================================================================

// Import dependencies


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _properties = require('./entt/properties');

var _properties2 = _interopRequireDefault(_properties);

var _extensions = require('./entt/extensions');

var _extensions2 = _interopRequireDefault(_extensions);

var _changeDetection = require('./entt/change-detection');

var _changeDetection2 = _interopRequireDefault(_changeDetection);

var _dataManagement = require('./entt/data-management');

var _dataManagement2 = _interopRequireDefault(_dataManagement);

var _cache = require('./utils/cache');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Default property configuration values
var defaultPropertyConfiguration = {
  // Default value, given to the property on initialization
  value: undefined,
  // If true, property won't have a setter function
  readOnly: false,
  // If property is importable/exportable
  exportable: true
};

/**
 * EnTT Base class
 * @export
 * @class EnTT
 */

var EnTT = function () {
  _createClass(EnTT, null, [{
    key: 'cast',


    /**
     * Casts provided data as a EnTT instance of given type
     * @export
     * @param {any} data Data to cast
     * @param {any} EntityClass Extended EnTT class to cast as
     *        - if not provided, will cast to EnTT class this static method is being called from
     *        - if empty array provided, will cast to array of instances of EnTT class this static method is being called from
     *        - if empty hashmap provided, will cast to array of instances of EnTT class this static method is being called from
     * @returns {any} Instance of required EnTT class with provided data cast into it
     */
    value: function cast(data, EntityClass) {
      // Check if/how EntityClass is defined or implied
      if (!EntityClass && !_lodash2.default.isArray(data)) {
        // No explicit class definition, casting data not array
        return _dataManagement2.default.cast(data, this);
      } else if (!EntityClass && _lodash2.default.isArray(data)) {
        // No explicit class definition, casting data is array
        return _dataManagement2.default.cast(data, [this]);
      } else if (_lodash2.default.isArray(EntityClass) && EntityClass.length === 0) {
        // Explicit class definition as array with implicit members
        return _dataManagement2.default.cast(data, [this]);
      } else if (_lodash2.default.isObject(EntityClass) && !_lodash2.default.isFunction(EntityClass) && _lodash2.default.values(EntityClass).length === 0) {
        // Explicit class definition as hashmap with implicit members
        return _dataManagement2.default.cast(data, _defineProperty({}, this.name, this));
      } else {
        // Explicit class definition
        return _dataManagement2.default.cast(data, EntityClass);
      }
    }

    /**
     * Creates an instance of EnTT.
     * @memberof EnTT
     */

  }, {
    key: 'default',


    /**
     * Gets/Sets default property configuration
     * @static
     * @memberof EnTT
     */
    get: function get() {
      return defaultPropertyConfiguration;
    },
    set: function set(value) {
      defaultPropertyConfiguration = _lodash2.default.merge({}, defaultPropertyConfiguration, value);
    }
  }]);

  function EnTT() {
    _classCallCheck(this, EnTT);

    // Check if attempting to instantiate Entity base class directly
    if (this.constructor === EnTT) {
      throw new Error('Entity base class is not meant to be instantiated directly - extend it with your own class!');
    }

    // Initialize shared initialization namespace object
    var refs = {
      entity: this,
      properties: undefined,
      values: undefined,
      extensionsManager: undefined,
      changeManager: undefined,
      propertyManager: undefined,
      dataManager: undefined
    };

    // Load previously cached configuration
    var classes = null;
    var cached = _cache.ConfigurationCache.get(this);

    // Get (or load from cache if previously initialized) class extensions
    refs.extensions = cached.extensions;
    if (!refs.extensions) {
      // Get inherited classes (if not already gotten)
      if (!classes) {
        classes = getInheritedClasses.bind(this)();
      }
      // Get extensions
      _cache.ConfigurationCache.set(this, {
        extensions: refs.extensions = getClassExtensions.bind(this)(classes)
      });
    }
    // Initialize extension manager (without properties)
    refs.extensionsManager = new _extensions2.default(refs.extensions);
    refs.extensionsManager.initializeWithoutProperties(refs);

    // Get (or load from cache if previously initialized) class properties configuration
    // NOTE: .properties are cached per class, not per instance!
    refs.loadedPropertiesFromCache = !!cached.properties;
    refs.properties = cached.properties;
    if (!refs.properties) {
      // Get inherited classes (if not already gotten)
      if (!classes) {
        classes = getInheritedClasses.bind(this)();
      }
      // Get property configuration
      _cache.ConfigurationCache.set(this, {
        properties: refs.properties = getClassProperties.bind(this)(classes, refs)
      });
    }

    // Initialize extension manager (with properties)
    refs.extensionsManager.initializeWithProperties(refs);

    // EXTENSIONS HOOK: .updateDefaultPropertyConfiguration(...)
    // If properties weren't cached, lets extension update properties
    if (!refs.loadedPropertiesFromCache) {
      _lodash2.default.forEach(refs.properties, function (propertyConfiguration) {
        refs.extensionsManager.updatePropertyConfiguration(propertyConfiguration);
      });
    }

    // Initialize a change detection instance and expose public methods
    refs.changeManager = new _changeDetection2.default(refs);
    _changeDetection2.default.initialize(refs);

    // Initialize properties with getters/setters
    refs.propertyManager = new _properties2.default(refs);
    _properties2.default.initialize(refs);

    // Initialize data management (Import/Export of data)
    refs.dataManager = new _dataManagement2.default(refs);
    _dataManagement2.default.initialize(refs);

    // EXTENSIONS HOOK: .onEntityInstantiate(...)
    // Lets extensions modify the entity after being constructed and before it is locked
    refs.extensionsManager.onEntityInstantiate();

    // Lock instance to prevent ad-hoc addition of extra properties
    Object.freeze(this);
  }

  return EnTT;
}();

/**
 * Gets all of instances inherited classes
 * @returns {any} All of instances inherited classes
 */


exports.default = EnTT;
function getInheritedClasses() {

  // Get references to all classes current instance is inheriting from
  var classes = [];
  var current = this.constructor;
  do {
    classes.push(current);
  } while (current = Object.getPrototypeOf(current));

  // Return inherited from classes
  return classes;
}

/**
 * Gets class extensions by traversing and merging static ".includes" property of the instance's class and it's inherited classes
 * @param {any} classes Array of inherited from classes
 * @returns {any} Array of extensions applied to the class
 */
function getClassExtensions(classes) {

  // Extract property definitions from all inherited classes' static ".props" property
  var extensions = _lodash2.default.reduceRight(classes, function (extensions, current) {
    var extensionsArray = current.includes ? _lodash2.default.isArray(current.includes) ? current.includes : [current.includes] : [];
    _lodash2.default.forEach(extensionsArray, function (extension) {
      extensions.push(extension);
    });
    return extensions;
  }, []);

  // Return extracted properties
  return extensions;
}

/**
 * Gets class properties configuration by traversing and merging static ".props" property of the instance's class and all it's inherited classes
 * @param {any} classes Array of inherited from classes
 * @param {any} extensionsManager Extensions manager
 * @returns {any} Property configuration for all class' properties
 */
function getClassProperties(classes) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      extensionsManager = _ref.extensionsManager;

  // Define checks for shorthand casting configurations
  var isPropertyShorthandCastAsSingleEntity = function isPropertyShorthandCastAsSingleEntity(propertyConfiguration) {
    if (propertyConfiguration
    // Check if class extending EnTT
    && propertyConfiguration.prototype instanceof EnTT) {
      return propertyConfiguration;
    }
  };
  var isPropertyShorthandCastAsEntityArray = function isPropertyShorthandCastAsEntityArray(propertyConfiguration) {
    if (propertyConfiguration
    // Check if array
    && _lodash2.default.isArray(propertyConfiguration)
    // Check if array has a single member
    && propertyConfiguration.length === 1
    // Check if single array memeber is a class extending EnTT
    && propertyConfiguration[0].prototype instanceof EnTT) {
      return propertyConfiguration[0];
    }
  };
  var isPropertyShorthandCastAsEntityHashmap = function isPropertyShorthandCastAsEntityHashmap(propertyConfiguration) {
    if (propertyConfiguration
    // Check if object
    && _lodash2.default.isObject(propertyConfiguration)
    // Check if object has a single member
    && _lodash2.default.values(propertyConfiguration).length
    // Check if single object member is a class extending EnTT
    && _lodash2.default.values(propertyConfiguration)[0].prototype instanceof EnTT
    // Check if single object member's property key equals class name
    && _lodash2.default.keys(propertyConfiguration)[0] === _lodash2.default.values(propertyConfiguration)[0].name) {
      return _lodash2.default.values(propertyConfiguration)[0];
    }
  };

  // Extract property definitions from all inherited classes' static ".props" property
  var properties = _lodash2.default.reduceRight(classes, function (properties, current) {

    // Extract currentProperties
    var currentProperties = current.props,
        CastClass = void 0;

    // Edit short-hand configuration syntax where possible
    _lodash2.default.forEach(currentProperties, function (propertyConfiguration, propertyName) {

      // Replace "casting properties" short-hand configuration syntax for single entity
      CastClass = isPropertyShorthandCastAsSingleEntity(propertyConfiguration);
      if (CastClass) {
        // Replace shorthand cast-as-single-entity syntax
        currentProperties[propertyName] = { cast: propertyConfiguration };
        return;
      }
      // Replace "casting properties" short-hand configuration syntax for entity array
      CastClass = isPropertyShorthandCastAsEntityArray(propertyConfiguration);
      if (CastClass) {
        // Replace shorthand cast-as-entity-array syntax
        currentProperties[propertyName] = { cast: [CastClass] };
        return;
      }
      // Replace "casting properties" short-hand configuration syntax for entity array
      CastClass = isPropertyShorthandCastAsEntityHashmap(propertyConfiguration);
      if (CastClass) {
        // Replace shorthand cast-as-entity-hashmap syntax
        currentProperties[propertyName] = { cast: _defineProperty({}, new CastClass().constructor.name, CastClass) };
        return;
      }

      // EXTENSIONS HOOK: .processShorthandPropertyConfiguration(...)
      // Lets extensions process short-hand property configuration
      currentProperties[propertyName] = extensionsManager.processShorthandPropertyConfiguration(propertyConfiguration);
    });

    // Merge with existing properties
    return _lodash2.default.merge(properties, currentProperties || {});
  }, {});

  // Update property configuration with default configuration values
  _lodash2.default.forEach(properties, function (propertyConfiguration, key) {
    properties[key] = _lodash2.default.merge({}, EnTT.default, propertyConfiguration);
  });

  // Return extracted properties
  return properties;
}
//# sourceMappingURL=entt.js.map
