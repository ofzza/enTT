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
          foo: {},
          bar: {},
          private: { exportable: false },
          readonly: { value: 'readonly', readOnly: true },
          entity: { cast: MyExtendedEntity },
          entityArray: { cast: [ MyExtendedEntity ] },
          entityHashmap: { cast: { MyExtendedEntity } }
        };
      }
    }

    // Define Entity extending class with some bound properties
    class MyExtendedMappedEntity extends EnTT {
      static get props () {
        return {
          foo: { value: 'foo', bind: 'bar' },
          bar: { value: 'bar', bind: 'foo' }
        };
      }
    }

    // Should export raw data
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

      // Should preserve exported data
      it('> Should preserve exported data', () => {

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
      // Should respect property bindings
      it('> Should respect property bindings', () => {

        // Instantiate testing instance and export
        let e = new MyExtendedMappedEntity(),
            exported = e.export();

        // Check exported data
        assert.equal(exported.foo, 'bar');
        assert.equal(exported.bar, 'foo');

      });
      // SHould output a raw object
      it('> Should output a raw object, not an EnTT instance', () => {

        // Instantiate testing instance and export
        let e = getInstance(),
            exported = e.export();

        // Check if export a raw object
        assert.ok(_.isObject(exported));
        assert.ok(!(exported instanceof EnTT));

      });
      // Should not export non-exportable properties
      it('> Should only export exportable properties', () => {

        // Instantiate testing instance and export
        let e = getInstance(),
            exported = e.export();

        // Check exporting only exportable properties
        assert.ok(_.isUndefined(exported.private));

      });

    });

    // Should export nested Entity data
    describe('> Should export nested Entity data', () => {

      // Define a factory creating a testing instance
      let getInstance = () => {
        // Instantiate
        let e = new MyExtendedEntity();
        // Set non-nested Entity property as entity
        e.bar = new MyExtendedEntity();
        e.bar.foo = 'foo';
        e.bar.bar = { baz: 'baz' };
        // Set nested entity
        e.entity = new MyExtendedEntity();
        e.entity.foo = 'foo';
        e.entity.bar = { baz: 'baz' };
        // Set nested entity array
        e.entityArray = [ new MyExtendedEntity(), new MyExtendedEntity() ];
        e.entityArray[0].foo = 'foo';
        e.entityArray[0].bar = { baz: 'baz' };
        e.entityArray[1].foo = 'foo';
        e.entityArray[1].bar = { baz: 'baz' };
        // Set nested entity hashmap
        e.entityHashmap = { foo: new MyExtendedEntity(), bar: new MyExtendedEntity() };
        e.entityHashmap.foo.foo = 'foo';
        e.entityHashmap.foo.bar = { baz: 'baz' };
        e.entityHashmap.bar.foo = 'foo';
        e.entityHashmap.bar.bar = { baz: 'baz' };
        // Return instance
        return e;
      };

      // Should preserve exported data
      it('> Should preserve exported data', () => {

        // Instantiate testing instance and export
        let e = getInstance(),
            exported = e.export();

        // Check nested, not cast, entity is exported as is, without exporting
        assert.ok(_.isObject(exported.bar));
        assert.ok(exported.bar instanceof EnTT);
        // Check nested entity array is exported as raw object array
        assert.ok(_.isObject(exported.entityArray[0]));
        assert.ok(!(exported.entityArray[0] instanceof EnTT));
        assert.ok(_.isObject(exported.entityArray[1]));
        assert.ok(!(exported.entityArray[1] instanceof EnTT));
        // Check nested entity hashmap is exported as raw object hashmap
        assert.ok(_.isObject(exported.entityHashmap.foo));
        assert.ok(!(exported.entityHashmap.foo instanceof EnTT));
        assert.ok(_.isObject(exported.entityHashmap.bar));
        assert.ok(!(exported.entityHashmap.bar instanceof EnTT));

        // Check nested entity exported data
        assert.equal(exported.entity.foo, 'foo');
        assert.equal(exported.entity.bar.baz, 'baz');
        // Check nested entity array exported data
        assert.equal(exported.entityArray.length, 2);
        assert.equal(exported.entityArray[0].foo, 'foo');
        assert.equal(exported.entityArray[0].bar.baz, 'baz');
        assert.equal(exported.entityArray[1].foo, 'foo');
        assert.equal(exported.entityArray[1].bar.baz, 'baz');
        // Check nested entity hashmap exported data
        assert.equal(_.keys(exported.entityHashmap).length, 2);
        assert.equal(exported.entityHashmap.foo.foo, 'foo');
        assert.equal(exported.entityHashmap.foo.bar.baz, 'baz');
        assert.equal(exported.entityHashmap.bar.foo, 'foo');
        assert.equal(exported.entityHashmap.bar.bar.baz, 'baz');

        // Check nested not cast entity wasn't cloned, but just re-referenced
        e.bar.foo = 'bar';
        assert.equal(exported.bar.foo, 'bar');
        // Check nested entity's internals weren't cloned, but just re-referenced
        e.entity.bar.baz = 'foo';
        assert.equal(exported.entity.bar.baz, 'foo');
        // Check nested entity array's internals weren't cloned, but just re-referenced
        e.entityArray[0].bar.baz = 'foo';
        assert.equal(exported.entityArray[0].bar.baz, 'foo');
        // Check nested entity hashmap's internals weren't cloned, but just re-referenced
        e.entityHashmap.foo.bar.baz = 'foo';
        assert.equal(exported.entityHashmap.foo.bar.baz, 'foo');

      });
      // Should uncast nested entities in properties marked as cast
      it('> Should uncast nested entities in properties marked as cast', () => {

        // Instantiate testing instance and export
        let e = getInstance(),
            exported = e.export();

        // Check if non-nested entity property remains as original instance
        assert.ok(_.isObject(exported.bar));
        assert.ok(exported.bar instanceof EnTT);
        // Check nested entity array is exported as raw object array
        assert.ok(_.isObject(exported.entityArray[0]));
        assert.ok(!(exported.entityArray[0] instanceof EnTT));
        assert.ok(_.isObject(exported.entityArray[1]));
        assert.ok(!(exported.entityArray[1] instanceof EnTT));
        // Check nested entity hashmap is exported as raw object hashmap
        assert.ok(_.isObject(exported.entityHashmap.foo));
        assert.ok(!(exported.entityHashmap.foo instanceof EnTT));
        assert.ok(_.isObject(exported.entityHashmap.bar));
        assert.ok(!(exported.entityHashmap.bar instanceof EnTT));

      });
      // Should not uncast nested entities in properties not marked as cast
      it('> Should not uncast nested entities in properties not marked as cast', () => {

        // Instantiate testing instance and export
        let e = getInstance(),
            exported = e.export();

        // Check if non-nested entity property remains as original instance
        assert.ok(_.isObject(exported.bar));
        assert.ok(exported.bar instanceof EnTT);

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

      // Should preserve imported data
      it('Should preserve imported data', () => {

        // Instantiate testing instance and import data
        let e = getInstance();
        // Import raw data
        e.import({
          foo: 'bar',                               // Defined property
          bar: (new MyExtendedEntity()).import({    // Not-cast property being assigned an entity - should just copy reference
            foo: 'bar',                               // Defined property
            bar: 'baz',                               // Defined property
            baz: 'foo'                                // Not defined property
          }),
          baz: 'foo',                               // Not defined property
          private: 'public',                        // Non-exportable property
          readonly: 'writable'                      // Read-only property
        });

        // Check data was imported for raw properties
        assert.equal(e.foo, 'bar');
        assert.equal(e.bar.foo, 'bar');
        assert.equal(e.bar.bar, 'baz');
        // Check imported not-cast property was not cloned, but just re-referenced
        assert.ok(_.isObject(e.bar));
        assert.ok(e.bar instanceof EnTT);

      });
      // Should respect property bindings
      it('> Should respect property bindings', () => {

        // Instantiate testing instance and import data
        let e = (new MyExtendedMappedEntity()).import({
          foo: 'foo',
          bar: 'bar'
        });

        // Check imported data
        assert.equal(e.foo, 'bar');
        assert.equal(e.bar, 'foo');

      });
      // Should not import non-exportable properties
      it('Should not import non-exportable properties', () => {

        // Instantiate testing instance and import data
        let e = getInstance();
        // Import raw data
        e.import({
          foo: 'bar',                               // Defined property
          bar: (new MyExtendedEntity()).import({    // Not-cast property being assigned an entity - should just copy reference
            foo: 'bar',                               // Defined property
            bar: 'baz',                               // Defined property
            baz: 'foo'                                // Not defined property
          }),
          baz: 'foo',                               // Not defined property
          private: 'public',                        // Non-exportable property
          readonly: 'writable'                      // Read-only property
        });

        // Check that non-exportable properties weren't imported
        assert.equal(e.private, 'private');

      });
      // Should not import non-exportable properties
      it('Should not import read-only properties', () => {

        // Instantiate testing instance and import data
        let e = getInstance();
        // Import raw data
        e.import({
          foo: 'bar',                               // Defined property
          bar: (new MyExtendedEntity()).import({    // Not-cast property being assigned an entity - should just copy reference
            foo: 'bar',                               // Defined property
            bar: 'baz',                               // Defined property
            baz: 'foo'                                // Not defined property
          }),
          baz: 'foo',                               // Not defined property
          private: 'public',                        // Non-exportable property
          readonly: 'writable'                      // Read-only property
        });

        // Check that read-only properties weren't imported
        assert.equal(e.readonly, 'readonly');

      });
      // Should not import not defined properties
      it('Should not import not defined properties', () => {

        // Instantiate testing instance and import data
        let e = getInstance();
        // Import raw data
        e.import({
          foo: 'bar',                               // Defined property
          bar: (new MyExtendedEntity()).import({    // Not-cast property being assigned an entity - should just copy reference
            foo: 'bar',                               // Defined property
            bar: 'baz',                               // Defined property
            baz: 'foo'                                // Not defined property
          }),
          baz: 'foo',                               // Not defined property
          private: 'public',                        // Non-exportable property
          readonly: 'writable'                      // Read-only property
        });

        // Check that not declared properties weren't imported
        assert.equal(e.baz, null);
        assert.equal(e.bar.baz, null);

      });

    });

    // Should import nested Entity data
    describe('> Should import nested Entity data', () => {

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

      // Should cast imported data into single entity properties
      it('Should cast imported data into single entity properties', () => {

        // Instantiate testing instance and import data
        let e = getInstance();

        // Import entity
        let nestedData = { foo: 'foo', bar: { baz: 'baz' } },
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
        assert.equal(nestedEntity.bar.baz, 'foo');
        assert.equal(e.entity.bar.baz, 'foo');
        nestedData.bar.baz = 'baz';

        // Import raw data and expect it to be cast as entity
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

      // Should cast imported data into entity array properties
      it('Should cast imported data into entity array properties', () => {

        // Instantiate testing instance and import data
        let e = getInstance();

        // Import entity
        let nestedData = { foo: 'foo', bar: { baz: 'baz' } },
            nestedEntity = (new MyExtendedEntity).import(nestedData);
        e.import({
          entityArray: [ nestedEntity, nestedEntity ]
        });

        // Check import is an entity type
        assert.equal(e.entityArray.length, 2);
        assert.ok(_.isObject(e.entityArray[0]));
        assert.ok(e.entityArray[0] instanceof EnTT);
        assert.ok(_.isObject(e.entityArray[1]));
        assert.ok(e.entityArray[1] instanceof EnTT);
        // Check entity was imported and wasn't re-cast, but only re-referenced
        assert.equal(e.entityArray[0], nestedEntity);
        assert.equal(e.entityArray[1], nestedEntity);
        // Check imported data
        assert.equal(e.entityArray[0].foo, 'foo');
        assert.equal(e.entityArray[0].bar.baz, 'baz');
        assert.equal(e.entityArray[1].foo, 'foo');
        assert.equal(e.entityArray[1].bar.baz, 'baz');
        // Check imported internal structure wasn't cloned, but only re-referenced
        nestedData.bar.baz = 'foo';
        assert.equal(nestedEntity.bar.baz, 'foo');
        assert.equal(e.entityArray[0].bar.baz, 'foo');
        assert.equal(e.entityArray[1].bar.baz, 'foo');
        nestedData.bar.baz = 'baz';

        // Import raw data and expect it to be cast as entity
        e.import({
          entityArray: [ nestedData, nestedData ]
        });

        // Check import is an entity type
        assert.equal(e.entityArray.length, 2);
        assert.ok(_.isObject(e.entityArray[0]));
        assert.ok(e.entityArray[0] instanceof EnTT);
        assert.ok(_.isObject(e.entityArray[1]));
        assert.ok(e.entityArray[1] instanceof EnTT);
        // Check imported data
        assert.equal(e.entityArray[0].foo, 'foo');
        assert.equal(e.entityArray[0].bar.baz, 'baz');
        assert.equal(e.entityArray[1].foo, 'foo');
        assert.equal(e.entityArray[1].bar.baz, 'baz');
        // Check imported internal structure wasn't cloned, but only re-referenced
        nestedData.bar.baz = 'bar';
        assert.equal(e.entityArray[0].bar.baz, 'bar');
        assert.equal(e.entityArray[1].bar.baz, 'bar');

      });

      // Should cast imported data into entity hashmap properties
      it('Should cast imported data into entity hashmap properties', () => {

        // Instantiate testing instance and import data
        let e = getInstance();

        // Import entity
        let nestedData = { foo: 'foo', bar: { baz: 'baz' } },
            nestedEntity = (new MyExtendedEntity).import(nestedData);
        e.import({
          entityHashmap: { foo: nestedEntity, bar: nestedEntity }
        });

        // Check import is an entity type
        assert.equal(_.keys(e.entityHashmap).length, 2);
        assert.ok(_.isObject(e.entityHashmap.foo));
        assert.ok(e.entityHashmap.foo instanceof EnTT);
        assert.ok(_.isObject(e.entityHashmap.bar));
        assert.ok(e.entityHashmap.bar instanceof EnTT);
        // Check entity was imported and wasn't re-cast, but only re-referenced
        assert.equal(e.entityHashmap.foo, nestedEntity);
        assert.equal(e.entityHashmap.bar, nestedEntity);
        // Check imported data
        assert.equal(e.entityHashmap.foo.foo, 'foo');
        assert.equal(e.entityHashmap.foo.bar.baz, 'baz');
        assert.equal(e.entityHashmap.bar.foo, 'foo');
        assert.equal(e.entityHashmap.bar.bar.baz, 'baz');
        // Check imported internal structure wasn't cloned, but only re-referenced
        nestedData.bar.baz = 'foo';
        assert.equal(nestedEntity.bar.baz, 'foo');
        assert.equal(e.entityHashmap.foo.bar.baz, 'foo');
        assert.equal(e.entityHashmap.bar.bar.baz, 'foo');
        nestedData.bar.baz = 'baz';

        // Import raw data and expect it to be cast as entity
        e.import({
          entityHashmap: { foo: nestedData, bar: nestedData }
        });

        // Check import is an entity type
        assert.equal(_.keys(e.entityHashmap).length, 2);
        assert.ok(_.isObject(e.entityHashmap.foo));
        assert.ok(e.entityHashmap.foo instanceof EnTT);
        assert.ok(_.isObject(e.entityHashmap.bar));
        assert.ok(e.entityHashmap.bar instanceof EnTT);
        // Check imported data
        assert.equal(e.entityHashmap.foo.foo, 'foo');
        assert.equal(e.entityHashmap.foo.bar.baz, 'baz');
        assert.equal(e.entityHashmap.bar.foo, 'foo');
        assert.equal(e.entityHashmap.bar.bar.baz, 'baz');
        // Check imported internal structure wasn't cloned, but only re-referenced
        nestedData.bar.baz = 'bar';
        assert.equal(e.entityHashmap.foo.bar.baz, 'bar');
        assert.equal(e.entityHashmap.bar.bar.baz, 'bar');

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

      // Should clone entity
      it('Should clone entity', () => {

        // Instantiate testing instance and clone
        let e = getInstance(),
            cloned = e.clone();

        // Check cloned is an entity
        assert.ok(_.isObject(cloned));
        assert.ok(cloned instanceof EnTT);

      });
      // Should preserve cloned data
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
        assert.equal(cloned.entityArray[0].foo, 'foo');
        assert.equal(cloned.entityArray[0].bar.baz, 'baz');
        assert.equal(cloned.entityArray[1].foo, 'foo');
        assert.equal(cloned.entityArray[1].bar.baz, 'baz');
        // Check cloned nested entity hashmap data
        assert.equal(_.keys(cloned.entityHashmap).length, 2);
        assert.equal(cloned.entityHashmap.foo.foo, 'foo');
        assert.equal(cloned.entityHashmap.foo.bar.baz, 'baz');
        assert.equal(cloned.entityHashmap.bar.foo, 'foo');
        assert.equal(cloned.entityHashmap.bar.bar.baz, 'baz');

      });
      // Should clone cast nested entites, not just re-reference them
      it('Should clone nested entites into properties marked as cast, not just re-reference them', () => {

        // Instantiate testing instance and clone
        let e = getInstance(),
            cloned = e.clone();

        // Check nested single entites were cloned
        assert.notEqual(e.entity, cloned.entity);
        // Check nested entity arrays were cloned
        assert.notEqual(e.entityArray[0], cloned.entityArray[0]);
        assert.notEqual(e.entityArray[1], cloned.entityArray[1]);
        // Check nested entity hashmaps were cloned
        assert.notEqual(e.entityHashmap.foo, cloned.entityHashmap.foo);
        assert.notEqual(e.entityHashmap.bar, cloned.entityHashmap.bar);

      });
      // Should not clone non-cast nested entites, but just re-reference them
      it('Should not clone nested entites into properties not marked as cast, but just re-reference them', () => {

        // Instantiate testing instance and clone
        let e = getInstance(),
            cloned = e.clone();

        // Check nested non-cast entities were just re-referenced
        e.bar.foo.foo = 'baz';
        assert.equal(cloned.bar.foo.foo, 'baz');

      });

    });

    // Define Entity extending classes with some properties
    class MyExtendedEntity1 extends MyExtendedEntity {
      static get props () {
        return {
          baz: {}
        };
      }
    }
    class MyExtendedEntity2 extends MyExtendedEntity {
      static get props () {
        return {
          qux: {}
        };
      }
    }

    // Should cast raw data and between entities
    describe('> Should cast entities', () => {

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
            e1 = (new MyExtendedEntity1()).import(data),
            e2 = (new MyExtendedEntity2()).import(data);
        // Return instances
        return { data, e1, e2 };
      };

      // TODO: Should cast raw data as single entity
      it('> Should cast raw data as single entity', () => {

        // Instantiate testing instances and cast
        let { data } = getInstances(),
            castAs1 = EnTT.cast(data, MyExtendedEntity1),
            castAs2 = MyExtendedEntity2.cast(data);       // Alternative syntax

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
      // Should cast raw data as entity array
      it('> Should cast raw data as entity array', () => {

        // Instantiate testing instances and cast
        let { data } = getInstances(),
            castAsArrayOf1 = EnTT.cast([ data, data ], [ MyExtendedEntity1 ]),
            castAsArrayOf2 = EnTT.cast([ data, data ], [ MyExtendedEntity2 ]),
            alt1CastAsArrayOf1 = MyExtendedEntity1.cast([ data, data ], []),    // Alternative syntax
            alt2CastAsArrayOf1 = MyExtendedEntity1.cast([ data, data ]);        // Alternative syntax

        // Should be an entity array
        assert.equal(castAsArrayOf1.length, 2);
        assert.equal(castAsArrayOf2.length, 2);
        assert.ok(_.isObject(castAsArrayOf1[0]));
        assert.ok(castAsArrayOf1[0] instanceof EnTT);
        assert.ok(_.isObject(castAsArrayOf1[1]));
        assert.ok(castAsArrayOf1[1] instanceof EnTT);
        assert.ok(_.isObject(castAsArrayOf2[0]));
        assert.ok(castAsArrayOf2[0] instanceof EnTT);
        assert.ok(_.isObject(castAsArrayOf2[1]));
        assert.ok(castAsArrayOf2[1] instanceof EnTT);
        // Should be an entity array (should work with alternative syntax)
        assert.equal(alt1CastAsArrayOf1.length, 2);
        assert.equal(alt2CastAsArrayOf1.length, 2);
        assert.ok(_.isObject(alt1CastAsArrayOf1[0]));
        assert.ok(alt1CastAsArrayOf1[0] instanceof EnTT);
        assert.ok(_.isObject(alt1CastAsArrayOf1[1]));
        assert.ok(alt1CastAsArrayOf1[1] instanceof EnTT);
        assert.ok(_.isObject(alt2CastAsArrayOf1[0]));
        assert.ok(alt2CastAsArrayOf1[0] instanceof EnTT);
        assert.ok(_.isObject(alt2CastAsArrayOf1[1]));
        assert.ok(alt2CastAsArrayOf1[1] instanceof EnTT);
        // Should preserve cast data
        assert.equal(castAsArrayOf1[0].foo, 'foo');
        assert.equal(castAsArrayOf1[0].bar.baz, 'baz');
        assert.equal(castAsArrayOf1[1].foo, 'foo');
        assert.equal(castAsArrayOf1[1].bar.baz, 'baz');
        assert.equal(castAsArrayOf2[0].foo, 'foo');
        assert.equal(castAsArrayOf2[0].bar.baz, 'baz');
        assert.equal(castAsArrayOf2[1].foo, 'foo');
        assert.equal(castAsArrayOf2[1].bar.baz, 'baz');
        // Should not cast not-defined properties
        assert.equal(castAsArrayOf1[0].qux, undefined);
        assert.equal(castAsArrayOf1[1].qux, undefined);
        assert.equal(castAsArrayOf2[0].baz, undefined);
        assert.equal(castAsArrayOf2[1].baz, undefined);
        // Should not clone, but only re-reference internal data
        data.bar.baz = 'foo';
        assert.equal(castAsArrayOf1[0].bar.baz, 'foo');
        assert.equal(castAsArrayOf1[1].bar.baz, 'foo');
        assert.equal(castAsArrayOf2[0].bar.baz, 'foo');
        assert.equal(castAsArrayOf2[1].bar.baz, 'foo');

      });
      // Should cast raw data as entity hashmap
      it('> Should cast raw data as entity hashmap', () => {

        // Instantiate testing instances and cast
        let { data } = getInstances(),
            castAsHashmapOf1 = EnTT.cast({ foo: data, bar: data }, { MyExtendedEntity1 }),
            castAsHashmapOf2 = MyExtendedEntity2.cast({ foo: data, bar: data }, {});        // Alternative syntax

        // Should be an entity hashmap (should work with alternative syntax)
        assert.equal(_.keys(castAsHashmapOf1).length, 2);
        assert.equal(_.keys(castAsHashmapOf2).length, 2);
        assert.ok(_.isObject(castAsHashmapOf1.foo));
        assert.ok(castAsHashmapOf1.foo instanceof EnTT);
        assert.ok(_.isObject(castAsHashmapOf1.bar));
        assert.ok(castAsHashmapOf1.bar instanceof EnTT);
        assert.ok(_.isObject(castAsHashmapOf2.foo));
        assert.ok(castAsHashmapOf2.foo instanceof EnTT);
        assert.ok(_.isObject(castAsHashmapOf2.bar));
        assert.ok(castAsHashmapOf2.bar instanceof EnTT);
        // Should preserve cast data
        assert.equal(castAsHashmapOf1.foo.foo, 'foo');
        assert.equal(castAsHashmapOf1.foo.bar.baz, 'baz');
        assert.equal(castAsHashmapOf1.bar.foo, 'foo');
        assert.equal(castAsHashmapOf1.bar.bar.baz, 'baz');
        assert.equal(castAsHashmapOf2.foo.foo, 'foo');
        assert.equal(castAsHashmapOf2.foo.bar.baz, 'baz');
        assert.equal(castAsHashmapOf2.bar.foo, 'foo');
        assert.equal(castAsHashmapOf2.bar.bar.baz, 'baz');
        // Should not cast not-defined properties
        assert.equal(castAsHashmapOf1.foo.qux, undefined);
        assert.equal(castAsHashmapOf1.bar.qux, undefined);
        assert.equal(castAsHashmapOf2.foo.baz, undefined);
        assert.equal(castAsHashmapOf2.bar.baz, undefined);
        // Should not clone, but only re-reference internal data
        data.bar.baz = 'foo';
        assert.equal(castAsHashmapOf1.foo.bar.baz, 'foo');
        assert.equal(castAsHashmapOf1.foo.bar.baz, 'foo');
        assert.equal(castAsHashmapOf2.bar.bar.baz, 'foo');
        assert.equal(castAsHashmapOf2.bar.bar.baz, 'foo');

      });

      // Should cast between single entities
      it('> Should cast between single entities', () => {

        // Instantiate testing instances and cast
        let { data, e1, e2 } = getInstances(),
            castAs1 = EnTT.cast(e2, MyExtendedEntity1),
            castAs2 = EnTT.cast(e1, MyExtendedEntity2);

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
      // Should cast between entity arrays
      it('> Should cast between entity arrays', () => {

        // Instantiate testing instances and cast
        let { data, e1, e2 } = getInstances(),
            castAsArrayOf1 = EnTT.cast([ e2, e2 ], [ MyExtendedEntity1 ]),
            castAsArrayOf2 = EnTT.cast([ e1, e1 ], [ MyExtendedEntity2 ]);

        // Should be an entity array
        assert.equal(castAsArrayOf1.length, 2);
        assert.equal(castAsArrayOf2.length, 2);
        assert.ok(_.isObject(castAsArrayOf1[0]));
        assert.ok(castAsArrayOf1[0] instanceof EnTT);
        assert.ok(_.isObject(castAsArrayOf1[1]));
        assert.ok(castAsArrayOf1[1] instanceof EnTT);
        assert.ok(_.isObject(castAsArrayOf2[0]));
        assert.ok(castAsArrayOf2[0] instanceof EnTT);
        assert.ok(_.isObject(castAsArrayOf2[1]));
        assert.ok(castAsArrayOf2[1] instanceof EnTT);
        // Should preserve cast data
        assert.equal(castAsArrayOf1[0].foo, 'foo');
        assert.equal(castAsArrayOf1[0].bar.baz, 'baz');
        assert.equal(castAsArrayOf1[1].foo, 'foo');
        assert.equal(castAsArrayOf1[1].bar.baz, 'baz');
        assert.equal(castAsArrayOf2[0].foo, 'foo');
        assert.equal(castAsArrayOf2[0].bar.baz, 'baz');
        assert.equal(castAsArrayOf2[1].foo, 'foo');
        assert.equal(castAsArrayOf2[1].bar.baz, 'baz');
        // Should not cast non-common properties
        assert.equal(castAsArrayOf1[0].qux, undefined);
        assert.equal(castAsArrayOf1[1].qux, undefined);
        assert.equal(castAsArrayOf2[0].baz, undefined);
        assert.equal(castAsArrayOf2[1].baz, undefined);
        // Should not clone, but only re-reference internal data
        data.bar.baz = 'foo';
        assert.equal(castAsArrayOf1[0].bar.baz, 'foo');
        assert.equal(castAsArrayOf1[1].bar.baz, 'foo');
        assert.equal(castAsArrayOf2[0].bar.baz, 'foo');
        assert.equal(castAsArrayOf2[1].bar.baz, 'foo');

      });
      // Should cast between entity hashmaps
      it('> Should cast between entity hashmaps', () => {

        // Instantiate testing instances and cast
        let { data, e1, e2 } = getInstances(),
            castAsHashmapOf1 = EnTT.cast({ foo: e2, bar: e2 }, { MyExtendedEntity1 }),
            castAsHashmapOf2 = EnTT.cast({ foo: e1, bar: e1 }, { MyExtendedEntity2 });

        // Should be an entity hashmap
        assert.equal(_.keys(castAsHashmapOf1).length, 2);
        assert.equal(_.keys(castAsHashmapOf2).length, 2);
        assert.ok(_.isObject(castAsHashmapOf1.foo));
        assert.ok(castAsHashmapOf1.foo instanceof EnTT);
        assert.ok(_.isObject(castAsHashmapOf1.bar));
        assert.ok(castAsHashmapOf1.bar instanceof EnTT);
        assert.ok(_.isObject(castAsHashmapOf2.foo));
        assert.ok(castAsHashmapOf2.foo instanceof EnTT);
        assert.ok(_.isObject(castAsHashmapOf2.bar));
        assert.ok(castAsHashmapOf2.bar instanceof EnTT);
        // Should preserve cast data
        assert.equal(castAsHashmapOf1.foo.foo, 'foo');
        assert.equal(castAsHashmapOf1.foo.bar.baz, 'baz');
        assert.equal(castAsHashmapOf1.bar.foo, 'foo');
        assert.equal(castAsHashmapOf1.bar.bar.baz, 'baz');
        assert.equal(castAsHashmapOf2.foo.foo, 'foo');
        assert.equal(castAsHashmapOf2.foo.bar.baz, 'baz');
        assert.equal(castAsHashmapOf2.bar.foo, 'foo');
        assert.equal(castAsHashmapOf2.bar.bar.baz, 'baz');
        // Should not cast non-common properties
        assert.equal(castAsHashmapOf1.foo.qux, undefined);
        assert.equal(castAsHashmapOf1.bar.qux, undefined);
        assert.equal(castAsHashmapOf2.foo.baz, undefined);
        assert.equal(castAsHashmapOf2.bar.baz, undefined);
        // Should not clone, but only re-reference internal data
        data.bar.baz = 'foo';
        assert.equal(castAsHashmapOf1.foo.bar.baz, 'foo');
        assert.equal(castAsHashmapOf1.foo.bar.baz, 'foo');
        assert.equal(castAsHashmapOf2.bar.bar.baz, 'foo');
        assert.equal(castAsHashmapOf2.bar.bar.baz, 'foo');

      });

      // Casting into same type should preserve reference to same instance
      it('> Casting into same type should preserve reference to same instance', () => {

        // Instantiate testing instances and cast
        let { e1: e } = getInstances(),
            castAs1 = EnTT.cast(e, MyExtendedEntity1),
            castAsArrayOf1 = EnTT.cast([ e, e ], [ MyExtendedEntity1 ]),
            castAsHashmapOf1 = EnTT.cast({ foo: e, bar: e }, { MyExtendedEntity1 });

        // Casting single entity to same type should preserve instance
        assert.equal(e, castAs1);
        // Casting entity within entity array to same type should preserve instance
        assert.equal(e, castAsArrayOf1[0]);
        assert.equal(e, castAsArrayOf1[1]);
        // Casting entity within entity ahshmap to same type should preserve instance
        assert.equal(e, castAsHashmapOf1.foo);
        assert.equal(e, castAsHashmapOf1.bar);

      });

    });

  });
};
