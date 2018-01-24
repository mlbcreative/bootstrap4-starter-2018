var path = './';
var gulp = require('gulp'),
browserSync = require('browser-sync').create(),
sass = require('gulp-sass'),
concat = require('gulp-concat'),
uglify = require('gulp-uglify'),
imagemin = require('gulp-imagemin'),
sourcemaps = require('gulp-sourcemaps'),
postcss = require('gulp-postcss'),
autoprefixer = require('autoprefixer'),
gulpif = require('gulp-if'),
htmlPartial = require('gulp-html-partial'),
del = require('del'),
reload = browserSync.reload;

var paths = {
    
    scripts : [
        path + "node_modules/jquery/dist/jquery.js",
        path + "node_modules/popper.js/dist/umd/popper.js",
        path + "node_modules/bootstrap/dist/js/bootstrap.js"
    ],
    styles : [
        path + "src/scss/*.scss"
    ]
};

function scripts() {
    return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path + 'src/js/vendors'));
};

function styles() {
    var config = {
        sass: {
            outputStyle: 'compressed',
            includePaths : ['./node_modules/bootstrap/scss/']
        },
        autoprefixer: {
            browsers: ['last 5 versions']
        }
    };
    
	return gulp.src(paths.styles)
	.pipe(sass(config.sass))
	.pipe(sourcemaps.init())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(sourcemaps.write('.'))
	.pipe(gulp.dest(path + 'src/css'))
	.pipe(browserSync.stream());
};

function html() {
	return gulp.src([path + 'src/pages/*.html'])
        .pipe(htmlPartial({
            basePath: path + 'src/partials/'
        }))
        .pipe(gulp.dest(path + 'src'))
}

// Static Server + watching scss/html files
function browsersync() {
    browserSync.init({
        server: path + "src"
    })
}

function watch(){
    gulp.watch("src/scss/**", sass);
    gulp.watch("src/js/*.js", scripts);
    gulp.watch(["src/**/*.html"], html).on('change', reload);
}

function cleanDev() {
    return del(path + 'src/*.html');
}

exports.cleanDev = cleanDev;
exports.scripts = scripts;
exports.styles = styles;
exports.watch = watch;
exports.browsersync = browsersync;
exports.html = html;

var build = gulp.series(cleanDev, gulp.parallel(scripts, styles), html, browsersync, watch);

gulp.task('default', build);