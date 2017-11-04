"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// =====================================================================================================================
// ENTITY PROTOTYPE Internals: Debug status
// =====================================================================================================================

// Define internal variables
var debug = false; // Holds EntityPrototype debugging status

/**
 * Manages static debugging status
 * @export
 * @class Debug
 */

var Debug = function () {
  function Debug() {
    _classCallCheck(this, Debug);
  }

  _createClass(Debug, null, [{
    key: "debug",


    /**
     * Debugging status (When debugging, some extra properties are exposed)
     * @static
     * @memberof EntityPrototype
     */
    get: function get() {
      return debug;
    },
    set: function set(value) {
      debug = value;
    }
  }]);

  return Debug;
}();

exports.default = Debug;
//# sourceMappingURL=debug.js.map
