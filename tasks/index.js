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
    let taskNames = require(path)(gulp);
    // Loop through defined tasks
    _.forEach((_.isArray(taskNames) ? taskNames : [ taskNames ]), (taskNames) => {
      // Initialize storage of local tasks
      let localTasks = {
        test: [],
        build: []
      };
      // Collect test tasks
      if (taskNames && taskNames.test)  {
        _.forEach((_.isArray(taskNames.test) ? taskNames.test : [ taskNames.test ]), (task) => {
          tasks.test.push(task);
          localTasks.test.push(task);
        });
      }
      // Collect build tasks
      if (taskNames && taskNames.build) {
        _.forEach((_.isArray(taskNames.build) ? taskNames.build : [ taskNames.build ]), (task) => {
          tasks.build.push(task);
          localTasks.build.push(task);
        });
      }
      // Collect publish tasks
      if (taskNames && taskNames.publish) {
        _.forEach((_.isArray(taskNames.publish) ? taskNames.publish : [ taskNames.publish ]), (task) => {
          tasks.publish.push(task);
        });
      }
      // Collect watch patterns and associate with tasks
      if (taskNames && taskNames.watch) {
        tasks.watch.push({
          src: taskNames.watch,
          tasks: localTasks
        });
      }
    });
    // Return collected tasks
    return tasks;
  },
  { test: [], build: [], publish: [], watch: [] });

  // Define watch tasks
  gulp.task('watch', () => {

    // Initialize task execution queue
    let executing = false;
    const queue = { test: [], build: [] },
          orderedTasks = _.flatten(
            _.map(tasks.watch, (watch) => { return [...watch.tasks.test, ...watch.tasks.build]; })
          );

    /**
     * Queues up tasks for execution
     * @param {any} testTasks Array of test tasks names
     * @param {any} buildTasks Array of build task names
     */
    function queueTasks (testTasks, buildTasks) {
      // Queue up test tasks, removing them if already queued up
      _.forEach({ test: testTasks, build: buildTasks }, (queuingTasks, type) => {
        _.forEach(queuingTasks, (task) => {
          // Remove if already queued
          const removed = _.remove(queue[type], (queuedTask) => { return (queuedTask === task); });
          // Queue task ...
          queue[type].push(task);
          // Reorder tasks by original configuration ordering
          queue[type] = _.sortBy(queue[type], (queuedTask) => {
            return _.findIndex(orderedTasks, (originalTask) => {
              return (originalTask === queuedTask);
            });
          });
          // Prompt queued task
          console.log(`> ${removed.length ? 'Requeued' : 'Queued'} ${ type } task for execution: "${ task.blue }"`);
          console.log(`  Queue: ${ [...queue.test, ...queue.build].join(', ').gray }`);
        });
      });
      // Execute tasks from the queue
      executeQueuedTasks();
    }

    /**
     * Executes previously queued up tasks, one-by-one
     */
    function executeQueuedTasks () {
      // Delay execution to allow for more tasks to queue up
      setTimeout(() => {
        // Check if already executing and if any tasks ready for execution
        if (!executing && (queue.test.length || queue.build.length)) {
          // Flag executing status
          executing = true;
          // Pop a task from the execution queue
          const task = (queue.test.length ? queue.test.splice(0, 1)[0] : queue.build.splice(0, 1)[0]);
          // Execute task
          gulp.series([task])(() => {
            // Flag executing status
            executing = false;
            // Execute next task from the queue
            executeQueuedTasks();
          });
        }
      }, 250);
      // If no tasks queued up, prompt watcher done
      if (!executing && !(queue.test.length || queue.build.length)) {
        console.log();
        console.log(`> WATCHER(S) DONE PROCESSING - WAITING FOR CHANGES ...`.green);
        console.log();
      }
    }

    // Configure and start watchers
    _.forEach(tasks.watch, (watch) => {

      // Process task
      const sources = watch.src,
            tasks = [...watch.tasks.test, ...watch.tasks.build],
            taskId = `\n                     ${ '> tasks'.green }: [${ tasks.join(', ').blue }]`,
            sourcesName =  _.map((_.isArray(sources) ? sources : [ sources ]), (src) => {
              return `\n                     ${ '> source'.green }: ${ src.gray }`;
            });

      // Prompt watcher
      console.log(`> Watching: ${ sourcesName }${ taskId } `);

      // Run watcher
      gulp.watch(sources, (done) => {
        // Queue up tasks for execution
        queueTasks(watch.tasks.test, watch.tasks.build);
        done();
      })
        .on('change', (path) => {
          console.log(`> Watcher detected change: ${ path.yellow }${ sourcesName }${ taskId } `);
        })
        .on('add',    (path) => {
          console.log(`> Watcher detected addition: ${ path.yellow }${ sourcesName }${ taskId } `);
        })
        .on('unlink', (path) => {
          console.log(`> Watcher detected deletion: ${ path.yellow }${ sourcesName }${ taskId } `);
        });

    });

  });

  // Define default tasks
  if (tasks.test.length) {
    gulp.task('test', gulp.series(tasks.test));
  }
  if (tasks.build.length) {
    gulp.task('build', gulp.series(tasks.build));
  }
  if (tasks.publish.length) {
    gulp.task('publish', gulp.series(tasks.publish));
  }
  if (tasks.test.length || tasks.build.length) {
    gulp.task('default', gulp.series([...tasks.test, ...tasks.build]));
  }

};
