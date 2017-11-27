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
// ENTITY: Entity Default Value Module
// =====================================================================================================================

// Import dependencies


/**
 * Default value module, included directly into Entity base class,
 * provides support for setting default, initial values for defined properties
 * @export
 * @class DefaultValueEntityModule
 * @extends {EntityModule}
 */
var DefaultValueEntityModule = function (_EntityModule) {
  _inherits(DefaultValueEntityModule, _EntityModule);

  function DefaultValueEntityModule() {
    _classCallCheck(this, DefaultValueEntityModule);

    return _possibleConstructorReturn(this, (DefaultValueEntityModule.__proto__ || Object.getPrototypeOf(DefaultValueEntityModule)).apply(this, arguments));
  }

  _createClass(DefaultValueEntityModule, [{
    key: 'processProperty',
    value: function processProperty(name, def) {
      // Initialize formal definition
      var formal = {};
      // Check for default value
      if (def && def.value) {
        formal.value = def.value;
      }
      // Return formal definition
      return formal;
    }
  }, {
    key: 'initialize',
    value: function initialize(name, value, formal) {
      // If not initialized already, initialize to default value
      if (_lodash2.default.isUndefined(value)) {
        return formal.value;
      }
    }
  }]);

  return DefaultValueEntityModule;
}(_3.default);

exports.default = DefaultValueEntityModule;
//# sourceMappingURL=index.js.map
