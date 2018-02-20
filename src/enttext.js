// =====================================================================================================================
// ENTITY: Extension Class
// =====================================================================================================================

/**
 * Entity Extension class
 * @export
 * @class EnTTExt
 */
export default class EnTTExt {

  /**
   * Creates an instance of EnTTExt.
   * @param {any} processShorthandPropertyConfiguration If true, the extension is expected to implement the .procesShorthandPropertyConfiguration(...) method
   * @param {any} updatePropertyConfiguration If true, the extension is expected to implement the .updatePropertyConfiguration(...) method
   * @param {any} onEntityInstantiate If true, the extension is expected to implement the .onEntityInstantiate(...) method
   * @param {any} onChangeDetected If true, the extension is expected to implement the .onChangeDetected(...) method
   * @param {any} afterChangeProcessed If true, the extension is expected to implement the .afterChangeProcessed(...) method
   * @param {any} interceptPropertySet If true, the extension is expected to implement the .intercaptPropertySet(...) method
   * @param {any} interceptPropertyGet If true, the extension is expected to implement the .intercaptPropertyGet(...) method
   * @memberof EnTTExt
   */
  constructor ({
    processShorthandPropertyConfiguration = false,
    updatePropertyConfiguration = false,
    onEntityInstantiate = false,
    onChangeDetected = false,
    afterChangeProcessed = false,
    interceptPropertySet = false,
    interceptPropertyGet = false
  } = {}) {
    // Store information on which methods the extension implements
    this.implemented = {
      processShorthandPropertyConfiguration,
      updatePropertyConfiguration,
      onEntityInstantiate,
      onChangeDetected,
      afterChangeProcessed,
      interceptPropertySet,
      interceptPropertyGet
    };
  }

  /**
   * Processes property configuration and replaces it if detected as short-hand configuration syntax
   * @param {any} propertyConfiguration Single property configuration to be processed
   * @returns {any} Processed property configuration
   * @memberof EnTTExt
   */
  processShorthandPropertyConfiguration (propertyConfiguration) {
    return (() => {
      throw new Error('Not implemented!', propertyConfiguration);
    })();
  }

  /**
   * Updates property's configuration
   * @param {any} propertyConfiguration Single property configuration to be updated
   * @memberof EnTTExt
   */
  updatePropertyConfiguration (propertyConfiguration) { throw new Error('Not implemented!', propertyConfiguration); }

  /**
   * Modifies the entity instance right after it is constructed
   * @param {any} entity Entity instance
   * @param {any} properties Entity's properties' configuration
   * @memberof EnTTExt
   */
  onEntityInstantiate (entity, properties) { throw new Error('Not implemented!', entity, properties); }

  /**
   * Notifies the extension that the entity instance being extended has had a property change detected
   * @param {any} entity Entity instance
   * @param {any} properties Entity's properties' configuration
   * @param {any} event EntityChangedEvent instance
   * @memberof EnTTExt
   */
  onChangeDetected (entity, properties, event) { throw new Error('Not implemented!', entity, properties, event); }

  /**
   * Notifies the extension that the entity instance being extended has had a property change detected and has had the change processed by all outside watchers
   * @param {any} entity Entity instance
   * @param {any} properties Entity's properties' configuration
   * @param {any} event EntityChangedEvent instance
   * @memberof EnTTExt
   */
  afterChangeProcessed (entity, properties, event) { throw new Error('Not implemented!', entity, properties, event); }

  /**
   * Generates a function to process every value being set for the particular property
   * @param {any} propertyName Name of the property being processed
   * @param {any} propertyConfiguration Property configuration
   * @returns {function} Function processing every value being set for this property (If no function returned, extension won't intercept setter for this property)
   * @memberof EnTTExt
   */
  interceptPropertySet (propertyName, propertyConfiguration) {
    /**
     * Called before committing a new property value, allows the extension to modify the value being set
     * @param {any} entity Entity instance
     * @param {any} properties Entity's properties' configuration
     * @param {any} event EnTTExtValueEvent instance
     * @memberof EnTTExt
     */
    return (entity, properties, event) => { throw new Error('Not implemented!', propertyName, propertyConfiguration, entity, properties, event); };
  }

  /**
   * Generates a function to process every value being fetched from the particular property
   * @param {any} propertyName Name of the property being processed
   * @param {any} propertyConfiguration Property configuration
   * @returns {function} Function processing every value being fetched from this property (If no function returned, extension won't intercept getter for this property)
   * @memberof EnTTExt
   */
  interceptPropertyGet (propertyName, propertyConfiguration) {
    /**
     * Called before returning a fetched property value, allows the extension to modify the value being fetched
     * @param {any} entity Entity instance
     * @param {any} properties Entity's properties' configuration
     * @param {any} event EnTTExtValueEvent instance
     * @memberof EnTTExt
     */
    return (entity, properties, event) => { throw new Error('Not implemented!', propertyName, propertyConfiguration, entity, properties, event); };
  }

}

/**
 * Event class keeping track of value updates made by the extensnios' setter/getter interceptors
 * @export
 * @class EnTTExtValueEvent
 */
export class EnTTExtValueEvent {
  /**
   * Creates an instance of EnTTExtValueEvent.
   * @param {any} changes Array of changes to the value done by each of the interceptors
   * @param {any} currentValue Value currently set for the property
   * @param {any} value Value being updated by the interceptors
   * @memberof EnTTExtValueEvent
   */
  constructor ({ changes, currentValue, value }) {

    // Expose changes as a read-only property
    Object.defineProperty(this, 'changes', {
      configurable: false,
      enumerable: true,
      get: () => { return changes; }
    });

    // Expose currentValue as a read-only property
    Object.defineProperty(this, 'currentValue', {
      configurable: false,
      enumerable: true,
      get: () => { return currentValue; }
    });

    // Expose value as a writable property
    Object.defineProperty(this, 'value', {
      configurable: false,
      enumerable: true,
      set: (val) => { value = val; },
      get: () => { return value; }
    });

  }
}
