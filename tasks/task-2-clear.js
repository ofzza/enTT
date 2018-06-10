// =====================================================================================================================
// GULP TASK: Clear previous builds
// =====================================================================================================================

// Require dependencies
const del = require('del');

// Initialize tasks
module.exports = (gulp, path = './dist') => {

  // Define a clear task (to be executed before a clean build)
  gulp.task('build@clear', () => {
    return del(`${ path }/*`);
  });

  // Return registered tasks
  return {
    build: 'build@clear'
  };

};
