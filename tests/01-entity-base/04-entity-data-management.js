// =====================================================================================================================
// Tests Entity properties watchers
// =====================================================================================================================
let _                   = require('lodash'),
    assert              = require('assert'),
    EnTT                = require('../../dist').default;

// Export tests
module.exports = () => {
  describe('> Entity Data Management', () => {

    // Define Entity extending class with some properties
    class MyExtendedEntity extends EnTT {
      static get props () {
        return {
          foo: {},                                          // Local property
          bar: {},                                          // Local property
          private: { exportable: false },                   // Private, non-exportable property
          readonly: { value: 'readonly', readOnly: true },  // Read-only property
          entity: { cast: MyExtendedEntity },               // Property to have it's value cast as an Entity instance
          entityArray: { cast: [ MyExtendedEntity ] },      // Property to have it's value cast as an array of Entity instances
          entityHashmap: { cast: { MyExtendedEntity } }     // Property to have it's value cast as an array of Entity instances
        };
      }
    }

    // Define Entity extending class with some explicitly bound properties
    class MyExtendedMappedEntity extends EnTT {
      static get props () {
        return {
          foo: { value: 'foo', bind: 'bar' },
          bar: { value: 'bar', bind: 'foo' }
        };
      }
    }

    describe('> Should export raw data', () => {

      // Define a factory creating a testing instance
      let getInstance = () => {
        // Instantiate
        let e = new MyExtendedEntity();
        // Set properties
        e.foo = 'foo';
        e.bar = { baz: 'baz' };
        e.private = 'private';
        // Return instance
        return e;
      };

      it('> Exported data should be re-referenced, not cloned', () => {

        // Instantiate testing instance and export
        let e = getInstance(),
            exported = e.export();

        // Check exported data
        assert.equal(exported.foo, 'foo');
        assert.equal(exported.bar.baz, 'baz');

        // Check exported data wasn't cloned, but just re-referenced
        e.bar.baz = 'foo';
        assert.equal(exported.bar.baz, 'foo');

      });

      it('> Exported data should respect explicit property bindings', () => {

        // Instantiate testing instance with explicit property bindings and export
        let e = new MyExtendedMappedEntity(),
            exported = e.export();

        // Check exported data
        assert.equal(exported.foo, 'bar');
        assert.equal(exported.bar, 'foo');

      });

      it('> Exported data should be a raw object, not an EnTT instance', () => {

        // Instantiate testing instance and export
        let e = getInstance(),
            exported = e.export();

        // Check if export a raw object
        assert.ok(_.isObject(exported));
        assert.ok(!(exported instanceof EnTT));

      });

      it('> Exported data should only contain exportable properties', () => {

        // Instantiate testing instance and export
        let e = getInstance(),
            exported = e.export();

        // Check exporting only exportable properties
        assert.ok(_.isUndefined(exported.private));

      });

    });

    describe('> Should recursively export nested entities', () => {

      // Define a factory creating a testing instance
      let getInstance = () => {
        // Instantiate
        let e = new MyExtendedEntity(),
            member = { foo: 'foo', bar: { baz: 'baz' } };
        // Set non-casting property as entity
        e.bar = MyExtendedEntity.cast(member);
        // Set casting entity
        e.entity = MyExtendedEntity.cast(member);
        // Set casting entity array
        e.entityArray = MyExtendedEntity.cast([member, member], []);
        // Set casting entity hashmap
        e.entityHashmap = MyExtendedEntity.cast({ foo: member, bar: member }, {});
        // Return instance
        return e;
      };

      it('> Should re-reference, not export, nested entities from non-casting properties', () => {

        // Instantiate testing instance and export
        let e = getInstance(),
            exported = e.export();

        // Check if non-casting proeprty value was just re-referenced, not exported
        assert.ok(_.isObject(exported.bar));
        assert.ok(exported.bar instanceof EnTT);

      });

      it('> Should export nested entities from casting properties', () => {

        // Instantiate testing instance and export
        let e = getInstance(),
            exported = e.export();

        // Check casting property value was exported as raw data
        assert.ok(_.isObject(exported.entity));
        assert.ok(!(exported.entity instanceof EnTT));
        // Check casting as entity array property members were exported as raw data
        _.forEach(exported.entityArray, (x) => {
          assert.ok(_.isObject(x));
          assert.ok(!(x instanceof EnTT));
        });
        // Check casting as entity hashmap's property members were exported as raw data
        _.forEach(exported.entityHashmap, (x) => {
          assert.ok(_.isObject(x));
          assert.ok(!(x instanceof EnTT));
        });

      });

      it('> Should correctly export nested entities\' data', () => {

        // Instantiate testing instance and export
        let e = getInstance(),
            exported = e.export();

        // Check nested, not-cast, entity data
        assert.equal(exported.bar.foo, 'foo');
        assert.equal(exported.bar.bar.baz, 'baz');

        // Check entities cast into property of nested array of entities' data
        assert.equal(exported.entityArray.length, 2);
        _.forEach(exported.entityArray, (x) => {
          assert.equal(x.foo, 'foo');
          assert.equal(x.bar.baz, 'baz');
        });

        // Check entities cast into property of nested hashmap of entities' data
        assert.equal(_.keys(exported.entityHashmap).length, 2);
        assert.ok(exported.entityHashmap.hasOwnProperty('foo'));
        assert.ok(exported.entityHashmap.hasOwnProperty('bar'));
        _.forEach(exported.entityHashmap, (x) => {
          assert.equal(x.foo, 'foo');
          assert.equal(x.bar.baz, 'baz');
        });

      });

      it('> Nested entities\' exported data should be re-referenced, not cloned', () => {

        // Instantiate testing instance and export
        let e = getInstance(),
            exported = e.export();

        // Check nested not cast entity wasn't cloned, but just re-referenced
        e.bar.foo = 'bar';
        assert.equal(exported.bar.foo, 'bar');
        // Check nested entity's internals weren't cloned, but just re-referenced
        e.entity.bar.baz = 'foo';
        assert.equal(exported.entity.bar.baz, 'foo');
        // Check nested entity array's internals weren't cloned, but just re-referenced
        _.forEach(e.entityArray, (e, i) => {
          e.bar.baz = 'foo';
          assert.equal(exported.entityArray[i].bar.baz, 'foo');
        });
        // Check nested entity hashmap's internals weren't cloned, but just re-referenced
        _.forEach(e.entityHashmap, (e, key) => {
          e.bar.baz = 'foo';
          assert.equal(exported.entityHashmap[key].bar.baz, 'foo');
        });

      });

    });

    // Should import raw data
    describe('> Should import raw data', () => {

      // Define a factory creating a testing instance
      let getInstance = () => {
        // Instantiate
        let e = new MyExtendedEntity();
        // Set properties
        e.foo = 'foo';
        e.bar = { baz: 'baz' };
        e.private = 'private';
        // Return instance
        return e;
      };

      // Define importing raw data
      let importing = {
        foo: { foo: 'foo', bar: 'bar' },          // Local property
        bar: MyExtendedEntity.cast({              // Not-cast property being assigned an entity - should just copy reference
          foo: 'bar',                               // Local property
          bar: 'baz',                               // Local property
          baz: 'foo'                                // Undefined property
        }),
        baz: 'foo',                               // Undefined property
        private: 'public',                        // Private, non-exportable property
        readonly: 'writable'                      // Read-only property
      };

      it('> Imported data should be re-referenced, not cloned', () => {

        // Instantiate testing instance and import data
        let e = getInstance();
        e.import(importing);

        // Check data was imported for raw properties
        assert.equal(e.foo, importing.foo);
        assert.equal(e.bar.foo, 'bar');
        assert.equal(e.bar.bar, 'baz');

        // Check raw data was re-referenced, not cloned for raw properties
        importing.foo.foo = 'bar';
        assert.equal(e.foo.foo, 'bar');
        importing.foo.bar = 'foo';
        assert.equal(e.foo.bar, 'foo');

        // Check imported not-cast entity was not cloned, but just re-referenced
        assert.ok(_.isObject(e.bar));
        assert.ok(e.bar instanceof EnTT);


      });

      it('> Should respect explicit property bindings', () => {

        // Instantiate testing instance with explicit property bindings and import data
        let e = (new MyExtendedMappedEntity()).import({
          foo: 'foo',
          bar: 'bar'
        });

        // Check imported data
        assert.equal(e.foo, 'bar');
        assert.equal(e.bar, 'foo');

      });

      it('> Should not import non-exportable properties', () => {

        // Instantiate testing instance and import data
        let e = getInstance();
        e.import(importing);

        // Check that non-exportable properties weren't imported
        assert.equal(e.private, 'private');

      });

      it('> Should not import read-only properties', () => {

        // Instantiate testing instance and import data
        let e = getInstance();
        e.import(importing);

        // Check that read-only properties weren't imported
        assert.equal(e.readonly, 'readonly');

      });

      it('> Should not import not defined properties', () => {

        // Instantiate testing instance and import data
        let e = getInstance();
        e.import(importing);

        // Check that not declared properties weren't imported
        assert.equal(e.baz, null);
        assert.equal(e.bar.baz, null);

      });

    });

    // Should import nested Entity data
    describe('> Should recursively import nested Entity data', () => {

      // Define a factory creating a testing instance
      let getInstance = () => {
        // Instantiate
        let e = new MyExtendedEntity();
        // Set properties
        e.foo = 'foo';
        e.bar = { baz: 'baz' };
        e.private = 'private';
        // Return instance
        return e;
      };

      // Define importing raw data
      let importing = { foo: 'foo', bar: { baz: 'baz' } };

      it('Should cast imported raw data into single entity properties', () => {

        // Instantiate testing instance
        let e = getInstance();
        // Import raw data
        let nestedData = _.cloneDeep(importing);
        e.import({ entity: nestedData });

        // Check import is an entity type
        assert.ok(_.isObject(e.entity));
        assert.ok(e.entity instanceof EnTT);
        // Check imported data
        assert.equal(e.entity.foo, 'foo');
        assert.equal(e.entity.bar.baz, 'baz');
        // Check imported internal structure wasn't cloned, but only re-referenced
        nestedData.bar.baz = 'bar';
        assert.equal(e.entity.bar.baz, 'bar');

      });

      it('Should cast imported entity into single entity properties', () => {

        // Instantiate testing instance
        let e = getInstance();
        // Import entity
        let nestedData = _.cloneDeep(importing),
            nestedEntity = (new MyExtendedEntity).import(nestedData);
        e.import({ entity: nestedEntity });

        // Check import is an entity type
        assert.ok(_.isObject(e.entity));
        assert.ok(e.entity instanceof EnTT);
        // Check entity was imported and wasn't re-cast, but only re-referenced
        assert.equal(e.entity, nestedEntity);
        // Check imported data
        assert.equal(e.entity.foo, 'foo');
        assert.equal(e.entity.bar.baz, 'baz');
        // Check imported internal structure wasn't cloned, but only re-referenced
        nestedData.bar.baz = 'foo';
        assert.equal(e.entity.bar.baz, 'foo');

      });

      // Should cast imported data into entity array properties
      it('Should cast imported raw data into entity array properties', () => {

        // Instantiate testing instance and import data
        let e = getInstance();

        // Import raw data and expect it to be cast as entity
        let nestedData = _.cloneDeep(importing);
        e.import({
          entityArray: [ nestedData, nestedData ]
        });

        // Check imported data
        assert.equal(e.entityArray.length, 2);
        _.forEach(e.entityArray, (x) => {
          // Check import is an entity type
          assert.ok(_.isObject(x));
          assert.ok(x instanceof EnTT);
          // Check imported data
          assert.equal(x.foo, 'foo');
          assert.equal(x.bar.baz, 'baz');
        });
        // Check imported internal structure wasn't cloned, but only re-referenced
        nestedData.bar.baz = 'bar';
        _.forEach(e.entityArray, (x) => {
          assert.equal(x.bar.baz, 'bar');
        });

      });

      // Should cast imported data into entity array properties
      it('Should cast imported entity array into entity array properties', () => {

        // Instantiate testing instance and import data
        let e = getInstance();

        // Import entity
        let nestedData = _.cloneDeep(importing),
            nestedEntity = (new MyExtendedEntity).import(nestedData);
        e.import({
          entityArray: [ nestedEntity, nestedEntity ]
        });

        // Check imported data
        assert.equal(e.entityArray.length, 2);
        _.forEach(e.entityArray, (x) => {
          // Check import is an entity type
          assert.ok(_.isObject(x));
          assert.ok(x instanceof EnTT);
          // Check entity was imported and wasn't re-cast, but only re-referenced
          assert.equal(x, nestedEntity);
          // Check imported data
          assert.equal(x.foo, 'foo');
          assert.equal(x.bar.baz, 'baz');
        });
        // Check imported internal structure wasn't cloned, but only re-referenced
        nestedData.bar.baz = 'bar';
        _.forEach(e.entityArray, (x) => {
          assert.equal(x.bar.baz, 'bar');
        });

      });

      // Should cast imported data into entity hashmap properties
      it('Should cast imported raw data into entity hashmap properties', () => {

        // Instantiate testing instance and import data
        let e = getInstance();

        // Import entity
        let nestedData = _.cloneDeep(importing);
        // Import raw data and expect it to be cast as entity
        e.import({
          entityHashmap: { foo: nestedData, bar: nestedData }
        });

        // Check imported data
        assert.equal(_.keys(e.entityHashmap).length, 2);
        assert.ok(e.entityHashmap.hasOwnProperty('foo'));
        assert.ok(e.entityHashmap.hasOwnProperty('bar'));
        _.forEach(e.entityArray, (x) => {
          // Check import is an entity type
          assert.ok(_.isObject(x));
          assert.ok(x instanceof EnTT);
          // Check imported data
          assert.equal(x.foo, 'foo');
          assert.equal(x.bar.baz, 'baz');
        });
        // Check imported internal structure wasn't cloned, but only re-referenced
        nestedData.bar.baz = 'bar';
        _.forEach(e.entityArray, (x) => {
          assert.equal(x.bar.baz, 'bar');
        });

      });

      // Should cast imported data into entity hashmap properties
      it('Should cast imported entity hashmap into entity hashmap properties', () => {

        // Instantiate testing instance and import data
        let e = getInstance();

        // Import entity
        let nestedData = _.cloneDeep(importing),
            nestedEntity = (new MyExtendedEntity).import(nestedData);
        e.import({
          entityHashmap: { foo: nestedEntity, bar: nestedEntity }
        });

        // Check imported data
        assert.equal(_.keys(e.entityHashmap).length, 2);
        assert.ok(e.entityHashmap.hasOwnProperty('foo'));
        assert.ok(e.entityHashmap.hasOwnProperty('bar'));
        _.forEach(e.entityArray, (x) => {
          // Check import is an entity type
          assert.ok(_.isObject(x));
          assert.ok(x instanceof EnTT);
          // Check entity was imported and wasn't re-cast, but only re-referenced
          assert.equal(x, nestedEntity);
          // Check imported data
          assert.equal(x.foo, 'foo');
          assert.equal(x.bar.baz, 'baz');
        });
        // Check imported internal structure wasn't cloned, but only re-referenced
        nestedData.bar.baz = 'bar';
        _.forEach(e.entityArray, (x) => {
          assert.equal(x.bar.baz, 'bar');
        });

      });

    });

    // Should clone entities
    describe('> Should clone entities', () => {

      // Define a factory creating a testing instance
      let getInstance = () => {
        // Instantiate
        let nestedData = { foo: 'foo', bar: { baz: 'baz' } },
            nestedEntity = (new MyExtendedEntity()).import(nestedData),
            e = new MyExtendedEntity();
        // Set properties
        e.foo = 'foo';
        e.bar = { foo: nestedEntity, baz: 'baz' };
        e.entity = nestedEntity;
        e.entityArray = [ nestedEntity, nestedEntity ];
        e.entityHashmap = { foo: nestedEntity, bar: nestedEntity };
        // Return instance
        return e;
      };

      it('Should clone entity', () => {

        // Instantiate testing instance and clone
        let e = getInstance(),
            cloned = e.clone();

        // Check cloned is an entity
        assert.ok(_.isObject(cloned));
        assert.ok(cloned instanceof EnTT);
        assert.ok(cloned instanceof MyExtendedEntity);

      });

      it('Should preserve cloned data', () => {

        // Instantiate testing instance and clone
        let e = getInstance(),
            cloned = e.clone();

        // Check cloned data
        assert.equal(cloned.foo, 'foo');
        assert.equal(cloned.bar.baz, 'baz');
        // Check cloned nested single entity data
        assert.equal(cloned.entity.foo, 'foo');
        assert.equal(cloned.entity.bar.baz, 'baz');
        // Check cloned nested entity array data
        assert.equal(cloned.entityArray.length, 2);
        _.forEach(cloned.entityArray, (x) => {
          assert.equal(x.foo, 'foo');
          assert.equal(x.bar.baz, 'baz');
        });
        // Check cloned nested entity hashmap data
        assert.equal(_.keys(cloned.entityHashmap).length, 2);
        assert.ok(cloned.entityHashmap.hasOwnProperty('foo'));
        assert.ok(cloned.entityHashmap.hasOwnProperty('bar'));
        _.forEach(cloned.entityHashmap, (x) => {
          assert.equal(x.foo, 'foo');
          assert.equal(x.bar.baz, 'baz');
        });
        // Check cloned internal structure was cloned, not only re-referenced
        e.bar.baz = 'foo';
        _.forEach([cloned.entity, ...cloned.entityArray, ..._.values(cloned.entityHashmap)], (x) => {
          assert.notEqual(x.bar.baz, e.bar.baz);
          assert.equal(x.bar.baz, 'baz');
        });


      });

      it('Should clone nested entites into properties marked as cast, not just re-reference them', () => {

        // Instantiate testing instance and clone
        let e = getInstance(),
            cloned = e.clone();

        // Check nested single entites were cloned
        assert.notEqual(e.entity, cloned.entity);
        // Check nested entity arrays were cloned
        _.forEach(e.entityArray, (e, i) => {
          assert.notEqual(e, cloned.entityArray[i]);
        });
        // Check nested entity hashmaps were cloned
        _.forEach(e.entityArray, (e, key) => {
          assert.notEqual(e, cloned.entityHashmap[key]);
        });

      });

      it('Should clone nested entites into properties not marked as cast, not just re-reference them', () => {

        // Instantiate testing instance and embed an entity into a non-casting property
        let e = getInstance();
        e.foo = new MyExtendedEntity();
        // Clone
        let cloned = e.clone();

        // Check non-cast property with entity value was cloned, not just re-referenced
        assert.ok(_.isObject(cloned.foo));
        assert.ok(cloned.foo instanceof EnTT);
        assert.ok(cloned.foo instanceof MyExtendedEntity);
        assert.notEqual(cloned.foo, e.foo);

        // Check nested non-cast entities were cloned, not just re-referenced
        e.bar.foo.foo = 'baz';
        assert.notEqual(cloned.bar.foo.foo, e.bar.foo.foo);
        assert.equal(cloned.bar.foo.foo, 'foo');

      });

    });

    // Should cast raw data and between entities
    describe('> Should cast entities', () => {

      // Define Entity extending classes with some properties
      class MyCastingTargetEntity1 extends MyExtendedEntity {
        static get props () {
          return {
            baz: {}
          };
        }
      }
      class MyCastingTargetEntity2 extends MyExtendedEntity {
        static get props () {
          return {
            qux: {}
          };
        }
      }

      // Define a factory creating a testing instances
      let getInstances = () => {
        // Instantiate
        let data = {
              foo: 'foo',
              bar: { baz: 'baz' },
              baz: 'baz',
              qux: 'qux',
              private: 'public',
              readonly: 'writable'
            },
            e1 = (new MyCastingTargetEntity1()).import(data),
            e2 = (new MyCastingTargetEntity2()).import(data);
        // Return instances
        return { data, e1, e2 };
      };

      it('> Should cast raw data as single entity', () => {

        // Instantiate testing instances and cast
        let { data } = getInstances(),
            castAs1 = EnTT.cast(data, MyCastingTargetEntity1),
            castAs2 = MyCastingTargetEntity2.cast(data);        // Alternative syntax

        // Should be an entity
        assert.ok(_.isObject(castAs1));
        assert.ok(castAs1 instanceof EnTT);
        // Should be an entity (should work with alternative syntax)
        assert.ok(_.isObject(castAs2));
        assert.ok(castAs2 instanceof EnTT);
        // Should preserve cast data
        assert.equal(castAs1.foo, 'foo');
        assert.equal(castAs1.bar.baz, 'baz');
        assert.equal(castAs2.foo, 'foo');
        assert.equal(castAs2.bar.baz, 'baz');
        // Should cast even not-exportable properties
        assert.equal(castAs1.private, 'public');
        assert.equal(castAs2.private, 'public');
        // Should not cast read-only properties
        assert.equal(castAs1.readonly, 'readonly');
        assert.equal(castAs2.readonly, 'readonly');
        // Should not cast not-defined properties
        assert.equal(castAs1.qux, undefined);
        assert.equal(castAs2.baz, undefined);
        // Should not clone, but only re-reference internal data
        data.bar.baz = 'foo';
        assert.equal(castAs1.bar.baz, 'foo');
        assert.equal(castAs2.bar.baz, 'foo');

      });

      it('> Should cast raw data as entity array', () => {

        // Instantiate testing instances and cast
        let { data } = getInstances(),
            castAsArrayOf1 = EnTT.cast([ data, data ], [ MyCastingTargetEntity1 ]),
            alt1CastAsArrayOf1 = MyCastingTargetEntity1.cast([ data, data ], []),    // Alternative syntax
            alt2CastAsArrayOf1 = MyCastingTargetEntity1.cast([ data, data ]),        // Alternative syntax
            castAsArrayOf2 = EnTT.cast([ data, data ], [ MyCastingTargetEntity2 ]),
            alt1CastAsArrayOf2 = MyCastingTargetEntity2.cast([ data, data ], []),    // Alternative syntax
            alt2CastAsArrayOf2 = MyCastingTargetEntity2.cast([ data, data ]);        // Alternative syntax

        // Should cast all data in array
        assert.equal(castAsArrayOf1.length, 2);
        assert.equal(castAsArrayOf2.length, 2);
        // All members should be cast correcty as entities (should work with alternative syntax)
        _.forEach([...castAsArrayOf1, ...alt1CastAsArrayOf1, ...alt2CastAsArrayOf1], (x) => {
          assert.ok(_.isObject(x));
          assert.ok(x instanceof EnTT);
          assert.ok(x instanceof MyCastingTargetEntity1);
        });
        _.forEach([...castAsArrayOf2, ...alt1CastAsArrayOf2, ...alt2CastAsArrayOf2], (x) => {
          assert.ok(_.isObject(x));
          assert.ok(x instanceof EnTT);
          assert.ok(x instanceof MyCastingTargetEntity2);
        });
        // Should preserve cast data
        _.forEach([...castAsArrayOf1, ...castAsArrayOf2], (x) => {
          assert.equal(x.foo, 'foo');
          assert.equal(x.bar.baz, 'baz');
        });
        // Should not cast not-defined properties
        _.forEach(castAsArrayOf1, (x) => {
          assert.equal(x.qux, undefined);
        });
        _.forEach(castAsArrayOf2, (x) => {
          assert.equal(x.baz, undefined);
        });
        assert.equal(castAsArrayOf1[0].qux, undefined);
        assert.equal(castAsArrayOf1[1].qux, undefined);
        assert.equal(castAsArrayOf2[0].baz, undefined);
        assert.equal(castAsArrayOf2[1].baz, undefined);
        // Should not clone, but only re-reference internal data
        data.bar.baz = 'foo';
        _.forEach([...castAsArrayOf1, ...castAsArrayOf2], (x) => {
          assert.equal(x.bar.baz, 'foo');
        });

      });

      it('> Should cast raw data as entity hashmap', () => {

        // Instantiate testing instances and cast
        let { data } = getInstances(),
            castAsHashmapOf1 = EnTT.cast({ foo: data, bar: data }, { MyCastingTargetEntity1 }),
            castAsHashmapOf2 = MyCastingTargetEntity2.cast({ foo: data, bar: data }, {});        // Alternative syntax

        // Should cast all data in hashmap
        assert.equal(_.keys(castAsHashmapOf1).length, 2);
        assert.ok(castAsHashmapOf1.hasOwnProperty('foo'));
        assert.ok(castAsHashmapOf1.hasOwnProperty('bar'));
        assert.equal(_.keys(castAsHashmapOf2).length, 2);
        assert.ok(castAsHashmapOf2.hasOwnProperty('foo'));
        assert.ok(castAsHashmapOf2.hasOwnProperty('bar'));
        // All members should be cast correcty as entities
        _.forEach(castAsHashmapOf1, (x) => {
          assert.ok(_.isObject(x));
          assert.ok(x instanceof EnTT);
          assert.ok(x instanceof MyCastingTargetEntity1);
        });
        _.forEach(castAsHashmapOf2, (x) => {
          assert.ok(_.isObject(x));
          assert.ok(x instanceof EnTT);
          assert.ok(x instanceof MyCastingTargetEntity2);
        });
        // Should preserve cast data
        _.forEach([..._.values(castAsHashmapOf1), ..._.values(castAsHashmapOf2)], (x) => {
          assert.equal(x.foo, 'foo');
          assert.equal(x.bar.baz, 'baz');
        });
        // Should not cast not-defined properties
        _.forEach(castAsHashmapOf1, (x) => {
          assert.equal(x.qux, undefined);
        });
        _.forEach(castAsHashmapOf2, (x) => {
          assert.equal(x.baz, undefined);
        });
        // Should not clone, but only re-reference internal data
        data.bar.baz = 'foo';
        _.forEach([..._.values(castAsHashmapOf1), ..._.values(castAsHashmapOf2)], (x) => {
          assert.equal(x.bar.baz, 'foo');
        });

      });

      it('> Should cast between single entities', () => {

        // Instantiate testing instances and cast
        let { data, e1, e2 } = getInstances(),
            castAs1 = EnTT.cast(e2, MyCastingTargetEntity1),
            castAs2 = MyCastingTargetEntity2.cast(e1);        // Alternative syntax

        // Should be an entity
        assert.ok(_.isObject(castAs1));
        assert.ok(castAs1 instanceof EnTT);
        assert.ok(_.isObject(castAs2));
        assert.ok(castAs2 instanceof EnTT);
        // Should preserve cast data
        assert.equal(castAs1.foo, 'foo');
        assert.equal(castAs1.bar.baz, 'baz');
        assert.equal(castAs2.foo, 'foo');
        assert.equal(castAs2.bar.baz, 'baz');
        // Should not cast non-common properties
        assert.equal(castAs1.qux, undefined);
        assert.equal(castAs2.baz, undefined);
        // Should not clone, but only re-reference internal data
        data.bar.baz = 'foo';
        assert.equal(castAs1.bar.baz, 'foo');
        assert.equal(castAs2.bar.baz, 'foo');

      });

      it('> Should cast between entity arrays', () => {

        // Instantiate testing instances and cast
        let { data, e1, e2 } = getInstances(),
            castAsArrayOf1 = EnTT.cast([ e2, e2 ], [ MyCastingTargetEntity1 ]),
            castAsArrayOf2 = MyCastingTargetEntity2.cast([ e1, e1 ], [ ]);      // Alternative syntax

        // Should cast all data in array
        assert.equal(castAsArrayOf1.length, 2);
        assert.equal(castAsArrayOf2.length, 2);
        // All members should be cast correcty as entities (should work with alternative syntax)
        // All members should be cast correcty as entities (should work with alternative syntax)
        _.forEach(castAsArrayOf1, (x) => {
          assert.ok(_.isObject(x));
          assert.ok(x instanceof EnTT);
          assert.ok(x instanceof MyCastingTargetEntity1);
        });
        _.forEach(castAsArrayOf2, (x) => {
          assert.ok(_.isObject(x));
          assert.ok(x instanceof EnTT);
          assert.ok(x instanceof MyCastingTargetEntity2);
        });
        // Should preserve cast data
        _.forEach([...castAsArrayOf1, ...castAsArrayOf2], (x) => {
          assert.equal(x.foo, 'foo');
          assert.equal(x.bar.baz, 'baz');
        });
        // Should not cast not-defined properties
        _.forEach(castAsArrayOf1, (x) => {
          assert.equal(x.qux, undefined);
        });
        _.forEach(castAsArrayOf2, (x) => {
          assert.equal(x.baz, undefined);
        });
        assert.equal(castAsArrayOf1[0].qux, undefined);
        assert.equal(castAsArrayOf1[1].qux, undefined);
        assert.equal(castAsArrayOf2[0].baz, undefined);
        assert.equal(castAsArrayOf2[1].baz, undefined);
        // Should not clone, but only re-reference internal data
        data.bar.baz = 'foo';
        _.forEach([...castAsArrayOf1, ...castAsArrayOf2], (x) => {
          assert.equal(x.bar.baz, 'foo');
        });

      });

      it('> Should cast between entity hashmaps', () => {

        // Instantiate testing instances and cast
        let { data, e1, e2 } = getInstances(),
            castAsHashmapOf1 = EnTT.cast({ foo: e2, bar: e2 }, { MyCastingTargetEntity1 }),
            castAsHashmapOf2 = MyCastingTargetEntity2.cast({ foo: e1, bar: e1 }, { });      // Alternative syntax

        // Should cast all data in hashmap
        assert.equal(_.keys(castAsHashmapOf1).length, 2);
        assert.ok(castAsHashmapOf1.hasOwnProperty('foo'));
        assert.ok(castAsHashmapOf1.hasOwnProperty('bar'));
        assert.equal(_.keys(castAsHashmapOf2).length, 2);
        assert.ok(castAsHashmapOf2.hasOwnProperty('foo'));
        assert.ok(castAsHashmapOf2.hasOwnProperty('bar'));
        // All members should be cast correcty as entities
        _.forEach(castAsHashmapOf1, (x) => {
          assert.ok(_.isObject(x));
          assert.ok(x instanceof EnTT);
          assert.ok(x instanceof MyCastingTargetEntity1);
        });
        _.forEach(castAsHashmapOf2, (x) => {
          assert.ok(_.isObject(x));
          assert.ok(x instanceof EnTT);
          assert.ok(x instanceof MyCastingTargetEntity2);
        });
        // Should preserve cast data
        _.forEach([..._.values(castAsHashmapOf1), ..._.values(castAsHashmapOf2)], (x) => {
          assert.equal(x.foo, 'foo');
          assert.equal(x.bar.baz, 'baz');
        });
        // Should not cast not-defined properties
        _.forEach(castAsHashmapOf1, (x) => {
          assert.equal(x.qux, undefined);
        });
        _.forEach(castAsHashmapOf2, (x) => {
          assert.equal(x.baz, undefined);
        });
        // Should not clone, but only re-reference internal data
        data.bar.baz = 'foo';
        _.forEach([..._.values(castAsHashmapOf1), ..._.values(castAsHashmapOf2)], (x) => {
          assert.equal(x.bar.baz, 'foo');
        });

      });

      // Casting into same type should preserve reference to same instance
      it('> Casting into same type should preserve references to instances', () => {

        // Instantiate testing instances and cast
        let { e1: e } = getInstances(),
            castAs1 = EnTT.cast(e, MyCastingTargetEntity1),
            castAsArrayOf1 = EnTT.cast([ e, e ], [ MyCastingTargetEntity1 ]),
            castAsHashmapOf1 = EnTT.cast({ foo: e, bar: e }, { MyCastingTargetEntity1 });

        // Casting single entity to same type should preserve instance
        assert.equal(e, castAs1);
        // Casting entity within entity array to same type should preserve instance
        _.forEach(castAsArrayOf1, (x) => {
          assert.equal(e, x);
        });
        // Casting entity within entity ahshmap to same type should preserve instance
        _.forEach(castAsHashmapOf1, (x) => {
          assert.equal(e, x);
        });

      });

    });

  });
};
