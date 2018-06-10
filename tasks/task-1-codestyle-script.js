// =====================================================================================================================
// GULP TASK: Code-style JS checks
// =====================================================================================================================

// Require dependencies
const jscs    = require('gulp-jscs'),
      eslint  = require('gulp-eslint');

// Initialize tasks
module.exports = (gulp) => {

  // JSCS code-style task
  gulp.task('test@codestyle-jscs', () => {
    return gulp
      .src(['./**/*.js', '!./node_modules/**/*', '!./dist/**/*'])
      .pipe(jscs({
        configPath: './.jscsrc',
        fix: false
      }))
      .pipe(jscs.reporter());
  });

  // ES Lint code-style task
  gulp.task('test@codestyle-eslint', () => {
    return gulp
      .src(['./**/*.js', '!./node_modules/**/*', '!./dist/**/*'])
      .pipe(eslint({
        configFile: './.eslintrc'
      }))
      .pipe(eslint.format());
    //.pipe(eslint.failOnError());
  });

  // Return registered tasks
  return {
    test: ['test@codestyle-jscs', 'test@codestyle-eslint'],
    watch: ['./src/**/*.js', './tasks/**/*.js', './tests/**/*.js']
  };

};
