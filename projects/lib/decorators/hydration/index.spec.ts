// enTT HYDRATION decorators and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../tests.init';
import { createPropertyCustomDecorator, getDecoratedClassDefinition } from '../../lib';
import { def } from '../def';
import { Hydratable, HydrationStrategy, dehydrate, rehydrate } from './';

// Define required decorators
const bind = (...args: any[]) => createPropertyCustomDecorator();
const cast = (...args: any[]) => createPropertyCustomDecorator();

/**
 * Class decorated with @Hydration decorators
 */
class Test<T> {
  constructor() {}
  // Public properties
  @def
  @bind({})
  @cast({})
  public pub!: string;
}

// Test ...
export function testsHydrationDecoratorsAndCompanionServices() {
  describe('EnTT HYDRATION decorators and companion services', () => {
    it('Works?!', () => {
      assert(false);
    });
  });
}
