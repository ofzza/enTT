// Internal types testing
// ----------------------------------------------------------------------------

// Import dependencies
import { assert, refute } from '@ofzza/ts-std/types/utility/assertion';
import { Class, ClassInstance } from '@ofzza/ts-std/types/corejs/class';
import { EnttClass, EnttClassInstance } from './';

export function testInternalsTypes() {
  it('Class and EnttClass are interchangable', () => {
    <T extends ClassInstance>(BaseClass: Class<T>, EnttClass: EnttClass<T>) => {
      // Entt<T> is assignable as Class<T>
      assert<Class<T>, EnttClass<T>>;
      assert<Class<T>>()(EnttClass);
      // Class<T> is assignable as Entt<T>
      // ((): EnttClass<T> => BaseClass)(); // TODO: Make this refutation work!
      // assert<EnttClass<T>>()(BaseClass);
      // refute<EnttClass<T>>()(BaseClass);
    };
    // Empty runtime assert for jasmine
    assert();
  });

  it('ClassInstance and EnttClassInstance are interchangable', () => {
    <T extends ClassInstance>(base: ClassInstance<T>, entt: EnttClassInstance<T>) => {
      // EnttInstance<T> is assignable as ClassInstance<T>
      assert<ClassInstance<T>, EnttClassInstance<T>>;
      assert<ClassInstance<T>>()(entt);
      // ClassInstance<T> is assignable as EnttInstance<T>
      // ((): EnttClassInstance<T> => base)(); // TODO: Make this refutation work!
      // assert<EnttClassInstance<T>>()(base);
      // refute<EnttClassInstance<T>>()(base);
    };
    // Empty runtime assert for jasmine
    assert();
  });
}
