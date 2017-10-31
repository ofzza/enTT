// =====================================================================================================================
// Dummy test
// =====================================================================================================================
let assert = require('assert');

describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      assert.equal(-1, [1, 2, 3].indexOf(4));
    });
    it('should return -1 when the value is not present', () => {
      assert.notEqual(-1, [1, 2, 3].indexOf(3));
    });
  });
});
