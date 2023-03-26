// enTT HYDRATION @cast decorator's dehydration testing
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../../tests.init';
import { rehydrate, HydrationStrategy } from '../../';
import { TestCast, createDehydratedTestCastExampleObj } from './fixtures.spec';

// Test ...
export function testHydrationCastDecoratorRehydrate() {
  // Check class instance can (re)hydrate all its properties correctly
  describe('A class instance with properties using the @cast decorator can (re)hydrate and will cast', () => {
    // Rehydrate the a testing instance, making sure to rehydrate all properties
    const rehydratedInstanceViaClassParameter = rehydrate(createDehydratedTestCastExampleObj(), TestCast, HydrationStrategy.AllClassProperties);
    const rehydratedInstanceViaDirectClassInstance = rehydrate(createDehydratedTestCastExampleObj(), new TestCast(), HydrationStrategy.AllClassProperties);
    const rehydratedInstance = rehydratedInstanceViaClassParameter;

    // Check rehydration returns same result when called with a Class or a Class instance as an argument
    it('(Re)Hydration with casting properties works the same when given a class or class instance as a target argument', () => {
      assert(JSON.stringify(rehydratedInstanceViaClassParameter) === JSON.stringify(rehydratedInstanceViaDirectClassInstance));
    });

    // Check all (re)hydrated direct value properties exist as expected with values as expected
    it('Non casting properties with raw values can (re)hydrate', () => {
      assert(rehydratedInstance.propertyA === 'Value A');
      assert(rehydratedInstance.propertyB === 'Value B');
      assert(rehydratedInstance.propertyC === 'Value C');
    });
    // Check all (re)hydrated direct value properties exist on a non-cast embeddded instance as expected with values as expected
    it('Non casting properties containing class instances can (re)hydrate', () => {
      assert(!!rehydratedInstance.propertyRaw);
      assert(rehydratedInstance.propertyRaw?.['propA'] === 'Value A');
      assert(rehydratedInstance.propertyRaw?.['propB'] === 'Value B');
      assert(rehydratedInstance.propertyRaw?.['propC'] === 'Value C');
    });
    // Check all (re)hydrated direct value properties exist on a cast embeddded instance as expected with values as expected,
    // respecting bindings from the cast class
    it('Casting property with a single class instance value can (re)hydrate', () => {
      assert(!!rehydratedInstance.propertySingle);
      assert(rehydratedInstance.propertySingle?.propertyA === 'Value A');
      assert(rehydratedInstance.propertySingle?.propertyB === 'Value B');
      assert(rehydratedInstance.propertySingle?.propertyC === 'Value C');
    });
    // ... and respecting custom bindings
    it('Casting property with a single class instance value can (re)hydrate while respecting custom binding', () => {
      assert(!!rehydratedInstance.propertyCustomSingle);
      assert(rehydratedInstance.propertyCustomSingle?.propertyA === 'Value A');
      assert(rehydratedInstance.propertyCustomSingle?.propertyB === 'Value B');
      assert(rehydratedInstance.propertyCustomSingle?.propertyC === 'Value C');
    });
    // Check all (re)hydrated direct value properties exist on a cast embeddded array of instances as expected with values as expected,
    // respecting bindings from the cast class
    it('Casting property with an array of class instance value can (re)hydrate', () => {
      assert(!!rehydratedInstance.propertyArray);
      assert(rehydratedInstance.propertyArray?.length === 3);
      for (const rehydratedArrayMemberInstance of rehydratedInstance.propertyArray || []) {
        assert(rehydratedArrayMemberInstance.propertyA === 'Value A');
        assert(rehydratedArrayMemberInstance.propertyB === 'Value B');
        assert(rehydratedArrayMemberInstance.propertyC === 'Value C');
      }
    });
    // ... and respecting custom bindings
    it('Casting property with an array of class instance value can (re)hydrate while respecting custom binding', () => {
      assert(!!rehydratedInstance.propertyCustomArray);
      assert(rehydratedInstance.propertyCustomArray?.length === 3);
      for (const rehydratedArrayMemberInstance of rehydratedInstance.propertyCustomArray || []) {
        assert(rehydratedArrayMemberInstance.propertyA === 'Value A');
        assert(rehydratedArrayMemberInstance.propertyB === 'Value B');
        assert(rehydratedArrayMemberInstance.propertyC === 'Value C');
      }
    });
    // Check all (re)hydrated direct value properties exist on a cast embeddded hashmap of instances as expected with values as expected,
    // respecting bindings from the cast class
    it('Casting property with a hashmap of class instance value can (re)hydrate', () => {
      assert(!!rehydratedInstance.propertyHashmap);
      assert(Object.keys(rehydratedInstance.propertyHashmap || {}).length === 3);
      assert(Object.keys(rehydratedInstance.propertyHashmap || {}).filter(key => !['a', 'b', 'c'].includes(key)).length === 0);
      for (const rehydratedHashmapMemberInstance of Object.values(rehydratedInstance.propertyHashmap || {}) as Array<TestCast>) {
        assert(rehydratedHashmapMemberInstance.propertyA === 'Value A');
        assert(rehydratedHashmapMemberInstance.propertyB === 'Value B');
        assert(rehydratedHashmapMemberInstance.propertyC === 'Value C');
      }
    });
    // ... and respecting custom bindings
    it('Casting property with a hashmap of class instance value can (re)hydrate while respecting custom binding', () => {
      assert(!!rehydratedInstance.propertyCustomHashmap);
      assert(Object.keys(rehydratedInstance.propertyCustomHashmap || {}).length === 3);
      assert(Object.keys(rehydratedInstance.propertyCustomHashmap || {}).filter(key => !['a', 'b', 'c'].includes(key)).length === 0);
      for (const rehydratedHashmapMemberInstance of Object.values(rehydratedInstance.propertyCustomHashmap || {}) as Array<TestCast>) {
        assert(rehydratedHashmapMemberInstance.propertyA === 'Value A');
        assert(rehydratedHashmapMemberInstance.propertyB === 'Value B');
        assert(rehydratedHashmapMemberInstance.propertyC === 'Value C');
      }
    });
  });

  // Check (re)hydrating a class instance respects strictness settings in all cases
  describe('(Re)Hydrating a non-class-instance value respects strictness settings in all cases', () => {
    // Do not throw when rehydrating a non-object value in a non-strict property
    const valueTestingSingle = createDehydratedTestCastExampleObj();
    valueTestingSingle['propSingle'] = false as unknown as TestCast;
    it(`Single not castable value won't throw when property not configured with strict casting`, () => {
      expect(() => rehydrate(valueTestingSingle, TestCast, HydrationStrategy.AllClassProperties)).not.toThrow();
    });
    // ... except when forcing strict dehydration
    it(`Single not castable value will throw when forcing a strict dehydration`, () => {
      expect(() => rehydrate(valueTestingSingle, TestCast, HydrationStrategy.AllClassProperties, { strict: true })).toThrow();
    });
    // Do throw when rehydrating a non-object value in a strict property
    const valueTestingCustomSingle = createDehydratedTestCastExampleObj();
    valueTestingCustomSingle['propCustomSingle'] = { data: false } as unknown as TestCast;
    it(`Single not castable value will throw when property configured with strict casting`, () => {
      expect(() => rehydrate(valueTestingCustomSingle, TestCast, HydrationStrategy.AllClassProperties)).toThrow();
    });
    // ... except when forcing non-strict dehydration
    it(`Single not castable value won't throw when forcing a non-strict dehydration`, () => {
      expect(() => rehydrate(valueTestingCustomSingle, TestCast, HydrationStrategy.AllClassProperties, { strict: false })).not.toThrow();
    });

    // Do not throw when rehydrating a non-object containing array in a non-strict property
    const valueTestingArray = createDehydratedTestCastExampleObj();
    valueTestingArray['propArray']![1] = false as unknown as TestCast;
    it(`Array containing a not castable value won't throw when property not configured with strict casting`, () => {
      expect(() => rehydrate(valueTestingArray, TestCast, HydrationStrategy.AllClassProperties)).not.toThrow();
    });
    // ... except when forcing strict dehydration
    it(`Array containing a not castable value will throw when forcing a strict dehydration`, () => {
      expect(() => rehydrate(valueTestingArray, TestCast, HydrationStrategy.AllClassProperties, { strict: true })).toThrow();
    });
    // Do throw when rehydrating a non-object containing array in a strict property
    const valueTestingCustomArray = createDehydratedTestCastExampleObj();
    valueTestingCustomArray['propCustomArray']![1] = { data: false } as unknown as TestCast;
    it(`Array containing a not castable value will throw when property configured with strict casting`, () => {
      expect(() => rehydrate(valueTestingCustomArray, TestCast, HydrationStrategy.AllClassProperties)).toThrow();
    });
    // ... except when forcing non-strict dehydration
    it(`Array containing a not castable value won't throw when forcing a non-strict dehydration`, () => {
      expect(() => rehydrate(valueTestingCustomArray, TestCast, HydrationStrategy.AllClassProperties, { strict: false })).not.toThrow();
    });

    // Do not throw when rehydrating a non-object containing hashmap in a non-strict property
    const valueTestingHashmap = createDehydratedTestCastExampleObj();
    valueTestingHashmap['propHashmap']!['b'] = false as unknown as TestCast;
    it(`Hashmap containing a non-instance won't throw when property not configured with strict casting`, () => {
      expect(() => rehydrate(valueTestingHashmap, TestCast, HydrationStrategy.AllClassProperties)).not.toThrow();
    });
    // ... except when forcing strict dehydration
    it(`Hashmap containing a non-instance will throw when forcing a strict dehydration`, () => {
      expect(() => rehydrate(valueTestingHashmap, TestCast, HydrationStrategy.AllClassProperties, { strict: true })).toThrow();
    });
    // Do throw when dehydrehydratingrating a non-object containing hashmap in a strict property
    const valueTestingCustomHashmap = createDehydratedTestCastExampleObj();
    valueTestingCustomHashmap['propCustomHashmap']!['b'] = { data: false } as unknown as TestCast;
    it(`Hashmap containing a non-instance will throw when property configured with strict casting`, () => {
      expect(() => rehydrate(valueTestingCustomHashmap, TestCast, HydrationStrategy.AllClassProperties)).toThrow();
    });
    // ... except when forcing non-strict dehydration
    it(`Hashmap containing a Single non-instance won't throw when forcing a non-strict dehydration`, () => {
      expect(() => rehydrate(valueTestingCustomHashmap, TestCast, HydrationStrategy.AllClassProperties, { strict: false })).not.toThrow();
    });
  });

  // Check (re)hydrating a class instance is resiliant to circular and shared references
  describe('(Re)Hydrating a class instance is resiliant to circular and shared references', () => {
    // TODO: ...
    it('', () => assert(true));
  });
}
