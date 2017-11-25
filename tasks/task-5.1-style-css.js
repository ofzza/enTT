// =====================================================================================================================
// GULP TASK: Copy CSS files
// =====================================================================================================================

// Initialize tasks
module.exports = (gulp) => {

  // Define CSS copy task
  gulp.task('build@style-css', () => {
    return gulp
      .src('./src/**/*.css')
      .pipe(gulp.dest('./dist'));
  });

  // Return registered tasks
  return {
    build: 'build@style-css',
    watch: './src/**/*.css'
  };

};
