/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en'
  },
  localePath: require('path').resolve('./public/locales')
}
