// =====================================================================================================================
// Tests Entity Extension: Dynamic Properties Extension
// =====================================================================================================================
let assert                      = require('assert'),
    EnTT                        = require('../../dist').default,
    DynamicPropertiesExtension  = require('../../dist').DynamicPropertiesExtension;

// Entity extending and instantiation
module.exports = () => {
  describe('> Dynamic Properties Extension', () => {

    // Should make dynamic properties read-only
    it('Should make dynamic properties read-only', () => {

      // Define EnTT extending class using dynamic properties custom extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ DynamicPropertiesExtension ];
        }
        static get props () {
          return {
            foo: { value: 'bar' },
            bar: { dynamic: (entity) => { return entity.foo.toUpperCase(); } }
          };
        }
      }

      // Instantiate EnTT including the DynamicProperties extension
      const e = new MyExtendedEntity();

      // Check properties were created and .bar property is read-only
      assert.ok(e.hasOwnProperty('foo'));
      assert.ok(e.hasOwnProperty('bar'));
      assert.throws(() => { e.bar = 'baz'; });

    });

    // Should properly process shorthand syntax for dynamic property configuration
    it('Should properly process shorthand syntax for dynamic property configuration', () => {

      // Define EnTT extending class using the dynamic properties extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ DynamicPropertiesExtension ];
        }
        static get props () {
          return {
            foo: { value: 'bar' },
            bar: (entity) => { return entity.foo.toUpperCase(); }
          };
        }
      }

      // Instantiate EnTT including the DynamicProperties extension
      const e = new MyExtendedEntity();

      // Check properties were created and .bar property is read-only
      assert.ok(e.hasOwnProperty('foo'));
      assert.ok(e.hasOwnProperty('bar'));
      assert.throws(() => { e.bar = 'baz'; });

    });

    // Should regenerate dynamic values on get if extension set as deferred
    it('Should regenerate dynamic values on get if extension set as deferred', () => {

      // Count dynamic property generations
      let count = 0;

      // Define EnTT extending class using the dynamic properties extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ new DynamicPropertiesExtension({ deferred: true }) ];
        }
        static get props () {
          return {
            foo: { value: 'bar' },
            bar: (entity) => {
              // Count re-generation of value
              count++;
              // Regenerate value
              return entity.foo.toUpperCase();
            }
          };
        }
      }

      // Instantiate EnTT including the DynamicProperties extension
      const e = new MyExtendedEntity();

      // Check dynamic property was generated on instantiation
      assert.equal(count, 0);
      assert.equal(e.foo, 'bar');
      assert.equal(e.bar, 'BAR');

      // Check if dynamic property not regenerated on set
      assert.equal(count, 1);
      e.foo = 'foo';
      e.foo = 'bar';
      e.foo = 'baz';
      // Check if dynamic property regenerated on every get
      assert.equal(count, 1);
      e.bar;
      assert.equal(count, 2);
      e.bar; e.bar;
      assert.equal(count, 4);
      e.bar; e.bar; e.bar;
      assert.equal(count, 7);

      // Check if dynamic property (re)generated properly
      e.foo = 'foo';
      assert.equal(e.bar, 'FOO');
      e.foo = 'bar';
      assert.equal(e.bar, 'BAR');
      e.foo = 'baz';
      assert.equal(e.bar, 'BAZ');

    });

    // Should regenerate dynamic values on change-detected if extension not set as deferred
    it('Should regenerate dynamic values on change-detected if extension not set as deferred', () => {

      // Count dynamic property generations
      let count = 0;

      // Define EnTT extending class using the dynamic properties extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ new DynamicPropertiesExtension({ deferred: false }) ];
        }
        static get props () {
          return {
            foo: { value: 'bar' },
            bar: (entity) => {
              // Count re-generation of value
              count++;
              // Regenerate value
              return entity.foo.toUpperCase();
            }
          };
        }
      }

      // Instantiate EnTT including the DynamicProperties extension
      const e = new MyExtendedEntity();

      // Check dynamic property was generated on instantiation
      assert.equal(count, 1);
      assert.equal(e.foo, 'bar');
      assert.equal(e.bar, 'BAR');

      // Check dynamic property was generated on instantiation
      assert.equal(count, 1);
      assert.equal(e.foo, 'bar');
      assert.equal(e.bar, 'BAR');

      // Check if dynamic property not regenerated on every get
      assert.equal(count, 1);
      e.bar;
      assert.equal(count, 1);
      e.bar; e.bar;
      assert.equal(count, 1);
      e.bar; e.bar; e.bar;
      assert.equal(count, 1);
      // Check if dynamic property regenerated on set
      assert.equal(count, 1);
      e.foo = 'foo';
      e.foo = 'bar';
      e.foo = 'baz';
      assert.equal(count, 4);
      assert.equal(e.bar, 'BAZ');
      // Check if dynamic property regenerated on manual value update
      e.update();
      assert.equal(count, 5);
      e.update(() => {
        e.foo = 'foo';
        e.foo = 'bar';
        e.foo = 'baz';
        e.foo = 'qux';
      });
      assert.equal(count, 6);
      assert.equal(e.bar, 'QUX');

      // Check if dynamic property (re)generated properly
      e.foo = 'foo';
      assert.equal(e.bar, 'FOO');
      e.foo = 'bar';
      assert.equal(e.bar, 'BAR');
      e.foo = 'baz';
      assert.equal(e.bar, 'BAZ');

    });

  });
};
