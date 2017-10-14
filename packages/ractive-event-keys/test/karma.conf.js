const baseConf = require('../../../karma.conf')

module.exports = function (config) {
  config.set(Object.assign({}, baseConf, {
    files: [
      '../../../node_modules/simulant/dist/simulant.umd.js',
      '../node_modules/ractive/dist/lib.umd.js',
      '../dist/lib.umd.js',
      '../tmp/test.umd.js'
    ]
  }))
}
