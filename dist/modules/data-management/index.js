'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // =====================================================================================================================
// ENTITY: Entity Key Data Management Module
// =====================================================================================================================

// Import dependencies


/**
 * Provides full-entity getter, setter and clone functionality
 * @export
 * @class DataManagementModule
 * @extends {EntityModule}
 */
var DataManagementModule = function (_EntityModule) {
  _inherits(DataManagementModule, _EntityModule);

  function DataManagementModule() {
    _classCallCheck(this, DataManagementModule);

    return _possibleConstructorReturn(this, (DataManagementModule.__proto__ || Object.getPrototypeOf(DataManagementModule)).apply(this, arguments));
  }

  _createClass(DataManagementModule, [{
    key: 'initializePrototype',
    value: function initializePrototype() {
      var _this2 = this;

      // Expose full-entity get method
      Object.defineProperty(this, 'set', {
        configurable: false,
        get: function get() {
          /**
           * Imports properties from a provided object onto the entity
           * @param {any} value Value to import properties from
           * @returns {any} A reference to the entity instance baing set
           */
          return function (value) {
            // Import value properties
            _lodash2.default.forEach(value, function (value, name) {
              _this2[name] = value;
            });
            // Return reference to the entity instance
            return _this2;
          };
        }
      });

      // Expose full-entity get method
      Object.defineProperty(this, 'get', {
        configurable: false,
        enumerable: false,
        get: function get() {
          /**
           * Exports properties from the entity onto a raw object
           * @returns {any} Raw object with same properties as the entity
           */
          return function () {
            // Export own properties
            return _lodash2.default.reduce(_this2, function (result, value, name) {
              result[name] = value;
              return result;
            }, {});
          };
        }
      });

      // Expose full-entity get method
      Object.defineProperty(this, 'clone', {
        configurable: false,
        enumerable: false,
        get: function get() {
          /**
           * Instantiates a new entity of same type and copies over values of all properties from the existing entity
           * @returns {any} A cloned instance of the entity
           */
          return function () {
            // Clone the entity instance
            return new _this2.constructor().set(_this2.get());
          };
        }
      });
    }
  }]);

  return DataManagementModule;
}(_3.default);

exports.default = DataManagementModule;
//# sourceMappingURL=index.js.map
