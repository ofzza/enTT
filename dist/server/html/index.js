'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // =====================================================================================================================
// TEST HTML SCRIPT: Dummy script, testing HTML tasks
// =====================================================================================================================

// Test module importing


var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Testing HTML class definition
 * @export
 * @class Test
 */
var TestHTML = function () {
  function TestHTML() {
    _classCallCheck(this, TestHTML);
  }

  _createClass(TestHTML, null, [{
    key: 'run',

    /**
     * Outputs to console
     * @static
     * @memberof Test
     */
    value: function run() {

      // Fetch HTML template and styling
      var html = _fs2.default.readFileSync(_path2.default.join(__dirname, '../../client/index.html')).toString(),
          css = _fs2.default.readFileSync(_path2.default.join(__dirname, '../../client/style/css/style.css')).toString(),
          less = _fs2.default.readFileSync(_path2.default.join(__dirname, '../../client/style/less/style.css')).toString(),
          scss = _fs2.default.readFileSync(_path2.default.join(__dirname, '../../client/style/scss/style.css')).toString(),
          output = html.replace('</head>', '<style>\n' + css.replace(/\n/g, '') + '\n' + less.replace(/\n/g, '') + '\n' + scss.replace(/\n/g, '') + '\n\t</style></head>');
      console.log();
      console.log(output);
    }
  }]);

  return TestHTML;
}();

exports.default = TestHTML;
//# sourceMappingURL=index.js.map
