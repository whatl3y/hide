const gulp = require('gulp')
const babel = require('gulp-babel')
const plumber = require('gulp-plumber')
const insert = require('gulp-insert')
// const replace = require('gulp-replace')
// const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const webpack = require('webpack-stream')
const webpack_config = require('./webpack.config.js')

gulp.task('transpile', function() {
  return gulp.src("./src/**/*.js")
    // .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(webpack(webpack_config))
    .pipe(uglify().on('error', console.log))
    // .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest("./dist"))
})

gulp.task('index', function() {
  return gulp.src("./dist/index.js")
    .pipe(insert.prepend("#!/usr/bin/env node\n\n"))
    .pipe(gulp.dest("./dist"))
})

gulp.task('build', ['transpile', 'index'])
