'use strict'

const mapConfig = {
  inline: false,
  annotation: true,
  sourcesContent: true
}

module.exports = () => {
  return {
    map: mapConfig,
    plugins: {
      autoprefixer: {
        cascade: false
      }
    }
  }
}
