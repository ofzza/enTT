// enTT HYDRATION @cast decorator's dehydration testing
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../../tests.init';
import { rehydrate, HydrationStrategy } from '../../';
import { TestCast, dehydratedTestCastExampleObj } from './fixtures.spec';

// Test ...
export function testHydrationCastDecoratorRehydrate() {
  // Instantiate a testing instance
  const instance = new TestCast();
  instance.propertyRaw = new TestCast();
  instance.propertySingle = new TestCast();
  instance.propertyArray = [1, 2, 3].map(_ => new TestCast());
  instance.propertyHashmap = ['a', 'b', 'c'].reduce((obj, key) => ({ ...obj, [key]: new TestCast() }), {});

  // Check class instance can (re)hydrate all its properties correctly
  it('A class instance with properties using the @cast decorator can (re)hydrate and will cast', () => {
    // Rehydrate the a testing instance, making sure to rehydrate all properties
    const rehydratedInstanceViaClassParameter = rehydrate(dehydratedTestCastExampleObj, TestCast, HydrationStrategy.AllClassProperties);
    const rehydratedInstanceViaDirectClassInstance = rehydrate(dehydratedTestCastExampleObj, new TestCast(), HydrationStrategy.AllClassProperties);

    // Check rehydration returns same result when called with a Class or a Class instance as an argument
    assert(JSON.stringify(rehydratedInstanceViaClassParameter) === JSON.stringify(rehydratedInstanceViaDirectClassInstance));
  });

  // Check class instance can dehydrate all its properties correctly
  it('Rehydrating a class instance respects strictness settings in all cases', () => {
    // Check Instance class === Cast class
    // Check Instance class !== Cast class && Instance class === Object
    // Check Instance class !== Cast class && Instance class !== Object
  });

  // Check class instance can rehydrate even when encounters circular references
  it('Rehydrating a class instance is resiliant to circular references', () => {
    // TODO: ...
  });
}
