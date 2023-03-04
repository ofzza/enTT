// EnTT lib base functionality tests
// ----------------------------------------------------------------------------

// Import tests
import { testsHydrationBindDecoratorAndCompanionServices } from './_spec/bindDecorator.spec';
import { testsHydrationCastDecoratorAndCompanionServices } from './_spec/castDecorator.spec';

// Test ...
export function testsHydrationDecoratorsAndServices() {
  describe('EnTT HYDRATION decorators and companion services', () => {
    // Test @bind decorator
    describe('@bind', () => {
      testsHydrationBindDecoratorAndCompanionServices();
    });

    // Test @cast decorator
    describe('@cast', () => {
      testsHydrationCastDecoratorAndCompanionServices();
    });
  });
}
