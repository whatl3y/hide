const gulp = require('gulp')
const babel = require('gulp-babel')
const plumber = require('gulp-plumber')
const insert = require('gulp-insert')
const uglify = require('gulp-uglify-es').default
const webpack = require('webpack-stream')
const webpack_config = require('./webpack.config.js')

gulp.task('transpile', function() {
  return gulp.src("./src/**/*.js")
    .pipe(plumber())
    .pipe(webpack(webpack_config))
    .pipe(uglify().on('error', console.log))
    .pipe(gulp.dest("./dist"))
})

gulp.task('index', function() {
  return gulp.src("./dist/hide")
    .pipe(insert.prepend("#!/usr/bin/env node\n\n"))
    .pipe(gulp.dest("./dist"))
})

gulp.task('build', gulp.series('transpile', 'index'))
