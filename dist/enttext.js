'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// =====================================================================================================================
// ENTITY: Extension Class
// =====================================================================================================================

/**
 * Entity Extension class
 * @export
 * @class EnTTExt
 */
var EnTTExt = function () {

  /**
   * Creates an instance of EnTTExt.
   * @param {any} processShorthandPropertyConfiguration If true, the extension is expected to implement the .procesShorthandPropertyConfiguration(...) method
   * @param {any} updatePropertyConfiguration If true, the extension is expected to implement the .updatePropertyConfiguration(...) method
   * @param {any} onEntityInstantiate If true, the extension is expected to implement the .onEntityInstantiate(...) method
   * @param {any} onChangeDetected If true, the extension is expected to implement the .onChangeDetected(...) method
   * @param {any} afterChangeProcessed If true, the extension is expected to implement the .afterChangeProcessed(...) method
   * @param {any} interceptPropertySet If true, the extension is expected to implement the .intercaptPropertySet(...) method
   * @param {any} interceptPropertyGet If true, the extension is expected to implement the .intercaptPropertyGet(...) method
   * @memberof EnTTExt
   */
  function EnTTExt() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$processShorthand = _ref.processShorthandPropertyConfiguration,
        processShorthandPropertyConfiguration = _ref$processShorthand === undefined ? false : _ref$processShorthand,
        _ref$updatePropertyCo = _ref.updatePropertyConfiguration,
        updatePropertyConfiguration = _ref$updatePropertyCo === undefined ? false : _ref$updatePropertyCo,
        _ref$onEntityInstanti = _ref.onEntityInstantiate,
        onEntityInstantiate = _ref$onEntityInstanti === undefined ? false : _ref$onEntityInstanti,
        _ref$onChangeDetected = _ref.onChangeDetected,
        onChangeDetected = _ref$onChangeDetected === undefined ? false : _ref$onChangeDetected,
        _ref$afterChangeProce = _ref.afterChangeProcessed,
        afterChangeProcessed = _ref$afterChangeProce === undefined ? false : _ref$afterChangeProce,
        _ref$interceptPropert = _ref.interceptPropertySet,
        interceptPropertySet = _ref$interceptPropert === undefined ? false : _ref$interceptPropert,
        _ref$interceptPropert2 = _ref.interceptPropertyGet,
        interceptPropertyGet = _ref$interceptPropert2 === undefined ? false : _ref$interceptPropert2;

    _classCallCheck(this, EnTTExt);

    // Store information on which methods the extension implements
    this.implemented = {
      processShorthandPropertyConfiguration: processShorthandPropertyConfiguration,
      updatePropertyConfiguration: updatePropertyConfiguration,
      onEntityInstantiate: onEntityInstantiate,
      onChangeDetected: onChangeDetected,
      afterChangeProcessed: afterChangeProcessed,
      interceptPropertySet: interceptPropertySet,
      interceptPropertyGet: interceptPropertyGet
    };
  }

  /**
   * Processes property configuration and replaces it if detected as short-hand configuration syntax
   * @param {any} propertyConfiguration Single property configuration to be processed
   * @returns {any} Processed property configuration
   * @memberof EnTTExt
   */


  _createClass(EnTTExt, [{
    key: 'processShorthandPropertyConfiguration',
    value: function processShorthandPropertyConfiguration(propertyConfiguration) {
      return function () {
        throw new Error('Not implemented!', propertyConfiguration);
      }();
    }

    /**
     * Updates property's configuration
     * @param {any} propertyConfiguration Single property configuration to be updated
     * @memberof EnTTExt
     */

  }, {
    key: 'updatePropertyConfiguration',
    value: function updatePropertyConfiguration(propertyConfiguration) {
      throw new Error('Not implemented!', propertyConfiguration);
    }

    /**
     * Modifies the entity instance right after it is constructed
     * @param {any} entity Entity instance
     * @param {any} properties Entity's properties' configuration
     * @memberof EnTTExt
     */

  }, {
    key: 'onEntityInstantiate',
    value: function onEntityInstantiate(entity, properties) {
      throw new Error('Not implemented!', entity, properties);
    }

    /**
     * Notifies the extension that the entity instance being extended has had a property change detected
     * @param {any} entity Entity instance
     * @param {any} properties Entity's properties' configuration
     * @param {any} event EntityChangedEvent instance
     * @memberof EnTTExt
     */

  }, {
    key: 'onChangeDetected',
    value: function onChangeDetected(entity, properties, event) {
      throw new Error('Not implemented!', entity, properties, event);
    }

    /**
     * Notifies the extension that the entity instance being extended has had a property change detected and has had the change processed by all outside watchers
     * @param {any} entity Entity instance
     * @param {any} properties Entity's properties' configuration
     * @param {any} event EntityChangedEvent instance
     * @memberof EnTTExt
     */

  }, {
    key: 'afterChangeProcessed',
    value: function afterChangeProcessed(entity, properties, event) {
      throw new Error('Not implemented!', entity, properties, event);
    }

    /**
     * Generates a function to process every value being set for the particular property
     * @param {any} propertyName Name of the property being processed
     * @param {any} propertyConfiguration Property configuration
     * @returns {function} Function processing every value being set for this property (If no function returned, extension won't intercept setter for this property)
     * @memberof EnTTExt
     */

  }, {
    key: 'interceptPropertySet',
    value: function interceptPropertySet(propertyName, propertyConfiguration) {
      /**
       * Called before committing a new property value, allows the extension to modify the value being set
       * @param {any} entity Entity instance
       * @param {any} properties Entity's properties' configuration
       * @param {any} event EnTTExtValueEvent instance
       * @memberof EnTTExt
       */
      return function (entity, properties, event) {
        throw new Error('Not implemented!', propertyName, propertyConfiguration, entity, properties, event);
      };
    }

    /**
     * Generates a function to process every value being fetched from the particular property
     * @param {any} propertyName Name of the property being processed
     * @param {any} propertyConfiguration Property configuration
     * @returns {function} Function processing every value being fetched from this property (If no function returned, extension won't intercept getter for this property)
     * @memberof EnTTExt
     */

  }, {
    key: 'interceptPropertyGet',
    value: function interceptPropertyGet(propertyName, propertyConfiguration) {
      /**
       * Called before returning a fetched property value, allows the extension to modify the value being fetched
       * @param {any} entity Entity instance
       * @param {any} properties Entity's properties' configuration
       * @param {any} event EnTTExtValueEvent instance
       * @memberof EnTTExt
       */
      return function (entity, properties, event) {
        throw new Error('Not implemented!', propertyName, propertyConfiguration, entity, properties, event);
      };
    }
  }]);

  return EnTTExt;
}();

/**
 * Event class keeping track of value updates made by the extensnios' setter/getter interceptors
 * @export
 * @class EnTTExtValueEvent
 */


exports.default = EnTTExt;

var EnTTExtValueEvent =
/**
 * Creates an instance of EnTTExtValueEvent.
 * @param {any} changes Array of changes to the value done by each of the interceptors
 * @param {any} currentValue Value currently set for the property
 * @param {any} value Value being updated by the interceptors
 * @memberof EnTTExtValueEvent
 */
exports.EnTTExtValueEvent = function EnTTExtValueEvent(_ref2) {
  var changes = _ref2.changes,
      currentValue = _ref2.currentValue,
      value = _ref2.value;

  _classCallCheck(this, EnTTExtValueEvent);

  // Expose changes as a read-only property
  Object.defineProperty(this, 'changes', {
    configurable: false,
    enumerable: true,
    get: function get() {
      return changes;
    }
  });

  // Expose currentValue as a read-only property
  Object.defineProperty(this, 'currentValue', {
    configurable: false,
    enumerable: true,
    get: function get() {
      return currentValue;
    }
  });

  // Expose value as a writable property
  Object.defineProperty(this, 'value', {
    configurable: false,
    enumerable: true,
    set: function set(val) {
      value = val;
    },
    get: function get() {
      return value;
    }
  });
};
//# sourceMappingURL=enttext.js.map
