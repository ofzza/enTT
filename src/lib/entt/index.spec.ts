// enTT lib base class tests
// ----------------------------------------------------------------------------

// Import dependencies
import { assert } from '../../tests.init'
import { EnTT, _getClassMetadata, _getInstanceMetadata }  from './';

// Test ...
describe('class EnTT', () => {

  it('Initializes enTT metadata namespaces on extending classes and instances', () => {
    class NonEnTT {}
    const nonEnTT = new NonEnTT();
    assert(!(nonEnTT instanceof EnTT));
    assert(_getInstanceMetadata(nonEnTT) !== undefined);
    assert(_getClassMetadata(nonEnTT.constructor) !== undefined);

    class NotInitializedEnTT extends EnTT {}
    const notInitializedEnTT = new NotInitializedEnTT();
    assert(notInitializedEnTT instanceof EnTT);
    assert(_getInstanceMetadata(notInitializedEnTT) !== undefined);
    assert(_getClassMetadata(notInitializedEnTT.constructor) !== undefined);

    class InitializedEnTT extends EnTT { constructor () { super(); super.entt(); } }
    const initializedEnTT = new InitializedEnTT();
    assert(initializedEnTT instanceof EnTT);
    assert(_getInstanceMetadata(initializedEnTT) !== undefined);
    assert(_getClassMetadata(initializedEnTT.constructor) !== undefined);
  });

  it('Allow occlusion of prototype methods', () => {

    // TODO: check occlusion of: serialize
    // TODO: check occlusion of: deserialize
    // TODO: check occlusion of: valid
    // TODO: check occlusion of: errors

  });

});

