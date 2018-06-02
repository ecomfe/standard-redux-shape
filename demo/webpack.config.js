/**
 * @file 基础webpack配置
 * @author zhanglili
 */

const path = require('path');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const context = path.resolve(__dirname, '..');

module.exports = {
    mode: 'development',
    context: context,
    entry: {
        index: path.join(context, 'demo', 'index.js')
    },
    output: {
        path: path.join(context, 'demo', 'dist'),
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
