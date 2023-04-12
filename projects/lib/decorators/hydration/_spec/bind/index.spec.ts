// enTT HYDRATION @bind decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../../tests.init';

// Import from library root
import * as root from '../../';

// Import tests
import { testHydrationBindDecoratorDehydrate } from './dehydrate.spec';
import { testHydrationBindDecoratorRehydrate } from './rehydrate.spec';

// Test ...
export function testHydrationBindDecoratorAndCompanionServices() {
  // Can import from library root
  describe('Decorator and related services can be imported from "./"', () => {
    // Decorator
    it('Can import decorator', () => {
      assert(!!root.bind);
    });
  });

  // Test dehydration
  testHydrationBindDecoratorDehydrate();
  // Test rehydration
  testHydrationBindDecoratorRehydrate();
}
