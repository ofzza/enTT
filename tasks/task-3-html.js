// =====================================================================================================================
// GULP TASK: Copy HTML
// =====================================================================================================================

// Initialize tasks
module.exports = (gulp) => {

  // Define HTML copy task
  gulp.task('build@html', () => {
    return gulp
      .src('./src/**/*.html')
      .pipe(gulp.dest('./dist'));
  });

  // Return registered tasks
  return {
    build: 'build@html',
    watch: './src/**/*.html'
  };

};
