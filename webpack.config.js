/**
 * @file 基础webpack配置
 * @author zhanglili
 */

const path = require('path');
const {HashedModuleIdsPlugin, LoaderOptionsPlugin} = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    context: __dirname,
    entry: {
        index: './src/index.js'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'index.js',
        library: 'standardReduxShape',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
        modules: ['node_modules']
    },
    plugins: [
        new UglifyJSPlugin({sourceMap: true}),
        new LoaderOptionsPlugin({minimize: true, debug: false}),
        new HashedModuleIdsPlugin()
    ]
};
