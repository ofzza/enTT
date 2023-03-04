// enTT HYDRATION @bind decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init';
import { def } from '../../def';
import { bind, dehydrate, rehydrate, HydrationStrategy } from '../';

/**
 * Class decorated with Hydration decorators, used primarily to test the @bind decorator
 */
class TestBinding {
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
  @bind<object, number, string>({
    propertyName: 'propF',
    conversion: {
      dehydrate: v => parseInt(v, 10),
      rehydrate: v => v.toString(),
    },
  })
  // @cast({})
  public propertyF: string = '12345';
}

// Compose a degydrated object to test rehydration from
const dehydratedTestBindingExampleObj = {
  propertyA: 'UPDATED Property A value',
  propertyB: 'UPDATED Property B value',
  propertyC: 'UPDATED Property C value',
  propD: 'UPDATED Property D value',
  propE: 'UPDATED Property E value',
  propF: 67890,
};

// Test ...
export function testsHydrationBindDecoratorAndCompanionServices() {
  // Instantiate a testing instance
  const instance = new TestBinding();

  // Check class isntance can dehydrate all its properties correctly
  it('A class instance with properties using the @bind decorator can dehydrate', () => {
    // Dehydrate the testing instance, making sure to dehydrate all properties
    const dehydratedInstance = dehydrate(instance, HydrationStrategy.AllClassProperties);

    // Check all dehydrated properties exist as expected with values as expected
    assert(Object.keys(dehydratedInstance).includes('propertyA'));
    assert(dehydratedInstance['propertyA'] === 'Property A value');
    assert(Object.keys(dehydratedInstance).includes('propertyB'));
    assert(dehydratedInstance['propertyB'] === 'Property B value');
    assert(Object.keys(dehydratedInstance).includes('propertyC'));
    assert(dehydratedInstance['propertyC'] === 'Property C value');
    assert(Object.keys(dehydratedInstance).includes('propD'));
    assert(dehydratedInstance['propD'] === 'Property D value');
    assert(Object.keys(dehydratedInstance).includes('propE'));
    assert(dehydratedInstance['propE'] === 'Property E value');
    assert(Object.keys(dehydratedInstance).includes('propF'));
    assert(dehydratedInstance['propF'] === 12345);

    // Check no extra properties exist on the dehydrated object
    assert(Object.keys(dehydratedInstance).filter(key => !['propertyA', 'propertyB', 'propertyC', 'propD', 'propE', 'propF'].includes(key)).length === 0);
  });

  // Check dehydration service respects selected hydration strategy
  it('Dehydrating a class instance respects the selected hydration strategy', () => {
    // Dehydrate the testing instance, making sure to dehydrate all properties
    const dehydratedInstanceWithAllProperties = dehydrate(instance, HydrationStrategy.AllClassProperties);
    assert(dehydratedInstanceWithAllProperties['propertyA'] === 'Property A value');
    assert(dehydratedInstanceWithAllProperties['propertyB'] === 'Property B value');
    assert(dehydratedInstanceWithAllProperties['propertyC'] === 'Property C value');
    assert(dehydratedInstanceWithAllProperties['propD'] === 'Property D value');
    assert(dehydratedInstanceWithAllProperties['propE'] === 'Property E value');
    assert(dehydratedInstanceWithAllProperties['propF'] === 12345);

    // Dehydrate the testing instance, making sure to dehydrate all decorated class properties
    const dehydratedInstanceWithAllDecoratedClassProperties = dehydrate(instance, HydrationStrategy.AllDecoratedClassProperties);
    assert(dehydratedInstanceWithAllDecoratedClassProperties['propertyA'] === undefined);
    assert(dehydratedInstanceWithAllDecoratedClassProperties['propertyB'] === 'Property B value');
    assert(dehydratedInstanceWithAllDecoratedClassProperties['propertyC'] === 'Property C value');
    assert(dehydratedInstanceWithAllDecoratedClassProperties['propD'] === 'Property D value');
    assert(dehydratedInstanceWithAllDecoratedClassProperties['propE'] === 'Property E value');
    assert(dehydratedInstanceWithAllDecoratedClassProperties['propF'] === 12345);

    // Dehydrate the testing instance, making sure to dehydrate only bound class properties
    const dehydratedInstanceWithOnlyBoundClassProperties = dehydrate(instance, HydrationStrategy.OnlyBoundClassProperties);
    assert(dehydratedInstanceWithOnlyBoundClassProperties['propertyA'] === undefined);
    assert(dehydratedInstanceWithOnlyBoundClassProperties['propertyB'] === undefined);
    assert(dehydratedInstanceWithOnlyBoundClassProperties['propertyC'] === 'Property C value');
    assert(dehydratedInstanceWithOnlyBoundClassProperties['propD'] === 'Property D value');
    assert(dehydratedInstanceWithOnlyBoundClassProperties['propE'] === 'Property E value');
    assert(dehydratedInstanceWithOnlyBoundClassProperties['propF'] === 12345);
  });

  // Check class isntance can (re)hydrate all its properties correctly
  it('A class instance with properties using the @bind decorator can (re)hydrate', () => {
    // Rehydrate the a testing instance, making sure to rehydrate all properties
    const rehydratedInstanceViaClassParameter = rehydrate(dehydratedTestBindingExampleObj, TestBinding, HydrationStrategy.AllClassProperties);
    const rehydratedInstanceViaDirectClassInstance = rehydrate(dehydratedTestBindingExampleObj, new TestBinding(), HydrationStrategy.AllClassProperties);

    // Check rehydration returns same result when called with a Class or a Class instance as an argument
    assert(JSON.stringify(rehydratedInstanceViaClassParameter) === JSON.stringify(rehydratedInstanceViaDirectClassInstance));

    // Check all rehydrated properties exist as expected with values as expected
    const rehydratedInstance = rehydratedInstanceViaClassParameter;
    assert(Object.keys(rehydratedInstance).includes('propertyA'));
    assert(rehydratedInstance['propertyA'] === 'UPDATED Property A value');
    assert(Object.keys(rehydratedInstance).includes('propertyB'));
    assert(rehydratedInstance['propertyB'] === 'UPDATED Property B value');
    assert(Object.keys(rehydratedInstance).includes('propertyC'));
    assert(rehydratedInstance['propertyC'] === 'UPDATED Property C value');
    assert(Object.keys(rehydratedInstance).includes('propertyD'));
    assert(rehydratedInstance['propertyD'] === 'UPDATED Property D value');
    assert(Object.keys(rehydratedInstance).includes('propertyE'));
    assert(rehydratedInstance['propertyE'] === 'UPDATED Property E value');
    assert(Object.keys(rehydratedInstance).includes('propertyF'));
    assert(rehydratedInstance['propertyF'] === '67890');

    // Check no extra properties exist on the rehydrated object
    assert(
      Object.keys(rehydratedInstance).filter(key => !['propertyA', 'propertyB', 'propertyC', 'propertyD', 'propertyE', 'propertyF'].includes(key)).length === 0,
    );
  });

  // Check (re)hydration service respects selected hydration strategy
  it('(Re)Hydrating a class instance respects the selected hydration strategy', () => {
    // Dehydrate the testing instance, making sure to dehydrate all properties
    const rehydratedInstanceWithAllProperties = rehydrate(dehydratedTestBindingExampleObj, TestBinding, HydrationStrategy.AllClassProperties);
    // Check all properties were dehydrated
    assert(rehydratedInstanceWithAllProperties.propertyA === 'UPDATED Property A value');
    assert(rehydratedInstanceWithAllProperties.propertyB === 'UPDATED Property B value');
    assert(rehydratedInstanceWithAllProperties.propertyC === 'UPDATED Property C value');
    assert(rehydratedInstanceWithAllProperties.propertyD === 'UPDATED Property D value');
    assert(rehydratedInstanceWithAllProperties.propertyE === 'UPDATED Property E value');
    assert(rehydratedInstanceWithAllProperties.propertyF === '67890');

    // Dehydrate the testing instance, making sure to dehydrate all decorated class properties
    const rehydratedInstanceWithAllDecoratedClassProperties = rehydrate(
      dehydratedTestBindingExampleObj,
      TestBinding,
      HydrationStrategy.AllDecoratedClassProperties,
    );
    // Check all properties were dehydrated
    assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyA === 'Property A value');
    assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyB === 'UPDATED Property B value');
    assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyC === 'UPDATED Property C value');
    assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyD === 'UPDATED Property D value');
    assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyE === 'UPDATED Property E value');
    assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyF === '67890');

    // Dehydrate the testing instance, making sure to dehydrate only bound class properties
    const rehydratedInstanceWithOnlyBoundClassProperties = rehydrate(dehydratedTestBindingExampleObj, TestBinding, HydrationStrategy.OnlyBoundClassProperties);
    // Check all properties were dehydrated
    assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyA === 'Property A value');
    assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyB === 'Property B value');
    assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyC === 'UPDATED Property C value');
    assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyD === 'UPDATED Property D value');
    assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyE === 'UPDATED Property E value');
    assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyF === '67890');
  });
}
