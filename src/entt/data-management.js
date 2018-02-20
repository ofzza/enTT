// =====================================================================================================================
// ENTITY: Data Casting
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EnTT from '../entt';

/**
 * Data Management
 * @export
 * @class DataManagement
 */
export default class DataManagement {

  /**
   * Casts provided data as either an EnTT instance or an array/hashmap of EnTT instances of required type
   * @static
   * @param {any} data Data to cast
   * @param {any} EntityClass Extended EnTT class structure definition to cast as
   *              example: - EnTT: will cast as a single instance of EnTT
   *                       - [ EnTT ]: will cast as array of EnTT instances
   *                       - { EnTT }: will cast as hashmap of EnTT instances
   * @returns {any} Instance of required EnTT class with provided data cast into it
   */
  static cast (data, EntityClass = EnTT) {
    // Check target structure
    if (_.isNil(data)) {

      // Don't cast empty value
      return data;

    } else if (_.isFunction(EntityClass) && (EntityClass.prototype instanceof EnTT)) {

      // Cast as single EnTT instance if needed
      return (data instanceof EntityClass ? data : (new EntityClass()).import(data, { importNonExportable: true }));

    } if (_.isArray(EntityClass) && _.isFunction(EntityClass[0]) && (EntityClass[0].prototype instanceof EnTT)) {

      // Cast as array of EnTT instances
      const InnerEntityClass = EntityClass[0];
      return _.map(data, (value) => {
        return (value instanceof InnerEntityClass ? value : (new InnerEntityClass()).import(value, { importNonExportable: true }));
      });

    } else if (_.isObject(EntityClass) && _.isFunction(_.values(EntityClass)[0]) && (_.values(EntityClass)[0].prototype instanceof EnTT)) {

      // Cast as hashmap of EnTT instances
      const InnerEntityClass = _.values(EntityClass)[0];
      return _.reduce(data, (result, value, key) => {
        result[key] = (value instanceof InnerEntityClass ? value : (new InnerEntityClass()).import(value, { importNonExportable: true }));
        return result;
      }, {});

    } else {

      // Throw error, casting not supported
      throw new Error('EnTT property casting definition must be of form: EnTT | [EnTT] | {EnTT}');

    }
  }
  /**
   * Casts provided data as a raw object or a raw object array/hashmap, based on the currently cast class
   * @static
   * @param {any} data Data to cast
   * @param {any} EntityClass Extended EnTT class structure definition to uncast from
   *              example: - EnTT: will cast as a single instance of EnTT
   *                       - [ EnTT ]: will cast as array of EnTT instances
   *                       - { EnTT }: will cast as hashmap of EnTT instances
   * @returns {any} Raw object representation of the data being uncast
   * @memberof DataManagement
   */
  static uncast (data, EntityClass = EnTT) {
    // Check source structure
    if (_.isNil(data)) {

      // Don't cast empty value
      return data;

    } else if (_.isFunction(EntityClass) && (EntityClass.prototype instanceof EnTT)) {

      // Uncast from single EnTT instance
      return (data instanceof EnTT ? data.export() : data);

    } else if (_.isArray(EntityClass) && _.isFunction(EntityClass[0]) && (EntityClass[0].prototype instanceof EnTT)) {

      // Uncast from array of EnTT instances
      return _.map(data, (value) => {
        return (value instanceof EnTT ? value.export() : value);
      });

    } else if (_.isObject(EntityClass) && _.isFunction(_.values(EntityClass)[0]) && (_.values(EntityClass)[0].prototype instanceof EnTT)) {

      // Uncast from hashmap of EnTT instances
      return _.reduce(data, (result, value, key) => {
        result[key] = (value instanceof EnTT ? value.export() : value);
        return result;
      }, {});

    } else {

      // Throw error, casting not supported
      throw new Error('EnTT property casting definition must be of form: EnTT | [EnTT] | {EnTT}');

    }
  }

  /**
   * Initializes data management functionality on the entity instance
   * @param {any} entity Reference to the parent entity instance
   * @param {any} dataManager DataManagement instance associated to the entity instance being handled
   */
  static initialize ({ entity, dataManager }) {

    // Export public import method
    Object.defineProperty(entity, 'import', {
      configurable: true,
      enumerable: false,
      get: () => {
        return (...args) => {
          return dataManager.import(...args);
        };
      }
    });

    // Export public export method
    Object.defineProperty(entity, 'export', {
      configurable: true,
      enumerable: false,
      get: () => {
        return (...args) => {
          return dataManager.export(...args);
        };
      }
    });

    // Export public clone method
    Object.defineProperty(entity, 'clone',  {
      configurable: true,
      enumerable: false,
      get: () => {
        return (...args) => {
          return dataManager.clone(...args);
        };
      }
    });

  }

  /**
   * Creates an instance of DataManagement.
   * @param {any} entity Reference to the parent entity instance
   * @param {any} properties Properties configuration
   * @memberof DataManagement
   */
  constructor ({ entity, properties }) {
    // Store local properties
    this.entity = entity;
    this.properties = properties;
  }

  /**
   * Imports provided raw data into the entity isntance
   * @param {any} data Raw data object to import from
   * @param {bool} importNonExportable If true, even properties not marked exportable will be imported
   * @returns {any} Reference to current entity instance (useful for chaining)
   */
  import (data = {}, { importNonExportable = false } = {}) {
    // Import data, and trigger change watchers when done
    this.entity.update(() => {
      _.forEach(this.properties, (propertyConfiguration, key) => {
        // Check if exportable/importable and not readOnly
        if ((propertyConfiguration.exportable || importNonExportable) && !propertyConfiguration.readOnly) {
          // Get importing value (check "bind" property configuration if exists, or use same property name)
          let value = (propertyConfiguration.bind ? data[propertyConfiguration.bind] : data[key]);
          // Check if value needs to be cast
          if (propertyConfiguration.cast) {
            // Cast and import data
            this.entity[key] = DataManagement.cast(value, propertyConfiguration.cast);
          } else {
            // Import data not required to be cast
            this.entity[key] = value;
          }
        }
      });
    });
    // Return reference to this entity instance
    return this.entity;
  }

  /**
   * Exports entity instance's data as a raw object
   * @param {bool} exportNonExportable If true, even properties not marked exportable will be exported
   * @returns {any} Raw object containing entity instance's data
   */
  export ({ exportNonExportable = false } = {}) {
    // Export data
    const exported = {};
    _.forEach(this.properties, (propertyConfiguration, key) => {
      // Check if exportable/importable
      if (propertyConfiguration.exportable || exportNonExportable) {
        // Get export target property name (check "bind" property configuration if exists, or use same property name)
        let exportPropertyName = propertyConfiguration.bind || key;
        // Check if value needs to be uncast
        if (propertyConfiguration.cast) {
          // Export property values expected to be cast as entities
          exported[exportPropertyName] = DataManagement.uncast(this.entity[key], propertyConfiguration.cast);
        } else {
          // Export raw property values with no conversion
          exported[exportPropertyName] = this.entity[key];
        }
      }
    });
    // Return exported data (cloned if requested)
    return exported;
  }

  /**
   * Clones the current instance of the entity into a separate instance with same data
   * @returns {any} A clone of the instance containing hte same data
   */
  clone () {
    return (new (this.entity.constructor)())
      .import(
        this.entity.export()
      );
  }

}
