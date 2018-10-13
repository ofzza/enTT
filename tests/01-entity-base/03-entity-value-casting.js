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
          foo: {},                                      // Local property
          bar: {},                                      // Local property
          entity: { cast: MyExtendedEntity },           // Property to have it's value cast as an Entity instance
          entityArray: { cast: [ MyExtendedEntity ] },  // Property to have it's value cast as an array of Entity instances
          entityHashmap: { cast: { MyExtendedEntity }}  // Property to have it's value cast as an array of Entity instances
        };
      }
    }

    // Define a factory creating a testing instance
    let getInstance = () => {
      // Instantiate
      let e = new MyExtendedEntity(),
          member = { foo: 'foo', bar: { baz: 'baz' } };
      // Set nested entity
      e.entity = member;
      // Set nested entity array
      e.entityArray = [member, member];
      // Set nested entity hashmap
      e.entityHashmap = { a: member, b: member };
      // Return instance
      return e;
    };

    it('> Should properly cast single entity', () => {

      // Instantiate testing instance
      let e = getInstance();

      // Check single entity property value was cast
      assert.ok(_.isObject(e.entity));
      assert.ok(e.entity instanceof EnTT);
      // Check single entity data
      assert.equal(e.entity.foo, 'foo');
      assert.equal(e.entity.bar.baz, 'baz');

    });

    it('> Should properly cast entity array', () => {

      // Instantiate testing instance
      let e = getInstance();

      // Check array contains all members
      assert.equal(e.entityArray.length, 2);
      // Check all members of entity array property
      _.forEach(e.entityArray, (e) => {
        // Check member was cast
        assert.ok(_.isObject(e));
        assert.ok(e instanceof EnTT);
        // Check member data
        assert.equal(e.foo, 'foo');
        assert.equal(e.bar.baz, 'baz');
      });

    });

    it('> Should properly cast entity hashmap', () => {

      // Instantiate testing instance
      let e = getInstance();

      // Check hashmap contains all members, with expected keys
      assert.equal(_.keys(e.entityHashmap).length, 2);
      assert.ok(e.entityHashmap.hasOwnProperty('a'));
      assert.ok(e.entityHashmap.hasOwnProperty('b'));
      // Check all members of entity hashmap property
      _.forEach(e.entityHashmap, (x) => {
        // Check member was cast
        assert.ok(_.isObject(x));
        assert.ok(x instanceof EnTT);
        // Check member data
        assert.equal(x.foo, 'foo');
        assert.equal(x.bar.baz, 'baz');
      });

    });

    it('> Should allow shorthand syntax for property cast configuration', () => {

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
