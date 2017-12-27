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
// ENTITY: Entity Key Value Module
// =====================================================================================================================

// Import dependencies


/**
 * Key value module, included directly into Entity base class,
 * provides support marking properties as key proeprties, uniquely identifying the entity
 * @export
 * @class KeyValueEntityModule
 * @extends {EntityModule}
 */
var KeyValueEntityModule = function (_EntityModule) {
  _inherits(KeyValueEntityModule, _EntityModule);

  function KeyValueEntityModule() {
    _classCallCheck(this, KeyValueEntityModule);

    return _possibleConstructorReturn(this, (KeyValueEntityModule.__proto__ || Object.getPrototypeOf(KeyValueEntityModule)).apply(this, arguments));
  }

  _createClass(KeyValueEntityModule, [{
    key: 'initializePrototype',
    value: function initializePrototype(formal) {
      var _this2 = this;

      // Expose uniqueId method
      Object.defineProperty(this, 'uniqueKey', {
        configurable: false,
        enumerable: false,
        get: function get() {

          // Collect unique key properties' values
          var primaryKeys = _lodash2.default.reduce(formal, function (primaryKeys, def, name) {
            if (def.key) {
              primaryKeys[name] = _this2[name] || null;
            }
            return primaryKeys;
          }, {});

          // Construct a unique identifier from primary keys
          return _lodash2.default.keys(primaryKeys).length ? JSON.stringify(primaryKeys) : undefined;
        }
      });
    }
  }, {
    key: 'processProperty',
    value: function processProperty(name, def) {
      // Initialize formal definition
      var formal = {};
      // Check for default value
      if (def && def.key) {
        formal.key = true;
      }
      // Return formal definition
      return formal;
    }
  }]);

  return KeyValueEntityModule;
}(_3.default);

exports.default = KeyValueEntityModule;
//# sourceMappingURL=index.js.map
