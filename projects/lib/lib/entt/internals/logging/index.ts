// enTT lib logging functionality
// ----------------------------------------------------------------------------

/**
 * Log info, warning or error message handler function type
 */
export type Logger = (msg: Info | Warning | Error) => void;

/**
 * Error-like class meant for reporting non-error events
 */
class BaseNonError {
  constructor(public message: string) {}
}

/**
 * Error-like class meant for reporting non-error information
 */
export class Info extends BaseNonError {}
/**
 * Error-like class meant for reporting warnings
 */
export class Warning extends BaseNonError {}

/**
 * Logs an info, warning or error message thrown by the EnTT library or it's extensions
 * @param msg Info or warning or error being logged
 */
let _log = (msg: Info | Warning | Error) => {
  if (msg instanceof Error) {
    console.error(msg?.message || msg);
  }
  if (msg instanceof Warning) {
    console.warn(msg?.message || msg);
  } else {
    console.log(msg?.message || msg);
  }
};

/**
 * Sets a logging function to use for all info, warning or error message logging
 * @param loggingFunction Logging function to use for all info, warning or error message logging
 */
export function setLogging(loggingFunction: Logger) {
  _log = loggingFunction;
}

/**
 * Logs an info, warning or error message thrown by the EnTT library or it's extensions
 * @param msg Info or warning or error being logged
 */
export function log(msg: Info | Warning | Error) {
  if (typeof _log === 'function') {
    _log(msg);
  }
}
