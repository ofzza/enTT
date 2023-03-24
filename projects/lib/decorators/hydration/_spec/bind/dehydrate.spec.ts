// enTT HYDRATION @bind decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../../tests.init';
import { dehydrate, rehydrate, HydrationStrategy } from '../../';
import { HYDRATIONS_PER_SECOND, TestBinding, dehydratedTestBindingExampleObj } from './fixtures.spec';

// Test ...
export function testHydrationBindDecoratorDehydrate() {
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

  // Check dehydration service is performant
  it('Dehydrating a class instance respects the selected hydration strategy', () => {
    // Perform as many dehydrations as possible in 100ms
    let count = 0;
    const start = Date.now();
    while (!(count % 1000 === 0 && Date.now() - start >= 100)) {
      dehydrate(instance, HydrationStrategy.AllClassProperties);
      count++;
    }
    const dehydrationsPerSecond = (1000 * count) / (Date.now() - start);

    // Check number of dehydrations per second
    assert(dehydrationsPerSecond > HYDRATIONS_PER_SECOND);
  });
}
