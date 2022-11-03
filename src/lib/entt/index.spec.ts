// EnTT lib base functionality tests
// ----------------------------------------------------------------------------

// Import tests
import { testsStaticPropertyDecorators, testsDynamicPropertyDecorators } from './_tests';

// Test ...
describe('EnTT internals', () => {
  // Tests static custom property decorators cration and implementation
  describe('Property decorators', () => {
    // #region Test static decorator implementation

    // Tests static custom property decorators cration and implementation
    describe('Can implement a custom, static property decorator', () => {
      testsStaticPropertyDecorators();
    });

    // Tests dynamic custom property decorators cration and implementation
    describe('Can implement a custom, dynamic property decorator', () => {
      testsDynamicPropertyDecorators();
    });

    // #endregion
  });
});
