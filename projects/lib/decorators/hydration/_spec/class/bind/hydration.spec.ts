// enTT HYDRATION @bind class decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../../../tests.init';
import { dehydrate, rehydrate } from '../../../';
import { BoundDate, staticDate2000, staticDateIsoString2000 } from './fixtures.spec';

// Test ...
export function testHydrationBindClassDecoratorHydration() {
  // Check decorated class instance can dehydrate using custom dehydration conversion
  describe('Decorated class can be dehydrated using custom dehydration conversion', () => {
    // Dehydrate date
    const dehydrated = dehydrate(staticDate2000);

    // Check dehydrated value is generated using custom dehydration conversion callbacks defined via @bind class decorator
    it('Date can dehydrate as ISO string', () => {
      assert(dehydrated === staticDateIsoString2000);
    });
  });

  // Check decorated class instance can (re)hydrate using custom dehydration conversion
  describe('Decorated class can be (re)hydrated using custom dehydration conversion', () => {
    const rehydrated = rehydrate(staticDateIsoString2000, BoundDate);

    // Check dehydrated value is generated using custom dehydration conversion callbacks defined via @bind class decorator
    it('ISO string can (re)hydrate as Date', () => {
      assert(rehydrated.toISOString() === staticDateIsoString2000);
    });
  });
}
