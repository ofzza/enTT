// =====================================================================================================================
// Tests Entity properties definition and initialization
// =====================================================================================================================
let assert              = require('assert'),
    EnTT                = require('../../dist').default,
    Properties          = require('../../dist/entt/properties').default;

// Export tests
module.exports = () => {
  describe('> Property Configuration and Initialization', () => {

    // Set default property values
    EnTT.default = { value: null };

    // Define an Entity class with some properties
    class ParentEntityClass extends EnTT {
      static get props () {
        return {
          foo: {          // Local property, specific to only this class
            bar: 'bar'      // Random, meaningless configuration
          },
          shared: {       // Shared property, to be overridden by extending classes
            foo: 'foo',     // Random, meaningless configuration
            bar: 'bar'      // Random, meaningless configuration
          },
          readonly: {    // Read-only property
            value: 'readonly',
            readOnly: true
          }
        };
      }
    }

    it('> Should extract property configuration from an Entity class', () => {

      // Get property configuration
      let properties = Properties.getEntityPropertyConfiguration(ParentEntityClass);

      // Check properties' configuration
      assert.equal(properties.foo.bar,    'bar');
      assert.equal(properties.shared.foo, 'foo');
      assert.equal(properties.shared.bar, 'bar');

    });

    it('> Should extract property configuration from an Entity instance', () => {

      // Get property configuration
      let properties = Properties.getEntityPropertyConfiguration(new ParentEntityClass());

      // Check properties' configuration
      assert.equal(properties.foo.bar,    'bar');
      assert.equal(properties.shared.foo, 'foo');
      assert.equal(properties.shared.bar, 'bar');

    });

    it('> Should properly initialize property values', () => {

      // Instantiate a 1st level extended Entity class
      let e = new ParentEntityClass();

      // Check initial property values
      assert.equal(e.foo, null);
      assert.equal(e.shared, null);
      assert.equal(e.readonly, 'readonly');

    });

    // Define a 2nd-level Entity class, adding to and overriding some of the 1st level properties
    class ChildEntityClass extends ParentEntityClass {
      static get props () {
        return {
          bar: {          // Local property, specific to only this class
            baz: 'baz'      // Random, meaningless configuration
          },
          shared: {       // Shared property, being overridden
            foo: 'bar',     // Overriding configuration
            baz: 'baz'      // Overriding configuration
          }
        };
      }
    }

    it('> Should extend and override property configuration', () => {

      // Get property configuration
      let properties = Properties.getEntityPropertyConfiguration(new ChildEntityClass());

      // Check properties' configuration
      assert.equal(properties.foo.bar, 'bar');      // Inherited, parent-class Local property
      assert.equal(properties.bar.baz, 'baz');      // Appended, child-class Local property
      assert.equal(properties.shared.foo, 'bar');   // Extended property's overridden configuration
      assert.equal(properties.shared.bar, 'bar');   // Extended property's inherited configuration
      assert.equal(properties.shared.baz, 'baz');   // Extended property's extended configuration

    });

    it('> Should lock instances to prevent ad-hoc addition of properties', () => {

      // Instantiate a 1st level extended Entity class
      let e = new ParentEntityClass();

      // Adding new, not-configured property silently ignored
      assert.doesNotThrow(() => { e.bar = 'baz'; });
      assert.notEqual(e.bar, 'baz');

    });

    it('> Should lock instances to prevent then being deleted or reconfigured', () => {

      // Instantiate a 1st level extended Entity class
      let e = new ParentEntityClass();
      e.foo = 'bar';

      // Check configured property can't be deleted or reconfigured
      assert.doesNotThrow(() => { delete e.foo; });
      assert.throws(() => { Object.defineProperty(e, 'foo', { value: 'baz' });});
      assert.equal(e.foo, 'bar');

    });

    it('> Should instantiate configured properties with working getters and setters', () => {

      // Instantiate a 1st level extended Entity class
      let e = new ParentEntityClass();

      // Check configured property initialized
      assert.ok(e.hasOwnProperty('foo'));
      // Check configured property has working getter and setter
      e.foo = 'waldo';
      assert.equal(e.foo, 'waldo');

    });

    it('> Should instantiate read-only properties with only a getter', () => {

      // Instantiate a 1st level extended Entity class
      let e = new ParentEntityClass();

      // Check read-only property initialized
      assert.ok(e.hasOwnProperty('readonly'));
      // Check read-only property has working getter
      assert.equal(e.readonly, 'readonly');
      // Check read-only property has no setter
      assert.throws(() => { e.readonly = 'writable'; });

    });

    // Define 3rd-level Entity class, with properties occluding existing Entity class methods
    class EntityClassWithOcluddedMethods extends EnTT {
      static get props () {
        return {
          import: {},
          export: {},
          clone: {},
          watch: {},
          update: {}
        };
      }
    }

    it('> Should allow properties to occlude existing methods', () => {

      // Instantiate Entity class with ocludded methods
      let e = new EntityClassWithOcluddedMethods();

      // Check properties initialized
      assert.equal(e.import, null);
      assert.equal(e.export, null);
      assert.equal(e.clone, null);
      assert.equal(e.watch, null);
      assert.equal(e.update, null);
      // Check properties have working setters and getters
      assert.doesNotThrow(() => { e.import = 'foo'; });
      assert.equal(e.import, 'foo');
      assert.doesNotThrow(() => { e.export = 'foo'; });
      assert.equal(e.export, 'foo');
      assert.doesNotThrow(() => { e.clone = 'foo'; });
      assert.equal(e.clone, 'foo');
      assert.doesNotThrow(() => { e.watch = 'bar'; });
      assert.equal(e.watch, 'bar');
      assert.doesNotThrow(() => { e.update = 'bar'; });
      assert.equal(e.update, 'bar');

    });

    it('> Occluding methods shouldn\'t affect usage of EnTT static methods' , () => {

      // Check static EnTT.cast() method still works
      assert.doesNotThrow(() => { EntityClassWithOcluddedMethods.cast({}); });

    });

    // Define 3rd-level Entity class, with properties occluding existing Entity class methods (except .import())
    class EntityClassWithOcluddedMethodsExceptImport extends EnTT {
      static get props () {
        return {
          export: {},
          clone: {},
          watch: {},
          update: {}
        };
      }
    }
    // Define 3rd-level Entity class, with properties occluding existing Entity class methods (except .export())
    class EntityClassWithOcluddedMethodsExceptExport extends EnTT {
      static get props () {
        return {
          import: {},
          clone: {},
          watch: {},
          update: {}
        };
      }
    }
    // Define 3rd-level Entity class, with properties occluding existing Entity class methods (except .clone())
    class EntityClassWithOcluddedMethodsExceptClone extends EnTT {
      static get props () {
        return {
          import: {},
          export: {},
          watch: {},
          update: {}
        };
      }
    }
    // Define 3rd-level Entity class, with properties occluding existing Entity class methods (except .watch())
    class EntityClassWithOcluddedMethodsExceptWatch extends EnTT {
      static get props () {
        return {
          import: {},
          export: {},
          clone: {},
          update: {}
        };
      }
    }
    // Define 3rd-level Entity class, with properties occluding existing Entity class methods (except .update())
    class EntityClassWithOcluddedMethodsExceptUpdate extends EnTT {
      static get props () {
        return {
          import: {},
          export: {},
          clone: {},
          watch: {}
        };
      }
    }

    it('> Occluding some methods shouldn\'t affect usage of others non-occluded methods' , () => {

      // Instantiate Entity class with ocludded methods
      let eImport = new EntityClassWithOcluddedMethodsExceptImport(),
          eExport = new EntityClassWithOcluddedMethodsExceptExport(),
          eClone  = new EntityClassWithOcluddedMethodsExceptClone(),
          eWatch  = new EntityClassWithOcluddedMethodsExceptWatch(),
          eUpdate = new EntityClassWithOcluddedMethodsExceptUpdate();

      // Check non-occluded .import() method still works
      assert.doesNotThrow(() => {
        eImport.import({});
      });
      // Check non-occluded .export() method still works
      assert.doesNotThrow(() => {
        eExport.export();
      });
      // Check non-occluded .clone() method still works
      assert.doesNotThrow(() => {
        eClone.clone();
      });
      // Check non-occluded .update() method still works
      assert.doesNotThrow(() => {
        const cancelWatcher = eWatch.watch(() => {  });
        cancelWatcher();
      });
      // Check non-occluded .watch() method still works
      assert.doesNotThrow(() => {
        eUpdate.update();
      });

    });

  });
};
