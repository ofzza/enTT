// =====================================================================================================================
// TEST HTML SCRIPT: Dummy script, testing HTML tasks
// =====================================================================================================================

// Test module importing
import fs from 'fs';
import path from 'path';

/**
 * Testing HTML class definition
 * @export
 * @class Test
 */
export default class TestHTML {
  /**
   * Outputs to console
   * @static
   * @memberof Test
   */
  static run () {

    // Fetch HTML template and styling
    let html  = fs.readFileSync(path.join(__dirname, '../../client/index.html')).toString(),
        css   = fs.readFileSync(path.join(__dirname, '../../client/style/css/style.css')).toString(),
        less  = fs.readFileSync(path.join(__dirname, '../../client/style/less/style.css')).toString(),
        scss  = fs.readFileSync(path.join(__dirname, '../../client/style/scss/style.css')).toString(),
        output = html.replace('</head>', `<style>\n${ css.replace(/\n/g, '') }\n${ less.replace(/\n/g, '') }\n${ scss.replace(/\n/g, '') }\n\t</style></head>`);
    console.log();
    console.log(output);

  }
}
