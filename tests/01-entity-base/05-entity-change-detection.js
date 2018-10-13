// =====================================================================================================================
// Tests Entity properties watchers
// =====================================================================================================================
let _                   = require('lodash'),
    assert              = require('assert'),
    EnTT                = require('../../dist').default;

// Export tests
module.exports = () => {
  describe('> Property Change Detection', () => {

    // Define Entity extending class with some properties
    class MyExtendedEntity extends EnTT {
      static get props () {
        return {
          foo: {},
          bar: {},
          baz: {}
        };
      }
    }

    // Check watcher registration
    it('> Should allow registration of a change watcher', () => {

      // Instantiate extended Entity class and register a watcher
      let e = new MyExtendedEntity(),
          cancelFn = e.watch((e) => { return e; });

      // Check registered cancel function
      assert.ok(cancelFn && _.isFunction(cancelFn));
      assert.doesNotThrow(() => { cancelFn(); });

    });

    // Check change detection
    it('> Should detect changes and trigger watchers', () => {

      // Instantiate extended Entity class and register watchers
      let e = new MyExtendedEntity(),
          callbackEvents1 = [],
          callbackEvents2 = [];
      e.watch((e) => { return callbackEvents1.push(e); });
      e.watch((e) => { return callbackEvents2.push(e); });

      // Update a property and check if watchers triggered with correct arguments
      e.foo = 'foo';
      _.forEach([ callbackEvents1, callbackEvents2 ], (callbackEvents) => {
        assert.equal(callbackEvents.length, 1);
        assert.equal(callbackEvents[0].propertyName, 'foo');
        assert.equal(callbackEvents[0].oldValue, null);
        assert.equal(callbackEvents[0].newValue, 'foo');
      });

      // Re-update a property and check if watchers triggered with correct arguments
      e.foo = 'bar';
      _.forEach([ callbackEvents1, callbackEvents2 ], (callbackEvents) => {
        assert.equal(callbackEvents.length, 2);
        assert.equal(callbackEvents[1].propertyName, 'foo');
        assert.equal(callbackEvents[1].oldValue, 'foo');
        assert.equal(callbackEvents[1].newValue, 'bar');
      });

    });

    // Check watcher cancelation
    it('> Should cancel watchers correctly', () => {

      // Instantiate extended Entity class and register watchers
      let e = new MyExtendedEntity(),
          callbackEvents1 = [],
          callbackEvents2 = [],
          cancelWatcher1 = e.watch((e) => { return callbackEvents1.push(e); });
      e.watch((e) => { return callbackEvents2.push(e); });

      // Update a property and check if watchers triggered with correct arguments
      e.foo = 'foo';
      _.forEach([ callbackEvents1, callbackEvents2 ], (callbackEvents) => {
        assert.equal(callbackEvents.length, 1);
        assert.equal(callbackEvents[0].propertyName, 'foo');
        assert.equal(callbackEvents[0].oldValue, null);
        assert.equal(callbackEvents[0].newValue, 'foo');
      });

      // Cancel one of the watchers
      cancelWatcher1();

      // Re-update a property and check if only non-canceled watchers triggered with correct arguments
      e.foo = 'bar';
      assert.equal(callbackEvents1.length, 1);
      assert.equal(callbackEvents2.length, 2);
      assert.equal(callbackEvents2[1].propertyName, 'foo');
      assert.equal(callbackEvents2[1].oldValue, 'foo');
      assert.equal(callbackEvents2[1].newValue, 'bar');

    });

    // Check child entity change propagation
    it('> Should propagate nested entity changes', () => {

      // Instantiate a new entity and nest entities few lavels deep
      let e = new MyExtendedEntity();
      e.foo = new MyExtendedEntity();
      e.foo.foo = new MyExtendedEntity();

      // Deep nest top level entity, checking for recursive loop breaking when propagating changes
      e.foo.foo.foo = e;

      // Register a watcher
      let callbackEvents = [];
      e.watch((e) => { callbackEvents.push(e); });

      // Update a 1st level property and check if watchers triggered with correct arguments
      e.bar = 'foo';
      assert.equal(callbackEvents.length, 1);
      assert.equal(callbackEvents[0].propertyName, 'bar');
      assert.equal(callbackEvents[0].oldValue, null);
      assert.equal(callbackEvents[0].newValue, 'foo');

      // Update a 2nd level property and check if watchers triggered with correct arguments
      e.foo.bar = 'baz';
      assert.equal(callbackEvents.length, 2);
      assert.equal(callbackEvents[1].propertyName, 'foo');
      assert.equal(callbackEvents[1].innerEvent.propertyName, 'bar');
      assert.equal(callbackEvents[1].innerEvent.oldValue, null);
      assert.equal(callbackEvents[1].innerEvent.newValue, 'baz');

      // Update a 3rd level property and check if watchers triggered with correct arguments
      e.foo.foo.bar = 'qux';
      assert.equal(callbackEvents.length, 3);
      assert.equal(callbackEvents[2].propertyName, 'foo');
      assert.equal(callbackEvents[2].innerEvent.propertyName, 'foo');
      assert.equal(callbackEvents[2].innerEvent.innerEvent.propertyName, 'bar');
      assert.equal(callbackEvents[2].innerEvent.innerEvent.oldValue, null);
      assert.equal(callbackEvents[2].innerEvent.innerEvent.newValue, 'qux');

    });

    // Check custom update works and triggers watchers
    it('> Should allow for custom updates notification and batching', () => {

      // Instantiate extended Entity class and register a watcher
      let e = new MyExtendedEntity(),
          callbackEvents = [];
      e.watch((e) => { return callbackEvents.push(e); });

      // Set an initial value
      e.foo = { foo: 'foo', bar: 'bar', baz: 'baz' };
      assert.equal(callbackEvents.length, 1);
      assert.equal(callbackEvents[0].propertyName, 'foo');

      // Update internal properties and notify watchers by using a .update() call
      e.foo.foo = 'bar';
      e.update();
      assert.equal(callbackEvents.length, 2);
      assert.equal(callbackEvents[1].propertyName, false);

      // Do a series of batched updates using the .update(() => { ... }) call
      e.update(() => {
        e.foo = true;
        e.foo = false;
        e.foo = { foo: 'foo', bar: 'bar', baz: 'baz' };
        e.foo.foo = 'bar';
      });
      assert.equal(callbackEvents.length, 3);
      assert.equal(callbackEvents[2].propertyName, false);


    });

  });
};
