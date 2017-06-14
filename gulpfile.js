const gulp = require('./gulp')([
  // 'assets',
  // 'aws',
  // 'aws-test',
  'browserify',
  // 'clear-test',
  // 'plain-images',
  // 'optimize-images',
  // 'resize-images',
  // 'scss',
  // 'templates',
  // 'server',
  'watchify',
]);


gulp.task('default', [
  // 'assets',
  // 'img',
  // 'scss',
  // 'templates',
  // 'server',
  'watchify'
], () => {});


gulp.task('build', [
  // 'assets',
  // 'img',
  // 'scss',
  // 'templates',
  'browserify'
]);


gulp.task('publish', (cb) => { runSequence('build', 'aws', 'clear-test', cb); });


gulp.task('publish-test', (cb) => { runSequence('build', 'aws-test', cb); });
