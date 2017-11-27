// =====================================================================================================================
// GULP TASK: Transpile ES6 code
// =====================================================================================================================

// Require dependencies
const path        = require('path'),
      util        = require('gulp-util'),
      babel       = require('gulp-babel'),
      sourcemaps  = require('gulp-sourcemaps');

// Initialize tasks
module.exports = (gulp) => {

  // Define ES6 transcompilation task
  gulp.task('build@script-babel', () => {
    return gulp
      .src('./src/**/*.js')
      .pipe(!util.env.production ? sourcemaps.init({ loadMaps: true }) : util.noop())
      .pipe(babel({
        presets: [
          require('babel-preset-esnext')
        ],
        filenameRelative: true
      }))
      .pipe(!util.env.production ? sourcemaps.write('.', { includeContent: false, sourceRoot: sourceRootFn }) : util.noop())
      .pipe(gulp.dest('./dist'));
  });

  // Return registered tasks
  return {
    build: 'build@script-babel',
    watch: './src/**/*.js'
  };

};

/**
 * Composes source-maps' sourceRoot property for a file
 * @param {any} file File being processed
 * @returns {any} sourceRoot value
 */
function sourceRootFn (file) {
  let sourcePath    = file.history[0],
      targetPath    = path.join(__dirname, '../src/'),
      relativePath  = path.join(path.relative(sourcePath, targetPath), './src');
  return relativePath;
}
