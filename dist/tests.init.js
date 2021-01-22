"use strict";
// Configure testing library
// ----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = void 0;
// Import dependencies
const jasmine_spec_reporter_1 = require("jasmine-spec-reporter");
/**
 * ASserts truthfulness of an expression
 * @param expr Expression to assert
 */
function assert(expr) {
    expect(expr).toBeTruthy();
}
exports.assert = assert;
// Configure reporter
jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(new jasmine_spec_reporter_1.SpecReporter({
    spec: {
        displayErrorMessages: true,
        displayStacktrace: true,
        displaySuccessful: true,
        displayFailed: true,
        displayPending: true,
        displayDuration: true,
    },
}));
//# sourceMappingURL=tests.init.js.map