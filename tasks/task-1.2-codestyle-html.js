// =====================================================================================================================
// GULP TASK: Code-style checks
// =====================================================================================================================

// Require dependencies
const htmllint = require('gulp-html-lint');

// Initialize tasks
module.exports = (gulp) => {

  // HTML code-style task
  gulp.task('test@codestyle-html', () => {
    return gulp
      .src(['./**/*.html', '!./node_modules/**/*', '!./dist/**/*'])
      .pipe(htmllint({ htmllintrc: './.rc-htmllint.json' }))
      .pipe(htmllint.format());
    // .pipe(htmllint.failOnError());
  });

  // Return registered tasks
  return {
    test: ['test@codestyle-html'],
    watch: ['./src/**/*.html']
  };

};
