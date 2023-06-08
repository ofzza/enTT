// enTT core decorators TESTS
// ----------------------------------------------------------------------------

// Import tests
import { testDefDecorator } from './def/index.spec';
import { testHydrationDecoratorsAndServices } from './hydration/index.spec';

describe(`Libraray's included decorators`, () => {
  // Test @def core decorator
  testDefDecorator();
  // Test @hydration decorators and companion services
  testHydrationDecoratorsAndServices();
});
