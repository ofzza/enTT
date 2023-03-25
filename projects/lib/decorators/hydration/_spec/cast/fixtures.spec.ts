// enTT HYDRATION @bind decorator test fixtures
// ----------------------------------------------------------------------------

// Import dependencies
import { def } from '../../../def';
import { bind, cast, CastAs } from '../../';

/**
 * Class decorated with Hydration decorators, used primarily to test the @cast decorator
 */
export class TestCast {
  // Value property
  @def
  @bind('propA')
  public propertyA: string = 'A';

  // Value property
  @def
  @bind('propB')
  public propertyB: string = 'B';

  // Value property
  @def
  @bind('propC')
  public propertyC: string = 'C';

  // Testing no cast
  @def
  @bind('propRaw')
  public propertyRaw?: Record<PropertyKey, any>;

  // Testing casting to single instance
  @def
  @bind('propSingle')
  @cast(TestCast, CastAs.SingleInstance, false)
  public propertySingle?: TestCast;
  // Testing casting to single instance
  @def
  @bind<object, undefined | TestCast, undefined | { data: TestCast }>({
    propertyName: 'propCustomSingle',
    conversion: {
      dehydrate: v => (v !== undefined ? { data: v } : undefined),
      rehydrate: v => (v !== undefined ? v.data : undefined),
    },
  })
  @cast(TestCast, CastAs.SingleInstance, true)
  public propertyCustomSingle?: TestCast;

  // Testing no cast to array
  @def
  @bind('propArray')
  @cast(TestCast, CastAs.ArrayOfInstances, false)
  public propertyArray?: Array<TestCast>;
  // Testing no cast to array with a customized binding (strict mode)
  @def
  @bind<object, undefined | Array<TestCast>, undefined | Array<{ data: TestCast }>>({
    propertyName: 'propCustomArray',
    conversion: {
      dehydrate: v => (v !== undefined ? v.map(val => ({ data: val })) : undefined),
      rehydrate: v => (v !== undefined ? v.map(val => val.data) : undefined),
    },
  })
  @cast(TestCast, CastAs.ArrayOfInstances, true)
  public propertyCustomArray?: Array<TestCast>;

  // Testing no cast to hashmap
  @def
  @bind('propHashmap')
  @cast(TestCast, CastAs.HashmapOfInstances, false)
  public propertyHashmap?: Record<PropertyKey, TestCast>;
  // Testing no cast to hashmap with a customized binding (strict mode)
  @def
  @bind<object, undefined | Record<PropertyKey, TestCast>, undefined | Record<PropertyKey, { data: TestCast }>>({
    propertyName: 'propCustomHashmap',
    conversion: {
      dehydrate: v => (v !== undefined ? Object.keys(v).reduce((val, key: PropertyKey) => ({ ...val, [key]: { data: v[key] } }), {}) : undefined),
      rehydrate: v => (v !== undefined ? Object.keys(v).reduce((val, key: PropertyKey) => ({ ...val, [key]: v[key].data }), {}) : undefined),
    },
  })
  @cast(TestCast, CastAs.HashmapOfInstances, true)
  public propertyCustomHashmap?: Record<PropertyKey, TestCast>;
}

/**
 * Creates a fully populated TestClass isntance
 * @returns Fully populated TestClass isntance
 */
export function createTestClassInstance() {
  // Instantiate a testing instance
  const instance = new TestCast();
  instance.propertyRaw = new TestCast();
  instance.propertySingle = new TestCast();
  instance.propertyCustomSingle = new TestCast();
  instance.propertyArray = [1, 2, 3].map(_ => new TestCast());
  instance.propertyCustomArray = [1, 2, 3].map(_ => new TestCast());
  instance.propertyHashmap = ['a', 'b', 'c'].reduce((obj, key) => ({ ...obj, [key]: new TestCast() }), {});
  instance.propertyCustomHashmap = ['a', 'b', 'c'].reduce((obj, key) => ({ ...obj, [key]: new TestCast() }), {});
  // Return instance
  return instance;
}

// Compose a degydrated object to test rehydration
export const dehydratedTestCastExampleObj: any = {
  propA: 'Value A',
  propB: 'Value B',
  propC: 'Value C',
};
dehydratedTestCastExampleObj.propRaw = { ...dehydratedTestCastExampleObj };
dehydratedTestCastExampleObj.propSingle = { ...dehydratedTestCastExampleObj };
dehydratedTestCastExampleObj.propCustomSingle = { data: { ...dehydratedTestCastExampleObj } };
dehydratedTestCastExampleObj.propArray = [1, 2, 3].map(_ => ({ ...dehydratedTestCastExampleObj }));
dehydratedTestCastExampleObj.propCustomArray = [1, 2, 3].map(_ => ({ data: { ...dehydratedTestCastExampleObj } }));
dehydratedTestCastExampleObj.propHashmap = ['a', 'b', 'c'].reduce((obj, key) => ({ ...obj, [key]: { ...dehydratedTestCastExampleObj } }), {});
dehydratedTestCastExampleObj.propCustomHashmap = ['a', 'b', 'c'].reduce((obj, key) => ({ ...obj, [key]: { data: { ...dehydratedTestCastExampleObj } } }), {});
