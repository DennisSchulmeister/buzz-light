"use strict";

// Imports
const fs = require("fs");
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require("webpack");

// Webpack base configuration
const extractCSS = new ExtractTextPlugin("style.css");

let webpackConfig = {
    entry: {
        vendor: ["knockout", "ko-component-router",],
        app: path.join(__dirname, "src", "app.js"),
    },
    output: {
        filename: "[name].bundle.js",
        path: path.join(__dirname, process.env.npm_package_config_build_dir),
        publicPath: `${process.env.npm_package_config_public_url}/`,
    },
    devtool: process.env.NODE_ENV == "production" ? "nosources-source-map" : "eval-source-map",
    //devtool: "nosources-source-map",
    devServer: {
        overlay: true,
        historyApiFallback: true,
    },

    module: {
        rules: [{
            test: /\.css$/,
            use: extractCSS.extract(["css-loader"]),
        }, {
            test: /\.less$/,
            use: extractCSS.extract(["css-loader", "less-loader"]),
        },{
            test: /\.(svg|jpg|png)$/,
            use: "url-loader",
        },{
            test: /\.(htm|html)/,
            use: "html-loader",
        },],
    },
    plugins: [
        extractCSS,

        new UglifyJSPlugin({
            // cheap source map options don't work with the plugin!
            "sourceMap": true,
        }),
        new webpack.optimize.CommonsChunkPlugin({
            names: "vendor",
            minChunks: Infinity,
        }),
    ]
};

// Export configuration
module.exports = webpackConfig;
