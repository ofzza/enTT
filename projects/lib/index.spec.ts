// Library global composition TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from './tests.init';

// Import base library
import { enttify, verifyDecoratorUsage } from './';
// Import internals
import {
  createPropertyCustomDecorator,
  getDecoratedClassDefinition,
  getDecoratedClassPropertyDefinition,
  getDecoratedClassPropertyDecoratorDefinition,
  filterDefinition,
  getUnderlyingEnttifiedInstance,
} from './lib';
// Import decorators
import { def, bind, cast, dehydrate, rehydrate } from './decorators';

// Check library composition
describe('Library composition makes sense', () => {
  // Check library can be imported
  it('Base library can be imported from "./"', () => {
    assert(!!enttify);
    assert(!!verifyDecoratorUsage);
  });

  // Internals can be imported for custom decorators
  it('Library internals can be imported from "./lib/"', () => {
    assert(!!createPropertyCustomDecorator);
    assert(!!getDecoratedClassDefinition);
    assert(!!getDecoratedClassPropertyDefinition);
    assert(!!getDecoratedClassPropertyDecoratorDefinition);
    assert(!!filterDefinition);
    assert(!!getUnderlyingEnttifiedInstance);
  });

  // Decorators can be imported
  it('Decorators and related services can be imported from "./decorators"', () => {
    // Property decorators
    assert(!!def);
    // Hydration decorators and related services
    assert(!!bind);
    assert(!!cast);
    assert(!!dehydrate);
    assert(!!rehydrate);
  });
});
