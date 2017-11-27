// =====================================================================================================================
// GULP TASK: Code-style Style LESS checks
// =====================================================================================================================

// Require dependencies
const lesshint = require('gulp-lesshint');

// Initialize tasks
module.exports = (gulp) => {

  // LESS code-style task
  gulp.task('test@codestyle-style-less', () => {
    return gulp
      .src(['./**/*.css', './**/*.less', '!./node_modules/**/*', '!./dist/**/*'])
      .pipe(lesshint({ configPath: './.rc-lesshint.json' }))
      .pipe(lesshint.reporter());
    //.pipe(lesshint.failOnError());
  });

  // Return registered tasks
  return {
    test: ['test@codestyle-style-less'],
    watch: ['./src/**/*.less']
  };

};
