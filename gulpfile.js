/**
 * GULP file
 *
 * This Node script is executed when you run `gulp`. It's purpose is
 * to load the Gulp tasks in your project's `tasks` folder, and allow
 * you to add and remove tasks as you see fit.
 *
 * WARNING:
 * Unless you know what you're doing, you shouldn't change this file.
 * Check out the `tasks` directory instead.
 */

// Load dependencies
require('colors');
const pck     = require('./package.json'),
      _       = require('lodash'),
      argv    = require('minimist')(process.argv.slice(2), { boolean: true });

// Prompt
const title = _._.padEnd(` ${ pck.name.toUpperCase() }: ${ pck.description } `, 78, ' ');
console.log('--------------------------------------------------------------------------------'.green);
console.log('#'.green + ' ' + title.bgGreen.gray);
console.log('#'.green + ' > Initializing tasks ...'.yellow);
if (!argv.production) {
  console.log('#'.green + '   (run with `--production` parameter to get production ready build)'.gray);
} else {
  console.log('#'.green + '   (runing PRODUCTION BUILD)'.red);
}
console.log('# ------------------------------------------------------------------------------'.green);
console.log();

// Require all of our gulp task definitions and registrations
require('./tasks')();
