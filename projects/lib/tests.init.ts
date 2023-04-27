// Configure testing library
// ----------------------------------------------------------------------------

// Import dependencies
import { SpecReporter } from 'jasmine-spec-reporter';

// Override default logging
import { setLogging } from './lib';
setLogging(() => {});

// Configure reporter
jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(
  new SpecReporter({
    spec: {
      displayErrorMessages: true,
      displaySuccessful: true,
      displayFailed: true,
      displayPending: true,
      displayDuration: true,
    },
  }),
);

/**
 * Function allows assertion of:
 *  - A value or expression evaluating as truthy (at runtime)
 *  - Two specified types being equal (at aompile time)
 *  - Value or expression type equals a specified type (at compile time)
 *
 * # Checking truthiness of a value or expression:
 * TODO: ...
 *
 * # Comparison of two types:
 * TODO: ...
 *
 * # Checking that a value matches a type:
 * TODO: ...
 *
 * @template TAssertion The type all the assertions are being made about
 * @template TComparison (Optional) Secondary type, being compared to `TAssertion` type
 *
 * @param expression (Optional) Expression to evaluate (at runtime) and assert evaluated value being truthy
 * @returns Function only accepting a value of provided generic `TAssertion` type. If a different type value or expression
 * is provided there will be a (compile time) error thrown. This allows for (compile time) assertion of types matching expected values.
 */
export function assert<TAssertion, TComparison extends TAssertion = TAssertion>(expression?: boolean): (assertion: TAssertion) => void {
  // If assertion defined, check assertion
  if (expression !== undefined) {
    // If jasmine injected into global scope, use jasmine's expectation to validate truthiness
    if ('jasmine' in globalThis && 'expect' in globalThis) {
      (globalThis as any).expect(expression).toBeTrue();
    }
    // ... else, check assertion and throw error if assertion broken
    else if (expression === true) {
    }
    // ... else, check assertion and throw error if assertion broken
    else if (expression === false) throw new Error('Assertion failed!');
    // ... else, check assertion is evaluated as boolean
    else if (expression !== undefined) throw new Error('Assertion needs to be a evaluated as a boolean value!');
  }

  /**
   * Asserts that the provided value's or expression's type matches the provided `TAssertion` generic parameter type. If a different type value or expression
   * is provided there will be a (compile time) error thrown. This allows for (compile time) assertion of types matching expected values.
   * @param assertion Value or expression to assert the type of (at compile time)
   */
  const valueTypeAssertionFn = function (assertion: TAssertion): void {};
  // Return function for (compile time) type assertion
  return valueTypeAssertionFn;
}

/**
 * Function allows refutation of:
 *  - Value or expression type equals a specified type (at compile time)
 *  - A value or expression evaluating as truthy (at runtime)
 *
 * # Checking truthiness of a value or expression:
 * TODO: ...
 *
 * # Checking that a value mismatches a type:
 * TODO: ...
 *
 * @template TRefutation The type all the refutations are being made about
 *
 * @param expression (Optional) Expression to evaluate (at runtime) and refute evaluated value being truthy (assert being falsy)
 * @returns Function only accepting a value of type different from provided generic `TRefutation` type. If matching type value or expression
 * is provided there will be a (compile time) error thrown. This allows for (compile time) refutation of types matching expected values (assetion of mismatching).
 */
export function refute<TRefutation>(expression?: boolean): <T>(refutation: T extends infer R ? (R extends TRefutation ? never : T) : never) => void {
  // If assertion defined, check assertion
  if (expression !== undefined) {
    // If jasmine injected into global scope, use jasmine's expectation to validate falsiness
    if ('jasmine' in globalThis && 'expect' in globalThis) {
      (globalThis as any).expect(expression).toBeFalse();
    }
    // ... else if refutation passing, continue
    else if (expression === false) {
    }
    // ... else, check refutation and throw error if refutation broken
    else if (expression === true) throw new Error('Refutation failed!');
    // ... else, check assertion is evaluated as boolean
    else if (expression !== undefined) throw new Error('Assertion needs to be a evaluated as a boolean value!');
  }

  /**
   * Refutes that the provided value's or expression's type matches the provided `TAssertion` generic parameter type (asserts a mismatch).
   * If matching type value or expression is provided there will be a (compile time) error thrown. This allows for (compile time) refutation of types matching
   * expected values (assetion of mismatching).
   * @param refutation Value or expression to refute the type of (at compile time)
   */
  const valueTypeRefutationFn = function <T>(refutation: T extends infer R ? (R extends TRefutation ? never : T) : never): void {};
  // Return function for (compile time) type refutation
  return valueTypeRefutationFn;
}
