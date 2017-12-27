'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fetchAllFromPrototypeChain;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _prototype = require('../prototype');

var _prototype2 = _interopRequireDefault(_prototype);

var _modules = require('../modules');

var _modules2 = _interopRequireDefault(_modules);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } // =====================================================================================================================
// ENTITY PROTOTYPE Internals: Initialization functions
// =====================================================================================================================

// Import dependencies


/**
 * Fetch required static properties from object's prototype chain
 * @returns {any} Merged, required static properties from the object's prototype chain
 */
function fetchAllFromPrototypeChain() {

  // Traverse and extract the prototype chain
  var proto = this.constructor,
      prototypes = [];
  do {
    prototypes.push(proto);
  } while (proto = Object.getPrototypeOf(proto));
  // Reverse prototypes array to start with prototypes deeper in the chain
  prototypes = _lodash2.default.reverse(prototypes);

  // Process modules (or get already processed from class' cache)
  var modules = _cache2.default.fetch(this, 'modules');
  if (!modules) {
    _cache2.default.store(this, 'modules', modules = processPrototypeChainForModules.bind(this)(prototypes));
  }
  // Expose modules (read-only, returns a cloned object to prevent tampering) if debugging
  if (_prototype2.default.debug) {
    Object.defineProperty(this, '__modules', {
      configurable: false,
      enumerable: false,
      get: function get() {
        // Allow only if debug mode
        if (_prototype2.default.debug) {
          return modules;
        } else {
          throw new Error('Access denied!');
        }
      }
    });
  }

  // Process property definitions (or get already processed from class' cache)
  var propertyDefinitions = _cache2.default.fetch(this, 'propertyDefinitions');
  if (!propertyDefinitions) {
    _cache2.default.store(this, 'propertyDefinitions', propertyDefinitions = processPrototypeChainForPropertyDefinitions.bind(this)(prototypes, modules));
  }
  // Expose property definitions (read-only, returns a cloned object to prevent tampering) if debugging
  if (_prototype2.default.debug) {
    Object.defineProperty(this, '__propertyDefinitions', {
      configurable: false,
      enumerable: false,
      get: function get() {
        // Allow only if debug mode
        if (_prototype2.default.debug) {
          return propertyDefinitions;
        } else {
          throw new Error('Access denied!');
        }
      }
    });
  }

  // Return everything collected from the prototype chain
  return { modules: modules, propertyDefinitions: propertyDefinitions };
}

/**
 * Extracts all modules from the prototype chain
 * @param {any} prototypes Array of prototypes from the class' prototy chain
 * @returns {any} Array of modules applied to this class, ordered by depth in the prototype chain, starting with deeper modules
 */
function processPrototypeChainForModules(prototypes) {
  var _this = this;

  // Merge all static "modules" properties from the prototype chain
  return _lodash2.default.reduce(prototypes, function (modules, proto) {
    if (!_lodash2.default.isUndefined(proto.modules)) {
      _lodash2.default.forEach(_lodash2.default.isArray(proto.modules) ? proto.modules : [proto.modules], function (module) {
        // Check if instance of EntityModule class or a NIL value
        if (!_lodash2.default.isNil(module) && module instanceof _modules2.default) {
          // Check if already added
          var alreadyAddedIndex = _lodash2.default.findIndex(modules, function (m) {
            return m.constructor === module.constructor;
          });
          if (alreadyAddedIndex === -1) {
            // ... if not add as new
            modules.push(module);
          } else {
            // ... if already added, replace with newer instance
            modules[alreadyAddedIndex] = module;
          }
        } else {
          // If not a NUL-value, throw an error
          if (!_lodash2.default.isNil(module)) {
            throw new Error('Only instances of EntityModule can be used as modules in ' + _this.constructor.name + ' class definition! ');
          }
        }
      });
    }
    return modules;
  }, []);
}

/**
 * Extracts all property definitions from the prototype chain
 * @param {any} prototypes Array of prototypes from the class' prototy chain
 * @param {any} modules Array of modules applied to this class
 * @returns {any} Collection of formalized property definitions for this class (property names used as keys)
 */
function processPrototypeChainForPropertyDefinitions(prototypes, modules) {

  // Collect definitions of all properties from the prototype chain
  var definitions = _lodash2.default.reduce(prototypes, function (definitions, proto) {
    if (!_lodash2.default.isUndefined(proto.propertyDefinitions)) {
      // If property definitions defined by array, transform into object with empty definitions for further processing
      var propertyDefinitions = _lodash2.default.isArray(proto.propertyDefinitions) ? _lodash2.default.reduce(proto.propertyDefinitions, function (r, name) {
        r[name] = {};return r;
      }, {}) : proto.propertyDefinitions;
      // Process all property definitions
      _lodash2.default.forEach(propertyDefinitions, function (def, name) {
        // Check if property already has a definition
        if (!definitions[name]) {
          definitions[name] = [];
        }
        // Add definition (deeper nested definitions to the front of the array, to allow for proper overriding when merging difinitions)
        definitions[name].push(def);
      });
    }
    return definitions;
  }, {});

  // Allow all modules to formalize all properties' definitions
  return _lodash2.default.reduce(definitions, function (propertyDefinitions, def, name) {
    // Merge definitions from the prototype chain
    if (!def || !def.length) {
      // If no definitions, assume empty definition
      def = {};
    } else if (!_lodash2.default.isObject(def)) {
      // If top definition not an object, use as definitive definition
      def = def[0];
    } else {
      // Merge all object definitions
      def = _lodash2.default.merge.apply(_lodash2.default, _toConsumableArray(_lodash2.default.filter(def, function (d) {
        return _lodash2.default.isObject(d);
      })));
    }
    // Initialize property namespace on the property definitions object
    propertyDefinitions[name] = {};
    // Allow all modules to process property definition
    _lodash2.default.reduce(modules, function (property, module) {
      // Initialize module namespace on property
      try {
        property[module.constructor.name] = module.processProperty(name, def);
      } catch (err) {
        // Check if not implemented, or if legitimate error
        if (err !== _modules.NotImplementedError) {
          // Throw ligitimate error
          throw err;
        } else {
          // Initialize dummy module namespace on property
          property[module.constructor.name] = null;
        }
      }
      return property;
    }, propertyDefinitions[name]);
    return propertyDefinitions;
  }, {});
}
//# sourceMappingURL=initialization.js.map
