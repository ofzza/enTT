// enTT lib @Property decorator tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../../tests.init'
import { EnTT, Property }  from '../../../';

// Test ...
describe('@Property', () => {

  class Test extends EnTT {
    constructor () { super(); super.entt(); }

    public plain = 'plain';

    @Property()
    public enttized = 'enttized';

    @Property({ enumerable: false })
    public nonenumerable = 'nonenumerable';

    @Property({ set: false })
    public getteronly = 'getteronly';

    @Property({ get: false })
    public setteronly = 'setteronly';

    @Property({ get: (obj, value) => `${obj.plain}:${value && value.toUpperCase()}` })
    public customgetter = 'customgetter';

    @Property({ set: (obj, value) => `${obj.plain}:${value && value.toUpperCase()}` })
    public customsetter = 'customsetter';
  }

  it('Replaces properties with dynamic counterparts', () => {
    const test = new Test();
    assert(test.plain === 'plain');
    assert(Object.getOwnPropertyDescriptor(test, 'plain').get);
    assert(Object.getOwnPropertyDescriptor(test, 'plain').get);
    assert(Object.getOwnPropertyDescriptor(test, 'plain').set);
    assert(Object.getOwnPropertyDescriptor(test, 'plain').enumerable === true);
    assert(test.enttized === 'enttized');
    assert(Object.getOwnPropertyDescriptor(test, 'enttized').get);
    assert(Object.getOwnPropertyDescriptor(test, 'enttized').set);
    assert(Object.getOwnPropertyDescriptor(test, 'enttized').enumerable === true);
  });

  it('Sets property enumerable state', () => {
    const test = new Test();
    assert(test.nonenumerable === 'nonenumerable');
    assert(Object.getOwnPropertyDescriptor(test, 'nonenumerable').get);
    assert(Object.getOwnPropertyDescriptor(test, 'nonenumerable').set);
    assert(Object.getOwnPropertyDescriptor(test, 'nonenumerable').enumerable === false);
  });

  it('Can set property with only a getter', () => {
    const test = new Test();
    assert(test.getteronly === 'getteronly');
    assert(Object.getOwnPropertyDescriptor(test, 'getteronly').get);
    assert(Object.getOwnPropertyDescriptor(test, 'getteronly').set === undefined);
    assert(Object.getOwnPropertyDescriptor(test, 'getteronly').enumerable === true);
  });

  it('Can set property with only a setter', () => {
    const test = new Test();
    assert(test.setteronly === undefined);
    assert(Object.getOwnPropertyDescriptor(test, 'setteronly').get === undefined);
    assert(Object.getOwnPropertyDescriptor(test, 'setteronly').set);
    assert(Object.getOwnPropertyDescriptor(test, 'setteronly').enumerable === true);
  });

  describe('Can set property with custom getter and setter', () => {

    it('Custom getter reflects changes to property value', () => {
      const test = new Test();
      assert(test.customgetter === 'plain:CUSTOMGETTER');
      test.customgetter = 'test';
      assert(test.customgetter === 'plain:TEST');
    });

    it('Custom setter reflects changes to property value', () => {
      const test = new Test();
      assert(test.customsetter === 'plain:CUSTOMSETTER');
      test.customsetter = 'test';
      assert(test.customsetter === 'plain:TEST');
    });

    it('Custom getter and setter reflect changes to other, referenced properties\' values', () => {
      const test = new Test();
      test.plain = 'no-longer-plain';
      test.customsetter = 'test';
      test.customgetter = 'test';
      assert(test.customgetter === 'no-longer-plain:TEST');
      assert(test.customsetter === 'no-longer-plain:TEST');
    });

  });

  it('Allows overriding when extending EnTT classes', () => {

    class TestBase extends EnTT {
      constructor () { super(); super.entt(); }
      
      @Property({
        enumerable: false,
        set: false,
        get: false
      })
      public prop = undefined as any;
    }

    class Test extends TestBase {
      constructor () { super(); super.entt(); }
      
      @Property({
        enumerable: true,
        set: (obj, value) => value && value.toUpperCase(),
        get: (obj, value) => `!${value && value.toUpperCase()}!`
      })
      public prop = undefined as any;
    }

    const base = new TestBase();
    assert(Object.keys(base).length === 0);
    expect(() => { base.prop = 'test'; }).toThrow();
    assert(base.prop === undefined);

    const test = new Test();
    assert(Object.keys(test).length === 1);
    test.prop = 'test';
    assert(test.prop === '!TEST!');

  });

});
