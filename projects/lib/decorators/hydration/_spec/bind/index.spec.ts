// enTT HYDRATION @bind decorator and services tests
// ----------------------------------------------------------------------------

// Import tests
import { testHydrationBindDecoratorDehydrate } from './dehydrate.spec';
import { testHydrationBindDecoratorRehydrate } from './rehydrate.spec';

// Test ...
export function testHydrationBindDecoratorAndCompanionServices() {
  // Test dehydration
  testHydrationBindDecoratorDehydrate();
  // Test rehydration
  testHydrationBindDecoratorRehydrate();
}
