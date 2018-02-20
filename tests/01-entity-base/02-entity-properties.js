// =====================================================================================================================
// Tests Entity properties definition and initialization
// =====================================================================================================================
let assert              = require('assert'),
    EnTT                = require('../../dist').default,
    Properties          = require('../../dist/entt/properties').default;

// Export tests
module.exports = () => {
  describe('> Property Definitions and Initialization', () => {

    // Set default property values
    EnTT.default = { value: null };

    // Define Entity extending class with some properties
    class MyExtendedEntity1 extends EnTT {
      static get props () {
        return {
          foo: {          // Local property
            bar: 'bar'
          },
          shared: {       // Shared property
            foo: 'foo',
            bar: 'bar'
          },
          readonly: {    // Readonly property
            value: 'readonly',
            readOnly: true
          }
        };
      }
    }

    // Property configuration fetching
    it('> Should be able to extract property configuration from an Entity class', () => {

      // Get property configuration
      let properties = Properties.getEntityPropertyConfiguration(MyExtendedEntity1);

      // Check properties' configuration
      assert.equal(properties.foo.bar,    'bar');
      assert.equal(properties.shared.foo, 'foo');
      assert.equal(properties.shared.bar, 'bar');

    });
    // Property configuration fetching
    it('> Should be able to extract property configuration from an Entity instance', () => {

      // Instantiate an extended Entity class
      let e = new MyExtendedEntity1();
      // Get property configuration
      let properties = Properties.getEntityPropertyConfiguration(e);

      // Check properties' configuration
      assert.equal(properties.foo.bar,    'bar');
      assert.equal(properties.shared.foo, 'foo');
      assert.equal(properties.shared.bar, 'bar');

    });

    // Entity extending and instantiation
    it('> Should properly configure 1st level extended properties', () => {

      // Instantiate a 1st level extended Entity class
      let e = new MyExtendedEntity1();
      // Get cached properties
      let properties = Properties.getEntityPropertyConfiguration(e);

      // Check properties' configuration
      assert.equal(properties.foo.bar,    'bar');
      assert.equal(properties.shared.foo, 'foo');
      assert.equal(properties.shared.bar, 'bar');

      // Check initial property values
      assert.equal(e.foo, null);
      assert.equal(e.shared, null);

    });

    // Define 2nd level extending property adding to and overriding some of the 1st level properties
    class MyExtendedEntity2 extends MyExtendedEntity1 {
      static get props () {
        return {
          bar: {          // Local property
            baz: 'baz'
          },
          shared: {       // Shared property
            foo: 'bar',     // Override property value
            baz: 'baz'      // Append property value
          }
        };
      }
    }
    // Entity extending and instantiation
    it('> Should properly extend and override 2st level extended properties', () => {

      // Instantiate a 1st level extended Entity class
      let e = new MyExtendedEntity2();
      // Get cached properties
      let properties = Properties.getEntityPropertyConfiguration(e);

      // Check properties' configuration
      assert.equal(properties.foo.bar, 'bar');      // 1st level Local property
      assert.equal(properties.bar.baz, 'baz');      // 2st level Local property
      assert.equal(properties.shared.foo, 'bar');   // Overridden value
      assert.equal(properties.shared.bar, 'bar');   // 1st level shared property
      assert.equal(properties.shared.baz, 'baz');   // Appended 2nd level property

    });

    // Properties added and locked
    it('> Should lock the instance to prevent ad-hoc addition of additional properties', () => {

      // Instantiate a 1st level extended Entity class
      let e = new MyExtendedEntity1();

      // Check trying to add new not configured property silently ignores new value
      assert.doesNotThrow(() => { e.bar = 'baz'; });
      assert.notEqual(e.bar, 'baz');

    });
    it('> Should lock configured properties and prevent them from being deleted or reconfigured', () => {

      // Instantiate a 1st level extended Entity class
      let e = new MyExtendedEntity1();
      e.foo = 'bar';

      // Check configured property can't be deleted or reconfigured
      assert.doesNotThrow(() => { delete e.foo; });
      assert.throws(() => { Object.defineProperty(e, 'foo', { value: 'baz' });});
      assert.equal(e.foo, 'bar');

    });
    it('> Should instantiate configured properties with working getters and setters', () => {

      // Instantiate a 1st level extended Entity class
      let e = new MyExtendedEntity1();

      // Check configured property initialized
      assert.ok(e.hasOwnProperty('foo'));
      // Check configured property has working getter and setter
      e.foo = 'waldo';
      assert.equal(e.foo, 'waldo');

    });
    it('> Should instantiate read-only properties with only a getter', () => {

      // Instantiate a 1st level extended Entity class
      let e = new MyExtendedEntity1();

      // Check read-only property initialized
      assert.ok(e.hasOwnProperty('readonly'));
      // Check read-only property has working getter
      assert.equal(e.readonly, 'readonly');
      // Check read-only property has no setter
      assert.throws(() => { e.readonly = 'writable'; });

    });

    // Define Entity extending class with properties occluding methods
    class MyExtendedEntity3 extends EnTT {
      static get props () {
        return {
          watch: {},
          update: {}
        };
      }
    }
    // Check if method occlusion is allowed
    it('> Should not prevent properties from occluding existing methods', () => {

      // Instantiate a 1st level extended Entity class
      let e = new MyExtendedEntity3();

      // Check properties' configuration
      assert.equal(e.watch, null);
      assert.equal(e.update, null);
      assert.doesNotThrow(() => { e.watch = 'foo'; });
      assert.doesNotThrow(() => { e.update = 'bar'; });
      assert.equal(e.watch, 'foo');
      assert.equal(e.update, 'bar');

    });

  });
};
