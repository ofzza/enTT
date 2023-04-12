// enTT HYDRATION @cast decorator test fixtures
// ----------------------------------------------------------------------------

// Import dependencies
import { def } from '../../../../def';
import { bindConstructorArguments, bindProperty, cast, CastAs } from '../../../';

// Import existing fixtures
import {
  BoundDate,
  staticDate2000,
  staticDate2010,
  staticDate2020,
  staticDateIsoString2000,
  staticDateIsoString2010,
  staticDateIsoString2020,
} from '../bind/fixtures.spec';
export { BoundDate, staticDate2000, staticDate2010, staticDate2020, staticDateIsoString2000, staticDateIsoString2010, staticDateIsoString2020 };

/**
 * Class decorated with Hydration decorators, used primarily to test the @cast decorator
 */
@bindConstructorArguments({
  conversion: {
    // Dehydrate to empty(ish) object, allowing per-property binding and casting to work
    dehydrate: () => ({ _constructor: 'DateCast' }),
    // If provided a string to rehydrate from, use the string as ISO date value, else use default date value
    rehydrate: obj => (typeof obj === 'string' ? new DateCast(obj) : new DateCast(staticDateIsoString2000)),
  },
})
export class DateCast {
  /**
   * Constructor arguments required to construct the class
   */
  constructor(dateIsoString: string) {
    // Initialize properties
    this.propDate = new BoundDate(dateIsoString);
    this.propDateArray = [new BoundDate(dateIsoString), new BoundDate(dateIsoString), new BoundDate(dateIsoString)];
    this.propDateHashmap = { a: new BoundDate(dateIsoString), b: new BoundDate(dateIsoString), c: new BoundDate(dateIsoString) };
  }

  /**
   * Date property
   */
  @def
  @bindProperty('propDate')
  @cast(BoundDate, CastAs.SingleInstance)
  public propDate!: BoundDate;

  /**
   * Date array property
   */
  @def
  @bindProperty('propDateArray')
  @cast(BoundDate, CastAs.ArrayOfInstances)
  public propDateArray!: Array<BoundDate>;

  /**
   * Date hashmap property
   */
  @def
  @bindProperty('propDateHashmap')
  @cast(BoundDate, CastAs.HashmapOfInstances)
  public propDateHashmap!: Record<PropertyKey, BoundDate>;
}
