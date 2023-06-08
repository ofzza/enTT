// enTT HYDRATION @bind decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';

// Import from library root
import * as root from '../../../';

// Import tests
import { testHydrationBindPropertyDecoratorDehydrate } from './dehydrate.spec';
import { testHydrationBindPropertyDecoratorRehydrate } from './rehydrate.spec';

export function testHydrationBindPropertyDecoratorAndCompanionServices() {
  describe('Decorator and related services can be imported from "./"', () => {
    it('Can import decorator', () => {
      assert(!!root.bind);
    });
  });

  // Test dehydration
  testHydrationBindPropertyDecoratorDehydrate();
  // Test rehydration
  testHydrationBindPropertyDecoratorRehydrate();
}
