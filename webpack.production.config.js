var webpack = require('webpack');
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: './src/client.js',
    output: {
        path: path.join(__dirname, 'dist', 'static'),
        publicPath: '/huntgenes/fasttrack/static/',
        filename: 'javascript.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel'
            },
            {
                test: [/\.css$/, /\.scss$/],
                loader: ExtractTextPlugin.extract('css?sourceMap!postcss-loader?sourceMap!sass?sourceMap')
            },
            {
                test: /fontawesome-webfont\.(eot|woff|woff2|ttf|svg)/,
                loader: 'file?name=src/client/fonts/[name].[ext]'
            },
            {
                test: /\.(png|jpg|svg|eot|woff|woff2|ttf)$/,
                loader: 'file',
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en)$/),
        new ExtractTextPlugin("stylesheet.css"),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new CopyWebpackPlugin([{
            from: __dirname + '/src/assets'
        }], {
            ignore: [
                '*.scss',
            ]
        })
    ]
};
