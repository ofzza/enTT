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
// ENTITY: Entity Dynamic Value Module
// =====================================================================================================================

// Import dependencies


/**
 * Dynamic value module, included directly into Entity base class,
 * provides support for read-only, dynamically generated properties
 * @export
 * @class DynamicValueEntityModule
 * @extends {EntityModule}
 */
var DynamicValueEntityModule = function (_EntityModule) {
  _inherits(DynamicValueEntityModule, _EntityModule);

  function DynamicValueEntityModule() {
    _classCallCheck(this, DynamicValueEntityModule);

    return _possibleConstructorReturn(this, (DynamicValueEntityModule.__proto__ || Object.getPrototypeOf(DynamicValueEntityModule)).apply(this, arguments));
  }

  _createClass(DynamicValueEntityModule, [{
    key: 'processProperty',
    value: function processProperty(def) {
      // Initialize formal definition
      var formal = {};
      // Check for dynamic value function value
      if (def && def.dynamic) {
        // Assign explicitly defined function
        formal.dynamic = def.dynamic;
      } else if (_lodash2.default.isFunction(def) && (!def.prototype || !(def.prototype instanceof _prototype2.default))) {
        // Assign short-hand definition
        formal.dynamic = def;
      }
      // Return formal definition
      return formal;
    }
  }, {
    key: 'get',
    value: function get(value, formal) {
      // If defined as dynamic property, use dynamic function to calculate value
      if (formal.dynamic) {
        return formal.dynamic.bind(this)();
      }
    }
  }]);

  return DynamicValueEntityModule;
}(_3.default);

exports.default = DynamicValueEntityModule;
//# sourceMappingURL=index.js.map
