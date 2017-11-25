// =====================================================================================================================
// GULP TASK: Copy LESS files
// =====================================================================================================================

// Require dependencies
const less = require('gulp-less');

// Initialize tasks
module.exports = (gulp) => {

  // Define LESS copy task
  gulp.task('build@style-less', () => {
    return gulp
      .src('./src/**/*.less')
      .pipe(less())
      .pipe(gulp.dest('./dist'));
  });

  // Return registered tasks
  return {
    build: 'build@style-less',
    watch: './src/**/*.less'
  };

};
