// =====================================================================================================================
// TEST SCRIPT: Dummy script, testing GULP tasks
// =====================================================================================================================

// Test module importing
import _ from 'lodash';

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
  static run () { console.log(`Test: [${ _.map(Array(10), (value, i) => i).join(', ') }]`); }
}

// Run test statuc method
Test.run();
