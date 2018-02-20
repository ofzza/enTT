// =====================================================================================================================
// Tests Entity properties definition and initialization
// =====================================================================================================================
let _                   = require('lodash'),
    assert              = require('assert'),
    EnTT                = require('../../dist').default,
    Properties          = require('../../dist/entt/properties').default;

// Export tests
module.exports = () => {
  describe('> Property Value casting', () => {

    // Define Entity extending class with some casting properties
    class MyExtendedEntity extends EnTT {
      static get props () {
        return {
          foo: {},
          bar: {},
          entity: { cast: MyExtendedEntity },
          entityArray: { cast: [ MyExtendedEntity ] },
          entityHashmap: { cast: { MyExtendedEntity }}
        };
      }
    }

    // Define a factory creating a testing instance
    let getInstance = () => {
      // Instantiate
      let e = new MyExtendedEntity();
      // Set non-nested Entity property as entity
      e.bar = new MyExtendedEntity();
      e.bar.foo = 'foo';
      e.bar.bar = { baz: 'baz' };
      // Set nested entity
      e.entity = { foo: 'foo', bar: { baz: 'baz' } };
      // Set nested entity array
      e.entityArray = [
        { foo: 'foo', bar: { baz: 'baz' } },
        { foo: 'foo', bar: { baz: 'baz' } }
      ];
      // Set nested entity hashmap
      e.entityHashmap = {
        foo: { foo: 'foo', bar: { baz: 'baz' } },
        bar: { foo: 'foo', bar: { baz: 'baz' } }
      };
      // Return instance
      return e;
    };

    // Single nested entity casting
    it('> Should properly cast property values being set as single entity', () => {

      // Instantiate testing instance
      let e = getInstance();

      // Check single entity property value was cast
      assert.ok(_.isObject(e.entity));
      assert.ok(e.entity instanceof EnTT);
      // Check single entity data
      assert.equal(e.entity.foo, 'foo');
      assert.equal(e.entity.bar.baz, 'baz');

    });

    // Nested entity array casting
    it('> Should properly cast property values being set as entity array', () => {

      // Instantiate testing instance
      let e = getInstance();

      // Check entity array property value was cast
      assert.ok(_.isObject(e.entityArray[0]));
      assert.ok(e.entityArray[0] instanceof EnTT);
      assert.ok(_.isObject(e.entityArray[1]));
      assert.ok(e.entityArray[1] instanceof EnTT);
      // Check entity array data
      assert.equal(e.entityArray.length, 2);
      assert.equal(e.entityArray[0].foo, 'foo');
      assert.equal(e.entityArray[0].bar.baz, 'baz');
      assert.equal(e.entityArray[1].foo, 'foo');
      assert.equal(e.entityArray[1].bar.baz, 'baz');

    });

    // Nested entity hashmap casting
    it('> Should properly cast property values being set as entity hashmap', () => {

      // Instantiate testing instance
      let e = getInstance();

      // Check entity array property value was cast
      assert.ok(_.isObject(e.entityHashmap.foo));
      assert.ok(e.entityHashmap.foo instanceof EnTT);
      assert.ok(_.isObject(e.entityHashmap.bar));
      assert.ok(e.entityHashmap.bar instanceof EnTT);
      // Check entity array data
      assert.equal(_.keys(e.entityHashmap).length, 2);
      assert.equal(e.entityHashmap.foo.foo, 'foo');
      assert.equal(e.entityHashmap.foo.bar.baz, 'baz');
      assert.equal(e.entityHashmap.bar.foo, 'foo');
      assert.equal(e.entityHashmap.bar.bar.baz, 'baz');

    });

    // Should properly process shorthand syntax
    it('> Should properly process shorthand syntax for property cast configuration', () => {

      // Define Entity extending class using shorthand property configuration syntax
      class MyExtendedEntityWithShorthandSyntax extends EnTT {
        static get props () {
          return {
            entity: MyExtendedEntity,
            entityArray: [ MyExtendedEntity ],
            entityHashmap: { MyExtendedEntity }
          };
        }
      }

      // Get cached properties
      let properties = Properties.getEntityPropertyConfiguration(MyExtendedEntityWithShorthandSyntax);

      // Check if shorthand casting property syntax for casting to single entity has been expanded
      assert.ok(_.isObject(properties.entity));
      assert.equal(properties.entity.cast, MyExtendedEntity);
      // Check if shorthand casting property syntax for casting to entity array has been expanded
      assert.ok(_.isObject(properties.entityArray));
      assert.ok(_.isArray(properties.entityArray.cast));
      assert.equal(properties.entityArray.cast.length, 1);
      assert.equal(properties.entityArray.cast[0], MyExtendedEntity);
      // Check if shorthand casting property syntax for casting to entity hashmap has been expanded
      assert.ok(_.isObject(properties.entity));
      assert.ok(_.isObject(properties.entityArray.cast));
      assert.equal(_.values(properties.entityArray.cast).length, 1);
      assert.equal(_.values(properties.entityArray.cast)[0], MyExtendedEntity);

    });

  });
};
