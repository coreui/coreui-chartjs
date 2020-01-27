'use strict'

const path  = require('path')
const pkg   = require(path.resolve(__dirname, '../package.json'))
const year  = new Date().getFullYear()

function getBanner(pluginFilename) {
  return `/*!
  * CoreUI Plugins - Chart.js for CoreUI 3${pluginFilename ? ` ${pluginFilename}` : ''} v${pkg.version} (${pkg.homepage})
  * Copyright ${year} ${pkg.author.name}
  * Licensed under MIT (${pkg.homepage}/license/)
  */`
}

module.exports = getBanner
