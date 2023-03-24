// enTT HYDRATION @bind decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../../tests.init';
import { dehydrate, rehydrate, HydrationStrategy } from '../../';
import { HYDRATIONS_PER_SECOND, TestBinding, dehydratedTestBindingExampleObj } from './fixtures.spec';

// Test ...
export function testHydrationBindDecoratorRehydrate() {
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

  // Check rehydration service is performant
  it('(Re)Hydrating a class instance respects the selected hydration strategy', () => {
    // Perform as many dehydrations as possible in 100ms
    let count = 0;
    const start = Date.now();
    while (!(count % 1000 === 0 && Date.now() - start >= 100)) {
      rehydrate(dehydratedTestBindingExampleObj, TestBinding, HydrationStrategy.AllClassProperties);
      count++;
    }
    const rehydrationsPerSecond = (1000 * count) / (Date.now() - start);

    // Check number of dehydrations per second
    assert(rehydrationsPerSecond > HYDRATIONS_PER_SECOND);
  });
}
