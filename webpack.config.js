import path from 'path';
import webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';

module.exports = {
    devServer: {
        port: 3001,
        hot: true,
        proxy: {
            '*': 'http://localhost:3000',
        },
    },
    devtool: 'inline-source-map',
    entry: [
        'webpack-dev-server/client?http://127.0.0.1:3001/',
        'webpack/hot/only-dev-server',
        './src/client.js',
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: 'react-hmre',
                },
            },
            {
                test: /\.css$/,
                loaders: ['style', 'css'],
            },
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'postcss', 'sass?outputStyle=expanded'],
            },
            {
                test: /fontawesome-webfont\.(eot|woff|woff2|ttf|svg)/,
                loader: 'file?name=src/client/fonts/[name].[ext]',
            },
            {
                test: /\.(png|jpg|svg|eot|woff|woff2|ttf)$/,
                loader: 'file',
            },
        ],
    },
    output: {
        path: path.join(__dirname, 'dist', 'assets'),
        publicPath: '/',
        filename: 'javascript.js',
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new CopyWebpackPlugin([{
            from: path.join(__dirname, 'src', 'assets'),
        }]),
        new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en)$/),
    ],
    sassLoader: {
        includePaths: [
            path.resolve(__dirname, 'node_modules/font-awesome/scss'),
        ],
    },
};
