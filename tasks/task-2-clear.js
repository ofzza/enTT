// =====================================================================================================================
// GULP TASK: Clear previous builds
// =====================================================================================================================

// Require dependencies
const clean = require('gulp-clean');

// Initialize tasks
module.exports = (gulp, path = './dist') => {

  // Define a clear task (to be executed before a clean build)
  gulp.task('build@clear', () => {
    return gulp
      .src(`${ path }/*`)
      .pipe(clean());
  });

  // Return registered tasks
  return {
    build: 'build@clear'
  };

};
