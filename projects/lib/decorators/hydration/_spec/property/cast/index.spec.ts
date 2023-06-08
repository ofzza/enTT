// enTT HYDRATION @cast decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';

// Import from library root
import * as root from '../../../';

// Import tests
import { testHydrationCastDecoratorDehydrate } from './dehydrate.spec';
import { testHydrationCastDecoratorRehydrate } from './rehydrate.spec';

export function testHydrationCastDecoratorAndCompanionServicesOnBoundPropertiesOnly() {
  describe('Decorator and related services can be imported from "./"', () => {
    it('Can import decorator', () => {
      assert(!!root.cast);
    });
    it('Can import services', () => {
      assert(!!root.dehydrate);
      assert(!!root.rehydrate);
    });
    it('Can import enums', () => {
      assert(!!root.CastAs);
    });
  });

  // Test dehydration
  testHydrationCastDecoratorDehydrate();
  // Test rehydration
  testHydrationCastDecoratorRehydrate();
}
