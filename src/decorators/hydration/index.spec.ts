// enTT HYDRATION decorators and services tests
// ----------------------------------------------------------------------------

// Import tests
import { assert } from '../../tests.init';
import { createCustomDecorator, getDecoratedClassDefinition } from '../../lib';
import { Hydratable, HydrationStrategy, dehydrate, rehydrate } from './';

// Test ...
describe('EnTT HYDRATION decorators and services', () => {
  it('Works?!', () => {
    const def = createCustomDecorator();
    const bind = (...args: any[]) => createCustomDecorator();
    const cast = (...args: any[]) => createCustomDecorator();

    class Test<T> {
      constructor() {}

      // Public properties
      @def
      @bind({})
      @cast({})
      public pub: string;
      @def public pubUndefined?: string;
      @def public pubUndefinedExplicit?: string = undefined;
      @def public pubUndefinedValue?: string = 'public';
      // Protected properties
      @def protected prot: string;
      @def protected protUndefined?: string;
      @def protected protUndefinedExplicit?: string = undefined;
      @def protected protUndefinedValue?: string = 'protected';
      // Private properties
      @def private priv: string;
      @def private privUndefined?: string;
      @def private privUndefinedExplicit?: string = undefined;
      @def private privUndefinedValue?: string = 'private';
    }

    const test = new Test<Date>();
    const definition = getDecoratedClassDefinition(Test);
    const data = dehydrate(test);

    assert(true);
  });
});
