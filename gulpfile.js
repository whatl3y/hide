const gulp = require('gulp')
const plumber = require('gulp-plumber')
const insert = require('gulp-insert')
const uglify = require('gulp-uglify-es').default
const webpack = require('webpack-stream')
const webpackConfig = require('./webpack.config.js')

gulp.task('src', function () {
  return gulp
    .src(['src/**/*.ts', '!src/**/*.spec.ts'])
    .pipe(plumber())
    .pipe(webpack(webpackConfig))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'))
})

gulp.task('index', function () {
  return gulp
    .src('./dist/hide')
    .pipe(insert.prepend('#!/usr/bin/env node\n\n'))
    .pipe(gulp.dest('./dist'))
})

gulp.task('build', gulp.series('src', 'index'))
