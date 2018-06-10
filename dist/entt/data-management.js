'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // =====================================================================================================================
// ENTITY: Data Casting
// =====================================================================================================================

// Import dependencies


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _entt = require('../entt');

var _entt2 = _interopRequireDefault(_entt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Data Management
 * @export
 * @class DataManagement
 */
var DataManagement = function () {
  _createClass(DataManagement, null, [{
    key: 'cast',


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
    value: function cast(data) {
      var EntityClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _entt2.default;

      // Check target structure
      if (_lodash2.default.isNil(data)) {

        // Don't cast empty value
        return data;
      } else if (_lodash2.default.isFunction(EntityClass) && EntityClass.prototype instanceof _entt2.default) {

        // Cast as single EnTT instance if needed
        return data instanceof EntityClass ? data : new EntityClass().import(data, { importNonExportable: true });
      }if (_lodash2.default.isArray(EntityClass) && _lodash2.default.isFunction(EntityClass[0]) && EntityClass[0].prototype instanceof _entt2.default) {

        // Cast as array of EnTT instances
        var InnerEntityClass = EntityClass[0];
        return _lodash2.default.map(data, function (value) {
          return value instanceof InnerEntityClass ? value : new InnerEntityClass().import(value, { importNonExportable: true });
        });
      } else if (_lodash2.default.isObject(EntityClass) && _lodash2.default.isFunction(_lodash2.default.values(EntityClass)[0]) && _lodash2.default.values(EntityClass)[0].prototype instanceof _entt2.default) {

        // Cast as hashmap of EnTT instances
        var _InnerEntityClass = _lodash2.default.values(EntityClass)[0];
        return _lodash2.default.reduce(data, function (result, value, key) {
          result[key] = value instanceof _InnerEntityClass ? value : new _InnerEntityClass().import(value, { importNonExportable: true });
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

  }, {
    key: 'uncast',
    value: function uncast(data) {
      var EntityClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _entt2.default;

      // Check source structure
      if (_lodash2.default.isNil(data)) {

        // Don't cast empty value
        return data;
      } else if (_lodash2.default.isFunction(EntityClass) && EntityClass.prototype instanceof _entt2.default) {

        // Uncast from single EnTT instance
        return data instanceof _entt2.default ? data.export() : data;
      } else if (_lodash2.default.isArray(EntityClass) && _lodash2.default.isFunction(EntityClass[0]) && EntityClass[0].prototype instanceof _entt2.default) {

        // Uncast from array of EnTT instances
        return _lodash2.default.map(data, function (value) {
          return value instanceof _entt2.default ? value.export() : value;
        });
      } else if (_lodash2.default.isObject(EntityClass) && _lodash2.default.isFunction(_lodash2.default.values(EntityClass)[0]) && _lodash2.default.values(EntityClass)[0].prototype instanceof _entt2.default) {

        // Uncast from hashmap of EnTT instances
        return _lodash2.default.reduce(data, function (result, value, key) {
          result[key] = value instanceof _entt2.default ? value.export() : value;
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

  }, {
    key: 'initialize',
    value: function initialize(_ref) {
      var entity = _ref.entity,
          dataManager = _ref.dataManager;


      // Export public import method
      Object.defineProperty(entity, 'import', {
        configurable: true,
        enumerable: false,
        get: function get() {
          return function () {
            return dataManager.import.apply(dataManager, arguments);
          };
        }
      });

      // Export public export method
      Object.defineProperty(entity, 'export', {
        configurable: true,
        enumerable: false,
        get: function get() {
          return function () {
            return dataManager.export.apply(dataManager, arguments);
          };
        }
      });

      // Export public clone method
      Object.defineProperty(entity, 'clone', {
        configurable: true,
        enumerable: false,
        get: function get() {
          return function () {
            return dataManager.clone.apply(dataManager, arguments);
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

  }]);

  function DataManagement(_ref2) {
    var entity = _ref2.entity,
        properties = _ref2.properties;

    _classCallCheck(this, DataManagement);

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


  _createClass(DataManagement, [{
    key: 'import',
    value: function _import() {
      var _this = this;

      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref3$importNonExport = _ref3.importNonExportable,
          importNonExportable = _ref3$importNonExport === undefined ? false : _ref3$importNonExport;

      // Import data, and trigger change watchers when done
      this.entity.update(function () {
        _lodash2.default.forEach(_this.properties, function (propertyConfiguration, key) {
          // Check if exportable/importable and not readOnly
          if ((propertyConfiguration.exportable || importNonExportable) && !propertyConfiguration.readOnly) {
            // Get importing value (check "bind" property configuration if exists, or use same property name)
            var value = propertyConfiguration.bind ? data[propertyConfiguration.bind] : data[key];
            // Check if value needs to be cast
            if (propertyConfiguration.cast) {
              // Cast and import data
              _this.entity[key] = DataManagement.cast(value, propertyConfiguration.cast);
            } else {
              // Import data not required to be cast
              _this.entity[key] = value;
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

  }, {
    key: 'export',
    value: function _export() {
      var _this2 = this;

      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref4$exportNonExport = _ref4.exportNonExportable,
          exportNonExportable = _ref4$exportNonExport === undefined ? false : _ref4$exportNonExport;

      // Export data
      var exported = {};
      _lodash2.default.forEach(this.properties, function (propertyConfiguration, key) {
        // Check if exportable/importable
        if (propertyConfiguration.exportable || exportNonExportable) {
          // Get export target property name (check "bind" property configuration if exists, or use same property name)
          var exportPropertyName = propertyConfiguration.bind || key;
          // Check if value needs to be uncast
          if (propertyConfiguration.cast) {
            // Export property values expected to be cast as entities
            exported[exportPropertyName] = DataManagement.uncast(_this2.entity[key], propertyConfiguration.cast);
          } else {
            // Export raw property values with no conversion
            exported[exportPropertyName] = _this2.entity[key];
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

  }, {
    key: 'clone',
    value: function clone() {
      return new this.entity.constructor().import(this.entity.export());
    }
  }]);

  return DataManagement;
}();

exports.default = DataManagement;
//# sourceMappingURL=data-management.js.map
