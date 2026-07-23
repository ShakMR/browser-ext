// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const {IgnorePlugin} = require('webpack');
const BookmarkletOutputWebpackPlugin = require("bookmarklet-output-webpack-plugin");
const DotEnv = require('dotenv-webpack');

const isProduction = process.env.NODE_ENV === 'production';

const extensionOutputs = {
  aws: '../extensions/aws/content.js',
  switch: '../extensions/switch/content.js',
  workday: '../extensions/workday/content.js',
  fontChecker: '../extensions/font-checker/content.js',
  fontCheckerPopup: '../extensions/font-checker/popup.js',
  fontCheckerDevtools: '../extensions/font-checker/devtools.js',
  fontCheckerDevtoolsPanel: '../extensions/font-checker/devtools-panel.js',
};

const config = {
  entry: {
    workday: './src/workday/main.js',
    switch: './src/switch/main.js',
    panel: './src/eventPanel.js',
    aws: './src/aws/main.js',
    fontChecker: './src/fontChecker/main.js',
    fontCheckerPopup: './src/fontChecker/popup.js',
    fontCheckerDevtools: './src/fontChecker/devtools.js',
    fontCheckerDevtoolsPanel: './src/fontChecker/devtoolsPanel.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (pathData) => {
      if (extensionOutputs[pathData.chunk.name]) {
        return extensionOutputs[pathData.chunk.name];
      }
      return '[name].js';
    }
  },
  plugins: [
    new IgnorePlugin({resourceRegExp: /server_data.json/}),
    new DotEnv(),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader',
      },
      {
        test: /\.html$/i,
        include: path.resolve(__dirname, 'src/fontChecker'),
        type: 'asset/resource',
        generator: {
          filename: '../extensions/font-checker/[name][ext]',
        },
      },
      {
        test: /\.html$/i,
        exclude: path.resolve(__dirname, 'src/fontChecker'),
        loader: "raw-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader","css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      }
    ],
  },
  optimization: {
    minimize: false,
  },
  devtool: false,
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';


  } else {
    config.mode = 'development';
    config.devtool = 'source-map';
  }
  return config;
};
