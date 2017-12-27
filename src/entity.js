// =====================================================================================================================
// ENTITY: Basic class
// =====================================================================================================================

// Import dependencies
import EntityPrototype from './prototype';
import KeyValueEntityModule from './modules/key-value';
import DefaultValueEntityModule from './modules/default-value';
import DynamicValueEntityModule from './modules/dynamic-value';
import CastingValueEntityModule from './modules/casting-value';

// Instantiate modules used in all Entities
const keyValueModule     = new KeyValueEntityModule(),
      defaultValueModule = new DefaultValueEntityModule(),
      dynamicValueModule = new DynamicValueEntityModule(),
      castingValueModule = new CastingValueEntityModule();

/**
 * Entity base class
 * @export
 * @class Entity
 */
export default class Entity extends EntityPrototype {

  /**
   * Debugging status (When debugging, some extra properties are exposed)
   * @static
   * @memberof Entity
   */
  static get debug () { return EntityPrototype.debug; }
  static set debug (value) { EntityPrototype.debug = value; }

  /**
   * Casts value as entity by copying content of all properties found on both
   * @static
   * @param {any} value Value to cast
   * @param {any} EntityClass Target casting Entity class
   * @returns {any} Cast instance of required Entity class
   * @memberof Entity
   */
  static cast (value, EntityClass) { return EntityPrototype.cast.bind(this)(value, EntityClass); }
  /**
   * Casts collection of values as a collection of entities by casting each mamber of the collection
   * @static
   * @param {any} collection Collection to cast
   * @param {any} EntityClass Target casting Entity class
   * @returns {any} Cast collection
   * @memberof Entity
   */
  static castCollection (collection, EntityClass) { return EntityPrototype.castCollection.bind(this)(collection, EntityClass); }

  /**
   * Entity modules included by default
   * @readonly
   * @static
   * @memberof Entity
   */
  static get modules () {
    return [
      keyValueModule,
      defaultValueModule,
      dynamicValueModule,
      castingValueModule
    ];
  }

  /**
   * Creates an instance of Entity.
   * @memberof Entity
   */
  constructor () {
    super();

    // Check if class neing directly instantiated
    if (this.constructor === Entity) {
      throw new Error('Entity class is not meant to be instantiated directly - extend it with your own class!');
    }
  }

}
