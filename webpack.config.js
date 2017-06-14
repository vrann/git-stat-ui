var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');
var webpackConfig = {
    entry: './src/app.js',
    output: {
      filename: 'output.[hash].bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      alias: {
        elasticsearch$: 'elasticsearch-browser/elasticsearch.angular'
      }
    },
    plugins: [
      new CopyWebpackPlugin([
          { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
          { from: 'css', to: 'css/'},
          { from: 'fonts', to: 'fonts/'},
          { from: 'img', to: 'img/'}
      ]),
      new HtmlWebpackPlugin(
        {template: 'index.ejs'}
      ),
      new HtmlWebpackIncludeAssetsPlugin({
          assets: [
            'css/bootstrap.min.css', 
            'css/jquery.switchButton.css',
            'css/app.css',
            'fonts/style.css',            
            'css/configure-toolbox.css'
          ],
          append: false
      })
  ]};
module.exports = webpackConfig;