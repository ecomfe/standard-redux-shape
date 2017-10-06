/**
 * @file 基础webpack配置
 * @author zhanglili
 */

const path = require('path');
const {LoaderOptionsPlugin} = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    context: __dirname,
    entry: {
        index: './demo/index.js'
    },
    output: {
        path: path.join(__dirname, 'demo', 'dist'),
        filename: 'index.js'
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
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
        modules: ['node_modules']
    },
    plugins: [
        new LoaderOptionsPlugin({minimize: true, debug: false}),
        new HtmlWebpackPlugin({title: 'standard-redux-shape'})
    ],
    devServer: {
        port: 9010,
        open: true,
        compress: true,
        inline: true,
        hot: false
    }
};
