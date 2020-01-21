module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer: {
    host: "localhost"
  },
  publicPath: process.env.NODE_ENV === 'production'
      ? '/reimagined-octo-disco/'
      : '/'
}