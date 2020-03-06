// enTT lib main, extensible class
// ----------------------------------------------------------------------------

// Import dependencies
import { readPropertyDescriptor } from '../decorators/property';

/**
 * Main, extensible EnTT class definition
 */
export class EnTT {

  /**
   * Initializes EnTT features for the extending class - should be called in extending class' constructor, right after "super()".
   * Example:
   *   constructor () { super(); super.entt(); }
   */
  protected entt () {

    // Initialize metadata on the derived class
    const Class = (this.constructor as any).__enTT__ || ((this.constructor as any).__enTT__ = {
    });

    // Initialize instance metadata
    const instance = {
      // Initialize a private property values' store
      store: {}
    };

    // Replace properties with dynamic counterparts
    replacePropertiesWithGetterSetters.bind(this)({ store: instance.store });

  }

}

/**
 * Replaces properties with dynamic counterparts
 * @param store Private store for all property values
 */
function replacePropertiesWithGetterSetters ({
  store = undefined as object
} = {}) {
  // Iterate over properties
  for (const key in this) {
    // Check if own property
    if (this.hasOwnProperty(key)) {
      if (typeof this[key] !== 'function') {

        // Store initial value
        store[key] = this[key];

        // Delete property
        delete this[key]

        // Replace property with a custom property
        Object.defineProperty(this, key, {
          // Default property configuration
          ...{ configurable: false },
          // @Property property overrides
          ...readPropertyDescriptor({ target: this, key, store })
        });

      }
    }
  }
}
