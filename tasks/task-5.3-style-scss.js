// =====================================================================================================================
// GULP TASK: Copy SCSS files
// =====================================================================================================================

// Require dependencies
const sass = require('gulp-sass');

// Initialize tasks
module.exports = (gulp) => {

  // Define SCSS copy task
  gulp.task('build@style-scss', () => {
    return gulp
      .src('./src/**/*.scss')
      .pipe(sass())
      .pipe(gulp.dest('./dist'));
  });

  // Return registered tasks
  return {
    build: 'build@style-scss',
    watch: './src/**/*.scss'
  };

};
