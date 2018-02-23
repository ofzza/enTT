// =====================================================================================================================
// ENTITY: Watching for changes
// =====================================================================================================================

// Import dependencies
import _ from 'lodash';

/**
 * Watching for changes
 * @export
 * @class Watcher
 */
export default class ChangeDetection {

  /**
   * Initializes an entity instance with public watcher methods
   * @static
   * @param {any} entity Entity instance to be initialized
   * @param {any} changeManager Watcher instance created for the entity
   * @memberof Watcher
   */
  static initialize ({ entity, changeManager }) {

    // Expose public .watch() method
    Object.defineProperty(entity, 'watch', {
      configurable: true,
      enumerable: false,
      get: () => {
        return (...args) => {
          return changeManager.watch(...args);
        };
      }
    });

    // Expose public .update() method
    Object.defineProperty(entity, 'update', {
      configurable: true,
      enumerable: false,
      get: () => {
        return (...args) => {
          return changeManager.update(...args);
        };
      }
    });

  }

  /**
   * Creates an instance of Watcher.
   * @param {any} entity Reference to the parent entity instance
   * @param {any} extensionsManager Exensions manager instance
   * @memberof Watcher
   */
  constructor ({ entity, extensionsManager }) {

    // Store local properties
    this.entity = entity;
    this.extensionsManager = extensionsManager;

    // Initialize an internal storage for keeping track of subscribed change watchers
    this.store = {
      // Holds index of next registered "on-change" callback function
      count: 0,
      // Holds references to all active "on-change" callback functions
      callbackFns: {}
    };

    // Initialize a property controlling if property changes trigger callbacks
    this.isTriggerOnPropertyChange = true;

  }

  /**
   * Triggers all watching callback functions after a change has been detected
   * @param {any} event Change detected event instance
   * @memberof Watcher
   */
  trigger (event) {

    // Check if event needs to be spoofed
    if (!event || !(event instanceof EntityChangedEvent)) { event = new EntityChangedEvent(); }

    // EXTENSIONS HOOK: .onChangeDetected(...)
    // Lets extensions know of any detected changes to the entity instance properties
    this.extensionsManager.onChangeDetected(event);

    // Execute all registered callback functions
    _.forEach(this.store.callbackFns, (fn) => { fn(event); });

    // EXTENSIONS HOOK: .afterChangeProcessed(...)
    // Lets extensions know that detected changes to the entity instance properties have been processed by all outside watchers
    this.extensionsManager.afterChangeProcessed(event);

  }
  /**
   * Triggers all watching callback functions after a property change has been detected (unless triggering on property change currently suppressed)
   * @param {any} event Change detected event instance
   * @memberof Watcher
   */
  triggerOnPropertyChange (event) {
    // Check if triggering on property change currently suppressed
    if (this.isTriggerOnPropertyChange) { this.trigger(event); }
  }

  /**
   * Registers a watcher callback which will trigger on every property change
   * @param {any} callbackFn Callback function, will trigger on change:
   *        iface: (event) => { ... }
   *        - event Change detected event instance
   * @returns {function} Watcher cancelation function, when called, watcher will be disabled
   * @memberof EnTT
   */
  watch (callbackFn) {
    // Check if callback function passed
    if (callbackFn && _.isFunction(callbackFn)) {

      // Register callback
      const index = this.store.count++;
      this.store.callbackFns[index] = callbackFn;
      // Return cancelation function
      return () => { delete this.store.callbackFns[index]; };

    }
  }

  /**
   * Executes a custom update function and triggers registered watchers once done
   * @param {any} updateFn Custom update function, allowed to update any of the properties on the instance.
   *              When done all registered watchers will trigger. If function returns a promise, it+ll be considered done when promise resolves.
   * @memberof EnTT
   */
  update (updateFn) {
    // Check if update function passed
    if (updateFn && _.isFunction(updateFn)) {

      // Run updating function (and while running the function, do not trigger by changed properties)
      this.isTriggerOnPropertyChange = false;
      let p = updateFn();
      this.isTriggerOnPropertyChange = true;
      // Trigger changed callbacks
      if (p instanceof Promise) {
        p.then(() => { this.trigger(); });
      } else {
        this.trigger();
      }

    } else {

      // Trigger changed callbacks
      this.trigger();

    }
  }

}

/**
 * Holds entity changed event information
 * @export
 * @class EntityChangedEvent
 */
export class EntityChangedEvent {

  /**
   * Creates an instance of EntityChangedEvent.
   * @param {any} source Reference to the changed entity
   * @param {any} propertyName Name of the property that has changed (if false, any property might have changed)
   * @param {any} oldValue Previous value of the property (only applies when propertyName != false)
   * @param {any} newValue Next value of the property (only applies when propertyName != false)
   * @param {any} innerEvent Original event of the change was to a child entity which was embedded as value of one of the properties
   * @memberof EntityChangedEvent
   */
  constructor ({ source, propertyName = false, oldValue = null, newValue = null, innerEvent = null } = {}) {

    // Expose "source" as a read-only property
    Object.defineProperty(this, 'source', {
      configurable: false,
      enumerable: true,
      get: () => { return source; }
    });

    // Expose "propertyName" as a read-only property
    Object.defineProperty(this, 'propertyName', {
      configurable: false,
      enumerable: true,
      get: () => { return propertyName; }
    });

    // Expose "oldValue" as a read-only property
    Object.defineProperty(this, 'oldValue', {
      configurable: false,
      enumerable: true,
      get: () => { return oldValue; }
    });

    // Expose "newValue" as a read-only property
    Object.defineProperty(this, 'newValue', {
      configurable: false,
      enumerable: true,
      get: () => { return newValue; }
    });

    // Expose "innerEvent" as a read-only property
    Object.defineProperty(this, 'innerEvent', {
      configurable: false,
      enumerable: true,
      get: () => { return innerEvent; }
    });
  }

}
