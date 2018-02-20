// =====================================================================================================================
// Tests Entity Extension Authoring (Overriding EnTTExt class into a custom extension)
// =====================================================================================================================
let assert      = require('assert'),
    EnTT        = require('../../dist').default,
    EnTTExt     = require('../../dist').EnTTExt,
    Properties  = require('../../dist/entt/properties').default;

// Entity extending and instantiation
module.exports = () => {
  // Extensions should hook into EnTT workflow
  describe('> Authored extensions need hooks into EnTT to ...', () => {

    // .updatePropertyConfiguration(...)
    it('> Update Property Configuration: .updatePropertyConfiguration(propertyConfiguration)', () => {

      // Define custom extension implementing .updatePropertyConfiguration(...)
      class AuthoredExtension extends EnTTExt {
        constructor() {
          // Implements .updatePropertyConfiguration(...)
          super({ updatePropertyConfiguration: true });
        }
        // Implement .updatePropertyConfiguration(...) to add a baz='qux' key/value to property configurations already containing baz property
        updatePropertyConfiguration (propertyConfiguration) {
          if (propertyConfiguration.baz) {
            propertyConfiguration.baz = 'qux';
          }
        }
      }

      // Define EnTT extending class using the custom extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ AuthoredExtension ];
        }
        static get props () {
          return {
            foo: { baz: 'baz' },
            bar: {}
          };
        }
      }

      // Get property definitions for the extended entity class
      const properties = Properties.getEntityPropertyConfiguration(MyExtendedEntity);

      // Check if .updatePropertyConfiguration(...) was called
      assert.equal(properties.foo.baz, 'qux');
      assert.equal(properties.bar.baz, undefined);

    });

    // .onEntityInstantiate(...)
    it('> Update Entity instance after it has been constructed: .onEntityInstantiate(entity)', () => {

      // Define custom extension implementing .onEntityInstantiate(...)
      class AuthoredExtension extends EnTTExt {
        constructor() {
          // Implements .onEntityInstantiate(...)
          super({ onEntityInstantiate: true });
        }
        // Implement .onEntityInstantiate(...) to add a .foo() method to the entity returning 'bar' when called
        onEntityInstantiate (entity) {
          entity.foo = () => { return 'bar'; };
        }
      }

      // Define EnTT extending class using the custom extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ AuthoredExtension ];
        }
      }

      // Instantiate EnTT including the custom extension
      const e = new MyExtendedEntity();

      // Check if .onEntityInstantiate(...) was called
      assert.ok(e.foo);
      assert.equal(e.foo(), 'bar');

    });

    // .onChangeDetected(...) and .afterChangeProcessed(event)
    it('> Intercept all changes to property values: .onChangeDetected(event) and .afterChangeProcessed(event)', () => {

      // Track detected changes
      let changeCallbackEvents = [],
          afterChangeCallbackEvent = [],
          orderOfExecutionBuffer = [];
      // Define custom extension implementing .onChangeDetected(...)
      class AuthoredExtension extends EnTTExt {
        constructor() {
          // Implements .onChangeDetected(...) and .afterChangeProcessed(...)
          super({
            onChangeDetected: true,
            afterChangeProcessed: true
          });
        }
        // Implement .onChangeDetected(...) to store argument event for inspection
        onChangeDetected (entity, properties, event) {
          changeCallbackEvents.push(event);
          orderOfExecutionBuffer.push('onChangeDetected');
        }
        // Implement .afterChangeProcessed(...) to store argument event for inspection
        afterChangeProcessed (entity, properties, event) {
          afterChangeCallbackEvent.push(event);
          orderOfExecutionBuffer.push('afterChangeProcessed');
        }
      }

      // Define EnTT extending class using the custom extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ AuthoredExtension ];
        }
        static get props () {
          return {
            foo: { value: 'foo' }
          };
        }
      }

      // Instantiate EnTT including the custom extension
      const e = new MyExtendedEntity();
      e.watch(() => { orderOfExecutionBuffer.push('watcher'); });

      // Initially no callback events should be triggered by instantiation
      assert.equal(changeCallbackEvents.length, 0);
      // Check change detection on property 1st value change
      e.foo = 'bar';
      assert.equal(changeCallbackEvents.length, 1);
      assert.equal(afterChangeCallbackEvent.length, 1);
      assert.equal(changeCallbackEvents[0].propertyName, 'foo');
      assert.equal(afterChangeCallbackEvent[0].propertyName, 'foo');
      assert.equal(changeCallbackEvents[0].oldValue, 'foo');
      assert.equal(afterChangeCallbackEvent[0].oldValue, 'foo');
      assert.equal(changeCallbackEvents[0].newValue, 'bar');
      assert.equal(afterChangeCallbackEvent[0].newValue, 'bar');
      // Check order of operations
      assert.equal(orderOfExecutionBuffer.length, 3);
      assert.equal(orderOfExecutionBuffer[0], 'onChangeDetected');
      assert.equal(orderOfExecutionBuffer[1], 'watcher');
      assert.equal(orderOfExecutionBuffer[2], 'afterChangeProcessed');
      // Check change detection on property 2st value change
      e.foo = 'baz';
      assert.equal(changeCallbackEvents.length, 2);
      assert.equal(afterChangeCallbackEvent.length, 2);
      assert.equal(changeCallbackEvents[1].propertyName, 'foo');
      assert.equal(afterChangeCallbackEvent[1].propertyName, 'foo');
      assert.equal(changeCallbackEvents[1].oldValue, 'bar');
      assert.equal(afterChangeCallbackEvent[1].oldValue, 'bar');
      assert.equal(changeCallbackEvents[1].newValue, 'baz');
      assert.equal(afterChangeCallbackEvent[1].newValue, 'baz');
      // Check order of operations
      assert.equal(orderOfExecutionBuffer.length, 6);
      assert.equal(orderOfExecutionBuffer[3], 'onChangeDetected');
      assert.equal(orderOfExecutionBuffer[4], 'watcher');
      assert.equal(orderOfExecutionBuffer[5], 'afterChangeProcessed');

      // Check change detection on update notification
      e.update();
      assert.equal(changeCallbackEvents.length, 3);
      assert.equal(afterChangeCallbackEvent.length, 3);
      assert.ok(!changeCallbackEvents[2].propertyName);
      assert.ok(!afterChangeCallbackEvent[2].propertyName);
      assert.ok(!changeCallbackEvents[2].oldValue);
      assert.ok(!afterChangeCallbackEvent[2].oldValue);
      assert.ok(!changeCallbackEvents[2].newValue);
      assert.ok(!afterChangeCallbackEvent[2].newValue);
      // Check order of operations
      assert.equal(orderOfExecutionBuffer.length, 9);
      assert.equal(orderOfExecutionBuffer[6], 'onChangeDetected');
      assert.equal(orderOfExecutionBuffer[7], 'watcher');
      assert.equal(orderOfExecutionBuffer[8], 'afterChangeProcessed');

      // Check change detection on batched update
      e.update(() => { e.foo = 'qux'; });
      assert.equal(changeCallbackEvents.length, 4);
      assert.equal(afterChangeCallbackEvent.length, 4);
      assert.ok(!changeCallbackEvents[3].propertyName);
      assert.ok(!afterChangeCallbackEvent[3].propertyName);
      assert.ok(!changeCallbackEvents[3].oldValue);
      assert.ok(!afterChangeCallbackEvent[3].oldValue);
      assert.ok(!changeCallbackEvents[3].newValue);
      assert.ok(!afterChangeCallbackEvent[3].newValue);
      // Check order of operations
      assert.equal(orderOfExecutionBuffer.length, 12);
      assert.equal(orderOfExecutionBuffer[9], 'onChangeDetected');
      assert.equal(orderOfExecutionBuffer[10], 'watcher');
      assert.equal(orderOfExecutionBuffer[11], 'afterChangeProcessed');

    });

    // .interceptPropertySet(...)
    it('> Intercept all values being set: .interceptPropertySet(propertyName, propertyConfiguration) => (entity, event) => { ... }', () => {

      // Define custom extensions implementing .interceptPropertySet(...)
      class AuthoredExtension1 extends EnTTExt {
        constructor() {
          // Implements .interceptPropertySet(...)
          super({
            interceptPropertySet: true
          });
        }
        // Implement .onChangeDetected(...) to store argument event for inspection
        interceptPropertySet (propertyName, propertyConfiguration) {
          // If configuration.foo
          if (propertyConfiguration.foo) {
            // ... uppercase set value
            return (entity, properties, event) => {
              event.value = event.value.toUpperCase();
            };
          }
        }
      }
      class AuthoredExtension2 extends EnTTExt {
        constructor() {
          // Implements .interceptPropertySet(...)
          super({
            interceptPropertySet: true
          });
        }
        // Implement .onChangeDetected(...) to store argument event for inspection
        interceptPropertySet (propertyName, propertyConfiguration) {
          // If configuration.foo
          if (propertyConfiguration.foo) {
            // ... preface "foo:" to the value
            return (entity, properties, event) => {
              event.value = `foo:${ event.value }`;
            };
          }
        }
      }

      // Define EnTT extending class using the custom extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ AuthoredExtension1, AuthoredExtension2 ];
        }
        static get props () {
          return {
            foo: { foo: true },
            bar: { foo: false }
          };
        }
      }

      // Instantiate EnTT including the custom extension
      const e = new MyExtendedEntity();

      // Setting value to .foo should trigger both extensions' setter interceptors in the right order
      e.foo = 'bar';
      assert.equal(e.foo, 'foo:BAR');
      // Setting value to .bar should not trigger any setter interceptors
      e.bar = 'bar';
      assert.equal(e.bar, 'bar');

    });

    // .interceptPropertyGet(...)
    it('> Intercept all values being fetched: .interceptPropertyGet(propertyName, propertyConfiguration) => (entity, event) => { ... }', () => {

      // Define custom extensions implementing .interceptPropertyGet(...)
      class AuthoredExtension1 extends EnTTExt {
        constructor() {
          // Implements .interceptPropertyGet(...)
          super({
            interceptPropertyGet: true
          });
        }
        // Implement .onChangeDetected(...) to store argument event for inspection
        interceptPropertyGet (propertyName, propertyConfiguration) {
          // If configuration.foo
          if (propertyConfiguration.foo) {
            // ... uppercase set value
            return (entity, properties, event) => {
              event.value = event.value.toUpperCase();
            };
          }
        }
      }
      class AuthoredExtension2 extends EnTTExt {
        constructor() {
          // Implements .interceptPropertyGet(...)
          super({
            interceptPropertyGet: true
          });
        }
        // Implement .onChangeDetected(...) to store argument event for inspection
        interceptPropertyGet (propertyName, propertyConfiguration) {
          // If configuration.foo
          if (propertyConfiguration.foo) {
            // ... preface "foo:" to the value
            return (entity, properties, event) => {
              event.value = `foo:${ event.value }`;
            };
          }
        }
      }

      // Define EnTT extending class using the custom extension
      class MyExtendedEntity extends EnTT {
        static get includes () {
          return [ AuthoredExtension1, AuthoredExtension2 ];
        }
        static get props () {
          return {
            foo: { value: 'bar', foo: true },
            bar: { value: 'baz', foo: false }
          };
        }
      }

      // Instantiate EnTT including the custom extension
      const e = new MyExtendedEntity();

      // Getting value from .foo should trigger both extensions' getter interceptors in the right order
      assert.equal(e.foo, 'foo:BAR');
      // Getting value from .bar should not trigger any getter interceptors
      assert.equal(e.bar, 'baz');

    });

  });
};
