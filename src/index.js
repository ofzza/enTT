// =====================================================================================================================
// TEST SCRIPT: Dummy script, testing GULP tasks
// =====================================================================================================================

// Test module importing
import { execSync } from 'child_process';
import TestHTML from './server/html';

/**
 * Testing class definition
 * @export
 * @class Test
 */
export default class Test {
  /**
   * Outputs to console
   * @static
   * @memberof Test
   */
  static run () {
    // Get system information
    let windowsVersion = null;
    try { windowsVersion = `${ execSync('ver') }`.replace(/\r/g, '').replace(/\n/g, ''); } catch (err) { err; }

    let linuxVersion = null;
    try { linuxVersion = `${ execSync('uname -mrs') }`.replace(/\r/g, '').replace(/\n/g, ''); } catch (err) { err; }

    // Prompt system info
    console.log(`OS version:   ${ windowsVersion || linuxVersion || 'Detection failed!' }`);
    console.log(`Node version: ${ process.version }`);

    // Execute inner script file
    TestHTML.run();
  }
}

// Run test statuc method
Test.run();
