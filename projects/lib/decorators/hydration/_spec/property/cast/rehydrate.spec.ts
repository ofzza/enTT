// enTT HYDRATION @cast decorator's dehydration testing
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';
import { rehydrate, HydrationStrategy } from '../../../';
import { TestCast, createDehydratedTestCastExampleObj } from './fixtures.spec';

export function testHydrationCastDecoratorRehydrate() {
  describe('A class instance with properties using the @cast decorator can (re)hydrate and will cast', () => {
    // Rehydrate the a testing instance, making sure to rehydrate all properties
    const rehydratedInstanceViaClassParameter = rehydrate(createDehydratedTestCastExampleObj(), TestCast, HydrationStrategy.AllClassProperties);
    const rehydratedInstanceViaDirectClassInstance = rehydrate(createDehydratedTestCastExampleObj(), new TestCast(), HydrationStrategy.AllClassProperties);
    const rehydratedInstance = rehydratedInstanceViaClassParameter;

    it('(Re)Hydration with casting properties works the same when given a class or class instance as a target argument', () => {
      assert(JSON.stringify(rehydratedInstanceViaClassParameter) === JSON.stringify(rehydratedInstanceViaDirectClassInstance));
    });

    it('Non casting properties with raw values can (re)hydrate', () => {
      assert(rehydratedInstance.propertyA === 'Value A');
      assert(rehydratedInstance.propertyB === 'Value B');
      assert(rehydratedInstance.propertyC === 'Value C');
    });

    it('Non casting properties containing class instances can (re)hydrate', () => {
      assert(!!rehydratedInstance.propertyRaw);
      assert(rehydratedInstance.propertyRaw?.['propA'] === 'Value A');
      assert(rehydratedInstance.propertyRaw?.['propB'] === 'Value B');
      assert(rehydratedInstance.propertyRaw?.['propC'] === 'Value C');
    });

    it('Casting property with a single class instance value can (re)hydrate', () => {
      assert(!!rehydratedInstance.propertySingle);
      assert(rehydratedInstance.propertySingle?.propertyA === 'Value A');
      assert(rehydratedInstance.propertySingle?.propertyB === 'Value B');
      assert(rehydratedInstance.propertySingle?.propertyC === 'Value C');
    });

    it('Casting property with a single class instance value can (re)hydrate while respecting custom binding', () => {
      assert(!!rehydratedInstance.propertyCustomSingle);
      assert(rehydratedInstance.propertyCustomSingle?.propertyA === 'Value A');
      assert(rehydratedInstance.propertyCustomSingle?.propertyB === 'Value B');
      assert(rehydratedInstance.propertyCustomSingle?.propertyC === 'Value C');
    });

    it('Casting property with an array of class instance value can (re)hydrate', () => {
      assert(!!rehydratedInstance.propertyArray);
      assert(rehydratedInstance.propertyArray?.length === 3);
      for (const rehydratedArrayMemberInstance of rehydratedInstance.propertyArray || []) {
        assert(rehydratedArrayMemberInstance.propertyA === 'Value A');
        assert(rehydratedArrayMemberInstance.propertyB === 'Value B');
        assert(rehydratedArrayMemberInstance.propertyC === 'Value C');
      }
    });

    it('Casting property with an array of class instance value can (re)hydrate while respecting custom binding', () => {
      assert(!!rehydratedInstance.propertyCustomArray);
      assert(rehydratedInstance.propertyCustomArray?.length === 3);
      for (const rehydratedArrayMemberInstance of rehydratedInstance.propertyCustomArray || []) {
        assert(rehydratedArrayMemberInstance.propertyA === 'Value A');
        assert(rehydratedArrayMemberInstance.propertyB === 'Value B');
        assert(rehydratedArrayMemberInstance.propertyC === 'Value C');
      }
    });

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

  describe('Casting undefined while (re)hydrating preserves undefined', () => {
    // Compose a testing instance with undefined property values
    const value = createDehydratedTestCastExampleObj();
    value['propSingle'] = undefined;
    value['propCustomSingle'] = undefined;
    value['propArray']![1] = undefined as unknown as TestCast;
    value['propCustomArray'] = undefined;
    value['propHashmap']!['b'] = undefined as unknown as TestCast;
    value['propCustomHashmap'] = undefined;

    it('(Re)Hydrating properties with undefined values', () => {
      // (Re)Hydrate the testing object containing undefined property values
      const rehydratedInstance = rehydrate(value, TestCast, HydrationStrategy.OnlyBoundClassProperties);
      // Test for preserved undefined values
      assert(rehydratedInstance.propertySingle === undefined); // Value not set (still seen as undefined)
      assert(rehydratedInstance.propertyArray instanceof Array);
      assert(rehydratedInstance.propertyArray!.length === 2); // Undefined members of the array skipped
      assert(rehydratedInstance.propertyHashmap instanceof Object);
      assert(Object.keys(rehydratedInstance.propertyHashmap!).length === 2); // Undefined members of the hashmap skipped
      // Test for respected custom binding where custom binding
      assert(rehydratedInstance.propertyCustomSingle === undefined); // Custom binding set value based on received undefined
      assert(rehydratedInstance.propertyCustomArray instanceof Array);
      assert(rehydratedInstance.propertyCustomArray!.length === 0); // Custom binding set value based on received undefined
      assert(rehydratedInstance.propertyCustomHashmap instanceof Object);
      assert(Object.keys(rehydratedInstance.propertyCustomHashmap!).length === 0); // Custom binding set value based on received undefined

      // Try setting array and hashmap cast properties to undefined
      value['propArray'] = undefined;
      value['propHashmap'] = undefined;
      // (Re)Hydrate the testing object containing undefined property values
      const rehydratedInstanceWithUndefinedCollections = rehydrate(value, TestCast, HydrationStrategy.OnlyBoundClassProperties);
      // Test for preserved undefined values
      assert(rehydratedInstanceWithUndefinedCollections.propertyArray === undefined); // Undefined values are skipped and default to class' default initialized value
      assert(rehydratedInstanceWithUndefinedCollections.propertyHashmap === undefined); // Undefined values are skipped and default to class' default initialized value
    });
  });

  describe('(Re)Hydrating a class instance is resiliant to circular and shared references', () => {
    // TODO: ...
    it('Test not implemented!', () =>
      expect(() => {
        throw new Error('Test not implemented!');
      }).toThrow());
  });

  describe('(Re)Hydration to an existing instance from a partial dehydrated object is possible', () => {
    // TODO: ...
    it('Test not implemented!', () =>
      expect(() => {
        throw new Error('Test not implemented!');
      }).toThrow());
  });
}
