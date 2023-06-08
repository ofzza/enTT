// enTT HYDRATION @cast decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';

// Import from library root
import * as root from '../../../';

// Import tests
import { testHydrationCastDecoratorHydration } from './hydration.spec';

export function testHydrationCastDecoratorAndCompanionServicesOnBoundPropertiesAndClasses() {
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
      assert(!!root.HydrationStrategy);
    });
  });

  // Test hydration
  testHydrationCastDecoratorHydration();
}
