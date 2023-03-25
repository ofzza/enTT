// enTT HYDRATION @cast decorator's dehydration testing
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../../tests.init';
import { dehydrate, HydrationStrategy } from '../../';
import { createTestClassInstance } from './fixtures.spec';

// Test ...
export function testHydrationCastDecoratorDehydrate() {
  // Check class instance can dehydrate all its properties correctly
  it('A class instance with properties using the @cast decorator can dehydrate', () => {
    // Dehydrate the testing instance, making sure to dehydrate all properties
    const dehydratedInstance = dehydrate(createTestClassInstance(), HydrationStrategy.OnlyBoundClassProperties);

    // Check all dehydrated direct value properties exist as expected with values as expected
    assert(dehydratedInstance['propA'] === 'A');
    assert(dehydratedInstance['propB'] === 'B');
    assert(dehydratedInstance['propC'] === 'C');
    // Check all dehydrated direct value properties exist on a non-cast embeddded instance as expected with values as expected
    assert(!!dehydratedInstance['propRaw']);
    assert(dehydratedInstance['propRaw']['propertyA'] === 'A');
    assert(dehydratedInstance['propRaw']['propertyB'] === 'B');
    assert(dehydratedInstance['propRaw']['propertyC'] === 'C');
    // Check all dehydrated direct value properties exist on a cast embeddded instance as expected with values as expected,
    // respecting bindings from the cast class
    assert(!!dehydratedInstance['propSingle']);
    assert(dehydratedInstance['propSingle']['propA'] === 'A');
    assert(dehydratedInstance['propSingle']['propB'] === 'B');
    assert(dehydratedInstance['propSingle']['propC'] === 'C');
    // ... and respecting custom bindings
    assert(!!dehydratedInstance['propCustomSingle']);
    assert(dehydratedInstance['propCustomSingle']?.data['propA'] === 'A');
    assert(dehydratedInstance['propCustomSingle']?.data['propB'] === 'B');
    assert(dehydratedInstance['propCustomSingle']?.data['propC'] === 'C');
    // Check all dehydrated direct value properties exist on a cast embeddded array of instances as expected with values as expected,
    // respecting bindings from the cast class
    assert(!!dehydratedInstance['propArray']);
    assert(dehydratedInstance['propArray'].length === 3);
    for (const dehydratedArrayMemberInstance of dehydratedInstance['propArray']) {
      assert(dehydratedArrayMemberInstance['propA'] === 'A');
      assert(dehydratedArrayMemberInstance['propB'] === 'B');
      assert(dehydratedArrayMemberInstance['propC'] === 'C');
    }
    // ... and respecting custom bindings
    assert(!!dehydratedInstance['propCustomArray']);
    assert(dehydratedInstance['propCustomArray'].length === 3);
    for (const dehydratedArrayMemberInstance of dehydratedInstance['propCustomArray']) {
      assert(dehydratedArrayMemberInstance?.data['propA'] === 'A');
      assert(dehydratedArrayMemberInstance?.data['propB'] === 'B');
      assert(dehydratedArrayMemberInstance?.data['propC'] === 'C');
    }
    // Check all dehydrated direct value properties exist on a cast embeddded hashmap of instances as expected with values as expected,
    // respecting bindings from the cast class
    assert(!!dehydratedInstance['propHashmap']);
    assert(Object.keys(dehydratedInstance['propHashmap']).length === 3);
    assert(Object.keys(dehydratedInstance['propHashmap']).filter(key => !['a', 'b', 'c'].includes(key)).length === 0);
    for (const dehydratedHashmapMemberInstance of Object.values(dehydratedInstance['propHashmap']) as Array<any>) {
      assert(dehydratedHashmapMemberInstance['propA'] === 'A');
      assert(dehydratedHashmapMemberInstance['propB'] === 'B');
      assert(dehydratedHashmapMemberInstance['propC'] === 'C');
    }
    // ... and respecting custom bindings
    assert(!!dehydratedInstance['propCustomHashmap']);
    assert(Object.keys(dehydratedInstance['propCustomHashmap']).length === 3);
    assert(Object.keys(dehydratedInstance['propCustomHashmap']).filter(key => !['a', 'b', 'c'].includes(key)).length === 0);
    for (const dehydratedHashmapMemberInstance of Object.values(dehydratedInstance['propCustomHashmap']) as Array<any>) {
      assert(dehydratedHashmapMemberInstance?.data['propA'] === 'A');
      assert(dehydratedHashmapMemberInstance?.data['propB'] === 'B');
      assert(dehydratedHashmapMemberInstance?.data['propC'] === 'C');
    }
  });

  // Check class instance can dehydrate all its properties correctly
  it('Dehydrating a class instance respects strictness settings in all cases', () => {
    // Check Instance class === Cast class
    // Check Instance class !== Cast class && Instance class === Object
    // Check Instance class !== Cast class && Instance class !== Object
  });

  // Check class instance can dehydrate even when encounters circular references
  it('Dehydrating a class instance is resiliant to circular references', () => {
    // TODO: ...
  });
}
