import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import banner from './banner.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BUNDLE = process.env.BUNDLE === 'true'
const ESM = process.env.ESM === 'true'

let destinationFile = `coreui-chartjs${ESM ? '.esm' : ''}`
const external = ['chart.js']
const plugins = [
  babel({
    // Only transpile our source code
    exclude: 'node_modules/**',
    // Include the helpers in the bundle, at most one copy of each
    babelHelpers: 'bundled'
  })
]
const globals = {
  'chart.js/auto': 'Chart',
  'chart.js/helpers': 'Chart.helpers'
}

if (BUNDLE) {
  destinationFile += '.bundle'
  // Remove last entry in external array to bundle Chart.js
  external.pop()
  delete globals['chart.js']
  delete globals['chart.js/helpers']
  plugins.push(
    replace({
      preventAssignment: true
    }),
    nodeResolve()
  )
}

const rollupConfig = {
  input: path.resolve(__dirname, `../js/index.${ESM ? 'esm' : 'umd'}.js`),
  output: {
    banner: banner(),
    file: path.resolve(__dirname, `../dist/js/${destinationFile}.js`),
    format: ESM ? 'esm' : 'umd',
    globals,
    generatedCode: 'es2015'
  },
  external,
  plugins
}

if (!ESM) {
  rollupConfig.output.name = 'coreui.ChartJS'
}

export default rollupConfig
