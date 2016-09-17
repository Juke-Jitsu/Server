/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var gulp = require('gulp');
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var uglify = require("gulp-uglify");
var streamify = require("gulp-streamify");
var minify = require('gulp-minify');
var concat = require('gulp-concat');
var ngAnnotate = require('browserify-ngannotate');

gulp.task('build-all', ['client-css'], function () {

    return browserify('./public/client/app/main')
            .transform(ngAnnotate)
            .bundle()
            .pipe(source('app.js'))
            .pipe(streamify(uglify()))
            .pipe(gulp.dest('././public/client/dist'));

});

gulp.task('client-css', function () {
    gulp.src([
        'node_modules/angular-material/angular-material.min.css'
    ])
        .pipe(concat('style.css'))
        .pipe(gulp.dest('./public/client/dist'));

});

gulp.task('debug', function () {

    return browserify('./public/client/app/main')
            .transform(ngAnnotate)
            .bundle()
            .pipe(source('app.js'))
            .pipe(gulp.dest('././public/client/dist'));

});


gulp.task('build-client', function () {

    return browserify('./public/client/app/main')
            .transform(ngAnnotate)
            .bundle()
            .pipe(source('app.js'))
            .pipe(streamify(uglify()))
            .pipe(gulp.dest('././public/client/dist'));

});
