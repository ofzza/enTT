// =====================================================================================================================
// Tests Entity prototype fundamentals
// =====================================================================================================================
let assert = require('assert');

describe('Entity Prototype', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', (done) => {
      assert.equal([1, 2, 3].indexOf(4), -1);
      done();
    });
  });
});
