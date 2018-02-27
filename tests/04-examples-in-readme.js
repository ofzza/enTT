// =====================================================================================================================
// Tests Entity README.md examples
// =====================================================================================================================
let _                           = require('lodash'),
    assert                      = require('assert'),
    EnTT                        = require('../dist').default,
    DynamicPropertiesExtension  = require('../dist').DynamicPropertiesExtension,
    ValidationExtension         = require('../dist').ValidationExtension;

// Run tests
describe('> README.md Examples', () => {

  // Property configuration
  describe('> Property configuration', () => {

    // How to configure properties
    it('> Example: How to configure properties', () => {

      // Define a 1st level EnTT class
      class MyModel extends EnTT {
        static get props () {
          // Configure properties with initial values
          return {
            foo: { value: 'value for FOO' },
            bar: { value: 'value for BAR' }
          };
        }
      }

      // Inherit into a 2nd level EnTT class
      class MyMoreSpecificModel extends MyModel {
        static get props () {
          // Configure properties with initial values
          return {
            foo: { value: 'overridden value for FOO' },
            baz: { value: 'value for BAZ' }
          };
        }
      }

      // Instantiate the 2nd level class
      let instance = new MyMoreSpecificModel();

      // Check initial values set
      assert.equal(instance.foo, 'overridden value for FOO');
      // ... console.log(instance.foo);
      // ... Outputs "overridden value for FOO", set because of "MyMoreSpecificModel.foo" configuration
      assert.equal(instance.bar, 'value for BAR');
      // ... console.log(instance.bar);
      // ... Outputs "value for BAR", set because of "MyModel.bar" configuration
      assert.equal(instance.baz, 'value for BAZ');
      // ... console.log(instance.baz);
      // ... Outputs "value for BAZ", set because of "MyMoreSpecificModel.baz" configuration

    });

    // Configuration options
    describe('> Configuration options', () => {

      // Value
      it('> Example: Value', () => {

        // Define an EnTT class
        class MyModel extends EnTT {
          static get props () {
            return {
              // Configure property .foo with a initial value "bar"
              foo: { value: 'bar' }
            };
          }
        }

        // Construct a single instance and check initial property value
        assert.equal((new MyModel()).foo, 'bar');
        // ... console.log((new MyModel()).foo);
        // ... Outputs initial "bar" value

      });

      // Readonly
      it('> Example: Readonly', () => {

        // Define an EnTT class
        class MyModel extends EnTT {
          static get props () {
            return {
              // Configure a read-only property .foo with a initial value "bar"
              foo: {
                value: 'bar',
                readOnly: true
              }
            };
          }
        }

        // Construct a single instance
        let instance = new MyModel();
        // Check if readable
        assert.equal(instance.foo, 'bar');
        // ... console.log(instance.foo);
        // ... Outputs initial "bar" value
        // Check if writable
        assert.throws(() => { instance.foo = 'baz'; });
        // ... instance.foo = 'baz';
        // ... Throws an error
        // Check if exported when exporting
        // ... console.log(instance.export().foo);
        // ... Outputs unchanged value of "bar"
        // Try importing data
        instance.import({ foo: 'baz' });
        assert.equal(instance.foo, 'bar');
        // ... console.log(instance.foo);
        // ... Outputs unchanged value of "bar"
        // Try casting to MyModel
        let castIntoModel = EnTT.cast({ foo: 'baz' }, MyModel);
        assert.equal(castIntoModel.foo, 'bar');
        // ... console.log(castIntoModel.foo);
        // ... Outputs unchanged value of "bar"

      });

      // Exportable
      it('> Example: Exportable', () => {

        // Define an EnTT class
        class MyModel extends EnTT {
          static get props () {
            return {
              // Configure a read-only property .foo with a initial value "bar"
              foo: {
                value: 'bar',
                exportable: false
              }
            };
          }
        }

        // Construct a single instance
        let instance = new MyModel();
        // Check if readable
        assert.equal(instance.foo, 'bar');
        // ... console.log(instance.foo);
        // ... Outputs initial "bar" value
        // Check if writable
        instance.foo = 'baz';
        assert.equal(instance.foo, 'baz');
        // ... console.log(instance.foo);
        // ... Outputs assigned "baz" value
        // Check if exported when exporting
        assert.equal(instance.export().foo, undefined);
        // ... console.log(instance.export().foo);
        // ... Outputs undefined
        // Try importing data
        instance.import({ foo: 'qux' });
        assert.equal(instance.foo, 'baz');
        // ... console.log(instance.foo);
        // ... Outputs unchanged value of "baz"
        // Try casting to MyModel
        let castIntoModel = EnTT.cast({ foo: 'qux' }, MyModel);
        assert.equal(castIntoModel.foo, 'qux');
        // ... console.log(castIntoModel.foo);
        // ... Outputs cast value of "qux"

      });

      // Cast
      it('> Example: Cast', () => {

        // Define a simple EnTT class to use as a casting target
        class MyValue extends EnTT {
          static get props () {
            return {
              val: { }
            };
          }
        }

        // Define an EnTT class containing casting properties
        class MyModel extends EnTT {
          static get props () {
            return {
              // Configure some casting properties
              foo: { cast: MyValue },
              bar: { cast: [ MyValue ] },
              baz: { cast: { MyValue } },
            };
          }
        }

        // Instantiate the class
        let instance = new MyModel();

        // Assign value to cast property
        instance.foo = { val: 1 };
        assert.ok(instance.foo instanceof MyValue);
        assert.equal(Object.keys(instance.foo).length, 1);
        assert.equal(Object.keys(instance.foo)[0], 'val');
        assert.equal(Object.values(instance.foo).length, 1);
        assert.equal(Object.values(instance.foo)[0], 1);
        // ... console.log((instance.foo instanceof MyValue), Object.keys(instance.foo), Object.values(instance.foo));
        // ... Outputs true, [ "val" ], [ 1 ]
        // ... The set raw object was cast as MyValue instance

        // Assign array of values to cast property
        instance.bar = [ { val: 0 }, { val: 1 }, { val: 2 } ];
        assert.ok(instance.bar[0] instanceof MyValue);
        assert.equal(Object.keys(instance.bar[0])[0], 'val');
        assert.equal(Object.values(instance.bar[0])[0], 0);
        // ...console.log((instance.bar[0] instanceof MyValue), Object.keys(instance.bar[0]), Object.values(instance.bar[0]));
        // ... Outputs true, [ "val" ], [ 0 ]
        assert.ok(instance.bar[1] instanceof MyValue);
        assert.equal(Object.keys(instance.bar[1])[0], 'val');
        assert.equal(Object.values(instance.bar[1])[0], 1);
        // ... console.log((instance.bar[1] instanceof MyValue), Object.keys(instance.bar[1]), Object.values(instance.bar[1]));
        // ... Outputs true, [ "val" ], [ 1 ]
        assert.ok(instance.bar[2] instanceof MyValue);
        assert.equal(Object.keys(instance.bar[2])[0], 'val');
        assert.equal(Object.values(instance.bar[2])[0], 2);
        // ... console.log((instance.bar[2] instanceof MyValue), Object.keys(instance.bar[2]), Object.values(instance.bar[2]));
        // ... Outputs true, [ "val" ], [ 2 ]
        // ... The set array of raw objects was cast as array of MyValue instances

        // Assign hashmap of values to cast property
        instance.baz = { a: { val: 0 }, b: { val: 1 } };
        assert.ok(instance.baz.a instanceof MyValue);
        assert.equal(Object.keys(instance.baz.a)[0], 'val');
        assert.equal(Object.values(instance.baz.a)[0], 0);
        // ... console.log((instance.baz.a instanceof MyValue), Object.keys(instance.baz.a), Object.values(instance.baz.a));
        // ... Outputs true, [ "val" ], [ 0 ]
        assert.ok(instance.baz.b instanceof MyValue);
        assert.equal(Object.keys(instance.baz.b)[0], 'val');
        assert.equal(Object.values(instance.baz.b)[0], 1);
        // ... console.log((instance.bar.b instanceof MyValue), Object.keys(instance.bar.b), Object.values(instance.bar.b));
        // ... Outputs true, [ "val" ], [ 1 ]
        // ... The set hashmap of raw objects was cast as hashmap of MyValue instances

      });

    });

  });

  // Data management
  describe('> Data management', () => {

    // Importing
    describe('> Importing', () => {

      // Default
      it('> Example: Default', () => {

        // Define an EnTT class to use as an import target
        class MyModel extends EnTT {
          static get props () {
            return {
              foo: { },
              bar: { readOnly: true },
              baz: { exportable: false }
            };
          }
        }

        // Instantiate the class and import raw data
        let instance = (new MyModel()).import({
          foo: 'FOO',   // Targeting import to a simple property
          bar: 'BAR',   // Targeting import to a read-only property
          baz: 'BAZ',   // Targeting import to a non-exportable property
          qux: 'QUX'    // Targeting import to a not define property
        });

        // Check imported properties
        assert.equal(instance.foo, 'FOO');
        // ... console.log(instance.foo);
        // ... Outputs imported value "FOO"
        assert.equal(instance.bar, undefined);
        // ... console.log(instance.bar);
        // ... Outputs undefined because can't import to read-only property
        assert.equal(instance.baz, undefined);
        // ... console.log(instance.baz);
        // ... Outputs undefined because can't import to a not exportable property
        assert.equal(instance.qux, undefined);
        // ... console.log(instance.qux);
        // ... Outputs undefined because can't import to a non-existant property

      });

      // With Bindings
      it('> Example: With Bindings', () => {

        // Define an EnTT class to use as a mapped import target
        class MyModel extends EnTT {
          static get props () {
            return {
              foo: { bind: 'bar' },
              bar: { bind: 'baz' }
            };
          }
        }

        // Instantiate the class and import raw data
        let instance = (new MyModel()).import({
          bar: 'BAR',   // Targeting mapped import into .foo
          baz: 'BAZ',   // Targeting mapped import into .bar
        });

        // Check imported properties
        assert.equal(instance.foo, 'BAR');
        // ... console.log(instance.foo);
        // ... Outputs "BAR", imported value from .bar
        assert.equal(instance.bar, 'BAZ');
        // ... console.log(instance.bar);
        // ... Outputs "BAZ", imported value from .baz

      });
    });

    // Exporting
    describe('> Exporting', () => {

      // Default
      it('> Example: Default', () => {

        // Define an EnTT class to use as an exporting source
        class MyModel extends EnTT {
          static get props () {
            return {
              foo: { value: 'FOO' },
              bar: { value: 'BAR', readOnly: true },
              baz: { value: 'BAZ', exportable: false }
            };
          }
        }

        // Instantiate the class and export raw data
        let exported = (new MyModel()).export();

        // Check exported properties
        assert.equal(exported.foo, 'FOO');
        // ... console.log(exported.foo);
        // ... Outputs initial value "FOO"
        assert.equal(exported.bar, 'BAR');
        // ... console.log(exported.bar);
        // ... Outputs initial value "BAR"
        assert.equal(exported.baz, undefined);
        // ... console.log(exported.baz);
        // ... Outputs undefined because can't export a not exportable property

      });

      // With Bindings
      it('> Example: With Bindings', () => {

        // Define an EnTT class to use as a mapped exporting source
        class MyModel extends EnTT {
          static get props () {
            return {
              foo: { value: 'FOO', bind: 'bar' },
              bar: { value: 'BAR', bind: 'baz' }
            };
          }
        }

        // Instantiate the class and export raw data
        let exported = (new MyModel()).export();

        // Check exported properties
        assert.equal(exported.foo, undefined);
        // ... console.log(exported.foo);
        // ... Outputs undefined
        assert.equal(exported.bar, 'FOO');
        // ... console.log(exported.bar);
        // ... Outputs "FOO", exported value from .foo
        assert.equal(exported.baz, 'BAR');
        // ... console.log(exported.baz);
        // ... Outputs "BAR", imported value from .bar

      });

    });

    // Casting
    describe('> Casting', () => {

      // Define an EnTT class to use as a casting target
      class MyModel extends EnTT {
        static get props () {
          return {
            foo: { },
            bar: { }
          };
        }
      }

      // Cast a single object as a single entity
      it('> Example: Cast a single object as a single entity', () => {

        // Cast a raw object as a single entity
        let rawData = { foo: 'FOO', bar: 'BAR' },
            castEntity = EnTT.cast(rawData, MyModel);

        // Check cast entity
        assert.ok(castEntity instanceof MyModel);
        assert.equal(castEntity.foo, 'FOO');
        assert.equal(castEntity.bar, 'BAR');
        // ... console.log((castEntity instanceof MyModel), castEntity.foo, castEntity.bar);
        // ... Outputs: true, "FOO", "BAR"

      });

      // Cast an array of objects as an array of entities
      it('> Example: Cast an array of objects as an array of entities', () => {

        // Cast a raw object array as an entity array
        let rawData = [
          { foo: 'FOO', bar: 'BAR' },
          { foo: 'BAZ', bar: 'QUX' }
        ],
        castEntityArray = EnTT.cast(rawData, [ MyModel ]);

        // Check cast entity array
        assert.equal(castEntityArray.length, 2);
        // ... console.log(castEntityArray.length);
        // ... Outputs 2
        assert.ok(castEntityArray[0] instanceof MyModel);
        assert.equal(castEntityArray[0].foo, 'FOO');
        assert.equal(castEntityArray[0].bar, 'BAR');
        // ... console.log(castEntityArray[0] instanceof MyModel), castEntityArray[0].foo, castEntityArray[0].bar);
        // ... Outputs: true, "FOO", "BAR"
        assert.ok(castEntityArray[1] instanceof MyModel);
        assert.equal(castEntityArray[1].foo, 'BAZ');
        assert.equal(castEntityArray[1].bar, 'QUX');
        // ... console.log(castEntityArray[1] instanceof MyModel), castEntityArray[1].foo, castEntityArray[1].bar);
        // ... Outputs: true, "BAZ", "QUX"

      });

      // Cast a hashmap of objects as a hashmap of entities
      it('> Example: Cast a hashmap of objects as a hashmap of entities', () => {

        // Cast a raw object hashmap as an entity hashmap
        let rawData = {
          waldo:  { foo: 'FOO', bar: 'BAR' },
          fred:   { foo: 'BAZ', bar: 'QUX' }
        },
        castEntityHashmap = EnTT.cast(rawData, { MyModel });

        assert.equal(Object.values(castEntityHashmap).length, 2);
        // ... console.log(Object.values(castEntityArray.length));
        // ... Outputs: 2
        assert.ok(castEntityHashmap.waldo instanceof MyModel);
        assert.equal(castEntityHashmap.waldo.foo, 'FOO');
        assert.equal(castEntityHashmap.waldo.bar, 'BAR');
        // ... console.log(castEntityHashmap.waldo instanceof MyModel), castEntityHashmap.waldo.foo, castEntityHashmap.waldo.bar);
        // ... Outputs: true, "FOO", "BAR"
        assert.ok(castEntityHashmap.fred instanceof MyModel);
        assert.equal(castEntityHashmap.fred.foo, 'BAZ');
        assert.equal(castEntityHashmap.fred.bar, 'QUX');
        // ... console.log(castEntityHashmap.fred instanceof MyModel), castEntityHashmap.fred.foo, castEntityHashmap.fred.bar);
        // ... Outputs: true, "BAZ", "QUX"


      });

    });

  });

  // Change detection
  describe('> Change detection', () => {

    // Watching for changes
    describe('> Watching for changes', () => {

      // Raw Values
      it('> Example: Raw Values', () => {

        // Define an EnTT class to use for change detection
        class MyModel extends EnTT {
          static get props () {
            return {
              foo: { value: 'FOO' }
            };
          }
        }

        // Instantiate an instance and subscribe to changes
        let output = null,
            instance = new MyModel(),
            cancel = instance.watch((e) => {
              output = e;
              // ... console.log(
              // ...   (e.source === instance),  // Source will be the instance which detected a change
              // ...   e.propertyName,           // Property which changed
              // ...   e.oldValue,               // Old property value before the change
              // ...   e.newValue                // New property value after the change
              // ... );
            });

        // Update instance
        instance.foo = 'BAR';
        assert.equal(output.source, instance);
        assert.equal(output.propertyName, 'foo');
        assert.equal(output.oldValue, 'FOO');
        assert.equal(output.newValue, 'BAR');
        output = null;
        // ... Change event handler outputs: true, "foo", "FOO", "BAR"
        instance.foo = 'BAZ';
        assert.equal(output.source, instance);
        assert.equal(output.propertyName, 'foo');
        assert.equal(output.oldValue, 'BAR');
        assert.equal(output.newValue, 'BAZ');
        output = null;
        // ... Change event handler outputs: true, "foo", "BAR", "BAZ"

        // Cancel the subscription
        cancel();

        // Update instance
        instance.foo = 'QUX';   // No output from change event handler
        assert.equal(output, null);
        output = null;

      });

      // Embedded Entity
      it('> Example: Embedded Entity', () => {

        // Define an EnTT class to use for change detection
        class MyModel extends EnTT {
          static get props () {
            return {
              foo: { value: 'FOO' },
              bar: { value: 'BAR' }
            };
          }
        }

        // Nest 3 levels of instances and watch top level instance for changes
        let output = null,
            instance = new MyModel();         // Top level instance
        instance.foo = new MyModel();         // 2nd level instance, nested as instance.foo
        instance.foo.bar = new MyModel();     // 3rd level instance, nested as instance.foo.bar
        instance.watch((e) => {               // Watch top level instance for changes
          output = e;
          // ... console.log(
          // ...   (e.source === instance),  // Source will be the instance which detected a change
          // ...   e.propertyName,           // Property which changed
          // ...   e.oldValue,               // Old property value before the change
          // ...   e.newValue,               // New property value after the change
          // ...   e.innerEvent              // Reference to the change event of the child instance
          // ... );
        });

        // Update 2nd level instance
        instance.foo.foo = 'BAR';
        assert.equal(output.source, instance);
        assert.equal(output.propertyName, 'foo');
        assert.equal(output.oldValue, null);
        assert.equal(output.newValue, null);
        assert.equal(output.innerEvent.source, instance.foo);
        assert.equal(output.innerEvent.propertyName, 'foo');
        assert.equal(output.innerEvent.oldValue, 'FOO');
        assert.equal(output.innerEvent.newValue, 'BAR');
        output = null;
        // ... Change event handler outputs:
        // ... true, "foo", null, null, {
        // ...   source: [instance.foo],
        // ...   propertyName: "foo",
        // ...   oldValue: "FOO",
        // ...   newValue: "BAR"
        // ... }
        instance.foo.bar.foo = 'BAZ';
        assert.equal(output.source, instance);
        assert.equal(output.propertyName, 'foo');
        assert.equal(output.oldValue, null);
        assert.equal(output.newValue, null);
        assert.equal(output.innerEvent.source, instance.foo);
        assert.equal(output.innerEvent.propertyName, 'bar');
        assert.equal(output.innerEvent.oldValue, null);
        assert.equal(output.innerEvent.newValue, null);
        assert.equal(output.innerEvent.innerEvent.source, instance.foo.bar);
        assert.equal(output.innerEvent.innerEvent.propertyName, 'foo');
        assert.equal(output.innerEvent.innerEvent.oldValue, 'FOO');
        assert.equal(output.innerEvent.innerEvent.newValue, 'BAZ');
        // ... Change event handler outputs:
        // ... true, "foo", null, null, {
        // ...   source: [instance.foo],
        // ...   propertyName: "bar",
        // ...   oldValue: null,
        // ...   newValue: null,
        // ...   innerEvent: {
        // ...     source: [instance.foo.bar]
        // ...     propertyName: "foo",
        // ...     oldValue: "FOO",
        // ...     newValue: "BAZ"
        // ...   }
        // ... }
        output = null;

      });

    });

    // Manual Update Notification
    describe('> Manual Update Notification', () => {

      // Manual Update Notification
      it('> Example: Manual Update Notification', () => {

        // Define an EnTT class to use for change detection
        class MyModel extends EnTT {
          static get props () {
            return {
              foo: { }
            };
          }
        }

        // Instantiate an instance and subscribe to changes
        let output = null,
            instance = new MyModel();
        instance.watch((e) => {
          output = e;
          // ... console.log('Change detected!');
        });

        // Set an object as property value
        instance.foo = { foo: 'FOO', bar: 'BAR' };
        // ... Outputs: "Change detected!"
        instance.foo.bar = 'BAZ';
        assert.ok(output); output = null;
        // ... No output, can't detect changes to embedded properties
        instance.foo.baz = 'BAZ';
        assert.ok(!output); output = null;
        // ... No output, can't detect creation of new embedded properties
        delete instance.foo.bar;
        assert.ok(!output); output = null;
        // ... No output, can't detect deletion of embedded properties
        // Manually notify of changes to trigger watchers
        instance.update();
        assert.ok(output); output = null;
        // ... Outputs: "Change detected!"

        // Set an array as property value
        instance.foo = [0, 1, 2, 3, 4];
        assert.ok(output); output = null;
        // ... Outputs: "Change detected!"
        instance.foo[2] = 20;
        assert.ok(!output); output = null;
        // ... No output, can't detect changes to array members
        instance.foo.push(5);
        assert.ok(!output); output = null;
        // ... No output, can't detect addition of array members
        instance.foo.splice(1, 1);
        assert.ok(!output); output = null;
        //...  No output, can't detect removal of array members
        // Manually notify of changes to trigger watchers
        instance.update();
        assert.ok(output); output = null;
        // ... Outputs: "Change detected!"

        // Set a foreign class instance as property value
        instance.foo = new Date();
        assert.ok(output); output = null;
        // ... Outputs: "Change detected!"
        instance.foo.setFullYear(1970);
        assert.ok(!output); output = null;
        // ... No output, can't detect changes within non-EnTT instances
        instance.update();
        assert.ok(output); output = null;
        // ... Outputs: "Change detected!"

        // Embed as EnTT instance deeper within data as property value
        instance.foo = { bar: new MyModel() };
        assert.ok(output); output = null;
        // ... Outputs: "Change detected!"
        instance.foo.bar.foo = 'QUX';
        assert.ok(!output); output = null;
        // ... No output, can't propagate EnTT change through a non.EnTT object
        instance.update();
        assert.ok(output); output = null;
        // ... Outputs: "Change detected!"

      });

    });

    // Update Batching
    describe('> Update Batching', () => {

      // Update Batching
      it('> Update Batching', () => {

        // Define an EnTT class to use for change detection
        class MyModel extends EnTT {
          static get props () {
            return {
              foo: { },
              bar: { },
              baz: { }
            };
          }
        }

        // Instantiate an instance and subscribe to changes
        let output = null,
            instance = new MyModel();
        instance.watch((e) => {
          output = e;
          // ... console.log('Change detected!');
        });

        // Make multiple changes without batching
        instance.foo = 'FOO';
        assert.ok(output); output = null;
        // ... Outputs: "Change detected!"
        instance.bar = 'BAR';
        assert.ok(output); output = null;
        // ... Outputs: "Change detected!"
        instance.baz = 'BAZ';
        assert.ok(output); output = null;
        // ... Outputs: "Change detected!"

        // Batch a number of changes
        instance.update(() => {
          instance.foo = 'FOO';
          assert.ok(!output); output = null;
          // ... No output
          instance.bar = 'BAR';
          assert.ok(!output); output = null;
          // ... No output
          instance.baz = 'BAZ';
          assert.ok(!output); output = null;
          // ... No output
        });
        assert.ok(output); output = null;
        // ... Outputs: "Change detected!"

      });

    });

  });

  // Extensions
  describe('> Extensions', () => {

    // Included extensions and how to use them
    describe('> Included extensions and how to use them', () => {

      // Dynamic Properties Extension
      it('> Dynamic Properties Extension', () => {

        // Define an EnTT class with dynamic properties
        class MyModel extends EnTT {
          static get includes () {
            return [ DynamicPropertiesExtension ];
          }
          static get props () {
            return {
              firstName: {},      // Standard property
              lastName: {},       // Standard property
              fullName: {         // Dynamic proeprty
                // Make this property dynamic
                dynamic: (entity) => {
                  // Compose full name from first and last names
                  return `${entity.firstName} ${entity.lastName}`;
                }
              }
            };
          }
        }

        // Instantiate an instance and set some values
        let instance = new MyModel();
        instance.firstName = 'Homer';
        instance.lastName = 'Simpson';

        // Check the dynamic property
        assert.equal(instance.fullName, 'Homer Simpson');
        // ... console.log(instance.fullName);
        // ... Outputs "Homer Simpson"

      });

      // Validation Extension
      it('> Validation Extension', () => {

        // Define an EnTT class with validated properties
        class MyModel extends EnTT {
          static get includes () {
            return [ ValidationExtension ];
          }
          static get props () {
            return {
              lastName: {
                value: 'simpson',
                validate: (value) => {
                  // Check if value starts with a capital letter
                  if (!value || !value.length || value[0] !== value[0].toUpperCase()) {
                    //  Return validation erorr message
                    return `Value "${value}" needs to be capitalized!`;
                  }
                }
              }
            };
          }
        }

        // Instantiate an instance
        let instance = new MyModel();

        // Check initial value and validation
        assert.equal(instance.lastName, 'simpson');
        // ... console.log(instance.lastName);
        // ... Outputs "simpson"
        assert.equal(!!instance.validation.lastName, true);
        // ... console.log(!!instance.validation.lastName);
        // ... Outputs true, meaning there is a validation error
        assert.equal(instance.validation.lastName.property, 'lastName');
        // ... console.log(instance.validation.lastName.property);
        // ... Outputs "lastName"
        assert.equal(instance.validation.lastName.value, 'simpson');
        // ... console.log(instance.validation.lastName.value);
        // ... Outputs "simpson"
        assert.equal(instance.validation.lastName.message, 'Value "simpson" needs to be capitalized!');
        // ... console.log(instance.validation.lastName.message);
        // ... Outputs "Value "simpson" needs to be capitalized!"

        // Update value to pass validation
        instance.lastName = 'Simpson';
        // Check value and validation
        assert.equal(instance.lastName, 'Simpson');
        // ... console.log(instance.lastName);
        // ... Outputs "Simpson"
        assert.equal(!!instance.validation.lastName, false);
        // ... console.log(!!instance.validation.lastName);
        // ... Outputs false, meaning there is no validation error

        // Update value to fail
        instance.update(() => {
          instance.lastName = instance.lastName.toLowerCase();
        });
        // Check value and validation
        assert.equal(instance.lastName, 'simpson');
        // .. console.log(instance.lastName);
        // .. Outputs "simpson"
        assert.equal(!!instance.validation.lastName, true);
        // .. console.log(!!instance.validation.lastName);
        // .. Outputs true, meaning there is a validation error
        assert.equal(instance.validation.lastName.property, 'lastName');
        // .. console.log(instance.validation.lastName.property);
        // .. Outputs "lastName"
        assert.equal(instance.validation.lastName.value, 'simpson');
        // .. console.log(instance.validation.lastName.value);
        // .. Outputs "simpson"
        assert.equal(instance.validation.lastName.message, 'Value "simpson" needs to be capitalized!');
        // .. console.log(instance.validation.lastName.message);
        // .. Outputs "Value "simpson" needs to be capitalized!"

      });

    });

    // Extension authoring
    describe('> Extension authoring', () => {

      // EnTTExt class methods
      describe('> EnTTExt class methods', () => {

        // .updatePropertyConfiguration(...) method
        it('.updatePropertyConfiguration(...) method', () => {

          /**
           * .updatePropertyConfiguration(...) method standin
           * @param {any} propertyConfiguration Single property configuration
           */
          function updatePropertyConfiguration (propertyConfiguration) {
            // Check if property is marked as a color property
            if (propertyConfiguration.color) {
              // Check if initial value set for property and if it's a valid hex color value
              const isLongColorValue  = /^#[0-9A-F]{6}$/i.test(propertyConfiguration.value),
                    isShortColorValue = /^#[0-9A-F]{3}$/i.test(propertyConfiguration.value);
              if (isLongColorValue || isShortColorValue) {
                // Capitalize hex coolor value
                propertyConfiguration.value = propertyConfiguration.value.toUpperCase();
              }
            }
          }

          // Test method when not color
          const conf = { color: false, value: null };
          conf.value = '#ffffff'; updatePropertyConfiguration(conf);
          assert.equal(conf.value, '#ffffff');
          conf.value = '#fff'; updatePropertyConfiguration(conf);
          assert.equal(conf.value, '#fff');
          conf.value = 'white'; updatePropertyConfiguration(conf);
          assert.equal(conf.value, 'white');

          // Test method when color
          conf.color = true;
          conf.value = '#ffffff'; updatePropertyConfiguration(conf);
          assert.equal(conf.value, '#FFFFFF');
          conf.value = '#fff'; updatePropertyConfiguration(conf);
          assert.equal(conf.value, '#FFF');
          conf.value = 'white'; updatePropertyConfiguration(conf);
          assert.equal(conf.value, 'white');

        });

        // .onEntityInstantiate(...) method
        it('.onEntityInstantiate(...) method', () => {

          /**
           * .onEntityInstantiate(...) method standin
           * @param {any} entity EnTT isntance
           * @param {any} properties EnTT properties' configuration
           * @returns {any} Average color
           */
          function getAverageColor (entity, properties) {
            const average = _.reduce(properties, (average, propertyConfiguration, propertyName) => {
              let propertyValue = entity[propertyName],
                  isLongColorValue  = /^#[0-9A-F]{6}$/i.test(propertyValue),
                  isShortColorValue = /^#[0-9A-F]{3}$/i.test(propertyValue);
              if (propertyConfiguration.color && (isLongColorValue || isShortColorValue)) {
                if (propertyValue.length === 7) {
                  average.r += parseInt(propertyValue.substr(1, 2), 16);
                  average.g += parseInt(propertyValue.substr(3, 2), 16);
                  average.b += parseInt(propertyValue.substr(5, 2), 16);
                  average.count++;
                } else if (propertyValue.length === 4) {
                  average.r += 0x11 * parseInt(propertyValue.substr(1, 1), 16);
                  average.g += 0x11 * parseInt(propertyValue.substr(2, 1), 16);
                  average.b += 0x11 * parseInt(propertyValue.substr(3, 1), 16);
                  average.count++;
                }
              }
              return average;
            }, { count: 0, r: 0, g: 0, b: 0 });
            const red   = (average.r / (average.count || 1)).toString(16),
                  green = (average.g / (average.count || 1)).toString(16),
                  blue  = (average.b / (average.count || 1)).toString(16);
            return `#${ red }${ green  }${ blue  }`;
          }

          // Test method
          const entity = { foo: '#ff0000', bar: '#0f0', baz: '#00f' },
                properties = { foo: { color: true }, bar: { color: true }, baz: { color: true } };
          assert.equal(getAverageColor(entity, properties), '#555555');

        });

        // .onChangeDetected(...) method
        it('.onChangeDetected(...) method', () => {
          // Nothing to really test here ...
        });

        // .afterChangeProcessed(...) method
        it('.afterChangeProcessed(...) method', () => {
          // Nothing to really test here ...
        });

        // .interceptPropertySet(...) method
        it('.interceptPropertySet(...) method', () => {

          /**
           * .interceptPropertySet(...) method standin
           * @param {any} event EnTTExtValueEvent instance
           */
          function interceptPropertySet (event) {
            // Check if value set for property and if it's a valid hex color value
            const isLongColorValue  = /^#[0-9A-F]{6}$/i.test(event.value),
                  isShortColorValue = /^#[0-9A-F]{3}$/i.test(event.value);
            if (isLongColorValue || isShortColorValue) {
              // Capitalize hex color value
              event.value = event.value.toUpperCase();
            }
          }

          // Test method
          const event = { value: null };
          event.value = '#ffffff'; interceptPropertySet(event);
          assert(event.value, '#FFFFFF');
          event.value = '#fff'; interceptPropertySet(event);
          assert(event.value, '#FFF');
          event.value = 'white'; interceptPropertySet(event);
          assert(event.value, 'white');

        });

        // .interceptPropertyGet(...) method
        it('.interceptPropertyGet(...) method', () => {

          /**
           * .interceptPropertyGet(...) method standin
           * @param {any} event EnTTExtValueEvent instance
           */
          function interceptPropertyGet (event) {
            // Define known colors
            const colors = {
              '#ffffff': 'white',
              '#fff': 'white',
              /* ... */
              '#000000': 'black',
              '#000': 'black',
            };
            // Replace color value if it is a known color value
            event.value = colors[event.value.toLowerCase()] || event.value;
          }

          // Test method
          const event = { value: null };
          event.value = '#ffffff'; interceptPropertyGet(event);
          assert.equal(event.value, 'white');
          event.value = '#fff'; interceptPropertyGet(event);
          assert.equal(event.value, 'white');
          event.value = '#000000'; interceptPropertyGet(event);
          assert.equal(event.value, 'black');
          event.value = '#000'; interceptPropertyGet(event);
          assert.equal(event.value, 'black');

        });

      });

    });

  });

});
