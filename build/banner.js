'use strict'

const path  = require('path')
const pkg   = require(path.resolve(__dirname, '../package.json'))
const year  = new Date().getFullYear()

function getBanner(pluginFilename) {
  return `/*!
  * CoreUI Plugins - Chart.js for CoreUI v5${pluginFilename ? ` ${pluginFilename}` : ''} v${pkg.version} (${pkg.homepage})
  * Copyright ${year} ${pkg.author.name}
  * Licensed under MIT (https://github.com/coreui/coreui-chartjs/blob/main/LICENSE)
  */`
}

module.exports = getBanner
