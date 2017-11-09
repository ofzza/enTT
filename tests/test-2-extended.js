// =====================================================================================================================
// Tests Entity Extended classes
// =====================================================================================================================
let assert  = require('assert'),
    _       = require('lodash'),
    Entity  = require('../dist').default,
    Module  = require('../dist').Module;

// Entity Extended Class
describe('Extended Class', () => {
  Entity.debug = true;

  // Define custom module
  class CustomModule extends Module {
    constructor (id) { super(); this.id = id; }
    processProperty () { return { id: this.id }; }
  }

  it('No EntityPrototype\'s properties or methods should leak into the extended class', () => {
    class ExtendedEntity extends Entity { }
    let extended = new ExtendedEntity();
    assert.equal(0, _.keys(extended).length);
  });

  describe('Should accept and apply modules', () => {
    it('Should silently ignore NIL-value as a module definition', () => {
      class ExtendedEntity extends Entity { static get modules () { return null; } }
      let extended;
      assert.doesNotThrow(() => { extended = new ExtendedEntity(); });
      assert.equal(extended.modules.length, Entity.modules.length);
    });
    it('Should silently ignore an empty array as module definition', () => {
      class ExtendedEntity extends Entity { static get modules () { return []; } }
      let extended;
      assert.doesNotThrow(() => { extended = new ExtendedEntity(); });
      assert.equal(extended.modules.length, Entity.modules.length);
    });
    it('Should silently ignore an array of NIL-values as module definitions', () => {
      class ExtendedEntity extends Entity { static get modules () { return [ null, undefined ]; } }
      let extended;
      assert.doesNotThrow(() => { extended = new ExtendedEntity(); });
      assert.equal(extended.modules.length, Entity.modules.length);
    });
    it('Shouldn\'t accept non-instantiated class as a module', () => {
      class ExtendedEntity extends Entity { static get modules () { return [ CustomModule ]; } }
      assert.throws(() => { new ExtendedEntity(); });
    });
    it('Shouldn\'t accept anything other than an instance of EntityModule class as a module', () => {
      class ExtendedEntity extends Entity { static get modules () { return [ {} ]; } }
      assert.throws(() => { new ExtendedEntity(); });
    });
    it('Should override multiple instances of same module class with last provided instance', () => {
      class EntityWithModule extends Entity {
        static get modules () { return [ new CustomModule('A') ]; }
      }
      assert.ok(_.find((new EntityWithModule()).modules, (module) => { return (module.id === 'A'); }));
      class EntityWithOverriddenModule extends EntityWithModule {
        static get modules () { return [ new CustomModule('B') ]; }
      }
      assert.ok(_.find((new EntityWithOverriddenModule()).modules, (module) => { return (module.id === 'B'); }));
    });
  });

  describe('Should accept and apply property definitions', () => {
    describe('Vanilla properties', () => {
      it('Should accept vanilla property definitions via array', () => {
        class ExtendedEntity extends Entity { static get propertyDefinitions () { return ['prop']; } }
        let extended = new ExtendedEntity();
        assert.ok(extended.propertyDefinitions.prop);
      });
      it('Should accept vanilla property definitions via object', () => {
        class ExtendedEntity extends Entity { static get propertyDefinitions () { return { prop: true }; } }
        let extended = new ExtendedEntity();
        assert.ok(extended.propertyDefinitions.prop);
      });
    });
  });

  describe('Casting should work', () => {
    it('From a non-entity', () => {
      class ExtendedEntity extends Entity { static get propertyDefinitions () { return ['propA', 'propB']; } }
      let cast = Entity.cast({ propA: 'valueA', propB: 'valueB', junkA: 'something', junkB: 'somethingElse' }, ExtendedEntity);
      assert.equal(cast.propA, 'valueA');
      assert.equal(cast.propB, 'valueB');
    });
    it('From a same-type entity', () => {
      class ExtendedEntity extends Entity { static get propertyDefinitions () { return ['propA', 'propB']; } }
      let extended = new ExtendedEntity();
      extended.propA = 'valueA';
      extended.propB = 'valueB';
      let cast = Entity.cast(extended, ExtendedEntity);
      assert.equal(cast.propA, 'valueA');
      assert.equal(cast.propB, 'valueB');
    });
    it('Between different type entities', () => {
      class ExtendedEntity extends Entity { static get propertyDefinitions () { return ['propA', 'propB']; } }
      class ExtraExtendedEntity extends ExtendedEntity { static get propertyDefinitions () { return ['propC', 'propD']; } }
      // Cast from fewer to more properties
      let extended = new ExtendedEntity();
      extended.propA = 'valueA';
      extended.propB = 'valueB';
      let cast = Entity.cast(extended, ExtraExtendedEntity);
      assert.equal(cast.propA, 'valueA');
      assert.equal(cast.propB, 'valueB');
      assert.equal(cast.propC, null);
      assert.equal(cast.propD, null);
      // Cast from more to fewer properties
      cast.propC = 'valueC';
      cast.propD = 'valueD';
      let recast = Entity.cast(cast, ExtendedEntity);
      assert.equal(recast.propA, 'valueA');
      assert.equal(recast.propB, 'valueB');
    });
  });

});
