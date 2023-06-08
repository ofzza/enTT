// Library global composition TESTS
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '@ofzza/ts-std/types/utility/assertion';

// Import base library
import * as root from './';
// Import base library types
import { Class, ClassInstance, EnttClass, EnttClassInstance } from './';
// Import internals
import * as lib from './lib';
// Import internal types
import {} from './lib'; // !TODO

describe('Library composition makes sense', () => {
  it(' @ofzza/ts-std commonly used types and functionality can be imported from "./"', () => {
    assert(!!root.assert);
    assert(!!root.refute);
    assert<any, Class>;
    assert<any, ClassInstance>;
  });

  it('Base library can be imported from "./"', () => {
    assert(!!root.enttify);
    assert(!!root.verifyDecoratorUsage);
  });

  it('Base library types can be imported from "./"', () => {
    // Check library types
    assert<any, EnttClass>;
    assert<any, EnttClassInstance>;
    // Empty runtime assert for jasmine
    assert();
  });

  it(`Library internals can't be imported from "./"`, () => {
    assert(!(root as any).createPropertyCustomDecorator);
    assert(!(root as any).getDecoratedClassDefinition);
    assert(!(root as any).getDecoratedClassPropertyDefinition);
    assert(!(root as any).getDecoratedClassPropertyDecoratorDefinition);
    assert(!(root as any).filterDefinition);
    assert(!(root as any).getUnderlyingEnttifiedClass);
    assert(!(root as any).getUnderlyingEnttifiedInstance);
  });

  it('Library internals can be imported from "./lib/"', () => {
    assert(!!lib.createPropertyCustomDecorator);
    assert(!!lib.getDecoratedClassDefinition);
    assert(!!lib.getDecoratedClassPropertyDefinition);
    assert(!!lib.getDecoratedClassPropertyDecoratorDefinition);
    assert(!!lib.filterDefinition);
    assert(!!lib.getUnderlyingEnttifiedClass);
    assert(!!lib.getUnderlyingEnttifiedInstance);
  });

  it('Library internal types can be imported from "./lib/"', () => {
    // Check library internal types
    // !TODO
    // Empty runtime assert for jasmine
    assert();
  });
});
