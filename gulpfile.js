var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    sass = require("gulp-sass"),
    webpack = require("webpack");

gulp.task('default', ['watch']);
gulp.task("build", ["sass", "icons", "images", "webpack"]);

gulp.task('sass', function() {
    return gulp.src('src/scss/stylesheet.scss')
    .pipe(sass({includePaths: ["node_modules/bootstrap-sass/assets/stylesheets", "node_modules/font-awesome/scss"]}))
    .pipe(gulp.dest('dist'));
});

gulp.task("webpack", function(callback) {
    // run webpack
    webpack({
        devtool: "cheap-module-source-map",
        context: __dirname + "/src",
        entry: "./client.js",

        output: {
            filename: "client.js",
            path: __dirname + "/dist",
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loaders: ["babel-loader"],
                }
            ],
        }
    }, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });
});

gulp.task("icons", function () {
    return gulp.src("./node_modules/font-awesome/fonts/*.*")
        .pipe(gulp.dest("./dist/fonts"));
});

gulp.task("images", function () {
    return gulp.src("./images/**/*.*")
        .pipe(gulp.dest("./dist/img"));
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['webpack']);
  gulp.watch('src/scss/*.scss', ['sass']);
});

