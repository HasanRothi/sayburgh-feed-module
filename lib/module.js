const { join, resolve } = require('path')
const { promisify } = require('util')
const { existsSync, mkdirSync, writeFileSync } = require('fs')
const { dirname } = require('path')
const RSS = require('sayburgh-rss');
const AsyncCache = require('async-cache')
const logger = require('./logger')

const defaults = {
  path: '/feed.xml',
  async create (feed) {
    // console.log('feed',feed)
  },
  cacheTime: 1000 * 60 * 15
}

module.exports = async function (moduleOptions) {
  // let person2 = Object.create(moduleOptions);
  // console.log('ashse',person2)
  // console.log('keys',Object.keys(moduleOptions))
  // console.log(moduleOptions)
  const options = [
    ...await parseOptions(this.options.feed),
    ...await parseOptions(moduleOptions)
  ].map(o => ({ ...defaults, ...o }))
// console.log(options)
  // const feedCache = new AsyncCache({
  //   load (feedIndex, callback) {
  //     createFeed(options[feedIndex], callback).catch(err => logger.error(err))
  //   }
  // })

  // feedCache.get = promisify(feedCache.get)
  let xml 
  let api = options[0].api
  xml = await loadRss(api)
  let optionNew = this.options
  // const xmlGeneratePath = resolve(optionNew.rootDir, join(optionNew.generate.dir, feedOptions.path))
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
        // const xml = await feedCache.get(index)
        // console.log('lol-----------------------')
        res.setHeader('Content-Type', 'application/xml')
        xml = await loadRss(api)
        // console.log('end')
        res.end(xml)
      } catch (err) {
        next(err)
      }
    }
  })

  // options.forEach((feedOptions, index) => {
  //   // console.log('dukhse',this.options.rootDir , feedOptions)
  //   const optionNew = this.options
  //   const date = new Date().toISOString();
  //   const currentYear = new Date().getFullYear();
  //   const feed = new RSS({
  //     title: 'somoynews.tv | RSS Feed',
  //     description: 'A RSS news feed containing the latest news of somoy TV',
  //     site_url: 'https://www.somoynews.tv/rss',
  //     custom_namespaces: {
  //       media: 'https://www.somoynews.tv',
  //       content: 'https://www.somoynews.tv',
  //     },
  //     custom_elements: [
  //       {
  //         'atom:link': {
  //           _attr: {
  //             href: 'https://www.somoynews.tv/rss',
  //             rel: 'self',
  //             type: 'application/rss+xml',
  //           },
  //         },
  //       },
  //       { 'dc:language': 'bn-bd' },
  //       { 'dc:creator': 'Somoy News (info@somoynews.tv' },
  //       { 'dc:rights': `Copyright ${currentYear} somoynews.tv` },
  //       { 'dc:date': `${date}` },
  //     ],
  //   });
  //   const xmlGeneratePath = resolve(optionNew.rootDir, join(optionNew.generate.dir, feedOptions.path))
  //   const xmlGenerateDirPath = dirname(xmlGeneratePath)

  // if (!existsSync(xmlGenerateDirPath)) {
  // mkdirSync(xmlGenerateDirPath, { recursive: true })
  //    }
  //   writeFileSync(xmlGeneratePath, xml)
  //   // console.log(xmlGeneratePath)
  //   this.nuxt.hook('generate:done', async () => {
  //     // console.log('Ready to done')
  //     if (index === 0) {
  //       logger.info('Generating feeds')
  //     }

  //     const xmlGeneratePath = resolve(this.options.rootDir, join(this.options.generate.dir, feedOptions.path))
  //     const xmlGenerateDirPath = dirname(xmlGeneratePath)

  //     if (!existsSync(xmlGenerateDirPath)) {
  //       mkdirSync(xmlGenerateDirPath, { recursive: true })
  //     }
  //     writeFileSync(xmlGeneratePath, await feedCache.get(index))
  //     // console.log('done')
  //     logger.success('Generated', feedOptions.path)
  //   })

  //   this.addServerMiddleware({
  //     path: feedOptions.path,
  //     async handler (req, res, next) {
  //       try {
  //         // const xml = await feedCache.get(index)
  //         res.setHeader('Content-Type', 'application/xml')
  //         res.end(xml)
  //       } catch (err) {
  //         next(err)
  //       }
  //     }
  //   })
  // })
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
  // console.log('wow',options)
  return options
}

function resolveContentType (type) {
  const lookup = {
    rss2: 'application/rss+xml',
    atom1: 'application/atom+xml',
    json1: 'application/json'
  }
  return (lookup.hasOwnProperty(type) ? lookup[type] : 'application/xml') + '; charset=UTF-8'
}

async function createFeed (feedOptions, callback) {
  if (!['rss2', 'json1', 'atom1'].includes(feedOptions.type)) {
    logger.fatal(`Could not create Feed ${feedOptions.path} - Unknown feed type`)
    return callback(null, '', feedOptions.cacheTime)
  }

  const feed = new RSS()

  try {
    await feedOptions.create.call(this, feed, feedOptions.data)
    feed.options = {
      generator: 'https://github.com/nuxt-community/sayburgh-feed-module',
      ...feed.options
    }
  } catch (err) {
    logger.error(err)
    logger.fatal('Error while executing feed creation function')

    return callback(null, '', feedOptions.cacheTime)
  }

  return callback(null, feed.generateXML(feedOptions), feedOptions.cacheTime)
}
async function loadRss (api) {
  // console.log('api calling')
  const axios = require('axios');
  // console.log('api ',options[0].api)
  // console.log('feed ',feedOption)
  let xmlData
  await axios.get(api)
  .then(function (response) {
  // handle success
  // console.log(response.data);
  xmlData = response.data
})
return xmlData
}
module.exports.meta = require('../package.json')
