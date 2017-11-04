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

var _prototype = require('../../prototype');

var _prototype2 = _interopRequireDefault(_prototype);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // =====================================================================================================================
// ENTITY: Entity Casting Value Module
// =====================================================================================================================

// Import dependencies


/**
 * Casting value module, included directly into Entity base class,
 * provides support for properties which will attempt to cast their value as an Entity instance of a given type
 * @export
 * @class CastingValueEntityModule
 * @extends {EntityModule}
 */
var CastingValueEntityModule = function (_EntityModule) {
  _inherits(CastingValueEntityModule, _EntityModule);

  function CastingValueEntityModule() {
    _classCallCheck(this, CastingValueEntityModule);

    return _possibleConstructorReturn(this, (CastingValueEntityModule.__proto__ || Object.getPrototypeOf(CastingValueEntityModule)).apply(this, arguments));
  }

  _createClass(CastingValueEntityModule, [{
    key: 'processProperty',
    value: function processProperty(def) {
      // Initialize formal definition
      var formal = {};
      // Check for casting definition
      if (def && def.castAs && def.castAs.prototype instanceof _prototype2.default) {
        // Assign explicitly defined casting
        formal.castAs = def.castAs;
        formal.collection = def.collection ? true : false;
      } else {
        // Parse value, and check if representing a cast definition
        def = def.castAs || def;
        if (def && def.prototype instanceof _prototype2.default) {
          // Formalize single casting
          formal.castAs = def;
          formal.collection = false;
        } else if (_lodash2.default.isArray(def) && def.length === 1 && def[0].prototype instanceof _prototype2.default) {
          // Formalize collection casting
          formal.castAs = def[0];
          formal.collection = true;
        }
      }
      // Return formal definition
      return formal;
    }
  }, {
    key: 'set',
    value: function set(value, formal) {
      if (formal.castAs) {
        if (_lodash2.default.isNil(value)) {
          // If setting null, allow null value
          return null;
        } else if (!formal.collection) {
          // Check if already cast
          if (value instanceof formal.castAs) {
            // Keep current casting
            return value;
          } else {
            // Attempt casting value directly
            return _prototype2.default.cast(value, formal.castAs);
          }
        } else {
          // Attempt casting value as a collection of castable values
          return _lodash2.default.reduce(value, function (collection, value, key) {
            // Check if already cast
            if (value instanceof formal.castAs) {
              // Keep current casting
              collection[key] = value;
            } else {
              // Attempt casting value
              collection[key] = _prototype2.default.cast(value, formal.castAs);
            }
            return collection;
          }, _lodash2.default.isArray(value) ? [] : {});
        }
      }
    }
  }]);

  return CastingValueEntityModule;
}(_3.default);

exports.default = CastingValueEntityModule;
//# sourceMappingURL=index.js.map
