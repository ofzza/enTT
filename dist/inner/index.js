'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// =====================================================================================================================
// TEST SCRIPT: Dummy script, testing GULP tasks
// =====================================================================================================================

/**
 * Testing class definition
 * @export
 * @class Test
 */
var TestInner = function () {
  function TestInner() {
    _classCallCheck(this, TestInner);
  }

  _createClass(TestInner, null, [{
    key: 'run',

    /**
     * Outputs to console
     * @static
     * @memberof Test
     */
    value: function run() {
      console.log('> Done!');
    }
  }]);

  return TestInner;
}();

exports.default = TestInner;
//# sourceMappingURL=index.js.map
