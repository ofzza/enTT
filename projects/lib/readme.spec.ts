// README.md file examples' tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from './tests.init';

// Import base library
import { enttify, verifyDecoratorUsage } from './';
// Import internals
import {
  createCustomDecorator,
  getDecoratedClassDefinition,
  getDecoratedClassPropertyDefinition,
  getDecoratedClassPropertyDecoratorDefinition,
  filterDefinition,
  getUnderlyingEnttifiedInstance,
} from './lib';
// Import decorators
import { Hydratable, dehydrate, rehydrate } from './decorators';

// Check library composition
describe('Library composition makes sense', () => {
  // Check library can be imported
  it('Base library can be imported from "./"', () => {
    assert(!!enttify);
    assert(!!verifyDecoratorUsage);
  });

  // Internals can be imported for custom decorators
  it('Library internals can be imported from "./lib/"', () => {
    assert(!!createCustomDecorator);
    assert(!!getDecoratedClassDefinition);
    assert(!!getDecoratedClassPropertyDefinition);
    assert(!!getDecoratedClassPropertyDecoratorDefinition);
    assert(!!filterDefinition);
    assert(!!getUnderlyingEnttifiedInstance);
  });

  // Decorators can be imported
  it('Decorators can be imported from "./decorators"', () => {
    assert(!!Hydratable);
    assert(!!dehydrate);
    assert(!!rehydrate);
  });
});
