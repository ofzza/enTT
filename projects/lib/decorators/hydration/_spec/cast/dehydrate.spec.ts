// enTT HYDRATION @cast decorator's dehydration testing
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../../tests.init';
import { dehydrate, HydrationStrategy } from '../../';
import { TestCast, createTestClassInstance } from './fixtures.spec';

// Test ...
export function testHydrationCastDecoratorDehydrate() {
  // Check class instance can dehydrate all its properties correctly
  describe('A class instance with properties using the @cast decorator can dehydrate', () => {
    // Dehydrate the testing instance, making sure to dehydrate all properties
    const dehydratedInstance = dehydrate(createTestClassInstance(), HydrationStrategy.OnlyBoundClassProperties);

    // Check all dehydrated direct value properties exist as expected with values as expected
    it('Non casting properties with raw values can dehydrate', () => {
      assert(dehydratedInstance['propA'] === 'A');
      assert(dehydratedInstance['propB'] === 'B');
      assert(dehydratedInstance['propC'] === 'C');
    });
    // Check all dehydrated direct value properties exist on a non-cast embeddded instance as expected with values as expected
    it('Non casting properties containing class instances can dehydrate', () => {
      assert(!!dehydratedInstance['propRaw']);
      assert(dehydratedInstance['propRaw']['propertyA'] === 'A');
      assert(dehydratedInstance['propRaw']['propertyB'] === 'B');
      assert(dehydratedInstance['propRaw']['propertyC'] === 'C');
    });
    // Check all dehydrated direct value properties exist on a cast embeddded instance as expected with values as expected,
    // respecting bindings from the cast class
    it('Casting property with a single class instance value can dehydrate', () => {
      assert(!!dehydratedInstance['propSingle']);
      assert(dehydratedInstance['propSingle']['propA'] === 'A');
      assert(dehydratedInstance['propSingle']['propB'] === 'B');
      assert(dehydratedInstance['propSingle']['propC'] === 'C');
    });
    // ... and respecting custom bindings
    it('Casting property with a single class instance value can dehydrate while respecting custom binding', () => {
      assert(!!dehydratedInstance['propCustomSingle']);
      assert(dehydratedInstance['propCustomSingle']?.data['propA'] === 'A');
      assert(dehydratedInstance['propCustomSingle']?.data['propB'] === 'B');
      assert(dehydratedInstance['propCustomSingle']?.data['propC'] === 'C');
    });
    // Check all dehydrated direct value properties exist on a cast embeddded array of instances as expected with values as expected,
    // respecting bindings from the cast class
    it('Casting property with an array of class instance value can dehydrate', () => {
      assert(!!dehydratedInstance['propArray']);
      assert(dehydratedInstance['propArray'].length === 3);
      for (const dehydratedArrayMemberInstance of dehydratedInstance['propArray']) {
        assert(dehydratedArrayMemberInstance['propA'] === 'A');
        assert(dehydratedArrayMemberInstance['propB'] === 'B');
        assert(dehydratedArrayMemberInstance['propC'] === 'C');
      }
    });
    // ... and respecting custom bindings
    it('Casting property with an array of class instance value can dehydrate while respecting custom binding', () => {
      assert(!!dehydratedInstance['propCustomArray']);
      assert(dehydratedInstance['propCustomArray'].length === 3);
      for (const dehydratedArrayMemberInstance of dehydratedInstance['propCustomArray']) {
        assert(dehydratedArrayMemberInstance?.data['propA'] === 'A');
        assert(dehydratedArrayMemberInstance?.data['propB'] === 'B');
        assert(dehydratedArrayMemberInstance?.data['propC'] === 'C');
      }
    });
    // Check all dehydrated direct value properties exist on a cast embeddded hashmap of instances as expected with values as expected,
    // respecting bindings from the cast class
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
    // ... and respecting custom bindings
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

  // Check casting undefined while dehydrating preserves undefined
  describe('Casting undefined while dehydrating preserves undefined', () => {
    // Compose a testing instance with undefined property values
    const instance = createTestClassInstance();
    instance.propertySingle = undefined;
    instance.propertyCustomSingle = undefined;
    instance.propertyArray![1] = undefined as unknown as TestCast;
    instance.propertyCustomArray = undefined;
    instance.propertyHashmap!['b'] = undefined as unknown as TestCast;
    instance.propertyCustomHashmap = undefined;
    // Dehydrate the testing instance containing undefined property values
    const dehydratedInstance = dehydrate(instance, HydrationStrategy.OnlyBoundClassProperties);

    // Verify dehydrating properties with undefined behavior: CastUndefined.Preserve
    it('Dehydrating properties with undefined behavior: CastUndefined.Preserve', () => {
      assert(dehydratedInstance['propSingle'] === undefined);
      assert(dehydratedInstance['propCustomSingle'] === undefined);
      assert(dehydratedInstance['propArray'][1] === undefined);
      assert(dehydratedInstance['propCustomArray'] === undefined);
      assert(dehydratedInstance['propHashmap']['b'] === undefined);
      assert(dehydratedInstance['propCustomHashmap'] === undefined);
    });

    // Verify dehydrating properties with undefined behavior: CastUndefined.Skip
    it('Dehydrating properties with undefined behavior: CastUndefined.Skip', () => {
      // TODO: ...
      assert(true);
    });

    // Verify dehydrating properties with undefined behavior: CastUndefined.CoerseIntoCastingDefault
    it('Dehydrating properties with undefined behavior: CastUndefined.CoerseIntoCastingDefault', () => {
      // TODO: ...
      assert(true);
    });
  });

  // Check dehydrating a class instance respects strictness settings in all cases
  describe('Dehydrating a non-class-instance value respects strictness settings in all cases', () => {
    // Do not throw when dehydrating a non-class-instance value in a non-strict property
    const instanceTestingSingle = createTestClassInstance();
    instanceTestingSingle.propertySingle = { ...instanceTestingSingle.propertySingle } as TestCast;
    it(`Single not castable value won't throw when property not configured with strict casting`, () => {
      expect(() => dehydrate(instanceTestingSingle, HydrationStrategy.AllClassProperties)).not.toThrow();
    });
    // ... except when forcing strict dehydration
    it(`Single not castable value will throw when forcing a strict dehydration`, () => {
      expect(() => dehydrate(instanceTestingSingle, HydrationStrategy.AllClassProperties, { strict: true })).toThrow();
    });
    // Do throw when dehydrating a non-class-instance value in a strict property
    const instanceTestingCustomSingle = createTestClassInstance();
    instanceTestingCustomSingle.propertyCustomSingle = { ...instanceTestingCustomSingle.propertyCustomSingle } as TestCast;
    it(`Single not castable value will throw when property configured with strict casting`, () => {
      expect(() => dehydrate(instanceTestingCustomSingle, HydrationStrategy.AllClassProperties)).toThrow();
    });
    // ... except when forcing non-strict dehydration
    it(`Single not castable value won't throw when forcing a non-strict dehydration`, () => {
      expect(() => dehydrate(instanceTestingCustomSingle, HydrationStrategy.AllClassProperties, { strict: false })).not.toThrow();
    });

    // Do not throw when dehydrating a non-class-instance containing array in a non-strict property
    const instanceTestingArray = createTestClassInstance();
    instanceTestingArray.propertyArray![1] = { ...instanceTestingArray.propertyArray![1] } as TestCast;
    it(`Array containing a not castable value won't throw when property not configured with strict casting`, () => {
      expect(() => dehydrate(instanceTestingArray, HydrationStrategy.AllClassProperties)).not.toThrow();
    });
    // ... except when forcing strict dehydration
    it(`Array containing a not castable value will throw when forcing a strict dehydration`, () => {
      expect(() => dehydrate(instanceTestingArray, HydrationStrategy.AllClassProperties, { strict: true })).toThrow();
    });
    // Do throw when dehydrating a non-class-instance containing array in a strict property
    const instanceTestingCustomArray = createTestClassInstance();
    instanceTestingCustomArray.propertyCustomArray![1] = { ...instanceTestingCustomArray.propertyCustomArray![1] } as TestCast;
    it(`Array containing a  not castable value will throw when property configured with strict casting`, () => {
      expect(() => dehydrate(instanceTestingCustomArray, HydrationStrategy.AllClassProperties)).toThrow();
    });
    // ... except when forcing non-strict dehydration
    it(`Array containing a not castable value won't throw when forcing a non-strict dehydration`, () => {
      expect(() => dehydrate(instanceTestingCustomArray, HydrationStrategy.AllClassProperties, { strict: false })).not.toThrow();
    });

    // Do not throw when dehydrating a non-class-instance containing hashmap in a non-strict property
    const instanceTestingHashmap = createTestClassInstance();
    instanceTestingHashmap.propertyHashmap!['b'] = { ...instanceTestingHashmap.propertyHashmap!['b'] } as TestCast;
    it(`Hashmap containing a not castable value won't throw when property not configured with strict casting`, () => {
      expect(() => dehydrate(instanceTestingHashmap, HydrationStrategy.AllClassProperties)).not.toThrow();
    });
    // ... except when forcing strict dehydration
    it(`Hashmap containing a not castable value will throw when forcing a strict dehydration`, () => {
      expect(() => dehydrate(instanceTestingHashmap, HydrationStrategy.AllClassProperties, { strict: true })).toThrow();
    });
    // Do throw when dehydrating a non-class-instance containing hashmap in a strict property
    const instanceTestingCustomHashmap = createTestClassInstance();
    instanceTestingCustomHashmap.propertyCustomHashmap!['b'] = { ...instanceTestingCustomHashmap.propertyCustomHashmap!['b'] } as TestCast;
    it(`Hashmap containing a not castable value will throw when property configured with strict casting`, () => {
      expect(() => dehydrate(instanceTestingCustomHashmap, HydrationStrategy.AllClassProperties)).toThrow();
    });
    // ... except when forcing non-strict dehydration
    it(`Hashmap containing a Single not castable value won't throw when forcing a non-strict dehydration`, () => {
      expect(() => dehydrate(instanceTestingCustomHashmap, HydrationStrategy.AllClassProperties, { strict: false })).not.toThrow();
    });
  });

  // Check dehydrating a class instance is resiliant to circular and shared references
  describe('Dehydrating a class instance is resiliant to circular and shared references', () => {
    // TODO: ...
    it('', () => assert(true));
  });
}
