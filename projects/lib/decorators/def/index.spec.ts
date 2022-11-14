// enTT @def core decorator TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../tests.init';
import { getDecoratedClassDefinition } from '../../lib';
import { def } from './';

/**
 * Class with decorated properties and not-decorated properties of different access levels
 */
class Test<T> {
  // Properties of different access levels with explicitly typed value not set
  @def public pub!: string;
  @def protected prot!: string;
  @def private priv!: string;
  // Properties of different access levels with optionally typed value not set
  @def public pubUndefined?: string;
  @def protected protUndefined?: string;
  @def private privUndefined?: string;
  // Properties of different access levels with undefined set as explicit value
  @def public pubUndefinedExplicit?: string = undefined;
  @def protected protUndefinedExplicit?: string = undefined;
  @def private privUndefinedExplicit?: string = undefined;
  // Properties of different access levels with value set
  @def public pubUndefinedValue?: string = 'public';
  @def protected protUndefinedValue?: string = 'protected';
  @def private privUndefinedValue?: string = 'private';
}

// Test ...
export function testsDefDecorator() {
  describe('@def', () => {
    const definition = getDecoratedClassDefinition(Test);

    it('Properties of different access levels, having explicitly typed value not set, registered', () => {
      // Check set and not set properties with public access level
      assert(!!definition.properties['pub']);
      assert(!!definition.properties['prot']);
      assert(!!definition.properties['priv']);
    });
    it('Properties of different access levels, having optionally typed value not set, registered', () => {
      assert(!!definition.properties['pubUndefined']);
      assert(!!definition.properties['protUndefined']);
      assert(!!definition.properties['privUndefined']);
    });
    it('Properties of different access levels, having undefined set as explicit value, registered', () => {
      assert(!!definition.properties['pubUndefinedExplicit']);
      assert(!!definition.properties['protUndefinedExplicit']);
      assert(!!definition.properties['privUndefinedExplicit']);
    });
    it('Properties of different access levels, having value set, registered', () => {
      assert(!!definition.properties['pubUndefinedValue']);
      assert(!!definition.properties['protUndefinedValue']);
      assert(!!definition.properties['privUndefinedValue']);
    });
  });
}
