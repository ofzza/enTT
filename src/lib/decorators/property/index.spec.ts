// enTT lib @Property decorator tests
// ----------------------------------------------------------------------------

// Import dependencies
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

    @Property({ get: (target, value) => `${target.plain}:${value && value.toUpperCase()}` })
    public customgetter = 'customgetter';

    @Property({ set: (target, value) => `${target.plain}:${value && value.toUpperCase()}` })
    public customsetter = 'customsetter';
  }

  it('Replaces properties with dynamic counterparts', () => {
    const test = new Test();
    expect(test.plain).toEqual('plain');
    expect(Object.getOwnPropertyDescriptor(test, 'plain').get).toBeTruthy();
    expect(Object.getOwnPropertyDescriptor(test, 'plain').get).toBeTruthy();
    expect(Object.getOwnPropertyDescriptor(test, 'plain').set).toBeTruthy();
    expect(Object.getOwnPropertyDescriptor(test, 'plain').enumerable).toEqual(true);
    expect(test.enttized).toEqual('enttized');
    expect(Object.getOwnPropertyDescriptor(test, 'enttized').get).toBeTruthy();
    expect(Object.getOwnPropertyDescriptor(test, 'enttized').set).toBeTruthy();
    expect(Object.getOwnPropertyDescriptor(test, 'enttized').enumerable).toEqual(true);
  });

  it('Sets property enumerable state', () => {
    const test = new Test();
    expect(test.nonenumerable).toEqual('nonenumerable');
    expect(Object.getOwnPropertyDescriptor(test, 'nonenumerable').get).toBeTruthy();
    expect(Object.getOwnPropertyDescriptor(test, 'nonenumerable').set).toBeTruthy();
    expect(Object.getOwnPropertyDescriptor(test, 'nonenumerable').enumerable).toEqual(false);
  });

  it('Can set property with only a getter', () => {
    const test = new Test();
    expect(test.getteronly).toEqual('getteronly');
    expect(Object.getOwnPropertyDescriptor(test, 'getteronly').get).toBeTruthy();
    expect(Object.getOwnPropertyDescriptor(test, 'getteronly').set).toBeUndefined()
    expect(Object.getOwnPropertyDescriptor(test, 'getteronly').enumerable).toEqual(true);
  });

  it('Can set property with only a setter', () => {
    const test = new Test();
    expect(test.setteronly).not.toEqual('setteronly');
    expect(Object.getOwnPropertyDescriptor(test, 'setteronly').get).toBeUndefined()
    expect(Object.getOwnPropertyDescriptor(test, 'setteronly').set).toBeTruthy()
    expect(Object.getOwnPropertyDescriptor(test, 'setteronly').enumerable).toEqual(true);
  });

  describe('Can set property with custom getter and setter', () => {
    it('Custom getter reflects changes to property value', () => {
      const test = new Test();
      expect(test.customgetter).toEqual('plain:CUSTOMGETTER');
      test.customgetter = 'test';
      expect(test.customgetter).toEqual('plain:TEST');
    });
    it('Custom setter reflects changes to property value', () => {
      const test = new Test();
      expect(test.customsetter).toEqual('customsetter');
      test.customsetter = 'test';
      expect(test.customsetter).toEqual('plain:TEST');
    });
    it('Custom getter and setter reflect changes to other, referenced properties\' values', () => {
      const test = new Test();
      test.plain = 'no-longer-plain';
      test.customsetter = 'test';
      test.customgetter = 'test';
      expect(test.customgetter).toEqual('no-longer-plain:TEST');
      expect(test.customsetter).toEqual('no-longer-plain:TEST');
    });

  });

});
