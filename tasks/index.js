// =====================================================================================================================
// GULP TASKS Definitions
// =====================================================================================================================

// Require dependencies
const fs    = require('fs'),
      path  = require('path'),
      _     = require('lodash'),
      gulp  = require('gulp');

/**
 * Defines available Gulp tasks
 */
module.exports = () => {

  // Scan for task files in ./tasks
  const paths = _.reduce(fs.readdirSync(path.join(__dirname)), (paths, filename) => {
    if (filename !== 'index.js') { paths.push(path.join(__dirname, filename)); }
    return paths;
  }, []);

  // Define tasks
  const tasks = _.reduce(paths, (tasks, path) => {
    // Initialize tasks' definitions
    let taskNames = require(path)(gulp),
        localTasks = [];
    // Collect test tasks
    if (taskNames && taskNames.test)  {
      _.forEach((_.isArray(taskNames.test) ? taskNames.test : [ taskNames.test ]), (task) => {
        tasks.test.push(task);
        localTasks.push(task);
      });
    }
    // Collect build tasks
    if (taskNames && taskNames.build) {
      _.forEach((_.isArray(taskNames.build) ? taskNames.build : [ taskNames.build ]), (task) => {
        tasks.build.push(task);
        localTasks.push(task);
      });
    }
    // Collect wach patterns and associate with tasks
    if (taskNames && taskNames.watch) {
      _.forEach((_.isArray(taskNames.watch) ? taskNames.watch : [ taskNames.watch ]), (pattern) => {
        if (!tasks.watch[pattern]) { tasks.watch[pattern] = []; }
        _.forEach(localTasks, (task) => { tasks.watch[pattern].push(task); });
      });
    }
    return tasks;
  },
  { test: [], build: [], watch: {} });

  // Define watch tasks
  gulp.task('watch', gulp.parallel(_.map(tasks.watch, (tasks, pattern) => {
    const watchName = `watch: ${ pattern } -> [${ tasks.join(', ') }]`;
    gulp.task(watchName, () => { gulp.watch(pattern, gulp.series(tasks)); });
    return watchName;
  })));

  // Define default tasks
  gulp.task('test',     gulp.series(tasks.test));
  gulp.task('build',    gulp.series(tasks.build));
  gulp.task('default',  gulp.series(['test', 'build']));

};
