const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require("copy-webpack-plugin")

const { meta } = require('./meta')

module.exports = {
  mode: 'production',
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: true,
      hash: true,
      minify: {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        sortAttributes: true,
        sortClassName: true
      },
      template: path.resolve(__dirname, 'src/index.html'),
      meta: meta
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
    }),
    new CopyWebpackPlugin({
      patterns: [{
        from: path.resolve(__dirname, 'src/img'), to: 'img'
      }]
    }),
    new CopyWebpackPlugin({
      patterns: [{
        from: path.resolve(__dirname, 'src/icons'), to: 'icons'
      }]
    }),
    new CopyWebpackPlugin({
      patterns: [{
        from: path.resolve(__dirname, 'data'), to: 'data'
      }]
    })
  ],
  module: {
    rules: [
      {
        test: /\.[sac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /[\\/]node_modules[\\/]/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        },
      },
      {
        test: /\.(woff(2)?|olf|ttf|eot|svg)$/,
        loader: 'file-loader'
      },
    ]
  },
  performance: {
    maxEntrypointSize: 1024000,
    maxAssetSize: 1024000
  }
}
