// plugin
var gulp = require('gulp');
var ejs = require('gulp-ejs');
var htmlbeautify = require('gulp-html-beautify');
var postcss = require('gulp-postcss');
var stylelint = require('stylelint');
var reporter = require('postcss-reporter');
var csscomb = require('gulp-csscomb');
var rename = require('gulp-rename');
var spritesmith = require('gulp.spritesmith');
var webserver = require('gulp-webserver');
var plumber = require('gulp-plumber');
var cssmin = require('gulp-cssmin'); //css圧縮
var uglify = require('gulp-uglify'); //js圧縮
var imagemin = require('gulp-imagemin'); //画像圧縮
var pngquant = require('imagemin-pngquant'); //png圧縮率
var mozjpeg  = require('imagemin-mozjpeg'); //jpeg圧縮率
var browserify = require('browserify'); //モジュール管理用
var watchify = require('watchify'); //bundleの時間を短縮

// ejs compile
gulp.task('ejs', function() {
    return gulp.src(['src/ejs/*.ejs', '!src/ejs/_*.ejs']) // ファイル名に_が付いたejsファイルはhtmlとして出力しない
    .pipe(plumber())
    .pipe(ejs())
    .pipe(rename({
        extname: '.html'
    }))
    .pipe(gulp.dest('dist/'));
});

// css compile
gulp.task('build-css', function() {
    return gulp.src(['src/css/**/*.css', '!src/css/**/_*.css'])
    .pipe(plumber())
    .pipe(postcss([
        require('postcss-import'),
        require('postcss-mixins'),
        require('postcss-extend'),
        require('postcss-simple-vars'),
        require('postcss-nested'),
        require('postcss-custom-media'),
        require('autoprefixer')({
            browsers: [
            'ie >= 11',
            'ios >= 8',
            'android >= 4.0'
            ]
        }),
        require('css-mqpacker'),
    ]))
    .pipe(csscomb())
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('browserify', function() {
    return jscompile(false);
});

gulp.task('watchify', function() {
    return jscompile(true);
});

function jscompile(is_watch) {
    var bundler;
    /*
    if (is_watch) {
        bundler = watchify(browserify('src/js/main.js'));
    } else {
        bundler = browserify('src/js/main.js');
    }
    */
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

// local server
gulp.task('webserver', function() {
  gulp.src('dist/')
    .pipe(webserver({
      livereload: true,
      directoryListing: true,
      open: false
    }));
});

//styleLint
gulp.task('analyze-css', function () {
  return gulp.src(['src/css/**/*.css', '!src/css/**/_*.css'])
    .pipe(postcss([ 
        stylelint(),
        reporter()
    ]));
});

// default task
gulp.task('default', [
    'ejs',
    'build-css'
], function() {
    gulp.watch(['src/ejs/**/*.ejs', 'src/ejs/*.ejs', 'src/partial/**/*.ejs'], ['ejs']);
    gulp.watch(['src/css/*.css', 'src/css/**/*.css'], ['build-css']);
    gulp.watch(['src/js/main.js'], ['watchify']);
});


// sprite compile
gulp.task('sprite', function () {
    var spriteItem = gulp.src('src/spriteimg/*.png') //スプライトする画像
    .pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: '_sprite.scss',
        imgPath: 'images/sprite.png',
        cssFormat: 'scss',
        cssVarMap: function (sprite) {
            sprite.name = 'sprite-' + sprite.name;
        }//,
        // retinaSrcFilter: 'src/spriteimg/*.png', //Retinaに対応する場合
        // retinaImgName: 'sprite@2x.png',
        // retinaImgPath: 'images/sprite@2x.png'
    }));
    spriteItem.img.pipe(gulp.dest('dist/images/')); //imgNameで指定したスプライト画像の保存先
    spriteItem.css.pipe(gulp.dest('src/css/')); //cssNameで指定したcssの保存先 mixinで使いたい箇所で呼び出す
});

// リリース用　HTML整形、画像圧縮、css/js難読化
var htmlbeautifyOptions = {
    browsers: [
    'indent_size:2,',
    'eol: "\r\n"',
    'indent_char":" ',
    'max_preserve_newlines: 0',
    'indent_inner_html: false'
    ]
};

gulp.task('build-html', function () {
    return gulp.src(`dist/**/*.html`, { base: 'src' })
    .pipe(htmlbeautify(htmlbeautifyOptions))
    .pipe(gulp.dest('dist/'));
});

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
    return gulp.src('src/images/*')
    .pipe(imagemin([
      pngquant({
        quality: '70-80',
        speed: 1,
        floyd: 0
    }),
    mozjpeg({ 
        quality: 80,
        progressive: true
    }),
      imagemin.svgo(),
      imagemin.optipng(),
      imagemin.gifsicle()
    ]))
    .pipe(gulp.dest('dist/images'))
});

gulp.task('release', [
    'build-html',
    'cssmin',
    'imgmin',
    'uglify'
], function() {
    return gulp.src(['dist/css/*.css', 'dist/img/*', 'dist/js/*.js']);
});

//https://tech.recruit-mp.co.jp/front-end/post-6844/
//https://liginc.co.jp/web/html-css/html/144170
//http://qiita.com/harapeko_wktk/items/a9446efce650b7fcc276
//http://blog.tsumikiinc.com/article/20150226_gulp-imagemin.html    
//https://tech.recruit-mp.co.jp/front-end/getting-started-gulp-browserify/
//http://www.yoheim.net/blog.php?q=20160307



//https://www.nxworld.net/services-resource/gulp-task-example-for-beginners.html
//https://blog.mismithportfolio.com/web/20160911postcss
//https://whiskers.nukos.kitchen/2014/”12/07/gulp-require-dir.html
//http://be-into.com/blog/web/how-to-modify-each-file-output-destination-in-gulp/
//http://qiita.com/harapeko_wktk/items/a9446efce650b7fcc276



//////styleLintについて
//http://qiita.com/makotot/items/c266ed11ada1423cb96e
//https://www.webprofessional.jp/improving-the-quality-of-your-css-with-postcss/


//https://github.com/nayucolony/boiler-plate
