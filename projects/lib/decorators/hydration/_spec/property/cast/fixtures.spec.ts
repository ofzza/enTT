// enTT HYDRATION @cast decorator test fixtures
// ----------------------------------------------------------------------------

// Import dependencies
import { def } from '../../../../def';
import { bindProperty, cast, CastAs } from '../../../';

/**
 * Class decorated with Hydration decorators, used primarily to test the @cast decorator
 */
export class TestCast {
  // Value property
  @def
  @bindProperty('propA')
  public propertyA: string = 'A';

  // Value property
  @def
  @bindProperty('propB')
  public propertyB: string = 'B';

  // Value property
  @def
  @bindProperty('propC')
  public propertyC: string = 'C';

  // Testing no cast
  @def
  @bindProperty('propRaw')
  public propertyRaw?: Record<PropertyKey, any>;

  // Testing casting to single instance
  @def
  @bindProperty('propSingle')
  @cast(TestCast, CastAs.SingleInstance)
  public propertySingle?: TestCast;
  // Testing casting to single instance
  @def
  @bindProperty<object, undefined | TestCast, undefined | { data?: TestCast }>({
    propertyName: 'propCustomSingle',
    conversion: {
      dehydrate: v => (v !== undefined ? { data: v } : { data: undefined }),
      rehydrate: v => (v !== undefined ? v.data : undefined),
    },
  })
  @cast(TestCast, CastAs.SingleInstance)
  public propertyCustomSingle?: TestCast;

  // Testing no cast to array
  @def
  @bindProperty('propArray')
  @cast(TestCast, CastAs.ArrayOfInstances)
  public propertyArray?: Array<TestCast>;
  // Testing no cast to array with a customized binding
  @def
  @bindProperty<object, undefined | Array<TestCast>, undefined | Array<{ data: TestCast }>>({
    propertyName: 'propCustomArray',
    conversion: {
      dehydrate: v => (v !== undefined ? v.map(val => ({ data: val })) : []),
      rehydrate: v => (v !== undefined ? v.map(val => val.data) : []),
    },
  })
  @cast(TestCast, CastAs.ArrayOfInstances)
  public propertyCustomArray?: Array<TestCast>;

  // Testing no cast to hashmap
  @def
  @bindProperty('propHashmap')
  @cast(TestCast, CastAs.HashmapOfInstances)
  public propertyHashmap?: Record<PropertyKey, TestCast>;
  // Testing no cast to hashmap with a customized binding
  @def
  @bindProperty<object, undefined | Record<PropertyKey, TestCast>, undefined | Record<PropertyKey, { data: TestCast }>>({
    propertyName: 'propCustomHashmap',
    conversion: {
      dehydrate: v => (v !== undefined ? Object.keys(v).reduce((val, key: PropertyKey) => ({ ...val, [key]: { data: v[key] } }), {}) : {}),
      rehydrate: v => (v !== undefined ? Object.keys(v).reduce((val, key: PropertyKey) => ({ ...val, [key]: v[key].data }), {}) : {}),
    },
  })
  @cast(TestCast, CastAs.HashmapOfInstances)
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
export function createDehydratedTestCastExampleObj(): any {
  // Define a partial dehydrated object stub
  const partialDehydratedTestCastExampleObj: any = {
    propA: 'Value A',
    propB: 'Value B',
    propC: 'Value C',
  };
  // Compose a full dehydrated testing object
  const dehydratedTestCastExampleObj = {
    propA: partialDehydratedTestCastExampleObj.propA,
    propB: partialDehydratedTestCastExampleObj.propB,
    propC: partialDehydratedTestCastExampleObj.propC,
    propRaw: { ...partialDehydratedTestCastExampleObj },
    propSingle: { ...partialDehydratedTestCastExampleObj },
    propCustomSingle: { data: { ...partialDehydratedTestCastExampleObj } },
    propArray: [1, 2, 3].map(_ => ({ ...partialDehydratedTestCastExampleObj })),
    propCustomArray: [1, 2, 3].map(_ => ({ data: { ...partialDehydratedTestCastExampleObj } })),
    propHashmap: ['a', 'b', 'c'].reduce((obj, key) => ({ ...obj, [key]: { ...partialDehydratedTestCastExampleObj } }), {}),
    propCustomHashmap: ['a', 'b', 'c'].reduce((obj, key) => ({ ...obj, [key]: { data: { ...partialDehydratedTestCastExampleObj } } }), {}),
  };
  // Return a full degydrated testing object
  return dehydratedTestCastExampleObj;
}
