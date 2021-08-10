const { join, resolve } = require('path')
const { existsSync, mkdirSync, writeFileSync } = require('fs')
const { dirname } = require('path')
const logger = require('./logger')

const defaults = {
  path: '/feed.xml',
  async create (feed) {
  },
  cacheTime: 1000 * 60 * 15
}

module.exports = async function (moduleOptions) {
  const options = [
    ...await parseOptions(this.options.feed),
    ...await parseOptions(moduleOptions)
  ].map(o => ({ ...defaults, ...o }))
  let xml 
  let api = options[0].api
  xml = await loadRss(api)
  let optionNew = this.options
  const xmlGeneratePath = resolve(optionNew.rootDir, join(optionNew.generate.dir, options[0].path))
  const xmlGenerateDirPath = dirname(xmlGeneratePath)

if (!existsSync(xmlGenerateDirPath)) {
mkdirSync(xmlGenerateDirPath, { recursive: true })
   }
  writeFileSync(xmlGeneratePath, xml)
  this.addServerMiddleware({
    path: options[0].path,
    async handler (req, res, next) {
      try {
        res.setHeader('Content-Type', 'application/xml')
        xml = await loadRss(api)
        res.end(xml)
      } catch (err) {
        next(err)
      }
    }
  })

}

async function parseOptions (options) {
  // Factory function
  if (typeof options === 'function') {
    options = await options()
  }

  // Factory object
  if (!Array.isArray(options)) {
    if (options.factory) {
      options = await options.factory(options.data)
    }
  }

  // Check if is empty
  if (Object.keys(options).length === 0) {
    return []
  }

  // Single feed
  if (!Array.isArray(options)) {
    options = [options]
  }
  return options
}


async function loadRss (api) {
  const axios = require('axios');
  let xmlData
  await axios.get(api)
  .then(function (response) {
  xmlData = response.data
})
return xmlData
}
module.exports.meta = require('../package.json')
