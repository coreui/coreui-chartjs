'use strict'

module.exports = ctx => {
  return {
    plugins: {
      autoprefixer: {
        cascade: false
      },
      'postcss-combine-duplicated-selectors': {},
      rtlcss: ctx.env === 'RTL' ? {} : false
    }
  }
}
