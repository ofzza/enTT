// =====================================================================================================================
// Tests Entity Extension Authoring (Overriding EnTTExt class into a custom extension)
// =====================================================================================================================
let _           = require('lodash'),
    assert      = require('assert'),
    EnTT        = require('../../dist').default,
    EnTTExt     = require('../../dist').EnTTExt,
    Extensions  = require('../../dist/entt/extensions').default;

// Entity extending and instantiation
module.exports = () => {
  describe('> Entity Extension Authoring', () => {

    // Define custom EnTT extensions (taking in ID parameter and making their isntances identifiable when testing)
    class MyEnTTExt1 extends EnTTExt {
      constructor (id) {
        super();
        this.id = id;
      }
    }
    class MyEnTTExt2 extends EnTTExt {
      constructor (id) {
        super();
        this.id = id;
      }
    }
    class MyEnTTExt3 extends EnTTExt {
      constructor (id) {
        super();
        this.id = id;
      }
    }

    // Define EnTT extending classes using different extensions
    class MyExtendedEntity1 extends EnTT {
      static get includes () {
        return [ new MyEnTTExt1('foo'), new MyEnTTExt2('bar') ];
      }
    }
    class MyExtendedEntity2 extends MyExtendedEntity1 {
      static get includes () {
        return [ new MyEnTTExt1('baz'), new MyEnTTExt3('qux') ];
      }
    }

    // Entity extensions
    it('> Should properly detect 1st level extensions', () => {

      // Instantiate an entity with custom modules and get property configuration
      const e = new MyExtendedEntity1(),
            extensions = Extensions.getEntityExtensions(e).extensions;

      // Should return array of extensions
      assert.ok(_.isArray(extensions));
      assert.equal(extensions.length, 2);
      // Should preserve extension ordering
      assert.equal(extensions[0].id, 'foo');
      assert.equal(extensions[1].id, 'bar');

    });
    // Entity extensions
    it('> Should properly detect 2st level extensions', () => {

      // Instantiate an entity with custom modules and get property configuration
      const e = new MyExtendedEntity2(),
            extensions = Extensions.getEntityExtensions(e).extensions;

      // Should return array of extensions
      assert.ok(_.isArray(extensions));
      assert.equal(extensions.length, 4);
      // Should preserve extension ordering from deeper inherited classes to shalower ones
      assert.equal(extensions[0].id, 'foo');
      assert.equal(extensions[1].id, 'bar');
      assert.equal(extensions[2].id, 'baz');
      assert.equal(extensions[3].id, 'qux');

    });

  });
};
