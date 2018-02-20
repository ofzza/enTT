// =====================================================================================================================
// Tests Entity properties definition and initialization
// =====================================================================================================================
let assert  = require('assert'),
    EnTT    = require('../../dist').default;

// Entity extending and instantiation
module.exports = () => {
  describe('> Extending Entity Base Class and Instantiation', () => {

    // Define Entity extending class
    class MyExtendedEntity extends EnTT { }

    // Entity extending and instantiation
    it('> Should not allow for Entity base class to be instantiated', () => {
      assert.throws(() => { new EnTT(); });
    });
    // Entity extending and instantiation
    it('> Should allow for extended class to instantiate', () => {
      assert.doesNotThrow(() => { new MyExtendedEntity(); });
    });

  });
};
