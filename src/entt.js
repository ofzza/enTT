// =====================================================================================================================
// ENTITY: Base Class
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import * as symbols from './symbols';
import Properties from './entt/properties';
import Extensions from './entt/extensions';
import ChangeDetection from './entt/change-detection';
import DataManagement from './entt/data-management';
import { ConfigurationCache } from './utils/cache';

// Default property configuration values
let defaultPropertyConfiguration = {
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
export default class EnTT {

  /**
   * Gets/Sets default property configuration
   * @static
   * @memberof EnTT
   */
  static get default () { return defaultPropertyConfiguration; }
  static set default (value) { defaultPropertyConfiguration = _.merge({}, defaultPropertyConfiguration, value); }

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
  static cast (data, EntityClass) {
    // Check if/how EntityClass is defined or implied
    if (!EntityClass && !_.isArray(data)) {
      // No explicit class definition, casting data not array
      return DataManagement.cast(data, this);
    } else if (!EntityClass && _.isArray(data)) {
      // No explicit class definition, casting data is array
      return DataManagement.cast(data, [ this ]);
    } else if (_.isArray(EntityClass) && (EntityClass.length === 0)) {
      // Explicit class definition as array with implicit members
      return DataManagement.cast(data,  [ this ]);
    } else if (_.isObject(EntityClass) && !_.isFunction(EntityClass) && (_.values(EntityClass).length === 0)) {
      // Explicit class definition as hashmap with implicit members
      return DataManagement.cast(data, { [this.name]: this });
    } else {
      // Explicit class definition
      return DataManagement.cast(data, EntityClass);
    }
  }

  /**
   * Creates an instance of EnTT.
   * @memberof EnTT
   */
  constructor () {

    // Check if attempting to instantiate Entity base class directly
    if (this.constructor === EnTT) {
      throw new Error('Entity base class is not meant to be instantiated directly - extend it with your own class!');
    }

    // Initialize shared initialization namespace object
    const refs = {
      entity:             this,
      properties:         undefined,
      values:             undefined,
      extensionsManager:  undefined,
      changeManager:      undefined,
      dataManager:        undefined,
      propertyManager:    undefined
    };

    // Initialize private EnTT property
    const $$entt = {};
    Object.defineProperty(this, symbols.privateNamespace, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: $$entt
    });

    // Load previously cached configuration
    let classes = null;
    const cached = ConfigurationCache.get(this);

    // Get (or load from cache if previously initialized) class extensions
    refs.extensions = cached.extensions;
    if (!refs.extensions) {
      // Get inherited classes (if not already gotten)
      if (!classes) { classes = getInheritedClasses.bind(this)(); }
      // Get extensions
      ConfigurationCache.set(this, {
        extensions: (refs.extensions = getClassExtensions.bind(this)(classes))
      });
    }
    // Initialize extension manager (without properties)
    refs.extensionsManager = new Extensions(refs.extensions);
    refs.extensionsManager.initializeWithoutProperties(refs);

    // Get (or load from cache if previously initialized) class properties configuration
    // NOTE: .properties are cached per class, not per instance!
    refs.loadedPropertiesFromCache = !!cached.properties;
    refs.properties = cached.properties;
    if (!refs.properties) {
      // Get inherited classes (if not already gotten)
      if (!classes) { classes = getInheritedClasses.bind(this)(); }
      // Get property configuration
      ConfigurationCache.set(this, {
        properties: (refs.properties = getClassProperties.bind(this)(classes, refs))
      });
    }

    // Initialize extension manager (with properties)
    refs.extensionsManager.initializeWithProperties(refs);

    // EXTENSIONS HOOK: .updateDefaultPropertyConfiguration(...)
    // If properties weren't cached, lets extension update properties
    if (!refs.loadedPropertiesFromCache) {
      _.forEach(refs.properties, (propertyConfiguration) => {
        refs.extensionsManager.updatePropertyConfiguration(propertyConfiguration);
      });
    }

    // Initialize a change detection instance and expose public methods
    refs.changeManager = new ChangeDetection(refs);
    ChangeDetection.initialize(refs);

    // Initialize data management (Import/Export of data)
    refs.dataManager = new DataManagement(refs);
    DataManagement.initialize(refs);

    // Initialize properties with getters/setters
    refs.propertyManager = new Properties(refs);
    Properties.initialize(refs);

    // EXTENSIONS HOOK: .onEntityInstantiate(...)
    // Lets extensions modify the entity after being constructed and before it is locked
    refs.extensionsManager.onEntityInstantiate();

    // Lock instance to prevent ad-hoc addition of extra properties
    Object.freeze(this);

  }

}

/**
 * Gets all of instances inherited classes
 * @returns {any} All of instances inherited classes
 */
function getInheritedClasses () {

  // Get references to all classes current instance is inheriting from
  const classes = [];
  let current = this.constructor;
  do { classes.push(current); } while ((current = Object.getPrototypeOf(current)));

  // Return inherited from classes
  return classes;

}

/**
 * Gets class extensions by traversing and merging static ".includes" property of the instance's class and it's inherited classes
 * @param {any} classes Array of inherited from classes
 * @returns {any} Array of extensions applied to the class
 */
function getClassExtensions (classes) {

  // Extract property definitions from all inherited classes' static ".props" property
  const extensions = _.reduceRight(classes, (extensions, current) => {
    let extensionsArray = (current.includes ? (_.isArray(current.includes) ? current.includes : [ current.includes ]) : []);
    _.forEach(extensionsArray, (extension) => {
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
function getClassProperties (classes, { extensionsManager } = {}) {

  // Define checks for shorthand casting configurations
  let isPropertyShorthandCastAsSingleEntity = (propertyConfiguration) => {
    if (propertyConfiguration
        // Check if class extending EnTT
        && (propertyConfiguration.prototype instanceof EnTT)
    ) {
      return propertyConfiguration;
    }
  };
  let isPropertyShorthandCastAsEntityArray = (propertyConfiguration) => {
    if (propertyConfiguration
        // Check if array
        && _.isArray(propertyConfiguration)
        // Check if array has a single member
        && (propertyConfiguration.length === 1)
        // Check if single array memeber is a class extending EnTT
        && (propertyConfiguration[0].prototype instanceof EnTT)
    ) {
      return propertyConfiguration[0];
    }
  };
  let isPropertyShorthandCastAsEntityHashmap = (propertyConfiguration) => {
    if (propertyConfiguration
        // Check if object
        && _.isObject(propertyConfiguration)
        // Check if object has a single member
        && (_.values(propertyConfiguration).length)
        // Check if single object member is a class extending EnTT
        && (_.values(propertyConfiguration)[0].prototype instanceof EnTT)
        // Check if single object member's property key equals class name
        && (_.keys(propertyConfiguration)[0] === _.values(propertyConfiguration)[0].name)
    ) {
      return _.values(propertyConfiguration)[0];
    }
  };

  // Extract property definitions from all inherited classes' static ".props" property
  const properties = _.reduceRight(classes, (properties, current) => {

    // Extract currentProperties
    let currentProperties = current.props,
        CastClass;

    // Edit short-hand configuration syntax where possible
    _.forEach(currentProperties, (propertyConfiguration, propertyName) => {

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
        currentProperties[propertyName] = { cast: [ CastClass ] };
        return;
      }
      // Replace "casting properties" short-hand configuration syntax for entity array
      CastClass = isPropertyShorthandCastAsEntityHashmap(propertyConfiguration);
      if (CastClass) {
        // Replace shorthand cast-as-entity-hashmap syntax
        currentProperties[propertyName] = { cast: { [(new CastClass()).constructor.name]: CastClass } };
        return;
      }

      // EXTENSIONS HOOK: .processShorthandPropertyConfiguration(...)
      // Lets extensions process short-hand property configuration
      currentProperties[propertyName] = extensionsManager.processShorthandPropertyConfiguration(propertyConfiguration);

    });

    // Merge with existing properties
    return _.merge(properties, currentProperties || {});

  }, {});

  // Update property configuration with default configuration values
  _.forEach(properties, (propertyConfiguration, key) => {
    properties[key] = _.merge({}, EnTT.default, propertyConfiguration);
  });

  // Return extracted properties
  return properties;

}
