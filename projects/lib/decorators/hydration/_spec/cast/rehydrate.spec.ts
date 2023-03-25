// enTT HYDRATION @cast decorator's dehydration testing
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../../tests.init';
import { rehydrate, HydrationStrategy } from '../../';
import { TestCast, dehydratedTestCastExampleObj } from './fixtures.spec';

// Test ...
export function testHydrationCastDecoratorRehydrate() {
  // Check class instance can (re)hydrate all its properties correctly
  it('A class instance with properties using the @cast decorator can (re)hydrate and will cast', () => {
    // Rehydrate the a testing instance, making sure to rehydrate all properties
    const rehydratedInstanceViaClassParameter = rehydrate(dehydratedTestCastExampleObj, TestCast, HydrationStrategy.AllClassProperties);
    const rehydratedInstanceViaDirectClassInstance = rehydrate(dehydratedTestCastExampleObj, new TestCast(), HydrationStrategy.AllClassProperties);
    const rehydratedInstance = rehydratedInstanceViaClassParameter;

    // Check rehydration returns same result when called with a Class or a Class instance as an argument
    assert(JSON.stringify(rehydratedInstanceViaClassParameter) === JSON.stringify(rehydratedInstanceViaDirectClassInstance));

    // Check all (re)hydrated direct value properties exist as expected with values as expected
    assert(rehydratedInstance.propertyA === 'Value A');
    assert(rehydratedInstance.propertyB === 'Value B');
    assert(rehydratedInstance.propertyC === 'Value C');
    // Check all (re)hydrated direct value properties exist on a non-cast embeddded instance as expected with values as expected
    assert(!!rehydratedInstance.propertyRaw);
    assert(rehydratedInstance.propertyRaw?.['propA'] === 'Value A');
    assert(rehydratedInstance.propertyRaw?.['propB'] === 'Value B');
    assert(rehydratedInstance.propertyRaw?.['propC'] === 'Value C');
    // Check all (re)hydrated direct value properties exist on a cast embeddded instance as expected with values as expected,
    // respecting bindings from the cast class
    assert(!!rehydratedInstance.propertySingle);
    assert(rehydratedInstance.propertySingle?.propertyA === 'Value A');
    assert(rehydratedInstance.propertySingle?.propertyB === 'Value B');
    assert(rehydratedInstance.propertySingle?.propertyC === 'Value C');
    // ... and respecting custom bindings
    assert(!!rehydratedInstance.propertyCustomSingle);
    assert(rehydratedInstance.propertyCustomSingle?.propertyA === 'Value A');
    assert(rehydratedInstance.propertyCustomSingle?.propertyB === 'Value B');
    assert(rehydratedInstance.propertyCustomSingle?.propertyC === 'Value C');
    // Check all (re)hydrated direct value properties exist on a cast embeddded array of instances as expected with values as expected,
    // respecting bindings from the cast class
    assert(!!rehydratedInstance.propertyArray);
    assert(rehydratedInstance.propertyArray?.length === 3);
    for (const rehydratedArrayMemberInstance of rehydratedInstance.propertyArray || []) {
      assert(rehydratedArrayMemberInstance.propertyA === 'Value A');
      assert(rehydratedArrayMemberInstance.propertyB === 'Value B');
      assert(rehydratedArrayMemberInstance.propertyC === 'Value C');
    }
    // ... and respecting custom bindings
    assert(!!rehydratedInstance.propertyCustomArray);
    assert(rehydratedInstance.propertyCustomArray?.length === 3);
    for (const rehydratedArrayMemberInstance of rehydratedInstance.propertyCustomArray || []) {
      assert(rehydratedArrayMemberInstance.propertyA === 'Value A');
      assert(rehydratedArrayMemberInstance.propertyB === 'Value B');
      assert(rehydratedArrayMemberInstance.propertyC === 'Value C');
    }
    // Check all (re)hydrated direct value properties exist on a cast embeddded hashmap of instances as expected with values as expected,
    // respecting bindings from the cast class
    assert(!!rehydratedInstance.propertyHashmap);
    assert(Object.keys(rehydratedInstance.propertyHashmap || {}).length === 3);
    assert(Object.keys(rehydratedInstance.propertyHashmap || {}).filter(key => !['a', 'b', 'c'].includes(key)).length === 0);
    for (const rehydratedHashmapMemberInstance of Object.values(rehydratedInstance.propertyHashmap || {}) as Array<TestCast>) {
      assert(rehydratedHashmapMemberInstance.propertyA === 'Value A');
      assert(rehydratedHashmapMemberInstance.propertyB === 'Value B');
      assert(rehydratedHashmapMemberInstance.propertyC === 'Value C');
    }
    // ... and respecting custom bindings
    assert(!!rehydratedInstance.propertyCustomHashmap);
    assert(Object.keys(rehydratedInstance.propertyCustomHashmap || {}).length === 3);
    assert(Object.keys(rehydratedInstance.propertyCustomHashmap || {}).filter(key => !['a', 'b', 'c'].includes(key)).length === 0);
    for (const rehydratedHashmapMemberInstance of Object.values(rehydratedInstance.propertyCustomHashmap || {}) as Array<TestCast>) {
      assert(rehydratedHashmapMemberInstance.propertyA === 'Value A');
      assert(rehydratedHashmapMemberInstance.propertyB === 'Value B');
      assert(rehydratedHashmapMemberInstance.propertyC === 'Value C');
    }
  });

  // Check class instance can (re)hydrate all its properties correctly
  it('(Re)Hydrating a class instance respects strictness settings in all cases', () => {
    // Check Instance class === Cast class
    // Check Instance class !== Cast class && Instance class === Object
    // Check Instance class !== Cast class && Instance class !== Object
  });

  // Check class instance can (re)hydrate even when encounters circular references
  it('(Re)Hydrating a class instance is resiliant to circular references', () => {
    // TODO: ...
  });
}
