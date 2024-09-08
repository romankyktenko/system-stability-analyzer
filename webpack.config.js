const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Вхідний файл
  entry: './src/index.tsx',

  // Вихідні налаштування
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },

  // Вирішення модулів
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  // Модулі
  module: {
    rules: [
      // Правила для TypeScript
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // Правила для стилів
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // Правила для шрифтів
      {
        test: /\.(ttf|otf|eot|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
              publicPath: '/fonts/',
            },
          },
        ],
      },
      // Правила для зображень
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/',
              publicPath: '/images/',
            },
          },
        ],
      },
      // Додайте інші правила тут за потреби
    ],
  },

  // Плагіни
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],

  // Налаштування сервера розробки
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    historyApiFallback: true, // Для SPA, що використовують BrowserRouter
  },
};
