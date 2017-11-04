// =====================================================================================================================
// ENTITY PROTOTYPE Internals: Watchers registry
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';
import EntityPrototype from './';

/**
 * Repository of entity instance's registered watchers
 * @class Watchers
 */
export default class Watchers {

  /**
   * Creates an instance of Watchers.
   * @param {any} entity Reference to the Entity instance being tracked
   * @memberof Watchers
   */
  constructor (entity) {

    // Store reference to parent entity instance
    this.entity = entity;

    // Initialize storage
    this.all = {};
    this.byProperty = {};
    this.childWatchers = {};

    // Initialize internal state
    this.index = 0;
    this.suppressed = false;

  }

  /**
   * Sets a callback that triggers when watched property changes
   * @param {any} callback Callback fruntion triggered on detected changes:
   *              (e = { entity, property }) => { ... code acting on change ...}
   * @param {any} properties Name of the property (or array  of names) that is being watched;
   *              If no property name specified, all changes on the entity instance will trigger callback
   * @returns {function} Function which when called, cancels the set watcher
   * @memberof Watchers
   */
  registerWatcher (callback, properties) {
    let index = this.index++;
    if (properties) {

      // Process all properties
      let watcherCancelFunctions = _.map((_.isArray(properties) ? _.uniq(properties) : [ properties ]), (propertyName) => {
        // Set property watcher
        if (!this.byProperty[propertyName]) { this.byProperty[propertyName] = {}; }
        this.byProperty[propertyName][index] = callback;
        return () => { delete this.byProperty[propertyName][index]; };
      });

      // Return collective watcher cancelation callback function
      return () => { _.forEach(watcherCancelFunctions, (fn) => { fn(); }); };

    } else {

      // Set global watcher
      this.all[index] = callback;

      // Return cancelation callback function
      return () => { delete this.all[index]; };

    }

  }

  /**
   * Executes the provided function (meant to be manually applying changes to the entity instance)
   * and when done triggers watchers.
   * If function returns a property name or an array of property names, watchers will only trigger for those proeprties.
   * @param {any} fn Function meant to be manually applying changes to the entity instance
   * @memberof Watchers
   */
  manualUpdate (fn) {

    // Suppress watchers being triggered by setters
    this.suppressed = true;

    // Execute the updating function
    let properties;
    try { properties = fn(); } catch (err) { err; }

    // Stop suppressing watchers
    this.suppressed = false;

    // Trigger watchers
    if (properties) {
      // Trigger watchers for specified properties
      _.forEach((_.isArray(properties) ? _.uniq(properties) : [ properties ]), (propertyName) => {
        this.triggerChangeEvent(propertyName);
      });
    } else {
      // Trigger all watchers
      this.triggerChangeEvent();
    }

  }

  /**
   * Triggers watchers monitoring a property for changes
   * @param {any} propertyName Name of the changed property; If no property name specified, all changes on the entity instance will trigger
   * @param {any} e Embedded WatcherEvent
   * @memberof Watchers
   */
  triggerChangeEvent (propertyName, e) {
    // Check if suppressed
    if (!this.suppressed) {

      // Trigger property watchers
      if (propertyName) {

        // Trigger requested property's watchers
        if (this.byProperty[propertyName]) {
          _.forEach(this.byProperty[propertyName], (callback) => {
            callback(new WatcherEvent({ entity: this.entity, property: propertyName, innerEvent: e }));
          });
        }

      } else {

        // Trigger all registered properties' watchers
        _.forEach(this.byProperty, (callbacks, propertyName) => {
          _.forEach(callbacks, (callback) => {
            callback(new WatcherEvent({ entity: this.entity, property: propertyName }));
          });
        });

      }

      // Trigger global watchers
      _.forEach(this.all, (callback) => {
        callback(new WatcherEvent({ entity: this.entity, property: propertyName }));
      });

    }
  }

  /**
   * Ataches to a watcher of a child entity value set inside a property
   * @param {any} propertyName Name of the property containing the entity isntance
   * @param {any} entityValue Entity instance being set and watched
   * @memberof Watchers
   */
  watchChildEntity (propertyName, entityValue) {
    // If already watching to property's previous entity, cancel the watcher
    if (this.childWatchers[propertyName]) { this.childWatchers[propertyName](); }
    // Register a watcher for the new entity - when triggered, trigger local change detected event
    if (entityValue instanceof EntityPrototype) {
      this.childWatchers[propertyName] = entityValue.watch((e) => {
        this.triggerChangeEvent(propertyName, e);
      });
    } else if (_.isArray(entityValue)) {
      let entityValues = _.filter(entityValue, (value) => { return (value instanceof EntityPrototype); }),
          cancelFunctions = _.map(entityValues, (value) => {
            return value.watch((e) => { this.triggerChangeEvent(propertyName, e); });
          });
      this.childWatchers[propertyName] =  () => { _.forEach(cancelFunctions, (fn) => { fn(); }); };
    }
  }

}

/**
 * Contains information of a watcher trigger event
 * @class WatcherEvent
 */
class WatcherEvent {

  /**
   * Creates an instance of WatcherEvent.
   * @param {any} entity Reference to the entity that was changed
   * @param {any} property Name of the changed property
   * @param {any} innerEvent Inner event, passed along from child Entity
   * @memberof WatcherEvent
   */
  constructor ({ entity, property, innerEvent } = {}) {
    this.entity = entity;
    this.property = property;
    this.innerEvent = innerEvent;
  }

}
