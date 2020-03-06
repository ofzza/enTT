// enTT lib base class tests
// ----------------------------------------------------------------------------

// Import dependencies
import { EnTT }  from '../../';

// Test ...
describe("class EnTT", () => {

  it('Initializes enTT metadata namespace on extending classes', () => {
    class NonEnTT {}
    const nonEnTT = new NonEnTT();
    expect(nonEnTT instanceof EnTT).toBeFalse();
    expect((nonEnTT.constructor as any).__enTT__).toBeUndefined();

    class NotInitializedEnTT extends EnTT {}
    const notInitializedEnTT = new NotInitializedEnTT();
    expect(notInitializedEnTT instanceof EnTT).toBeTrue();
    expect((notInitializedEnTT.constructor as any).__enTT__).toBeUndefined();

    class InitializedEnTT extends EnTT { constructor () { super(); super.entt(); } }
    const initializedEnTT = new InitializedEnTT();
    expect(initializedEnTT instanceof EnTT).toBeTrue();
    expect((initializedEnTT.constructor as any).__enTT__).not.toBeUndefined();
  });

});

