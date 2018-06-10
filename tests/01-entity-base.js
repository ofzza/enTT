// =====================================================================================================================
// Tests Entity Inheritence and Initialization
// =====================================================================================================================
describe('> Base Entity Class Functionality', () => {

  // Test entity class instantiation
  require('./01-entity-base/01-entity-init')();

  // Test inheritence and initialization of properties
  require('./01-entity-base/02-entity-properties')();

  // Test property value casting
  require('./01-entity-base/03-entity-value-casting')();

  // Test data management
  require('./01-entity-base/04-entity-data-management')();

  // Test property value change detection
  require('./01-entity-base/05-entity-change-detection')();

  // Test foreign key linking/unlinking
  require('./01-entity-base/06-entity-fk-linking')();

});
