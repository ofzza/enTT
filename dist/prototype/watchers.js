'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // =====================================================================================================================
// ENTITY PROTOTYPE Internals: Watchers registry
// =====================================================================================================================

// Import dependencies


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _2 = require('./');

var _3 = _interopRequireDefault(_2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Repository of entity instance's registered watchers
 * @class Watchers
 */
var Watchers = function () {

  /**
   * Creates an instance of Watchers.
   * @param {any} entity Reference to the Entity instance being tracked
   * @memberof Watchers
   */
  function Watchers(entity) {
    _classCallCheck(this, Watchers);

    // Store reference to parent entity instance
    this.entity = entity;

    // Initialize storage
    this.all = {};
    this.byProperty = {};
    this.childWatchers = {};

    // Initialize internal state
    this.index = 0;
    this.suppressed = false;
  }

  /**
   * Sets a callback that triggers when watched property changes
   * @param {any} callback Callback fruntion triggered on detected changes:
   *              (e = { entity, property }) => { ... code acting on change ...}
   * @param {any} properties Name of the property (or array  of names) that is being watched;
   *              If no property name specified, all changes on the entity instance will trigger callback
   * @returns {function} Function which when called, cancels the set watcher
   * @memberof Watchers
   */


  _createClass(Watchers, [{
    key: 'registerWatcher',
    value: function registerWatcher(callback, properties) {
      var _this = this;

      var index = this.index++;
      if (properties) {

        // Process all properties
        var watcherCancelFunctions = _lodash2.default.map(_lodash2.default.isArray(properties) ? _lodash2.default.uniq(properties) : [properties], function (propertyName) {
          // Set property watcher
          if (!_this.byProperty[propertyName]) {
            _this.byProperty[propertyName] = {};
          }
          _this.byProperty[propertyName][index] = callback;
          return function () {
            delete _this.byProperty[propertyName][index];
          };
        });

        // Return collective watcher cancelation callback function
        return function () {
          _lodash2.default.forEach(watcherCancelFunctions, function (fn) {
            fn();
          });
        };
      } else {

        // Set global watcher
        this.all[index] = callback;

        // Return cancelation callback function
        return function () {
          delete _this.all[index];
        };
      }
    }

    /**
     * Executes the provided function (meant to be manually applying changes to the entity instance)
     * and when done triggers watchers.
     * If function returns a property name or an array of property names, watchers will only trigger for those proeprties.
     * @param {any} fn Function meant to be manually applying changes to the entity instance
     * @memberof Watchers
     */

  }, {
    key: 'manualUpdate',
    value: function manualUpdate(fn) {
      var _this2 = this;

      // Suppress watchers being triggered by setters
      this.suppressed = true;

      // Execute the updating function
      var properties = void 0;
      try {
        properties = fn();
      } catch (err) {
        err;
      }

      // Stop suppressing watchers
      this.suppressed = false;

      // Trigger watchers
      if (properties) {
        // Trigger watchers for specified properties
        _lodash2.default.forEach(_lodash2.default.isArray(properties) ? _lodash2.default.uniq(properties) : [properties], function (propertyName) {
          _this2.triggerChangeEvent(propertyName);
        });
      } else {
        // Trigger all watchers
        this.triggerChangeEvent();
      }
    }

    /**
     * Triggers watchers monitoring a property for changes
     * @param {any} propertyName Name of the changed property; If no property name specified, all changes on the entity instance will trigger
     * @param {any} e Embedded WatcherEvent
     * @memberof Watchers
     */

  }, {
    key: 'triggerChangeEvent',
    value: function triggerChangeEvent(propertyName, e) {
      var _this3 = this;

      // Check if suppressed
      if (!this.suppressed) {

        // Trigger property watchers
        if (propertyName) {

          // Trigger requested property's watchers
          if (this.byProperty[propertyName]) {
            _lodash2.default.forEach(this.byProperty[propertyName], function (callback) {
              callback(new WatcherEvent({ entity: _this3.entity, property: propertyName, innerEvent: e }));
            });
          }
        } else {

          // Trigger all registered properties' watchers
          _lodash2.default.forEach(this.byProperty, function (callbacks, propertyName) {
            _lodash2.default.forEach(callbacks, function (callback) {
              callback(new WatcherEvent({ entity: _this3.entity, property: propertyName }));
            });
          });
        }

        // Trigger global watchers
        _lodash2.default.forEach(this.all, function (callback) {
          callback(new WatcherEvent({ entity: _this3.entity, property: propertyName }));
        });
      }
    }

    /**
     * Ataches to a watcher of a child entity value set inside a property
     * @param {any} propertyName Name of the property containing the entity isntance
     * @param {any} entityValue Entity instance being set and watched
     * @memberof Watchers
     */

  }, {
    key: 'watchChildEntity',
    value: function watchChildEntity(propertyName, entityValue) {
      var _this4 = this;

      // If already watching to property's previous entity, cancel the watcher
      if (this.childWatchers[propertyName]) {
        this.childWatchers[propertyName]();
      }
      // Register a watcher for the new entity - when triggered, trigger local change detected event
      if (entityValue instanceof _3.default) {
        this.childWatchers[propertyName] = entityValue.watch(function (e) {
          _this4.triggerChangeEvent(propertyName, e);
        });
      } else if (_lodash2.default.isArray(entityValue)) {
        var entityValues = _lodash2.default.filter(entityValue, function (value) {
          return value instanceof _3.default;
        }),
            cancelFunctions = _lodash2.default.map(entityValues, function (value) {
          return value.watch(function (e) {
            _this4.triggerChangeEvent(propertyName, e);
          });
        });
        this.childWatchers[propertyName] = function () {
          _lodash2.default.forEach(cancelFunctions, function (fn) {
            fn();
          });
        };
      }
    }
  }]);

  return Watchers;
}();

/**
 * Contains information of a watcher trigger event
 * @class WatcherEvent
 */


exports.default = Watchers;

var WatcherEvent =

/**
 * Creates an instance of WatcherEvent.
 * @param {any} entity Reference to the entity that was changed
 * @param {any} property Name of the changed property
 * @param {any} innerEvent Inner event, passed along from child Entity
 * @memberof WatcherEvent
 */
function WatcherEvent() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      entity = _ref.entity,
      property = _ref.property,
      innerEvent = _ref.innerEvent;

  _classCallCheck(this, WatcherEvent);

  this.entity = entity;
  this.property = property;
  this.innerEvent = innerEvent;
};
//# sourceMappingURL=watchers.js.map
