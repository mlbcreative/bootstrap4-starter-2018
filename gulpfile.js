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
        path + "node_modules/bootstrap/dist/js/bootstrap.js",
        path + "node_modules/waypoints/lib/noframework.waypoints.js"
    ],
    styles : [
        path + "src/scss/*.scss"
    ]
};

//DEV TASKS
function vendorscripts() {
    return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path + 'build/js/vendors'));
};

function myscripts() {
     return gulp.src(path + 'src/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path + 'build/js'));
}

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
	.pipe(gulp.dest(path + 'build/css'))
	.pipe(browserSync.stream());
};

function html() {
	return gulp.src([path + 'src/pages/*.html'])
        .pipe(htmlPartial({
            basePath: path + 'src/partials/'
        }))
        .pipe(gulp.dest(path + 'build'))
}

function images() {
    return gulp.src(path + 'src/img/**')
    .pipe(gulp.dest(path + 'build/img'));
}

function fonts() {
    return gulp.src(path + 'src/fontawesome/webfonts/**')
    .pipe(gulp.dest(path + 'build/fontawesome/webfonts'))
}

// Static Server + watching scss/html files
function serve() {
    browserSync.init({
        server: path + "build"
    });
    
    gulp.watch(path + "src/scss/**", styles);
    gulp.watch(path + "src/js/*.js", gulp.series(myscripts,reload));
    gulp.watch([path + "src/pages/*.html", path + "src/partials/**"], gulp.series(html, reload));
}

function reload(done) {
  browserSync.reload();
  done();
}


function cleanDev() {
    return del(path + 'build/**');
}

exports.cleanDev = cleanDev;
exports.vendorscripts = vendorscripts;
exports.myscripts = myscripts;
exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.serve = serve;
exports.html = html;

var dev = gulp.series(cleanDev, gulp.parallel(vendorscripts, myscripts, styles, images),fonts, html, serve);

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
    return gulp.src( path + 'build/css/*.css')
    .pipe(sourcemaps.init())
    .pipe(minifyCss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest( path + 'dist/css'));
}

function htmlProd(){
    return gulp.src( path + 'build/*.html')
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