// enTT HYDRATION decorators and services tests
// ----------------------------------------------------------------------------

// Import tests
import { testHydrationBindPropertyDecoratorAndCompanionServices } from './_spec/property/bind/index.spec';
import { testHydrationCastDecoratorAndCompanionServicesOnBoundPropertiesOnly } from './_spec/property/cast/index.spec';
import { testHydrationBindClassDecoratorAndCompanionServices } from './_spec/class/bind/index.spec';
import { testHydrationCastDecoratorAndCompanionServicesOnBoundPropertiesAndClasses } from './_spec/class/cast/index.spec';

// Test ...
export function testHydrationDecoratorsAndServices() {
  describe('EnTT HYDRATION decorators and companion services', () => {
    // Test @bind decorator
    describe('@bind properties', () => {
      testHydrationBindPropertyDecoratorAndCompanionServices();
      testHydrationBindClassDecoratorAndCompanionServices();
    });

    // Test @cast decorator
    describe('@cast', () => {
      testHydrationCastDecoratorAndCompanionServicesOnBoundPropertiesOnly();
      testHydrationCastDecoratorAndCompanionServicesOnBoundPropertiesAndClasses();
    });
  });
}
