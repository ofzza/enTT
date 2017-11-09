'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _prototype = require('./prototype');

var _prototype2 = _interopRequireDefault(_prototype);

var _defaultValue = require('./modules/default-value');

var _defaultValue2 = _interopRequireDefault(_defaultValue);

var _dynamicValue = require('./modules/dynamic-value');

var _dynamicValue2 = _interopRequireDefault(_dynamicValue);

var _castingValue = require('./modules/casting-value');

var _castingValue2 = _interopRequireDefault(_castingValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // =====================================================================================================================
// ENTITY: Basic class
// =====================================================================================================================

// Import dependencies


// Instantiate modules used in all Entities
var defaultValueModule = new _defaultValue2.default(),
    dynamicValueModule = new _dynamicValue2.default(),
    castingValueModule = new _castingValue2.default();

/**
 * Entity base class
 * @export
 * @class Entity
 */

var Entity = function (_EntityPrototype) {
  _inherits(Entity, _EntityPrototype);

  _createClass(Entity, null, [{
    key: 'cast',


    /**
     * Casts value as entity by copying content of all properties found on both
     * @static
     * @param {any} value Value to cast
     * @param {any} EntityClass Target casting Entity class
     * @returns {any} Cast instance of required Entity class
     * @memberof Entity
     */
    value: function cast(value, EntityClass) {
      return _prototype2.default.cast.bind(this)(value, EntityClass);
    }
    /**
     * Casts collection of values as a collection of entities by casting each mamber of the collection
     * @static
     * @param {any} collection Collection to cast
     * @param {any} EntityClass Target casting Entity class
     * @returns {any} Cast collection
     * @memberof Entity
     */

  }, {
    key: 'castCollection',
    value: function castCollection(collection, EntityClass) {
      return _prototype2.default.castCollectionAsEntity.bind(this)(collection, EntityClass);
    }

    /**
     * Entity modules included by default
     * @readonly
     * @static
     * @memberof Entity
     */

  }, {
    key: 'debug',


    /**
     * Debugging status (When debugging, some extra properties are exposed)
     * @static
     * @memberof Entity
     */
    get: function get() {
      return _prototype2.default.debug;
    },
    set: function set(value) {
      _prototype2.default.debug = value;
    }
  }, {
    key: 'modules',
    get: function get() {
      return [defaultValueModule, dynamicValueModule, castingValueModule];
    }

    /**
     * Creates an instance of Entity.
     * @memberof Entity
     */

  }]);

  function Entity() {
    _classCallCheck(this, Entity);

    // Check if class neing directly instantiated
    var _this = _possibleConstructorReturn(this, (Entity.__proto__ || Object.getPrototypeOf(Entity)).call(this));

    if (_this.constructor === Entity) {
      throw new Error('Entity class is not meant to be instantiated directly - extend it with your own class!');
    }
    return _this;
  }

  return Entity;
}(_prototype2.default);

exports.default = Entity;
//# sourceMappingURL=entity.js.map
