// enTT HYDRATION @cast decorator's dehydration testing
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';
import { dehydrate, HydrationStrategy } from '../../../';
import { TestCast, createTestClassInstance } from './fixtures.spec';

export function testHydrationCastDecoratorDehydrate() {
  describe('A class instance with properties using the @cast decorator can dehydrate', () => {
    // Dehydrate the testing instance, making sure to dehydrate all properties
    const dehydratedInstance = dehydrate(createTestClassInstance(), HydrationStrategy.OnlyBoundClassProperties);

    it('Non casting properties with raw values can dehydrate', () => {
      assert(dehydratedInstance['propA'] === 'A');
      assert(dehydratedInstance['propB'] === 'B');
      assert(dehydratedInstance['propC'] === 'C');
    });

    it('Non casting properties containing class instances can dehydrate', () => {
      assert(!!dehydratedInstance['propRaw']);
      assert(dehydratedInstance['propRaw']['propertyA'] === 'A');
      assert(dehydratedInstance['propRaw']['propertyB'] === 'B');
      assert(dehydratedInstance['propRaw']['propertyC'] === 'C');
    });

    it('Casting property with a single class instance value can dehydrate', () => {
      assert(!!dehydratedInstance['propSingle']);
      assert(dehydratedInstance['propSingle']['propA'] === 'A');
      assert(dehydratedInstance['propSingle']['propB'] === 'B');
      assert(dehydratedInstance['propSingle']['propC'] === 'C');
    });

    it('Casting property with a single class instance value can dehydrate while respecting custom binding', () => {
      assert(!!dehydratedInstance['propCustomSingle']);
      assert(dehydratedInstance['propCustomSingle']?.data['propA'] === 'A');
      assert(dehydratedInstance['propCustomSingle']?.data['propB'] === 'B');
      assert(dehydratedInstance['propCustomSingle']?.data['propC'] === 'C');
    });

    it('Casting property with an array of class instance value can dehydrate', () => {
      assert(!!dehydratedInstance['propArray']);
      assert(dehydratedInstance['propArray'].length === 3);
      for (const dehydratedArrayMemberInstance of dehydratedInstance['propArray']) {
        assert(dehydratedArrayMemberInstance['propA'] === 'A');
        assert(dehydratedArrayMemberInstance['propB'] === 'B');
        assert(dehydratedArrayMemberInstance['propC'] === 'C');
      }
    });

    it('Casting property with an array of class instance value can dehydrate while respecting custom binding', () => {
      assert(!!dehydratedInstance['propCustomArray']);
      assert(dehydratedInstance['propCustomArray'].length === 3);
      for (const dehydratedArrayMemberInstance of dehydratedInstance['propCustomArray']) {
        assert(dehydratedArrayMemberInstance?.data['propA'] === 'A');
        assert(dehydratedArrayMemberInstance?.data['propB'] === 'B');
        assert(dehydratedArrayMemberInstance?.data['propC'] === 'C');
      }
    });

    it('Casting property with a hashmap of class instance value can dehydrate', () => {
      assert(!!dehydratedInstance['propHashmap']);
      assert(Object.keys(dehydratedInstance['propHashmap']).length === 3);
      assert(Object.keys(dehydratedInstance['propHashmap']).filter(key => !['a', 'b', 'c'].includes(key)).length === 0);
      for (const dehydratedHashmapMemberInstance of Object.values(dehydratedInstance['propHashmap']) as Array<any>) {
        assert(dehydratedHashmapMemberInstance['propA'] === 'A');
        assert(dehydratedHashmapMemberInstance['propB'] === 'B');
        assert(dehydratedHashmapMemberInstance['propC'] === 'C');
      }
    });

    it('Casting property with a hashmap of class instance value can dehydrate while respecting custom binding', () => {
      assert(!!dehydratedInstance['propCustomHashmap']);
      assert(Object.keys(dehydratedInstance['propCustomHashmap']).length === 3);
      assert(Object.keys(dehydratedInstance['propCustomHashmap']).filter(key => !['a', 'b', 'c'].includes(key)).length === 0);
      for (const dehydratedHashmapMemberInstance of Object.values(dehydratedInstance['propCustomHashmap']) as Array<any>) {
        assert(dehydratedHashmapMemberInstance?.data['propA'] === 'A');
        assert(dehydratedHashmapMemberInstance?.data['propB'] === 'B');
        assert(dehydratedHashmapMemberInstance?.data['propC'] === 'C');
      }
    });
  });

  describe('Casting undefined while dehydrating preserves undefined', () => {
    // Compose a testing instance with undefined property values
    const instance = createTestClassInstance();
    instance.propertySingle = undefined;
    instance.propertyCustomSingle = undefined;
    instance.propertyArray![1] = undefined as unknown as TestCast;
    instance.propertyCustomArray = undefined;
    instance.propertyHashmap!['b'] = undefined as unknown as TestCast;
    instance.propertyCustomHashmap = undefined;

    it('Dehydrating properties with undefined values', () => {
      // Dehydrate the testing instance containing undefined property values
      const dehydratedInstance = dehydrate(instance, HydrationStrategy.OnlyBoundClassProperties);
      // Test for preserved undefined values
      assert(dehydratedInstance['propSingle'] === undefined); // Value not set (still seen as undefined)
      assert(dehydratedInstance['propArray'] instanceof Array);
      assert(dehydratedInstance['propArray'].length === 2); // Undefined members of the array skipped
      assert(dehydratedInstance['propHashmap'] instanceof Object);
      assert(Object.keys(dehydratedInstance['propHashmap']).length === 2); // Undefined members of the hashmap skipped
      // Test for respected custom binding where custom binding
      assert(dehydratedInstance['propCustomSingle'] instanceof Object);
      assert(Object.keys(dehydratedInstance['propCustomSingle']).length === 1);
      assert(dehydratedInstance['propCustomSingle']?.data === undefined); // Custom binding set value based on received undefined
      assert(dehydratedInstance['propCustomArray'] instanceof Array);
      assert(dehydratedInstance['propCustomArray'].length === 0); // Custom binding set value based on received undefined
      assert(dehydratedInstance['propCustomHashmap'] instanceof Object);
      assert(Object.keys(dehydratedInstance['propCustomHashmap']).length === 0); // Custom binding set value based on received undefined

      // Try setting array and hashmap cast properties to undefined
      instance.propertyArray = undefined;
      instance.propertyHashmap = undefined;
      // (Re)Hydrate the testing object containing undefined property values
      const dehydratedInstanceWithUndefinedCollections = dehydrate(instance, HydrationStrategy.OnlyBoundClassProperties);
      // Test for preserved undefined values
      assert(dehydratedInstanceWithUndefinedCollections['propArray'] === undefined); // Undefined values are skipped and default to undefined
      assert(dehydratedInstanceWithUndefinedCollections['propHashmap'] === undefined); // Undefined values are skipped and default to undefined
    });
  });

  describe('Dehydrating a non-class-instance value throws in all cases', () => {
    const instanceTestingSingle = createTestClassInstance();
    instanceTestingSingle.propertySingle = { ...instanceTestingSingle.propertySingle } as TestCast;
    it(`Single not castable value throws`, () => {
      expect(() => dehydrate(instanceTestingSingle, HydrationStrategy.AllClassProperties)).toThrow();
    });

    const instanceTestingArray = createTestClassInstance();
    instanceTestingArray.propertyArray![1] = { ...instanceTestingArray.propertyArray![1] } as TestCast;
    it(`Array containing a not castable value throws`, () => {
      expect(() => dehydrate(instanceTestingArray, HydrationStrategy.AllClassProperties)).toThrow();
    });

    const instanceTestingHashmap = createTestClassInstance();
    instanceTestingHashmap.propertyHashmap!['b'] = { ...instanceTestingHashmap.propertyHashmap!['b'] } as TestCast;
    it(`Hashmap containing a not castable value throws`, () => {
      expect(() => dehydrate(instanceTestingHashmap, HydrationStrategy.AllClassProperties)).toThrow();
    });
  });

  describe('Dehydrating a class instance is resiliant to circular and shared references', () => {
    // TODO: ...
    it('Test not implemented!', () =>
      expect(() => {
        throw new Error('Test not implemented!');
      }).toThrow());
  });
}
