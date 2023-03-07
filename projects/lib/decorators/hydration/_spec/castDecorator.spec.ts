// enTT HYDRATION @cast decorator and services tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init';
import { def } from '../../def';
import { bind, cast, dehydrate, rehydrate, HydrationStrategy } from '../';
import { CAST_AS_SINGLE_INSTANCE, CAST_AS_ARRAY_OF_INSTANCES, CAST_AS_HASHMAP_OF_INSTANCES } from '../';

/**
 * Class decorated with Hydration decorators, used primarily to test the @cast decorator
 */
class TestCast {
  // Testing no cast
  @def
  @bind('propRaw')
  public propertyRaw!: object;

  // Testing casting to single instance
  @def
  @bind('propSingle')
  @cast(TestCast, CAST_AS_SINGLE_INSTANCE)
  public propertySingle!: TestCast;

  // Testing no cast
  @def
  @bind('propArray')
  @cast(TestCast, CAST_AS_ARRAY_OF_INSTANCES)
  public propertyArray!: TestCast[];

  // Testing no cast
  @def
  @bind('propHashmap')
  @cast(TestCast, CAST_AS_HASHMAP_OF_INSTANCES)
  public propertyHashmap!: Record<PropertyKey, TestCast>;
}

// Test ...
export function testsHydrationCastDecoratorAndCompanionServices() {
  it('It works!!!', () => {
    assert(true);
  });
}
