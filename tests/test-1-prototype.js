// =====================================================================================================================
// Tests Entity Prototype
// =====================================================================================================================
let Entity  = require('../dist').default;

// Entity Prototype
describe('Base Class', () => {
  Entity.debug = true;

  it('Entity should not be instantiable', (done) => {
    try {
      new Entity();
      done(new Error('Entity Base Class shouldn\'t itself be instantiable!'));
    } catch (err) {
      done();
    }
  });
  it('EntityPrototype should not be instantiable', (done) => {
    try {
      new (Entity.constructor.prototype)();
      done(new Error('EntityPrototype Class shouldn\'t itself be instantiable!'));
    } catch (err) {
      done();
    }
  });
});
