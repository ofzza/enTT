// enTT HYDRATION @bind class decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';
import { dehydrate, rehydrate } from '../../../';
import { BoundDate, staticDate2000, staticDateIsoString2000 } from './fixtures.spec';

export function testHydrationBindClassDecoratorHydration() {
  describe('Decorated class can be dehydrated using custom dehydration conversion', () => {
    // Dehydrate date
    const dehydrated = dehydrate(staticDate2000);

    it('Date can dehydrate as ISO string', () => {
      assert(dehydrated === staticDateIsoString2000);
    });
  });

  describe('Decorated class can be (re)hydrated using custom dehydration conversion', () => {
    const rehydrated = rehydrate(staticDateIsoString2000, BoundDate);

    it('ISO string can (re)hydrate as Date', () => {
      assert(rehydrated.toISOString() === staticDateIsoString2000);
    });
  });
}
