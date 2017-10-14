const pkg = require('../package.json')
const buble = require('rollup-plugin-buble')

export default {
  sourcemap: true,
  plugins: [
    buble({transforms: { modules: false }})
  ],
  input: 'src/index.js',
  output: [
    { file: pkg.main, format: 'umd', name: pkg.name },
    { file: pkg.module, format: 'es' }
  ]
}
