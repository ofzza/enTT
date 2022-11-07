// enTT lib production mode functionality
// ----------------------------------------------------------------------------

/**
 * Holds production status. When in production mode some checks will be omitted for performance reasons and no warnings or info messages will be output
 */
let _isProduction = false;

/**
 * Sets production status. When in production mode some checks will be omitted for performance reasons and no warnings or info messages will be output
 * @param isProduction Production status
 */
export function setProduction(isProduction: boolean = true) {
  _isProduction = isProduction;
}

/**
 * Gets production status. When in production mode some checks will be omitted for performance reasons and no warnings or info messages will be output
 */
export function isProduction() {
  return _isProduction;
}
