var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
      qc: './src/app/QCApp/index.js',
      analytics: './src/app/AnalyticsApp/index.js',
      dashboard: './src/app/DashboardApp/index.js',
      dashboardCampaign: './src/app/DashboardApp/Campaign.js',
      dashboardGroup: './src/app/DashboardApp/Group.js',
      dashboardAdvertisement: './src/app/DashboardApp/Advertisement.js',
      dashboardArticle: './src/app/DashboardApp/Article.js',
      dashboardArticleForm: './src/app/DashboardApp/ArticleForm.js',
    },
    output: {
      path: path.resolve(__dirname, "..", "static", "js", "react"),
      filename: "[name].js"
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    plugins: [
      // automatically load modules instead of having to import or require them everywhere
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      })
    ],
    module: {
      rules: [
        {
          test : /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
            test: /\.css$/,
            exclude: /node_modules/,
            use: ['style-loader', 'css-loader'],
          },
        {
            test: /\.css$/,
            include: /node_modules/,  
            loaders: ['style-loader', 'css-loader'],
       },
       {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
       }
      ]
    }
  };
