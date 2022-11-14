// enTT core decorators TESTS
// ----------------------------------------------------------------------------

// Import tests
import { testsDefDecorator } from './def/index.spec';
import { testsHydrationDecoratorsAndCompanionServices } from './hydration/index.spec';

// Test ...
describe('EnTT core decorators', () => {
  // Test @def core decorator
  testsDefDecorator();
  // Test @hydration decorators and companion services
  testsHydrationDecoratorsAndCompanionServices();
});
