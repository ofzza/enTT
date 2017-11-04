// =====================================================================================================================
// ENTITY PROTOTYPE Internals: Initialization functions
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EntityPrototype from '../prototype';
import EntityModule from '../modules';
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
    Object.defineProperty(this, 'modules', {
      configurable: false,
      enumerable: false,
      get: () => {
        // Allow only if debug mode
        if (EntityPrototype.debug) {
          return _.clone(modules);
        } else {
          throw new Error('Access denied!');
        }
      }
    });
  }

  // Process schema (or get already processed from class' cache)
  let schema = Cache.fetch(this, 'schema');
  if (!schema) { Cache.store(this, 'schema', (schema = processPrototypeChainForSchema.bind(this)(prototypes, modules))); }
  // Expose schema (read-only, returns a cloned object to prevent tampering) if debugging
  if (EntityPrototype.debug) {
    Object.defineProperty(this, 'schema', {
      configurable: false,
      enumerable: false,
      get: () => {
        // Allow only if debug mode
        if (EntityPrototype.debug) {
          return _.clone(schema);
        } else {
          throw new Error('Access denied!');
        }
      }
    });
  }

  // Return everything collected from the prototype chain
  return { modules, schema };

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
 * Extracts all schema property definitions from the prototype chain
 * @param {any} prototypes Array of prototypes from the class' prototy chain
 * @param {any} modules Array of modules applied to this class
 * @returns {any} Collection of formalized property definitions for this class (property names used as keys)
 */
function processPrototypeChainForSchema (prototypes, modules) {

  // Collect definitions of all properties from the prototype chain
  const definitions = _.reduce(prototypes, (definitions, proto) => {
    if (!_.isUndefined(proto.schema)) {
      // If schema defined by array, transform into object with empty definitions for further processing
      let schema = (_.isArray(proto.schema) ? _.reduce(proto.schema, (schema, name) => { schema[name] = {}; return schema; }, {}) : proto.schema);
      // Process all property definitions
      _.forEach(schema, (def, name) => {
        // Check if property already has a definition
        if (!definitions[name]) { definitions[name] = []; }
        // Add definition (deeper nested definitions to the front of the array, to allow for proper overriding when merging difinitions)
        definitions[name].push(def);
      });
    }
    return definitions;
  }, {});

  // Allow all modules to formalize all properties' definitions
  return _.reduce(definitions, (schema, def, name) => {
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
    // Initialize property namespace on the schema object
    schema[name] = {};
    // Allow all modules to process property definition
    _.reduce(modules, (property, module) => {
      // Initialize module namespace on property
      property[module.constructor.name] = module.processProperty(def);
      return property;
    }, schema[name]);
    return schema;
  }, {});

}
