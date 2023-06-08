// enTT HYDRATION @bind properties decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';
import { dehydrate, HydrationStrategy } from '../../../';
import { HYDRATIONS_PER_SECOND, TestBinding, EnttifiedTestBinding } from './fixtures.spec';

export function testHydrationBindPropertyDecoratorDehydrate() {
  // Instantiate a testing instance
  const instance = new TestBinding();
  const enttifiedInstance = new EnttifiedTestBinding();

  describe('A class instance with properties using the @bind decorator can dehydrate', () => {
    // Dehydrate the testing instance, making sure to dehydrate all properties
    const dehydratedInstance = dehydrate(instance, HydrationStrategy.AllClassProperties);

    it('All properties exist on dehydrated object', () => {
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
    });

    it('No extra properties exist on dehydrated object', () => {
      assert(Object.keys(dehydratedInstance).filter(key => !['propertyA', 'propertyB', 'propertyC', 'propD', 'propE', 'propF'].includes(key)).length === 0);
    });
  });

  describe('An enttified class instance with properties using the @bind decorator can dehydrate', () => {
    // Dehydrate the testing instance, making sure to dehydrate all properties
    const dehydratedInstance = dehydrate(enttifiedInstance, HydrationStrategy.AllClassProperties);

    it('All properties exist on dehydrated object', () => {
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
    });

    it('No extra properties exist on dehydrated object', () => {
      assert(Object.keys(dehydratedInstance).filter(key => !['propertyA', 'propertyB', 'propertyC', 'propD', 'propE', 'propF'].includes(key)).length === 0);
    });
  });

  describe('Dehydrating a class instance respects the selected hydration strategy', () => {
    const dehydratedInstanceWithAllProperties = dehydrate(instance, HydrationStrategy.AllClassProperties);
    it('Correct properties dehydrated when using HydrationStrategy.AllClassProperties strategy', () => {
      assert(dehydratedInstanceWithAllProperties['propertyA'] === 'Property A value');
      assert(dehydratedInstanceWithAllProperties['propertyB'] === 'Property B value');
      assert(dehydratedInstanceWithAllProperties['propertyC'] === 'Property C value');
      assert(dehydratedInstanceWithAllProperties['propD'] === 'Property D value');
      assert(dehydratedInstanceWithAllProperties['propE'] === 'Property E value');
      assert(dehydratedInstanceWithAllProperties['propF'] === 12345);
    });

    const dehydratedInstanceWithAllExplicitProperties = dehydrate(instance, ['propertyA', 'propertyB', 'propertyC', 'propertyD', 'propertyE', 'propertyF']);
    it('Correct properties dehydrated when using explicity named all properties', () => {
      assert(dehydratedInstanceWithAllExplicitProperties['propertyA'] === 'Property A value');
      assert(dehydratedInstanceWithAllExplicitProperties['propertyB'] === 'Property B value');
      assert(dehydratedInstanceWithAllExplicitProperties['propertyC'] === 'Property C value');
      assert(dehydratedInstanceWithAllExplicitProperties['propD'] === 'Property D value');
      assert(dehydratedInstanceWithAllExplicitProperties['propE'] === 'Property E value');
      assert(dehydratedInstanceWithAllExplicitProperties['propF'] === 12345);
    });

    const dehydratedInstanceWithAllDecoratedClassProperties = dehydrate(instance, HydrationStrategy.AllDecoratedClassProperties);
    it('Correct properties dehydrated when using HydrationStrategy.AllDecoratedClassProperties strategy', () => {
      assert(dehydratedInstanceWithAllDecoratedClassProperties['propertyA'] === undefined);
      assert(dehydratedInstanceWithAllDecoratedClassProperties['propertyB'] === 'Property B value');
      assert(dehydratedInstanceWithAllDecoratedClassProperties['propertyC'] === 'Property C value');
      assert(dehydratedInstanceWithAllDecoratedClassProperties['propD'] === 'Property D value');
      assert(dehydratedInstanceWithAllDecoratedClassProperties['propE'] === 'Property E value');
      assert(dehydratedInstanceWithAllDecoratedClassProperties['propF'] === 12345);
    });

    const dehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties = dehydrate(instance, [
      HydrationStrategy.AllDecoratedClassProperties,
      'propertyA',
    ]);
    it('Correct properties dehydrated when using HydrationStrategy.AllDecoratedClassProperties strategy combined with explicitly named properties', () => {
      assert(dehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties['propertyA'] === 'Property A value');
      assert(dehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties['propertyB'] === 'Property B value');
      assert(dehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties['propertyC'] === 'Property C value');
      assert(dehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties['propD'] === 'Property D value');
      assert(dehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties['propE'] === 'Property E value');
      assert(dehydratedInstanceWithAllDecoratedClassPropertiesAndExplicitProperties['propF'] === 12345);
    });

    const dehydratedInstanceWithOnlyBoundClassProperties = dehydrate(instance, HydrationStrategy.OnlyBoundClassProperties);
    it('Correct properties dehydrated when using HydrationStrategy.OnlyBoundClassProperties strategy', () => {
      assert(dehydratedInstanceWithOnlyBoundClassProperties['propertyA'] === undefined);
      assert(dehydratedInstanceWithOnlyBoundClassProperties['propertyB'] === undefined);
      assert(dehydratedInstanceWithOnlyBoundClassProperties['propertyC'] === 'Property C value');
      assert(dehydratedInstanceWithOnlyBoundClassProperties['propD'] === 'Property D value');
      assert(dehydratedInstanceWithOnlyBoundClassProperties['propE'] === 'Property E value');
      assert(dehydratedInstanceWithOnlyBoundClassProperties['propF'] === 12345);
    });

    const dehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties = dehydrate(instance, [HydrationStrategy.OnlyBoundClassProperties, 'propertyA']);
    it('Correct properties dehydrated when using HydrationStrategy.OnlyBoundClassProperties strategy combined with explicitly named properties', () => {
      assert(dehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties['propertyA'] === 'Property A value');
      assert(dehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties['propertyB'] === undefined);
      assert(dehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties['propertyC'] === 'Property C value');
      assert(dehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties['propD'] === 'Property D value');
      assert(dehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties['propE'] === 'Property E value');
      assert(dehydratedInstanceWithOnlyBoundClassPropertiesAndExplicitProperties['propF'] === 12345);
    });
  });

  describe('Dehydrating a class instance is performant', () => {
    // Perform as many dehydrations as possible in 100ms
    let count = 0;
    const start = performance.now();
    while (!(count % 1000 === 0 && performance.now() - start >= 100)) {
      dehydrate(instance, HydrationStrategy.AllClassProperties);
      count++;
    }
    const dehydrationsPerSecond = (1000 * count) / (performance.now() - start);

    it(`Can perform >${HYDRATIONS_PER_SECOND} dehydrations/sec (${Math.round(dehydrationsPerSecond)})`, () => {
      assert(dehydrationsPerSecond > HYDRATIONS_PER_SECOND);
    });
  });
}
