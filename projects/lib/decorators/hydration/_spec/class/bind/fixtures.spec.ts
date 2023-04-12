// enTT HYDRATION @bind decorator test fixtures
// ----------------------------------------------------------------------------

// Import dependencies
import { def } from '../../../../def';
import { bind } from '../../../';

/**
 * Overridden system class (as not to polute base class, works the same with base class) decorated with Hydration decorators,
 * used primarily to test the @bind class decorator
 */
export class BoundDate extends Date {}

// Decorate existing class (TODO: Try getting rid of the explicit generic and infer from class being decorated?!)
bind<BoundDate>({
  conversion: {
    dehydrate: date => date.toISOString(),
    rehydrate: str => new BoundDate(str),
  },
})(BoundDate);

/**
 * A known date
 */
export const staticDate2000 = new BoundDate(BoundDate.UTC(2000, 0, 1, 0, 0, 0, 0));
/**
 * A known date
 */
export const staticDate2010 = new BoundDate(BoundDate.UTC(2010, 0, 1, 0, 0, 0, 0));
/**
 * A known date
 */
export const staticDate2020 = new BoundDate(BoundDate.UTC(2020, 0, 1, 0, 0, 0, 0));
/**
 * A known date ISO string
 */
export const staticDateIsoString2000 = staticDate2000.toISOString();
/**
 * A known date ISO string
 */
export const staticDateIsoString2010 = staticDate2010.toISOString();
/**
 * A known date ISO string
 */
export const staticDateIsoString2020 = staticDate2020.toISOString();
