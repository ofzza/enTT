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

    it('> Should not allow Entity base class to be instantiated', () => {
      assert.throws(() => { new EnTT(); });
    });

    it('> Should allow extended EnTT class to be instantiated', () => {
      assert.doesNotThrow(() => { new MyExtendedEntity(); });
    });

  });
};
