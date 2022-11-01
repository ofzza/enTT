// EnTT lib base functionality tests
// ----------------------------------------------------------------------------

// Import tests
import { testsStaticPropertyDecorators } from './_tests';

// Test ...
describe('EnTT internals', () => {
  // Tests static custom property decorators cration and implementation
  describe('Property decorators', () => {
    // #region Test static decorator implementation

    // Tests static custom property decorators cration and implementation
    describe('Can implement a custom static property decorator', () => {
      testsStaticPropertyDecorators();
    });

    // #endregion
  });
});
