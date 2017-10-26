'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // =====================================================================================================================
// TEST SCRIPT: Dummy script, testing GULP tasks
// =====================================================================================================================

// Test module importing


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Testing class definition
 * @export
 * @class Test
 */
var Test = function () {
  function Test() {
    _classCallCheck(this, Test);
  }

  _createClass(Test, null, [{
    key: 'run',

    /**
     * Outputs to console
     * @static
     * @memberof Test
     */
    value: function run() {
      console.log('Test: [' + _lodash2.default.map(Array(10), function (value, i) {
        return i;
      }).join(', ') + ']');
    }
  }]);

  return Test;
}();

// Run test statuc method


exports.default = Test;
Test.run();
//# sourceMappingURL=index.js.map
