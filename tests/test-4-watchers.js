// =====================================================================================================================
// Tests Entity watching for changes
// =====================================================================================================================
let  _      = require('lodash'),
    assert  = require('assert'),
    Entity  = require('../dist').default;

// Entity Extended Class
describe('Change Detection', () => {
  Entity.debug = true;

  class ExtendedEntity extends Entity { static get schema () { return ['propA', 'propB', 'propC']; } }
  let extended = new ExtendedEntity();
  let propertyChangeEvents = [],
      propertyWatchers = [],
      globalChangeEvents = [],
      globalWatchers = [];

  describe('Get notified of changes on set property values', () => {
    it('Watches for single property and global changes', () => {
      // Start watchers
      globalChangeEvents = [];
      globalWatchers.push(extended.watch((e) => { globalChangeEvents.push(e); }));
      propertyChangeEvents = [];
      propertyWatchers.push(extended.watch((e) => { propertyChangeEvents.push(e); }, 'propA'));
      propertyWatchers.push(extended.watch((e) => { propertyChangeEvents.push(e); }, 'propB'));
      propertyWatchers.push(extended.watch((e) => { propertyChangeEvents.push(e); }, 'propC'));
      // Check changes detection
      assert.equal(globalChangeEvents.length, 0);
      assert.equal(propertyChangeEvents.length, 0);
      extended.propA = 'Aa01';
      assert.equal(globalChangeEvents.length, 1);
      assert.ok((_.last(globalChangeEvents).entity === extended) && (_.last(globalChangeEvents).property === 'propA'));
      assert.equal(propertyChangeEvents.length, 1);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propA'));
      extended.propA = 'Aa02';
      assert.equal(globalChangeEvents.length, 2);
      assert.ok((_.last(globalChangeEvents).entity === extended) && (_.last(globalChangeEvents).property === 'propA'));
      assert.equal(propertyChangeEvents.length, 2);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propA'));
      extended.propB = 'Bb03';
      assert.equal(globalChangeEvents.length, 3);
      assert.ok((_.last(globalChangeEvents).entity === extended) && (_.last(globalChangeEvents).property === 'propB'));
      assert.equal(propertyChangeEvents.length, 3);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propB'));
      extended.propC = 'Cc04';
      assert.equal(globalChangeEvents.length, 4);
      assert.ok((_.last(globalChangeEvents).entity === extended) && (_.last(globalChangeEvents).property === 'propC'));
      assert.equal(propertyChangeEvents.length, 4);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propC'));
    });
    it('Doesn\'t detect changes when setting same value', () => {
      // Check changes detection
      assert.equal(globalChangeEvents.length, 4);
      assert.equal(propertyChangeEvents.length, 4);
      extended.propA = 'Aa02';
      assert.equal(globalChangeEvents.length, 4);
      assert.ok((_.last(globalChangeEvents).entity === extended) && (_.last(globalChangeEvents).property === 'propC'));
      assert.equal(propertyChangeEvents.length, 4);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propC'));
      extended.propB = 'Bb03';
      assert.equal(globalChangeEvents.length, 4);
      assert.ok((_.last(globalChangeEvents).entity === extended) && (_.last(globalChangeEvents).property === 'propC'));
      assert.equal(propertyChangeEvents.length, 4);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propC'));
      extended.propC = 'Cc04';
      assert.equal(globalChangeEvents.length, 4);
      assert.ok((_.last(globalChangeEvents).entity === extended) && (_.last(globalChangeEvents).property === 'propC'));
      assert.equal(propertyChangeEvents.length, 4);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propC'));
    });
    it('Stops watching for single property and global changes', () => {
      // Stop watchers
      _.forEach(globalWatchers, (watcher) => { watcher(); });
      _.forEach(propertyWatchers, (watcher) => { watcher(); });
      // Check changes detection
      assert.equal(globalChangeEvents.length, 4);
      assert.equal(propertyChangeEvents.length, 4);
      extended.propA = 'Dd4';
      assert.equal(globalChangeEvents.length, 4);
      assert.equal(propertyChangeEvents.length, 4);
    });
    it('Watches for multiple property and global changes', () => {
      // Start watchers
      globalChangeEvents = [];
      globalWatchers.push(extended.watch((e) => { globalChangeEvents.push(e); }));
      propertyChangeEvents = [];
      propertyWatchers.push(extended.watch((e) => { propertyChangeEvents.push(e); }, ['propA', 'propB', 'propC']));
      // Check changes detection
      assert.equal(globalChangeEvents.length, 0);
      assert.equal(propertyChangeEvents.length, 0);
      extended.propA = 'Aa05';
      assert.equal(globalChangeEvents.length, 1);
      assert.ok((_.last(globalChangeEvents).entity === extended) && (_.last(globalChangeEvents).property === 'propA'));
      assert.equal(propertyChangeEvents.length, 1);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propA'));
      extended.propA = 'Aa06';
      assert.equal(globalChangeEvents.length, 2);
      assert.ok((_.last(globalChangeEvents).entity === extended) && (_.last(globalChangeEvents).property === 'propA'));
      assert.equal(propertyChangeEvents.length, 2);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propA'));
      extended.propB = 'Bb07';
      assert.equal(globalChangeEvents.length, 3);
      assert.ok((_.last(globalChangeEvents).entity === extended) && (_.last(globalChangeEvents).property === 'propB'));
      assert.equal(propertyChangeEvents.length, 3);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propB'));
      extended.propC = 'Cc08';
      assert.equal(globalChangeEvents.length, 4);
      assert.ok((_.last(globalChangeEvents).entity === extended) && (_.last(globalChangeEvents).property === 'propC'));
      assert.equal(propertyChangeEvents.length, 4);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propC'));
    });
    it('Stops watching for multiple property and global changes', () => {
      // Stop watchers
      _.forEach(globalWatchers, (watcher) => { watcher(); });
      _.forEach(propertyWatchers, (watcher) => { watcher(); });
      // Check changes detection
      assert.equal(globalChangeEvents.length, 4);
      assert.equal(propertyChangeEvents.length, 4);
      extended.propA = 'Dd4';
      assert.equal(globalChangeEvents.length, 4);
      assert.equal(propertyChangeEvents.length, 4);
    });
  });

  describe('Watches for manually triggered changes', () => {
    it('When single property reported changed trigger: global watcher once + changed property watcher once', () => {
      // Start watchers
      globalChangeEvents = [];
      globalWatchers.push(extended.watch((e) => { globalChangeEvents.push(e); }));
      propertyChangeEvents = [];
      propertyWatchers.push(extended.watch((e) => { propertyChangeEvents.push(e); }, ['propA', 'propB', 'propC']));
      // Check changes detection
      extended.update(() => {
        extended.propA = 'Aa09';
        extended.propB = 'Bb10';
        extended.propC = 'Cc11';
        return 'propA';
      });
      assert.equal(globalChangeEvents.length, 1);
      assert.ok((_.last(globalChangeEvents).entity === extended) && (_.last(globalChangeEvents).property === 'propA'));
      assert.equal(propertyChangeEvents.length, 1);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propA'));
      // Stop watchers
      _.forEach(globalWatchers, (watcher) => { watcher(); });
      _.forEach(propertyWatchers, (watcher) => { watcher(); });
    });
    it('When multiple properties reported changed trigger: global watcher once per changed property + each changed property watcher once', () => {
      // Start watchers
      globalChangeEvents = [];
      globalWatchers.push(extended.watch((e) => { globalChangeEvents.push(e); }));
      propertyChangeEvents = [];
      propertyWatchers.push(extended.watch((e) => { propertyChangeEvents.push(e); }, ['propA', 'propB', 'propC']));
      // Check changes detection
      extended.update(() => {
        extended.propA = 'Aa09';
        extended.propB = 'Bb10';
        extended.propC = 'Cc11';
        return ['propA', 'propB', 'propC'];
      });
      assert.equal(globalChangeEvents.length, 3);
      assert.ok((_.last(globalChangeEvents).entity === extended) && (_.last(globalChangeEvents).property === 'propC'));
      assert.equal(propertyChangeEvents.length, 3);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propC'));
      // Stop watchers
      _.forEach(globalWatchers, (watcher) => { watcher(); });
      _.forEach(propertyWatchers, (watcher) => { watcher(); });
    });
    it('When no properties reported changed trigger: global watcher once + every registered property watcher once', () => {
      // Start watchers
      globalChangeEvents = [];
      globalWatchers.push(extended.watch((e) => { globalChangeEvents.push(e); }));
      propertyChangeEvents = [];
      propertyWatchers.push(extended.watch((e) => { propertyChangeEvents.push(e); }, ['propA', 'propB', 'propC']));
      // Check changes detection
      extended.update(() => {
        extended.propA = 'Aa12';
        extended.propB = 'Bb13';
        extended.propC = 'Cc14';
      });
      assert.equal(globalChangeEvents.length, 1);
      assert.ok((_.last(globalChangeEvents).entity === extended));
      assert.equal(propertyChangeEvents.length, 3);
      assert.ok((_.last(propertyChangeEvents).entity === extended) && (_.last(propertyChangeEvents).property === 'propC'));
      // Stop watchers
      _.forEach(globalWatchers, (watcher) => { watcher(); });
      _.forEach(propertyWatchers, (watcher) => { watcher(); });
    });
  });

  describe('Gets notified of changes to child Entities stored in casting properties', () => {

    class CastingEntity extends Entity {
      static get schema () {
        return {
          child: ExtendedEntity,
          children: [ ExtendedEntity ]
        };
      }
    }
    let casting = new CastingEntity();

    it('Should watch for changes in child Entities', () => {
      // Start watchers
      propertyChangeEvents = [];
      propertyWatchers.push(casting.watch((e) => { propertyChangeEvents.push(e); }, 'child'));
      // Check changes detection
      casting.child = new ExtendedEntity();
      assert.equal(propertyChangeEvents.length, 1);
      assert.ok((_.last(propertyChangeEvents).entity === casting) && (_.last(propertyChangeEvents).property === 'child'));
      casting.child.propA = 'Aa01';
      assert.equal(propertyChangeEvents.length, 2);
      assert.ok((_.last(propertyChangeEvents).entity === casting) && (_.last(propertyChangeEvents).property === 'child') && (_.last(propertyChangeEvents).innerEvent.property === 'propA'));
      casting.child.propB = 'Bb02';
      assert.equal(propertyChangeEvents.length, 3);
      assert.ok((_.last(propertyChangeEvents).entity === casting) && (_.last(propertyChangeEvents).property === 'child') && (_.last(propertyChangeEvents).innerEvent.property === 'propB'));
      casting.child.propC = 'Cc03';
      assert.equal(propertyChangeEvents.length, 4);
      assert.ok((_.last(propertyChangeEvents).entity === casting) && (_.last(propertyChangeEvents).property === 'child') && (_.last(propertyChangeEvents).innerEvent.property === 'propC'));
      // Stop watchers
      _.forEach(propertyWatchers, (watcher) => { watcher(); });
    });
    it('Should watch for changes in child Entitiy collections', () => {
      // Start watchers
      propertyChangeEvents = [];
      propertyWatchers.push(casting.watch((e) => { propertyChangeEvents.push(e); }, 'children'));
      // Check changes detection
      casting.children = [ new ExtendedEntity(), new ExtendedEntity(), new ExtendedEntity() ];
      assert.equal(propertyChangeEvents.length, 1);
      assert.ok((_.last(propertyChangeEvents).entity === casting) && (_.last(propertyChangeEvents).property === 'children'));
      casting.children[0].propA = 'Aa01';
      assert.equal(propertyChangeEvents.length, 2);
      assert.ok((_.last(propertyChangeEvents).entity === casting) && (_.last(propertyChangeEvents).property === 'children') && (_.last(propertyChangeEvents).innerEvent.property === 'propA'));
      casting.children[1].propB = 'Bb02';
      assert.equal(propertyChangeEvents.length, 3);
      assert.ok((_.last(propertyChangeEvents).entity === casting) && (_.last(propertyChangeEvents).property === 'children') && (_.last(propertyChangeEvents).innerEvent.property === 'propB'));
      casting.children[2].propC = 'Cc03';
      assert.equal(propertyChangeEvents.length, 4);
      assert.ok((_.last(propertyChangeEvents).entity === casting) && (_.last(propertyChangeEvents).property === 'children') && (_.last(propertyChangeEvents).innerEvent.property === 'propC'));
      // Stop watchers
      _.forEach(propertyWatchers, (watcher) => { watcher(); });
    });
    it('Should keep watching when replacing a child entity', () => {
      // Start watchers
      propertyChangeEvents = [];
      propertyWatchers.push(casting.watch((e) => { propertyChangeEvents.push(e); }, 'child'));
      // Check changes detection for first entity
      casting.child = new ExtendedEntity();
      assert.equal(propertyChangeEvents.length, 1);
      assert.ok((_.last(propertyChangeEvents).entity === casting) && (_.last(propertyChangeEvents).property === 'child'));
      casting.child.propA = 'Aa01';
      assert.equal(propertyChangeEvents.length, 2);
      assert.ok((_.last(propertyChangeEvents).entity === casting) && (_.last(propertyChangeEvents).property === 'child') && (_.last(propertyChangeEvents).innerEvent.property === 'propA'));
      // Check changes detection for second entity
      casting.child = new ExtendedEntity();
      assert.equal(propertyChangeEvents.length, 3);
      casting.child.propB = 'Bb02';
      assert.equal(propertyChangeEvents.length, 4);
      assert.ok((_.last(propertyChangeEvents).entity === casting) && (_.last(propertyChangeEvents).property === 'child') && (_.last(propertyChangeEvents).innerEvent.property === 'propB'));
      casting.child.propC = 'Cc03';
      assert.equal(propertyChangeEvents.length, 5);
      assert.ok((_.last(propertyChangeEvents).entity === casting) && (_.last(propertyChangeEvents).property === 'child') && (_.last(propertyChangeEvents).innerEvent.property === 'propC'));
      // Stop watchers
      _.forEach(propertyWatchers, (watcher) => { watcher(); });
    });
  });

});
