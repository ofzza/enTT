'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = castAsEntity;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _2 = require('./');

var _3 = _interopRequireDefault(_2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Casts value as entity by copying content of all properties found on both
 * @param {any} value Value to cast
 * @param {any} EntityClass Target casting Entity class
 * @returns {any} Cast instance of required Entity class
 */
// =====================================================================================================================
// ENTITY PROTOTYPE Internals: Casting
// =====================================================================================================================

// Import dependencies
function castAsEntity(value, EntityClass) {

  // Verify target entity class
  if (!EntityClass || !(EntityClass.prototype instanceof _3.default)) {
    throw new Error('Only casting to classes extending the Entity base class is allowed!');
  }

  // Initialize casting target
  var entity = new EntityClass();

  // Attempt copying properties from casting source
  if (value) {
    _lodash2.default.forEach(entity, function (none, key) {
      // Copy value if  property exists on source
      if (!_lodash2.default.isUndefined(value[key])) {
        entity[key] = value[key];
      }
    });
  }

  // Return cast entity
  return entity;
}
//# sourceMappingURL=casting.js.map
