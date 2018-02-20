'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EntityChangedEvent = exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // =====================================================================================================================
// ENTITY: Watching for changes
// =====================================================================================================================

// Import dependencies


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Watching for changes
 * @export
 * @class Watcher
 */
var ChangeDetection = function () {
  _createClass(ChangeDetection, null, [{
    key: 'initialize',


    /**
     * Initializes an entity instance with public watcher methods
     * @static
     * @param {any} entity Entity instance to be initialized
     * @param {any} changeManager Watcher instance created for the entity
     * @memberof Watcher
     */
    value: function initialize(_ref) {
      var entity = _ref.entity,
          changeManager = _ref.changeManager;


      // Expose public .watch() method
      Object.defineProperty(entity, 'watch', {
        configurable: true,
        enumerable: false,
        get: function get() {
          return function () {
            return changeManager.watch.apply(changeManager, arguments);
          };
        }
      });

      // Expose public .update() method
      Object.defineProperty(entity, 'update', {
        configurable: true,
        enumerable: false,
        get: function get() {
          return function () {
            return changeManager.update.apply(changeManager, arguments);
          };
        }
      });
    }

    /**
     * Creates an instance of Watcher.
     * @param {any} entity Reference to the parent entity instance
     * @param {any} extensionsManager Exensions manager instance
     * @memberof Watcher
     */

  }]);

  function ChangeDetection(_ref2) {
    var entity = _ref2.entity,
        extensionsManager = _ref2.extensionsManager;

    _classCallCheck(this, ChangeDetection);

    // Store local properties
    this.entity = entity;
    this.extensionsManager = extensionsManager;

    // Initialize an internal storage for keeping track of subscribed change watchers
    this.store = {
      // Holds index of next registered "on-change" callback function
      count: 0,
      // Holds references to all active "on-change" callback functions
      callbackFns: {}
    };

    // Initialize a property controlling if property changes trigger callbacks
    this.isTriggerOnPropertyChange = true;
  }

  /**
   * Triggers all watching callback functions after a change has been detected
   * @param {any} event Change detected event instance
   * @memberof Watcher
   */


  _createClass(ChangeDetection, [{
    key: 'trigger',
    value: function trigger(event) {

      // Check if event needs to be spoofed
      if (!event || !(event instanceof EntityChangedEvent)) {
        event = new EntityChangedEvent();
      }

      // EXTENSIONS HOOK: .onChangeDetected(...)
      // Lets extensions know of any detected changes to the entity instance properties
      this.extensionsManager.onChangeDetected(event);

      // Execute all registered callback functions
      _lodash2.default.forEach(this.store.callbackFns, function (fn) {
        fn(event);
      });

      // EXTENSIONS HOOK: .afterChangeProcessed(...)
      // Lets extensions know that detected changes to the entity instance properties have been processed by all outside watchers
      this.extensionsManager.afterChangeProcessed(event);
    }
    /**
     * Triggers all watching callback functions after a property change has been detected (unless triggering on property change currently suppressed)
     * @param {any} event Change detected event instance
     * @memberof Watcher
     */

  }, {
    key: 'triggerOnPropertyChange',
    value: function triggerOnPropertyChange(event) {
      // Check if triggering on property change currently suppressed
      if (this.isTriggerOnPropertyChange) {
        this.trigger(event);
      }
    }

    /**
     * Registers a watcher callback which will trigger on every property change
     * @param {any} callbackFn Callback function, will trigger on change:
     *        iface: (event) => { ... }
     *        - event Change detected event instance
     * @returns {function} Watcher cancelation function, when called, watcher will be disabled
     * @memberof EnTT
     */

  }, {
    key: 'watch',
    value: function watch(callbackFn) {
      var _this = this;

      // Check if callback function passed
      if (callbackFn && _lodash2.default.isFunction(callbackFn)) {

        // Register callback
        var index = this.store.count++;
        this.store.callbackFns[index] = callbackFn;
        // Return cancelation function
        return function () {
          delete _this.store.callbackFns[index];
        };
      }
    }

    /**
     * Executes a custom update function and triggers registered watchers once done
     * @param {any} updateFn Custom update function, allowed to update any of the properties on the instance.
     *              When done all registered watchers will trigger. If function returns a promise, it+ll be considered done when promise resolves.
     * @memberof EnTT
     */

  }, {
    key: 'update',
    value: function update(updateFn) {
      var _this2 = this;

      // Check if update function passed
      if (updateFn && _lodash2.default.isFunction(updateFn)) {

        // Run updating function (and while running the function, do not trigger by changed properties)
        this.isTriggerOnPropertyChange = false;
        var p = updateFn();
        this.isTriggerOnPropertyChange = true;
        // Trigger changed callbacks
        if (p instanceof Promise) {
          p.then(function () {
            _this2.trigger();
          });
        } else {
          this.trigger();
        }
      } else {

        // Trigger changed callbacks
        this.trigger();
      }
    }
  }]);

  return ChangeDetection;
}();

/**
 * Holds entity changed event information
 * @export
 * @class EntityChangedEvent
 */


exports.default = ChangeDetection;

var EntityChangedEvent =

/**
 * Creates an instance of EntityChangedEvent.
 * @param {any} source Reference to the changed entity
 * @param {any} propertyName Name of the property that has changed (if false, any property might have changed)
 * @param {any} oldValue Previous value of the property (only applies when propertyName != false)
 * @param {any} newValue Next value of the property (only applies when propertyName != false)
 * @param {any} innerEvent Original event of the change was to a child entity which was embedded as value of one of the properties
 * @memberof EntityChangedEvent
 */
exports.EntityChangedEvent = function EntityChangedEvent() {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      source = _ref3.source,
      _ref3$propertyName = _ref3.propertyName,
      propertyName = _ref3$propertyName === undefined ? false : _ref3$propertyName,
      _ref3$oldValue = _ref3.oldValue,
      oldValue = _ref3$oldValue === undefined ? null : _ref3$oldValue,
      _ref3$newValue = _ref3.newValue,
      newValue = _ref3$newValue === undefined ? null : _ref3$newValue,
      _ref3$innerEvent = _ref3.innerEvent,
      innerEvent = _ref3$innerEvent === undefined ? null : _ref3$innerEvent;

  _classCallCheck(this, EntityChangedEvent);

  // Store internal properties
  this.source = source;
  this.propertyName = propertyName;
  this.oldValue = oldValue;
  this.newValue = newValue;
  this.innerEvent = innerEvent;
};
//# sourceMappingURL=change-detection.js.map
