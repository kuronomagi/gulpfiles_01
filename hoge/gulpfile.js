var gulp = require('gulp');
var ejs = require('gulp-ejs');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var spritesmith = require('gulp.spritesmith');
var webserver = require('gulp-webserver');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var imageminGuetzli = require('imagemin-guetzli');
var browserify = require('browserify');
var watchify = require('watchify');

gulp.task('ejs', function() {
    return gulp.src(['src/ejs/*.ejs', '!src/ejs/_*.ejs']) // ファイル名に_が付いたejsファイルはhtmlとして出力しない
    .pipe(ejs())
    .pipe(rename({
        extname: '.html'
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('sass', function() {
    return gulp.src(['src/sass/*.scss', 'src/sass/**/*.scss'])
    .pipe(sass())
    .pipe(autoprefixer({
        browsers: [
          'ie >= 10',
          'ios >= 8',
          'android >= 4.0'
        ]
    }))
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('sprite', function () {
    var spriteItem = gulp.src('src/spriteimg/*.png') //スプライトする画像
    .pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: '_sprite.scss',
        imgPath: 'img/sprite.png',
        cssFormat: 'scss',
        cssVarMap: function (sprite) {
            sprite.name = 'sprite-' + sprite.name;
        }
    }));
    spriteItem.img.pipe(gulp.dest('dist/img/')); //imgNameで指定したスプライト画像の保存先
    spriteItem.css.pipe(gulp.dest('src/sass/')); //cssNameで指定したcssの保存先
});

gulp.task('browserify', function() {
    return jscompile(false);
});

gulp.task('watchify', function() {
    return jscompile(true);
});

function jscompile(is_watch) {
    var bundler;
    if (is_watch) {
        bundler = watchify(browserify('src/js/main.js'));
    } else {
        bundler = browserify('src/js/main.js');
    }
    function rebundle() {
        return bundler
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist/js'));
    }
    bundler.on('update', function() {
        rebundle();
    });
    bundler.on('log', function(message) {
        console.log(message);
    });
    return rebundle();
}

// ウォッチタスク ejs/sass/jsが保存されると自動でコンパイル
gulp.task('default', [
    'ejs',
    'cssmin',
    'imgmin', 
    'uglify'
], function() {
    gulp.watch(['src/ejs/**/*.ejs', 'src/ejs/*.ejs', '!src/ejs/common/_*.ejs'], ['ejs']);
    gulp.watch(['src/sass/*.scss', 'src/sass/**/*.scss'], ['sass']);
    gulp.watch(['src/js/main.js'], ['watchify']);
});




// リリース用　画像圧縮、css/js難読化
gulp.task('cssmin', function () {
    return gulp.src('dist/css/*.css')
    .pipe(cssmin())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('uglify', function() {
    return gulp.src(['dist/js/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('imgmin', function () {
    return gulp.src('dist/img/*')
    .pipe(imagemin([imageminGuetzli()]))
    .pipe(gulp.dest('dist/img'))
});

gulp.task('release', [
  'cssmin',
  'imgmin', 
  'uglify'
], function() {
    return gulp.src(['dist/css/*.css', 'dist/img/*', 'dist/js/*.js']);
});

// 参照・ライブリロード用WEBサーバ
gulp.task('webserver', function() {
  gulp.src('dist/')
    .pipe(webserver({
      livereload: true,
      directoryListing: true,
      open: false
    }));
});