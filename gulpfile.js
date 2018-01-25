var path = './';
var gulp = require('gulp'),
browserSync = require('browser-sync').create(),
sass = require('gulp-sass'),
uglify = require('gulp-uglify'),
minifyCss = require('gulp-clean-css'),
useref = require('gulp-useref'),
imagemin = require('gulp-imagemin'),
sourcemaps = require('gulp-sourcemaps'),
postcss = require('gulp-postcss'),
autoprefixer = require('autoprefixer'),
gulpif = require('gulp-if'),
htmlPartial = require('gulp-html-partial'),
del = require('del');

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

//DEV TASKS
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
function serve() {
    browserSync.init({
        server: path + "src"
    });
    
    gulp.watch(path + "src/scss/**", styles);
    gulp.watch(path + "src/js/*.js", scripts);
    gulp.watch([path + "src/pages/*.html", path + "src/partials/*.html"], gulp.series(html, reload));
}

function reload(done) {
  browserSync.reload();
  done();
}


function cleanDev() {
    return del(path + 'src/*.html');
}

exports.cleanDev = cleanDev;
exports.scripts = scripts;
exports.styles = styles;
exports.serve = serve;
exports.html = html;

var dev = gulp.series(cleanDev, gulp.parallel(scripts, styles), html, serve);

gulp.task('default', dev);
//.END DEV TASKS


//PRODUCTION TASKS


function cleanProd(){
    return del( path + "dist" );
}

function imageMinify() {
    return gulp.src( path + 'src/img/**')
    .pipe(imagemin())
    .pipe(gulp.dest( path + 'dist/img'));
}

function cssMinify() {
    return gulp.src( path + 'src/css/*.css')
    .pipe(sourcemaps.init())
    .pipe(minifyCss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest( path + 'dist/css'));
}

function htmlProd(){
    return gulp.src( path + 'src/*.html')
        .pipe(useref())
        .pipe(gulp.dest(path + 'dist'));
}

function serveProd() {
    browserSync.init({
        server: path + "dist"
    });
}

var build = gulp.series(cleanProd, gulp.parallel(imageMinify, cssMinify),htmlProd);
var serveBuild = gulp.series(cleanProd, gulp.parallel(imageMinify, cssMinify),htmlProd, serveProd);

gulp.task("build:prod", build);
gulp.task("serve:prod", serveBuild);