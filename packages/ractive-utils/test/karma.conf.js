const baseConf = require('../../../karma.conf')

module.exports = function (config) {
  config.set(Object.assign({}, baseConf, {
    files: [
      '../dist/lib.umd.js',
      '../tmp/test.umd.js'
    ]
  }))
}
