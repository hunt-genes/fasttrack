var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    sass = require("gulp-sass"),
    sourcemaps = require("gulp-sourcemaps"),
    webpack = require("webpack");

gulp.task('default', ['watch']);
gulp.task("build", ["sass", "webpack"]);

gulp.task('sass', function() {
    return gulp.src('src/scss/stylesheet.scss')
    .pipe(sourcemaps.init())  // Process the original sources
    .pipe(sass({includePaths: ["node_modules/bootstrap-sass/assets/stylesheets", "node_modules/font-awesome/scss"]}))
    .pipe(sourcemaps.write()) // Add the map to modified source.
    .pipe(gulp.dest('dist'));
});

gulp.task("webpack", function(callback) {
    // run webpack
    webpack({
        devtool: "source-map",
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

gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['webpack']);
  gulp.watch('src/scss/*.scss', ['sass']);
});

