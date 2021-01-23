// Configure testing library
// ----------------------------------------------------------------------------

// Import dependencies
import { SpecReporter } from 'jasmine-spec-reporter';

/**
 * ASserts truthfulness of an expression
 * @param expr Expression to assert
 */
export function assert(expr) {
  expect(expr).toBeTruthy();
}

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
