// enTT HYDRATION @bind decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';

// Import from library root
import * as root from '../../../';

// Import tests
import { testHydrationBindClassDecoratorHydration } from './hydration.spec';

// Test ...
export function testHydrationBindClassDecoratorAndCompanionServices() {
  // Can import from library root
  describe('Decorator and related services can be imported from "./"', () => {
    // Decorator
    it('Can import decorator', () => {
      assert(!!root.bind);
    });
  });

  // Test hydration
  testHydrationBindClassDecoratorHydration();
}
