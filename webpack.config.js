'use strict';
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = ENV === 'build';

function setDevTool() {
    if (isTest) {
      return 'inline-source-map';
    } else if (isProd) {
      return 'source-map';
    } else {
      return 'eval-source-map';
    }
}

module.exports = function makeConfig(){
    const config = {};
    config.entry = './src/app/app.js';
    config.output = {
        path: __dirname + '/dist',
        filename: isProd ? '[name].[hash].js' : '[name].bundle.js',
    };
    config.devtool = setDevTool();
    config.module = {
      rules: [
              {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: [
                  /node_modules/,
                  /\.spec\.js$/
                ]
              },
              {
                test: /\.html$/,
                loader: 'raw-loader'
              },
              {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
                loader: 'file-loader'
              },
              {
                  test: /\.css$/,
                  use: isTest ? 'null-loader' : ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    loader: [
                      { loader: 'css-loader', query: {sourceMap: true}},
                      { loader: 'postcss-loader'}
                    ],
                  })
              },
              {
                test: /\.(sass|scss)$/,
                loader: ExtractTextPlugin.extract({
                    loader: ['style-loader','css-loader', 'sass-loader','postcss-loader']
                })
              }
          ]
    };

    config.plugins = [
        new HtmlWebpackPlugin({
          template: './src/public/index.html',
          inject: 'body'
        }),
        new ExtractTextPlugin({filename: 'css/[name].css', disable: !isProd, allChunks: true})
    ];

    if(isProd) {
        config.plugins.push(
            new webpack.optimize.UglifyJsPlugin(),
            new CopyWebpackPlugin([{
              from: __dirname + '/src/public'
            }])
        );
    };

    config.devServer = {
      contentBase: './src/public',
      stats: 'minimal'
    };
    return config;
}();