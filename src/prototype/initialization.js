// =====================================================================================================================
// ENTITY PROTOTYPE Internals: Initialization functions
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EntityPrototype from '../prototype';
import { default as EntityModule, NotImplementedError } from '../modules';
import Cache from './cache';


/**
 * Fetch required static properties from object's prototype chain
 * @returns {any} Merged, required static properties from the object's prototype chain
 */
export default function fetchAllFromPrototypeChain () {

  // Traverse and extract the prototype chain
  let proto = this.constructor,
      prototypes = [];
  do { prototypes.push(proto); } while ((proto = Object.getPrototypeOf(proto)));
  // Reverse prototypes array to start with prototypes deeper in the chain
  prototypes = _.reverse(prototypes);

  // Process modules (or get already processed from class' cache)
  let modules = Cache.fetch(this, 'modules');
  if (!modules) { Cache.store(this, 'modules', (modules = processPrototypeChainForModules.bind(this)(prototypes))); }
  // Expose modules (read-only, returns a cloned object to prevent tampering) if debugging
  if (EntityPrototype.debug) {
    Object.defineProperty(this, '__modules', {
      configurable: false,
      enumerable: false,
      get: () => {
        // Allow only if debug mode
        if (EntityPrototype.debug) {
          return modules;
        } else {
          throw new Error('Access denied!');
        }
      }
    });
  }

  // Process property definitions (or get already processed from class' cache)
  let propertyDefinitions = Cache.fetch(this, 'propertyDefinitions');
  if (!propertyDefinitions) { Cache.store(this, 'propertyDefinitions', (propertyDefinitions = processPrototypeChainForPropertyDefinitions.bind(this)(prototypes, modules))); }
  // Expose property definitions (read-only, returns a cloned object to prevent tampering) if debugging
  if (EntityPrototype.debug) {
    Object.defineProperty(this, '__propertyDefinitions', {
      configurable: false,
      enumerable: false,
      get: () => {
        // Allow only if debug mode
        if (EntityPrototype.debug) {
          return propertyDefinitions;
        } else {
          throw new Error('Access denied!');
        }
      }
    });
  }

  // Return everything collected from the prototype chain
  return { modules, propertyDefinitions };

}

/**
 * Extracts all modules from the prototype chain
 * @param {any} prototypes Array of prototypes from the class' prototy chain
 * @returns {any} Array of modules applied to this class, ordered by depth in the prototype chain, starting with deeper modules
 */
function processPrototypeChainForModules (prototypes) {

  // Merge all static "modules" properties from the prototype chain
  return _.reduce(prototypes, (modules, proto) => {
    if (!_.isUndefined(proto.modules)) {
      _.forEach((_.isArray(proto.modules) ? proto.modules : [ proto.modules ]), (module) => {
        // Check if instance of EntityModule class or a NIL value
        if (!_.isNil(module) && module instanceof EntityModule) {
          // Check if already added
          let alreadyAddedIndex = _.findIndex(modules, (m) => {
            return (m.constructor === module.constructor);
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
          if (!_.isNil(module)) { throw new Error(`Only instances of EntityModule can be used as modules in ${ this.constructor.name } class definition! `); }
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
function processPrototypeChainForPropertyDefinitions (prototypes, modules) {

  // Collect definitions of all properties from the prototype chain
  const definitions = _.reduce(prototypes, (definitions, proto) => {
    if (!_.isUndefined(proto.propertyDefinitions)) {
      // If property definitions defined by array, transform into object with empty definitions for further processing
      let propertyDefinitions = (_.isArray(proto.propertyDefinitions) ? _.reduce(proto.propertyDefinitions, (r, name) => { r[name] = {}; return r; }, {}) : proto.propertyDefinitions);
      // Process all property definitions
      _.forEach(propertyDefinitions, (def, name) => {
        // Check if property already has a definition
        if (!definitions[name]) { definitions[name] = []; }
        // Add definition (deeper nested definitions to the front of the array, to allow for proper overriding when merging difinitions)
        definitions[name].push(def);
      });
    }
    return definitions;
  }, {});

  // Allow all modules to formalize all properties' definitions
  return _.reduce(definitions, (propertyDefinitions, def, name) => {
    // Merge definitions from the prototype chain
    if (!def || !def.length) {
      // If no definitions, assume empty definition
      def = {};
    } else if (!_.isObject(def)) {
      // If top definition not an object, use as definitive definition
      def = def[0];
    } else {
      // Merge all object definitions
      def = _.merge(..._.filter(def, (d) => { return _.isObject(d); }));
    }
    // Initialize property namespace on the property definitions object
    propertyDefinitions[name] = {};
    // Allow all modules to process property definition
    _.reduce(modules, (property, module) => {
      // Initialize module namespace on property
      try {
        property[module.constructor.name] = module.processProperty(name, def);
      } catch (err) {
        // Check if not implemented, or if legitimate error
        if (err !== NotImplementedError) {
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
