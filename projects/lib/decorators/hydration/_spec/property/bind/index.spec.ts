// enTT HYDRATION @bind decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../../../tests.init';

// Import from library root
import * as root from '../../../';

// Import tests
import { testHydrationBindPropertyDecoratorDehydrate } from './dehydrate.spec';
import { testHydrationBindPropertyDecoratorRehydrate } from './rehydrate.spec';

// Test ...
export function testHydrationBindPropertyDecoratorAndCompanionServices() {
  // Can import from library root
  describe('Decorator and related services can be imported from "./"', () => {
    // Decorator
    it('Can import decorator', () => {
      assert(!!root.bindProperty);
    });
  });

  // Test dehydration
  testHydrationBindPropertyDecoratorDehydrate();
  // Test rehydration
  testHydrationBindPropertyDecoratorRehydrate();
}
