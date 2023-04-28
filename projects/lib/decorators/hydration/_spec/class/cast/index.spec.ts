// enTT HYDRATION @cast decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';

// Import from library root
import * as root from '../../../';

// Import tests
import { testHydrationCastDecoratorHydration } from './hydration.spec';

// Test ...
export function testHydrationCastDecoratorAndCompanionServicesOnBoundPropertiesAndClasses() {
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

  // Test hydration
  testHydrationCastDecoratorHydration();
}
