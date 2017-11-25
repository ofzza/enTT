'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // =====================================================================================================================
// TEST SCRIPT: Dummy script, testing GULP tasks
// =====================================================================================================================

// Test module importing


var _child_process = require('child_process');

var _inner = require('./inner');

var _inner2 = _interopRequireDefault(_inner);

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
      // Get system information
      var windowsVersion = null;
      try {
        windowsVersion = ('' + (0, _child_process.execSync)('ver')).replace(/\r/g, '').replace(/\n/g, '');
      } catch (err) {
        err;
      }

      var linuxVersion = null;
      try {
        linuxVersion = ('' + (0, _child_process.execSync)('uname -mrs')).replace(/\r/g, '').replace(/\n/g, '');
      } catch (err) {
        err;
      }

      // Prompt system info
      console.log('OS version:   ' + (windowsVersion || linuxVersion || 'Detection failed!'));
      console.log('Node version: ' + process.version);

      // Execute inner script file
      _inner2.default.run();
    }
  }]);

  return Test;
}();

// Run test statuc method


exports.default = Test;
Test.run();
//# sourceMappingURL=index.js.map
