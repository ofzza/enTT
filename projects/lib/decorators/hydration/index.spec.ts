// enTT HYDRATION decorators and services tests
// ----------------------------------------------------------------------------

// Import tests
import { testHydrationBindDecoratorAndCompanionServices } from './_spec/bind/index.spec';
import { testHydrationCastDecoratorAndCompanionServices } from './_spec/cast/index.spec';

// Test ...
export function testHydrationDecoratorsAndServices() {
  describe('EnTT HYDRATION decorators and companion services', () => {
    // Test @bind decorator
    describe('@bind', () => {
      testHydrationBindDecoratorAndCompanionServices();
    });

    // Test @cast decorator
    describe('@cast', () => {
      testHydrationCastDecoratorAndCompanionServices();
    });
  });
}
