// =====================================================================================================================
// GULP TASK: Transpile ES6 code
// =====================================================================================================================

// Require dependencies
const util        = require('gulp-util'),
      babel       = require('gulp-babel'),
      sourcemaps  = require('gulp-sourcemaps');

// Initialize tasks
module.exports = (gulp) => {

  // Define ES6 transcompilation task
  gulp.task('build@babel', () => {
    return gulp
      .src('./src/**/*.js')
      .pipe(!util.env.production ? sourcemaps.init({ loadMaps: true }) : util.noop())
      .pipe(babel({
        presets: [
          require('babel-preset-esnext')
        ],
        filenameRelative: true
      }))
      .pipe(!util.env.production ? sourcemaps.write('.', { includeContent: true }) : util.noop())
      .pipe(gulp.dest('./dist'));
  });

  // Return registered tasks
  return {
    build: 'build@babel',
    watch: './src/**/*.js'
  };

};
