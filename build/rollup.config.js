'use strict'

const path = require('path')
const { babel } = require('@rollup/plugin-babel')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const replace = require('@rollup/plugin-replace')
const banner = require('./banner.js')

const BUNDLE = process.env.BUNDLE === 'true'
const ESM = process.env.ESM === 'true'

let fileDest = `coreui-chartjs${ESM ? '.esm' : ''}`
const external = ['chart.js']
const plugins = [
  babel({
    // Only transpile our source code
    exclude: 'node_modules/**',
    // Include the helpers in the bundle, at most one copy of each
    babelHelpers: 'bundled'
  }),
  replace({
    __COREUI_VERSION__: `v${process.env.npm_package_version}`
  })
]
const globals = {
  'chart.js/auto': 'Chart',
  'chart.js/helpers': 'Chart.helpers'
}

if (BUNDLE) {
  fileDest += '.bundle'
  // Remove last entry in external array to bundle Chart.js
  external.pop()
  delete globals['chart.js']
  delete globals['chart.js/helpers']
  plugins.push(
    replace(),
    nodeResolve()
  )
}

const rollupConfig = {
  input: path.resolve(__dirname, `../js/index.${ESM ? 'esm' : 'umd'}.js`),
  output: {
    banner: banner(),
    file: path.resolve(__dirname, `../dist/js/${fileDest}.js`),
    format: ESM ? 'esm' : 'umd',
    globals
  },
  external,
  plugins
}

if (!ESM) {
  rollupConfig.output.name = 'coreui.ChartJS'
}

module.exports = rollupConfig
