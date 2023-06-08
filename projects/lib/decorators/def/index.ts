// enTT property registration decorator
// ----------------------------------------------------------------------------

// Import dependencies
import { createPropertyCustomDecorator } from '../../lib';

/**
 * Property definition decorator symbol
 */
const defSymbol = Symbol('@def symbol');

/**
 * Property definition decorator. Has no functionality apart from making sure the decorated property is registered to the parent class
 */
export const def = createPropertyCustomDecorator({}, defSymbol);
