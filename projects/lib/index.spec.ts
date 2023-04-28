// Library global composition TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';

// Import base library
import * as root from './';
// Import internals
import * as lib from './lib';

// Check library composition
describe('Library composition makes sense', () => {
  // Check library can be imported
  it('Base library can be imported from "./"', () => {
    assert(!!root.enttify);
    assert(!!root.verifyDecoratorUsage);
  });

  // Internals can't be imported for custom decorators
  it(`Library internals can't be imported from "./"`, () => {
    assert(!(root as any).createPropertyCustomDecorator);
    assert(!(root as any).getDecoratedClassDefinition);
    assert(!(root as any).getDecoratedClassPropertyDefinition);
    assert(!(root as any).getDecoratedClassPropertyDecoratorDefinition);
    assert(!(root as any).filterDefinition);
    assert(!(root as any).getUnderlyingEnttifiedInstance);
  });

  // Internals can be imported for custom decorators
  it('Library internals can be imported from "./lib/"', () => {
    assert(!!lib.createPropertyCustomDecorator);
    assert(!!lib.getDecoratedClassDefinition);
    assert(!!lib.getDecoratedClassPropertyDefinition);
    assert(!!lib.getDecoratedClassPropertyDecoratorDefinition);
    assert(!!lib.filterDefinition);
    assert(!!lib.getUnderlyingEnttifiedInstance);
  });
});
