// enTT HYDRATION @bind decorator test fixtures
// ----------------------------------------------------------------------------

// Import dependencies
import { enttify } from '../../../../../';
import { def } from '../../../../def';
import { bind } from '../../../';

// Set minimal expected number of hydrations performed per second
export const HYDRATIONS_PER_SECOND = 10000;

/**
 * Class decorated with Hydration decorators, used primarily to test the @bind class properties decorator
 */
export class TestBinding {
  constructor() {}

  // Testing a property no decorators
  public propertyA: string = 'Property A value';

  // Testing a property with no binding
  @def
  public propertyB: string = 'Property B value';

  // Testing a property with unconfigured binding
  @def
  @bind()
  public propertyC: string = 'Property C value';

  // Testing a property with binding configured only with property name as string
  @def
  @bind('propD')
  public propertyD: string = 'Property D value';

  // Testing a property with binding configured only with property name as a partial configuration object
  @def
  @bind({
    propertyName: 'propE',
  })
  public propertyE: string = 'Property E value';

  // Testing a property with binding and conversion configured using a full form configuration object
  @def
  @bind<object, string, number>({
    propertyName: 'propF',
    conversion: {
      dehydrate: v => parseInt(v, 10),
      rehydrate: v => v.toString(),
    },
  })
  // @cast({})
  public propertyF: string = '12345';
}
/**
 * Enttified class decorated with Hydration decorators, used primarily to test the @bind class properties decorator
 */
export const EnttifiedTestBinding = enttify(TestBinding);

// Compose a degydrated object to test rehydration
export const dehydratedTestBindingExampleObj = {
  propertyA: 'UPDATED Property A value',
  propertyB: 'UPDATED Property B value',
  propertyC: 'UPDATED Property C value',
  propD: 'UPDATED Property D value',
  propE: 'UPDATED Property E value',
  propF: 67890,
};
