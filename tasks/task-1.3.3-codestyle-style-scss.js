// =====================================================================================================================
// GULP TASK: Code-style Style SCSS & SASS checks
// =====================================================================================================================

// Require dependencies
const //scsslint = require('gulp-scss-lint'),
      sasslint = require('gulp-sass-lint');

// Initialize tasks
module.exports = (gulp) => {

  // SCSS & SASS code-style task
  gulp.task('test@codestyle-style-sass', () => {
    return gulp
      .src(['./**/*.css', './**/*.scss', './**/*.sass', '!./node_modules/**/*', '!./dist/**/*'])
      .pipe(sasslint({ configFile: './.rc-sasslint.yml' }))
      .pipe(sasslint.format());
    //.pipe(sasslint.failOnError());
  });

  // Return registered tasks
  return {
    test: ['test@codestyle-style-sass'],
    watch: ['./src/**/*.scss', './src/**/*.sass']
  };

};
