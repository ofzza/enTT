// =====================================================================================================================
// GULP TASK: Mocha tests
// =====================================================================================================================

// Require dependencies
const mocha = require('gulp-mocha');

// Initialize tasks
module.exports = (gulp) => {

  // JSCS code-style task
  gulp.task('test@mocha', gulp.series((done) => {
    // Queue up test suite
    gulp.src('./tests/*.js', { read: false })
      .pipe(mocha({
        checkLeaks: true,
        reporter: 'spec'
      }));
    // Finish gulp task
    done();
  }));

  // Return registered tasks
  return {
    test: ['test@mocha'],
    watch: ['./src/**/*.js', './tests/**/*.js']
  };

};
