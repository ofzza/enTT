// Static class decorators creation and usage TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init';
import { Class, PropertyName, createPropertyCustomDecorator, getDecoratedClassDefinition, filterDefinition } from '../';

// Export tests
export function testsStaticClassDecorators() {
  // Check if, given a class, class can be found as having been decorated
  describe('Definitions are set correctly and can be reached via class', () => {
    // Entity definition exists and fetched and has correct owner info set
    it('Definitions are set correctly and can be reached via class', () => {
      assert(false);
    });
  });

  // Check if, given a class, entity definition can be filtered for only a particular decorator
  describe('Filtering of entity definition by decorator, given a class, works', () => {
    // Entity definition exists and fetched and has correct owner info set
    it('Filtered definitions are set correctly and can be reached via class', () => {
      assert(false);
    });
    // Check if filtering works
    it('Filtering of definitions by decorator, given a class, works', () => {
      assert(false);
    });
  });

  // Given a class, use decorated class configuration
  it('Decorated class can be used within real featured functionality via class', () => {
    assert(false);
  });

  // Check if, given a class instance, class can be found as having been decorated
  describe('Definitions are set correctly and can be reached via class instance', () => {
    // Entity definition exists and fetched and has correct owner info set
    it('Definitions are set and can be reached via class instance', () => {
      assert(false);
    });
  });

  // Check if, given a class instance, entity definition can be filtered for only a particular decorator
  describe('Filtering of entity definition by decorator, given a class instance, works', () => {
    // Entity definition exists and fetched and has correct owner info set
    it('Filtered definitions are set and can be reached via class instance', () => {
      assert(false);
    });
    // Check if filtering works
    it('Filtering of definitions by decorator, given a class instance, works', () => {
      assert(false);
    });
  });

  // Given a class instance, use decorated class configuration
  it('Decorated properties can be used within real featured functionality via class instance', () => {
    assert(false);
  });
}
