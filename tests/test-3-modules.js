// =====================================================================================================================
// Tests Entity Modules classes
// =====================================================================================================================
let _       = require('lodash'),
    assert  = require('assert'),
    Entity  = require('../dist').default;

// Entity Extended Class
describe('Modules', () => {
  Entity.debug = true;

  describe('Default value module', () => {
    class ExtendedEntity extends Entity {
      static get schema () {
        return {
          prop: { value: 'default' }
        };
      }
    }
    let extended = new ExtendedEntity();
    it('Should accept default value property configuration', () => {
      assert.ok(extended.schema.prop);
    });
    it('Should use default values until value set', () => {
      assert.equal(extended.prop, 'default');
    });
    it('Should use set value if stored', () => {
      extended.prop = 'custom';
      assert.equal(extended.prop, 'custom');
    });
  });

  describe('Dynamic value module', () => {
    class ExtendedEntity extends Entity {
      static get schema () {
        return {
          x: { value: (100 + Math.round(100 * Math.random())) },
          squareEx: { dynamic: function () { return (this.x * this.x); } },
          squareSh: function () { return (this.x * this.x); },
        };
      }
    }
    let extended = new ExtendedEntity();
    it('Should accept explicit dynamic property configuration', () => {
      assert.equal(extended.squareEx, extended.x * extended.x);
    });
    it('Should accept short-hand dynamic property configuration', () => {
      assert.equal(extended.squareSh, extended.x * extended.x);
    });
  });

  describe('Casting value module', () => {
    class ExtendedEntity extends Entity { static get schema () { return { prop: true }; } }
    class CastingEntity extends ExtendedEntity {
      static get schema () {
        return {
          castSingleEx:         { castAs: ExtendedEntity, collection: false },
          castCollectionEx:     { castAs: ExtendedEntity, collection: true },
          castSingleSemiEx:     { castAs: ExtendedEntity },
          castCollectionSemiEx: { castAs: [ ExtendedEntity ] },
          castSingleSh:         ExtendedEntity,
          castCollectionSh:     [ ExtendedEntity ]
        };
      }
    }
    let casting = new CastingEntity();
    it('Should cast single entity when explicitly defined', () => {
      casting.castSingleEx = { prop: 'value' };
      assert.ok(casting.castSingleEx instanceof ExtendedEntity);
      assert.equal(casting.castSingleEx.prop, 'value');
    });
    it('Should cast single entity when semi-explicitly defined', () => {
      casting.castSingleSemiEx = { prop: 'value' };
      assert.ok(casting.castSingleSemiEx instanceof ExtendedEntity);
      assert.equal(casting.castSingleSemiEx.prop, 'value');
    });
    it('Should cast single entity when defined via short-hand', () => {
      casting.castSingleSh = { prop: 'value' };
      assert.ok(casting.castSingleSh instanceof ExtendedEntity);
      assert.equal(casting.castSingleSh.prop, 'value');
    });
    it('Should not cast if already an entity', () => {
      let extended = new ExtendedEntity();
      casting.castSingleEx = extended;
      assert.equal(casting.castSingleEx, extended);
    });
    // Cast collection properties
    it('Should cast collection of entities when explicitly defined', () => {
      casting.castCollectionEx = [{ prop: 0 }, { prop: 1 }, { prop: 2 }];
      assert.ok(_.isArray(casting.castCollectionEx));
      _.forEach(casting.castCollectionEx, (cast, i) => {
        assert.ok(cast instanceof ExtendedEntity);
        assert.equal(cast.prop, i);
      });
    });
    it('Should cast collection of entities when semi-explicitly defined', () => {
      casting.castCollectionSemiEx = [{ prop: 0 }, { prop: 1 }, { prop: 2 }];
      assert.ok(_.isArray(casting.castCollectionSemiEx));
      _.forEach(casting.castCollectionSemiEx, (cast, i) => {
        assert.ok(cast instanceof ExtendedEntity);
        assert.equal(cast.prop, i);
      });
    });
    it('Should cast collection of entities when defined via short-hand', () => {
      casting.castCollectionSh = [{ prop: 0 }, { prop: 1 }, { prop: 2 }];
      assert.ok(_.isArray(casting.castCollectionSh));
      _.forEach(casting.castCollectionSh, (cast, i) => {
        assert.ok(cast instanceof ExtendedEntity);
        assert.equal(cast.prop, i);
      });
    });
    it('Should not cast if already a collection of entities', () => {
      let extendedCollection = [ new ExtendedEntity(), new ExtendedEntity(), new ExtendedEntity() ];
      casting.castCollectionEx = extendedCollection;
      assert.ok((casting.castCollectionEx[0] === extendedCollection[0]) && (casting.castCollectionEx[1] === extendedCollection[1]) && (casting.castCollectionEx[2] === extendedCollection[2]));
    });
  });

});
