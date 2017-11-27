// =====================================================================================================================
// GULP TASK: Code-style Style CSS checks
// =====================================================================================================================

// Require dependencies
const stylelint = require('gulp-stylelint');

// Initialize tasks
module.exports = (gulp) => {

  // CSS code-style task
  gulp.task('test@codestyle-style-css', () => {
    return gulp
      .src(['./**/*.css', '!./node_modules/**/*', '!./dist/**/*'])
      .pipe(stylelint({
        configFile: './.rc-stylelint.json',
        //failAfterError: true
      }));
  });

  // Return registered tasks
  return {
    test: ['test@codestyle-style-css'],
    watch: ['./src/**/*.css']
  };

};
