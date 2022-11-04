// EnTT lib base functionality tests
// ----------------------------------------------------------------------------

// Import tests
import { testsStaticPropertyDecorators } from './_spec/staticPropertyDecorator.spec';
import { testsDynamicPropertyDecorators } from './_spec/dynamicPropertyDecorator.spec';

// Test ...
describe('EnTT library internals', () => {
  // Tests static custom property decorators cration and implementation
  describe('Can implement a custom, static property decorator', () => {
    testsStaticPropertyDecorators();
  });

  // Tests dynamic custom property decorators cration and implementation
  describe('Can implement a custom, dynamic property decorator', () => {
    testsDynamicPropertyDecorators();
  });
});
