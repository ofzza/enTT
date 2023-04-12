// enTT HYDRATION @cast decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../../../tests.init';

// Import from library root
import * as root from '../../../';

// Import tests
import { testHydrationCastDecoratorDehydrate } from './dehydrate.spec';
import { testHydrationCastDecoratorRehydrate } from './rehydrate.spec';

// Test ...
export function testHydrationCastDecoratorAndCompanionServicesOnBoundPropertiesOnly() {
  // Can import from library root
  describe('Decorator and related services can be imported from "./"', () => {
    // Decorator
    it('Can import decorator', () => {
      assert(!!root.cast);
    });
    // Services
    it('Can import services', () => {
      assert(!!root.dehydrate);
      assert(!!root.rehydrate);
    });
    // Enums
    it('Can import enums', () => {
      assert(!!root.CastAs);
    });
  });

  // Test dehydration
  testHydrationCastDecoratorDehydrate();
  // Test rehydration
  testHydrationCastDecoratorRehydrate();
}
