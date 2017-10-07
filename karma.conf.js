module.exports = {
  singleRun: true,
  plugins: ['karma-qunit', 'karma-phantomjs-launcher'],
  frameworks: ['qunit'],
  browsers: ['PhantomJS'],
  client: { captureConsole: false }
}
