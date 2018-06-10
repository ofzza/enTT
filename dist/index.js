'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ValidationExtension = exports.DynamicPropertiesExtension = exports.EnTTExt = undefined;

var _enttext = require('./enttext');

Object.defineProperty(exports, 'EnTTExt', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_enttext).default;
  }
});

var _dynamicProperties = require('./ext/dynamic-properties');

Object.defineProperty(exports, 'DynamicPropertiesExtension', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_dynamicProperties).default;
  }
});

var _validation = require('./ext/validation');

Object.defineProperty(exports, 'ValidationExtension', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_validation).default;
  }
});

var _entt = require('./entt');

var _entt2 = _interopRequireDefault(_entt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _entt2.default;

// Export Entity extension class
// =====================================================================================================================
// ENTITY
// =====================================================================================================================

// Export EnTT class as default
//# sourceMappingURL=index.js.map
