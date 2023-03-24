// enTT HYDRATION @cast decorator and services tests
// ----------------------------------------------------------------------------

// Import tests
import { testHydrationCastDecoratorDehydrate } from './dehydrate.spec';
import { testHydrationCastDecoratorRehydrate } from './rehydrate.spec';

// Test ...
export function testHydrationCastDecoratorAndCompanionServices() {
  // Test dehydration
  testHydrationCastDecoratorDehydrate();
  // Test rehydration
  testHydrationCastDecoratorRehydrate();
}
