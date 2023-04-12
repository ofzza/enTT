// enTT HYDRATION @cast decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../../../tests.init';
import { dehydrate, rehydrate } from '../../../';
import { DateCast, BoundDate, staticDateIsoString2000, staticDateIsoString2010, staticDateIsoString2020 } from './fixtures.spec';

// Test ...
export function testHydrationCastDecoratorHydration() {
  // Check decorated class instance can dehydrate using custom dehydration conversion and can cast properties to decorated classes
  describe('Decorated class can be dehydrated using custom dehydration conversion and can cast properties to decorated classes ', () => {
    // Instantiate test class
    const instance = new DateCast(staticDateIsoString2000);
    // Dehydrate date
    const dehydrated = dehydrate(instance);

    // Check dehydrated value is generated using custom dehydration conversion callbacks defined via @bind class decorator
    it('Decorated class can dehydrate using custom dehydration conversion', () => {
      assert(dehydrated instanceof Object);
      assert(dehydrated._constructor === 'DateCast');
    });

    // Check dehydrated value has cast all properties using their cast target's custom dehydration conversion callbacks defined via @bind class decorator
    it("Decorated class can cast all properties using their cast target's custom dehydration conversion callbacks", () => {
      // Assert properly cast single instance
      assert(!!dehydrated.propDate);
      assert(dehydrated.propDate === staticDateIsoString2000);
      // Assert properly cast array of instances
      assert(!!dehydrated.propDateArray);
      assert(dehydrated.propDateArray.length === 3);
      (dehydrated.propDateArray as string[]).forEach(value => assert(value === staticDateIsoString2000));
      // Assert properly cast hashmap of instances
      assert(!!dehydrated.propDateHashmap);
      assert(Object.keys(dehydrated.propDateHashmap).length === 3);
      (Object.keys(dehydrated.propDateHashmap) as string[]).forEach(key => assert(dehydrated.propDateHashmap[key] === staticDateIsoString2000));
    });
  });

  // Check decorated class instance can (re)hydrate using custom dehydration conversion and can cast properties to decorated classes
  describe('Decorated class can be (re)hydrated using custom dehydration conversion and can cast properties to decorated classes ', () => {
    // Instantiate test class
    const instance = new DateCast(staticDateIsoString2010);
    // (Re)Hydrate date
    const dehydrated = dehydrate(instance);
    // (Re)Hydrate
    const rehydratedFromObject = rehydrate(dehydrated, DateCast);
    const rehydratedFromString = rehydrate(staticDateIsoString2020, DateCast);
    const rehydratedFromUndefined = rehydrate(undefined, DateCast);

    // Check (re)hydrated instance is generated using custom (re)hydration conversion callbacks defined via @bind class decorator
    it('ISO string can (re)hydrate as Date', () => {
      assert(rehydratedFromObject instanceof DateCast);
      assert(rehydratedFromString instanceof DateCast);
      assert(rehydratedFromUndefined instanceof DateCast);
    });

    // Check (re)hydrated value has cast all properties using their cast target's custom (re)hydration conversion callbacks defined via @bind class decorator
    it("Decorated class can cast all properties using their cast target's custom (re)hydration conversion callbacks", () => {
      // Assert properly cast single instance from dehydrated object
      assert(rehydratedFromObject.propDate instanceof BoundDate);
      assert(rehydratedFromObject.propDate.toISOString() === staticDateIsoString2010);
      // Assert properly cast array of instances from dehydrated object
      assert(!!rehydratedFromObject.propDateArray);
      assert(rehydratedFromObject.propDateArray.length === 3);
      (rehydratedFromObject.propDateArray as BoundDate[]).forEach(date => {
        assert(date instanceof BoundDate);
        assert(date.toISOString() === staticDateIsoString2010);
      });
      // Assert properly cast hashmap of instances from dehydrated object
      assert(!!rehydratedFromObject.propDateHashmap);
      assert(Object.keys(rehydratedFromObject.propDateHashmap).length === 3);
      (Object.keys(rehydratedFromObject.propDateHashmap) as string[]).forEach(key => {
        assert(rehydratedFromObject.propDateHashmap[key] instanceof BoundDate);
        assert(rehydratedFromObject.propDateHashmap[key].toISOString() === staticDateIsoString2010);
      });

      // Assert properly cast single instance from ISO date string using custom (re)hydration conversion callback
      assert(rehydratedFromString.propDate instanceof BoundDate);
      assert(rehydratedFromString.propDate.toISOString() === staticDateIsoString2020);
      // Assert properly cast array of instances from ISO date string using custom (re)hydration conversion callback
      assert(!!rehydratedFromString.propDateArray);
      assert(rehydratedFromString.propDateArray.length === 3);
      (rehydratedFromString.propDateArray as BoundDate[]).forEach(date => {
        assert(date instanceof BoundDate);
        assert(date.toISOString() === staticDateIsoString2020);
      });
      // Assert properly cast hashmap of instances from ISO date string using custom (re)hydration conversion callback
      assert(!!rehydratedFromString.propDateHashmap);
      assert(Object.keys(rehydratedFromString.propDateHashmap).length === 3);
      (Object.keys(rehydratedFromString.propDateHashmap) as string[]).forEach(key => {
        assert(rehydratedFromString.propDateHashmap[key] instanceof BoundDate);
        assert(rehydratedFromString.propDateHashmap[key].toISOString() === staticDateIsoString2020);
      });

      // Assert properly cast single instance from undefined using custom (re)hydration conversion callback
      assert(rehydratedFromUndefined.propDate instanceof BoundDate);
      assert(rehydratedFromUndefined.propDate.toISOString() === staticDateIsoString2000);
      // Assert properly cast array of instances from undefined using custom (re)hydration conversion callback
      assert(!!rehydratedFromUndefined.propDateArray);
      assert(rehydratedFromUndefined.propDateArray.length === 3);
      (rehydratedFromUndefined.propDateArray as BoundDate[]).forEach(date => {
        assert(date instanceof BoundDate);
        assert(date.toISOString() === staticDateIsoString2000);
      });
      // Assert properly cast hashmap of instances from undefined using custom (re)hydration conversion callback
      assert(!!rehydratedFromUndefined.propDateHashmap);
      assert(Object.keys(rehydratedFromUndefined.propDateHashmap).length === 3);
      (Object.keys(rehydratedFromUndefined.propDateHashmap) as string[]).forEach(key => {
        assert(rehydratedFromUndefined.propDateHashmap[key] instanceof BoundDate);
        assert(rehydratedFromUndefined.propDateHashmap[key].toISOString() === staticDateIsoString2000);
      });
    });
  });
}
