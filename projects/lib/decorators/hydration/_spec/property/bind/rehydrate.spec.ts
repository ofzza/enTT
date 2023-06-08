// enTT HYDRATION @bind properties decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';
import { rehydrate, HydrationStrategy } from '../../../';
import { HYDRATIONS_PER_SECOND, TestBinding, EnttifiedTestBinding, dehydratedTestBindingExampleObj } from './fixtures.spec';

// Test ...
export function testHydrationBindPropertyDecoratorRehydrate() {
  // Check class isntance can (re)hydrate all its properties correctly
  describe('A class instance with properties using the @bind decorator can (re)hydrate', () => {
    // Rehydrate the a testing instance, making sure to rehydrate all properties
    const rehydratedInstanceViaClassParameter = rehydrate(dehydratedTestBindingExampleObj, TestBinding, HydrationStrategy.AllClassProperties);
    const rehydratedInstanceViaDirectClassInstance = rehydrate(dehydratedTestBindingExampleObj, new TestBinding(), HydrationStrategy.AllClassProperties);

    // Check rehydration returns same result when called with a Class or a Class instance as an argument
    it('(Re)Hydration works the same when given a class or class instance as a target argument', () => {
      assert(JSON.stringify(rehydratedInstanceViaClassParameter) === JSON.stringify(rehydratedInstanceViaDirectClassInstance));
    });

    // Check all rehydrated properties exist as expected with values as expected
    const rehydratedInstance = rehydratedInstanceViaClassParameter;
    it('All properties exist on (re)hydrated instance', () => {
      assert(Object.keys(rehydratedInstance).includes('propertyA'));
      assert(rehydratedInstance.propertyA === 'UPDATED Property A value');
      assert(Object.keys(rehydratedInstance).includes('propertyB'));
      assert(rehydratedInstance.propertyB === 'UPDATED Property B value');
      assert(Object.keys(rehydratedInstance).includes('propertyC'));
      assert(rehydratedInstance.propertyC === 'UPDATED Property C value');
      assert(Object.keys(rehydratedInstance).includes('propertyD'));
      assert(rehydratedInstance.propertyD === 'UPDATED Property D value');
      assert(Object.keys(rehydratedInstance).includes('propertyE'));
      assert(rehydratedInstance.propertyE === 'UPDATED Property E value');
      assert(Object.keys(rehydratedInstance).includes('propertyF'));
      assert(rehydratedInstance.propertyF === '67890');
    });

    // Check no extra properties exist on the rehydrated object
    it('No extra properties exist on (re)hydrated instance', () => {
      assert(
        Object.keys(rehydratedInstance).filter(key => !['propertyA', 'propertyB', 'propertyC', 'propertyD', 'propertyE', 'propertyF'].includes(key)).length ===
          0,
      );
    });
  });

  // Check class isntance can (re)hydrate all its properties correctly
  describe('An enttified class instance with properties using the @bind decorator can (re)hydrate', () => {
    // Rehydrate the a testing instance, making sure to rehydrate all properties
    const rehydratedInstanceViaClassParameter = rehydrate(dehydratedTestBindingExampleObj, EnttifiedTestBinding, HydrationStrategy.AllClassProperties);
    const rehydratedInstanceViaDirectClassInstance = rehydrate(
      dehydratedTestBindingExampleObj,
      new EnttifiedTestBinding(),
      HydrationStrategy.AllClassProperties,
    );

    // Check rehydration returns same result when called with a Class or a Class instance as an argument
    it('(Re)Hydration works the same when given a class or class instance as a target argument', () => {
      assert(JSON.stringify(rehydratedInstanceViaClassParameter) === JSON.stringify(rehydratedInstanceViaDirectClassInstance));
    });

    // Check all rehydrated properties exist as expected with values as expected
    const rehydratedInstance = rehydratedInstanceViaClassParameter;
    it('All properties exist on (re)hydrated instance', () => {
      assert(Object.keys(rehydratedInstance).includes('propertyA'));
      assert(rehydratedInstance.propertyA === 'UPDATED Property A value');
      assert(Object.keys(rehydratedInstance).includes('propertyB'));
      assert(rehydratedInstance.propertyB === 'UPDATED Property B value');
      assert(Object.keys(rehydratedInstance).includes('propertyC'));
      assert(rehydratedInstance.propertyC === 'UPDATED Property C value');
      assert(Object.keys(rehydratedInstance).includes('propertyD'));
      assert(rehydratedInstance.propertyD === 'UPDATED Property D value');
      assert(Object.keys(rehydratedInstance).includes('propertyE'));
      assert(rehydratedInstance.propertyE === 'UPDATED Property E value');
      assert(Object.keys(rehydratedInstance).includes('propertyF'));
      assert(rehydratedInstance.propertyF === '67890');
    });

    // Check no extra properties exist on the rehydrated object
    it('No extra properties exist on (re)hydrated instance', () => {
      assert(
        Object.keys(rehydratedInstance).filter(key => !['propertyA', 'propertyB', 'propertyC', 'propertyD', 'propertyE', 'propertyF'].includes(key)).length ===
          0,
      );
    });
  });

  // Check (re)hydration service respects selected hydration strategy
  describe('(Re)Hydrating a class instance respects the selected hydration strategy', () => {
    // (Re)hydrate the testing instance, making sure to rehydrate all properties
    const rehydratedInstanceWithAllProperties = rehydrate(dehydratedTestBindingExampleObj, TestBinding, HydrationStrategy.AllClassProperties);
    // Check all properties were rehydrated
    it('Correct properties (re)hydrated when using HydrationStrategy.AllClassProperties strategy', () => {
      assert(rehydratedInstanceWithAllProperties.propertyA === 'UPDATED Property A value');
      assert(rehydratedInstanceWithAllProperties.propertyB === 'UPDATED Property B value');
      assert(rehydratedInstanceWithAllProperties.propertyC === 'UPDATED Property C value');
      assert(rehydratedInstanceWithAllProperties.propertyD === 'UPDATED Property D value');
      assert(rehydratedInstanceWithAllProperties.propertyE === 'UPDATED Property E value');
      assert(rehydratedInstanceWithAllProperties.propertyF === '67890');
    });

    // (Re)hydrate the testing instance, making sure to rehydrate all explicitly named properties
    const rehydratedInstanceWithAllAllExplicitProperties = rehydrate(dehydratedTestBindingExampleObj, TestBinding, [
      'propertyA',
      'propertyB',
      'propertyC',
      'propertyD',
      'propertyE',
      'propertyF',
    ]);
    // Check all properties were rehydrated
    it('Correct properties (re)hydrated when using explicity named all properties', () => {
      assert(rehydratedInstanceWithAllAllExplicitProperties.propertyA === 'UPDATED Property A value');
      assert(rehydratedInstanceWithAllAllExplicitProperties.propertyB === 'UPDATED Property B value');
      assert(rehydratedInstanceWithAllAllExplicitProperties.propertyC === 'UPDATED Property C value');
      assert(rehydratedInstanceWithAllAllExplicitProperties.propertyD === 'UPDATED Property D value');
      assert(rehydratedInstanceWithAllAllExplicitProperties.propertyE === 'UPDATED Property E value');
      assert(rehydratedInstanceWithAllAllExplicitProperties.propertyF === '67890');
    });

    // (Re)hydrate the testing instance, making sure to rehydrate all decorated class properties
    const rehydratedInstanceWithAllDecoratedClassProperties = rehydrate(
      dehydratedTestBindingExampleObj,
      TestBinding,
      HydrationStrategy.AllDecoratedClassProperties,
    );
    // Check all properties were rehydrated
    it('Correct properties (re)hydrated when using HydrationStrategy.AllDecoratedClassProperties strategy', () => {
      assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyA === 'Property A value');
      assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyB === 'UPDATED Property B value');
      assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyC === 'UPDATED Property C value');
      assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyD === 'UPDATED Property D value');
      assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyE === 'UPDATED Property E value');
      assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyF === '67890');
    });

    // (Re)hydrate the testing instance, making sure to rehydrate all decorated class properties and some additionally explicitly named properties
    const rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties = rehydrate(dehydratedTestBindingExampleObj, TestBinding, [
      HydrationStrategy.AllDecoratedClassProperties,
      'propertyA',
    ]);
    // Check all properties were rehydrated
    it('Correct properties (re)hydrated when using HydrationStrategy.AllDecoratedClassProperties strategy combined with explicitly named properties', () => {
      assert(rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties.propertyA === 'UPDATED Property A value');
      assert(rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties.propertyB === 'UPDATED Property B value');
      assert(rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties.propertyC === 'UPDATED Property C value');
      assert(rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties.propertyD === 'UPDATED Property D value');
      assert(rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties.propertyE === 'UPDATED Property E value');
      assert(rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties.propertyF === '67890');
    });

    // (Re)hydrate the testing instance, making sure to rehydrate only bound class properties
    const rehydratedInstanceWithOnlyBoundClassProperties = rehydrate(dehydratedTestBindingExampleObj, TestBinding, HydrationStrategy.OnlyBoundClassProperties);
    // Check all properties were rehydrated
    it('Correct properties (re)hydrated when using HydrationStrategy.OnlyBoundClassProperties strategy', () => {
      assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyA === 'Property A value');
      assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyB === 'Property B value');
      assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyC === 'UPDATED Property C value');
      assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyD === 'UPDATED Property D value');
      assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyE === 'UPDATED Property E value');
      assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyF === '67890');
    });
    // (Re)hydrate the testing instance, making sure to rehydrate only bound class properties and some additionally explicitly named properties
    const rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties = rehydrate(dehydratedTestBindingExampleObj, TestBinding, [
      HydrationStrategy.OnlyBoundClassProperties,
      'propertyA',
    ]);
    // Check all properties were rehydrated
    it('Correct properties (re)hydrated when using HydrationStrategy.OnlyBoundClassProperties strategy combined with explicitly named properties', () => {
      assert(rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties.propertyA === 'UPDATED Property A value');
      assert(rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties.propertyB === 'Property B value');
      assert(rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties.propertyC === 'UPDATED Property C value');
      assert(rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties.propertyD === 'UPDATED Property D value');
      assert(rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties.propertyE === 'UPDATED Property E value');
      assert(rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties.propertyF === '67890');
    });
  });

  // Check rehydration service is performant
  describe('(Re)Hydrating a class instance respects the selected hydration strategy', () => {
    // Perform as many dehydrations as possible in 100ms
    let count = 0;
    const start = performance.now();
    while (!(count % 1000 === 0 && performance.now() - start >= 100)) {
      rehydrate(dehydratedTestBindingExampleObj, TestBinding, HydrationStrategy.AllClassProperties);
      count++;
    }
    const rehydrationsPerSecond = (1000 * count) / (performance.now() - start);

    // Check number of dehydrations per second
    it(`Can perform >${HYDRATIONS_PER_SECOND} (re)hydrations/sec (${Math.round(rehydrationsPerSecond)})`, () => {
      assert(rehydrationsPerSecond > HYDRATIONS_PER_SECOND);
    });
  });
}
