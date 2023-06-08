// enTT HYDRATION @bind properties decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';
import { rehydrate, HydrationStrategy } from '../../../';
import { HYDRATIONS_PER_SECOND, TestBinding, EnttifiedTestBinding, dehydratedTestBindingExampleObj } from './fixtures.spec';

export function testHydrationBindPropertyDecoratorRehydrate() {
  describe('A class instance with properties using the @bind decorator can (re)hydrate', () => {
    // Rehydrate the a testing instance, making sure to rehydrate all properties
    const rehydratedInstanceViaClassParameter = rehydrate(dehydratedTestBindingExampleObj, TestBinding, HydrationStrategy.AllClassProperties);
    const rehydratedInstanceViaDirectClassInstance = rehydrate(dehydratedTestBindingExampleObj, new TestBinding(), HydrationStrategy.AllClassProperties);

    it('(Re)Hydration works the same when given a class or class instance as a target argument', () => {
      assert(JSON.stringify(rehydratedInstanceViaClassParameter) === JSON.stringify(rehydratedInstanceViaDirectClassInstance));
    });

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

    it('No extra properties exist on (re)hydrated instance', () => {
      assert(
        Object.keys(rehydratedInstance).filter(key => !['propertyA', 'propertyB', 'propertyC', 'propertyD', 'propertyE', 'propertyF'].includes(key)).length ===
          0,
      );
    });
  });

  describe('An enttified class instance with properties using the @bind decorator can (re)hydrate', () => {
    // Rehydrate the a testing instance, making sure to rehydrate all properties
    const rehydratedInstanceViaClassParameter = rehydrate(dehydratedTestBindingExampleObj, EnttifiedTestBinding, HydrationStrategy.AllClassProperties);
    const rehydratedInstanceViaDirectClassInstance = rehydrate(
      dehydratedTestBindingExampleObj,
      new EnttifiedTestBinding(),
      HydrationStrategy.AllClassProperties,
    );

    it('(Re)Hydration works the same when given a class or class instance as a target argument', () => {
      assert(JSON.stringify(rehydratedInstanceViaClassParameter) === JSON.stringify(rehydratedInstanceViaDirectClassInstance));
    });

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

    it('No extra properties exist on (re)hydrated instance', () => {
      assert(
        Object.keys(rehydratedInstance).filter(key => !['propertyA', 'propertyB', 'propertyC', 'propertyD', 'propertyE', 'propertyF'].includes(key)).length ===
          0,
      );
    });
  });

  describe('(Re)Hydrating a class instance respects the selected hydration strategy', () => {
    const rehydratedInstanceWithAllProperties = rehydrate(dehydratedTestBindingExampleObj, TestBinding, HydrationStrategy.AllClassProperties);
    it('Correct properties (re)hydrated when using HydrationStrategy.AllClassProperties strategy', () => {
      assert(rehydratedInstanceWithAllProperties.propertyA === 'UPDATED Property A value');
      assert(rehydratedInstanceWithAllProperties.propertyB === 'UPDATED Property B value');
      assert(rehydratedInstanceWithAllProperties.propertyC === 'UPDATED Property C value');
      assert(rehydratedInstanceWithAllProperties.propertyD === 'UPDATED Property D value');
      assert(rehydratedInstanceWithAllProperties.propertyE === 'UPDATED Property E value');
      assert(rehydratedInstanceWithAllProperties.propertyF === '67890');
    });

    const rehydratedInstanceWithAllAllExplicitProperties = rehydrate(dehydratedTestBindingExampleObj, TestBinding, [
      'propertyA',
      'propertyB',
      'propertyC',
      'propertyD',
      'propertyE',
      'propertyF',
    ]);
    it('Correct properties (re)hydrated when using explicity named all properties', () => {
      assert(rehydratedInstanceWithAllAllExplicitProperties.propertyA === 'UPDATED Property A value');
      assert(rehydratedInstanceWithAllAllExplicitProperties.propertyB === 'UPDATED Property B value');
      assert(rehydratedInstanceWithAllAllExplicitProperties.propertyC === 'UPDATED Property C value');
      assert(rehydratedInstanceWithAllAllExplicitProperties.propertyD === 'UPDATED Property D value');
      assert(rehydratedInstanceWithAllAllExplicitProperties.propertyE === 'UPDATED Property E value');
      assert(rehydratedInstanceWithAllAllExplicitProperties.propertyF === '67890');
    });

    const rehydratedInstanceWithAllDecoratedClassProperties = rehydrate(
      dehydratedTestBindingExampleObj,
      TestBinding,
      HydrationStrategy.AllDecoratedClassProperties,
    );
    it('Correct properties (re)hydrated when using HydrationStrategy.AllDecoratedClassProperties strategy', () => {
      assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyA === 'Property A value');
      assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyB === 'UPDATED Property B value');
      assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyC === 'UPDATED Property C value');
      assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyD === 'UPDATED Property D value');
      assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyE === 'UPDATED Property E value');
      assert(rehydratedInstanceWithAllDecoratedClassProperties.propertyF === '67890');
    });

    const rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties = rehydrate(dehydratedTestBindingExampleObj, TestBinding, [
      HydrationStrategy.AllDecoratedClassProperties,
      'propertyA',
    ]);
    it('Correct properties (re)hydrated when using HydrationStrategy.AllDecoratedClassProperties strategy combined with explicitly named properties', () => {
      assert(rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties.propertyA === 'UPDATED Property A value');
      assert(rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties.propertyB === 'UPDATED Property B value');
      assert(rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties.propertyC === 'UPDATED Property C value');
      assert(rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties.propertyD === 'UPDATED Property D value');
      assert(rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties.propertyE === 'UPDATED Property E value');
      assert(rehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties.propertyF === '67890');
    });

    const rehydratedInstanceWithOnlyBoundClassProperties = rehydrate(dehydratedTestBindingExampleObj, TestBinding, HydrationStrategy.OnlyBoundClassProperties);
    it('Correct properties (re)hydrated when using HydrationStrategy.OnlyBoundClassProperties strategy', () => {
      assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyA === 'Property A value');
      assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyB === 'Property B value');
      assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyC === 'UPDATED Property C value');
      assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyD === 'UPDATED Property D value');
      assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyE === 'UPDATED Property E value');
      assert(rehydratedInstanceWithOnlyBoundClassProperties.propertyF === '67890');
    });

    const rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties = rehydrate(dehydratedTestBindingExampleObj, TestBinding, [
      HydrationStrategy.OnlyBoundClassProperties,
      'propertyA',
    ]);
    it('Correct properties (re)hydrated when using HydrationStrategy.OnlyBoundClassProperties strategy combined with explicitly named properties', () => {
      assert(rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties.propertyA === 'UPDATED Property A value');
      assert(rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties.propertyB === 'Property B value');
      assert(rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties.propertyC === 'UPDATED Property C value');
      assert(rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties.propertyD === 'UPDATED Property D value');
      assert(rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties.propertyE === 'UPDATED Property E value');
      assert(rehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties.propertyF === '67890');
    });
  });

  describe('(Re)Hydrating a class instance respects the selected hydration strategy', () => {
    // Perform as many dehydrations as possible in 100ms
    let count = 0;
    const start = performance.now();
    while (!(count % 1000 === 0 && performance.now() - start >= 100)) {
      rehydrate(dehydratedTestBindingExampleObj, TestBinding, HydrationStrategy.AllClassProperties);
      count++;
    }
    const rehydrationsPerSecond = (1000 * count) / (performance.now() - start);

    it(`Can perform >${HYDRATIONS_PER_SECOND} (re)hydrations/sec (${Math.round(rehydrationsPerSecond)})`, () => {
      assert(rehydrationsPerSecond > HYDRATIONS_PER_SECOND);
    });
  });
}
