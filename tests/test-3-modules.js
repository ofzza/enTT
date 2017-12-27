// =====================================================================================================================
// Tests Entity Modules classes
// =====================================================================================================================
let _       = require('lodash'),
    assert  = require('assert'),
    Entity  = require('../dist').default;

// Entity Extended Class
describe('Modules', () => {
  Entity.debug = true;

  describe('Key value module', () => {
    class ExtendedEntityWithoutKeys extends Entity {
      static get propertyDefinitions () {
        return {
          idA: { key: false },
          idB: { key: false },
        };
      }
    }
    class ExtendedEntityWithKeys extends Entity {
      static get propertyDefinitions () {
        return {
          idA: { key: true },
          idB: { key: true },
        };
      }
    }
    it('Should not generate a "uniqueKey" if no primary key properties', () => {
      let extended = new ExtendedEntityWithoutKeys();
      assert.equal(extended.uniqueKey, undefined);
    });
    it('Should generate an empty "uniqueKey" if no data', () => {
      let extended = new ExtendedEntityWithKeys();
      assert.ok(extended.uniqueKey);
    });
    it('Should change "uniqueKey" as key proeprty values change', () => {
      let extended = new ExtendedEntityWithKeys(),
          key1 = extended.uniqueKey;
      extended.idA = 1;
      let key2 = extended.uniqueKey;
      extended.idB = 2;
      let key3 = extended.uniqueKey;
      extended.idA = 3;
      let key4 = extended.uniqueKey;
      assert.notEqual(key1, key2);
      assert.notEqual(key1, key3);
      assert.notEqual(key1, key4);
      assert.notEqual(key2, key1);
      assert.notEqual(key2, key3);
      assert.notEqual(key2, key4);
      assert.notEqual(key3, key1);
      assert.notEqual(key3, key2);
      assert.notEqual(key3, key4);
      assert.notEqual(key4, key1);
      assert.notEqual(key4, key2);
      assert.notEqual(key4, key3);
    });
  });

  describe('Default value module', () => {
    class ExtendedEntity extends Entity {
      static get propertyDefinitions () {
        return {
          prop: { value: 'default' }
        };
      }
    }
    let extended = new ExtendedEntity();
    it('Should accept default value property configuration', () => {
      assert.ok(extended.__propertyDefinitions.prop);
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
      static get propertyDefinitions () {
        return {
          x: { value: 3 },
          y: { value: 4 },
          multiplyEx: {
            dynamic: function () { return (this.x * this.y); }
          },
          multiplyExDeps: {
            dynamic: function () { return (this.x * this.y); },
            dependencies: ['x']
          },
          multiplySh: function () { return (this.x * this.y); },
        };
      }
    }
    let extended = new ExtendedEntity();
    it('Should accept explicit dynamic property configuration', () => {
      assert.equal(extended.multiplyEx, extended.x * extended.y);
    });
    it('Should accept short-hand dynamic property configuration', () => {
      assert.equal(extended.multiplySh, extended.x * extended.y);
    });
    it('Should recalculate on dependency change', () => {
      extended.x = 5;
      assert.equal(extended.multiplyEx, extended.x * extended.y);
      assert.equal(extended.multiplyExDeps, extended.x * extended.y);
    });
    it('Should not recalculate on non-dependency change', () => {
      extended.y = 6;
      assert.equal(extended.multiplyEx, extended.x * extended.y);
      assert.notEqual(extended.multiplyExDeps, extended.x * extended.y);
      extended.x = 7;
      assert.equal(extended.multiplyEx, extended.x * extended.y);
      assert.equal(extended.multiplyExDeps, extended.x * extended.y);
    });
  });

  describe('Casting value module', () => {
    class ExtendedEntity extends Entity {
      static get propertyDefinitions () {
        return {
          id: { key: true },
          prop: true
        };
      }
    }
    class CastingEntity extends ExtendedEntity {
      static get propertyDefinitions () {
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
    it('Should initialize as NULL properties, until any value is set', () => {
      assert.ok(_.isNil(casting.castSingleEx));
      assert.ok(_.isNil(casting.castCollectionEx));
      assert.ok(_.isNil(casting.castSingleSemiEx));
      assert.ok(_.isNil(casting.castCollectionSemiEx));
      assert.ok(_.isNil(casting.castSingleSh));
      assert.ok(_.isNil(casting.castCollectionSh));
    });
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
      casting.castSingleEx = null;
      casting.castSingleEx = extended;
      assert.equal(casting.castSingleEx, extended);
    });
    it('Should "smart" cast entity if matching primary key', () => {
      let initialValue = new ExtendedEntity();
      initialValue.id = 1;
      initialValue.prop = 'initial';
      let newValue = new ExtendedEntity();
      newValue.id = 1;
      newValue.prop = 'new';
      casting.castSingleEx = initialValue;
      casting.castSingleEx = newValue;
      assert.equal(casting.castSingleEx, initialValue);
      assert.equal(casting.castSingleEx.prop, newValue.prop);
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
      casting.castCollectionEx = null;
      casting.castCollectionEx = extendedCollection;
      assert.ok((casting.castCollectionEx[0] === extendedCollection[0]) && (casting.castCollectionEx[1] === extendedCollection[1]) && (casting.castCollectionEx[2] === extendedCollection[2]));
    });
    it('Should "smart" cast collection members matching primary key', () => {
      let initialCollection = [ new ExtendedEntity(), new ExtendedEntity(), new ExtendedEntity() ];
      initialCollection[0].id = 1;
      initialCollection[0].prop = 'initial 1';
      initialCollection[1].id = 2;
      initialCollection[1].prop = 'initial 2';
      initialCollection[2].id = 3;
      initialCollection[2].prop = 'initial 3';
      let newCollection = [ { id: 1, prop: 'new 1' }, new ExtendedEntity() ];
      newCollection[1].id = 4;
      newCollection[1].prop = 'new 4';
      casting.castCollectionEx = initialCollection;
      casting.castCollectionEx = newCollection;
      assert.equal(casting.castCollectionEx.length, 2);
      assert.equal(casting.castCollectionEx[0], initialCollection[0]);
      assert.equal(casting.castCollectionEx[0].prop, newCollection[0].prop);
      assert.equal(casting.castCollectionEx[1], newCollection[1]);
      assert.equal(casting.castCollectionEx[1].prop, newCollection[1].prop);
    });
  });

});
