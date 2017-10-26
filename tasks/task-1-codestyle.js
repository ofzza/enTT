// =====================================================================================================================
// GULP TASK: Code-style checks
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
        configPath: './.jscsrc.json',
        fix: false
      }))
      .pipe(jscs.reporter());
  });

  // ES Lint code-style task
  gulp.task('test@codestyle-eslint', () => {
    return gulp
      .src(['./**/*.js', '!./node_modules/**/*', '!./dist/**/*'])
      .pipe(eslint({
        configFile: './.eslintrc.json'
      }))
      .pipe(eslint.format());
  });

  // Return registered tasks
  return {
    test: ['test@codestyle-jscs', 'test@codestyle-eslint']
  };

};
