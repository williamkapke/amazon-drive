const querystring = require('querystring')
const eachline = require('eachline')

let _cache
function cache (urls) {
  console.log('cache', !urls ? 'GET' : 'SET', urls || '')
  return Promise.resolve(urls ? (_cache = urls) : _cache)
}
function qs (obj) {
  if (!obj) return ''
  for (let [key, val] of Object.entries(obj)) {
    if (typeof val === 'undefined') delete obj[key]
  }
  return querystring.stringify(obj)
}

module.exports = (config) => {
  if (typeof config.cacheUrls !== 'function') config.cacheUrls = cache

  // They ask that the urls are cached. This provides a single
  // point for `GET`ing them or pulling from a user defined cache
  const getUrls = () =>
    config.cacheUrls()
    .then((urls) => urls ||
      drive.account.endpoint()
      .then(config.cacheUrls)
    )
  const req = require('./req.js')(config, getUrls)
  const drive = {
    req,
    changes: (options, onchunk) =>
      getUrls()
      .then((urls) =>
        req.stream(urls.metadataUrl + 'changes', options, 'POST')
      )
      .then((stream) => new Promise(function (resolve, reject) {
        stream
        .on('close', reject)
        .on('end', resolve)
        .pipe(eachline((line) =>
          onchunk(JSON.parse(line))
        ))
      })),
    getUrls,
    account: {
      endpoint: () => req('https://drive.amazonaws.com/drive/v1/account/endpoint').then(JSON.parse),
      info: () => req.metadata('account/info'),
      quota: () => req.metadata('account/quota'),
      usage: () => req.metadata('account/usage')
    },
    nodes: {
      upload: (fullpath, metadata = {}, suppress = false) => {
        const md = {}
        if (Array.isArray(metadata.parents)) md.parents = metadata.parents.map(String)
        if (Array.isArray(metadata.labels)) md.labels = metadata.labels.map(String)
        if (metadata.properties) md.properties = metadata.properties

        return req.upload(fullpath, md, suppress)
      },
      overwrite: (id, fullpath) => req.overwrite(id, fullpath),
      download: (id) => getUrls().then((urls) =>
        req.stream(urls.contentUrl + `nodes/${id}/content`)
      ),
      create: (name, metadata = {}) => {
        const md = { name, kind: 'FOLDER' }
        if (Array.isArray(metadata.parents)) md.parents = metadata.parents.map(String)
        if (Array.isArray(metadata.labels)) md.labels = metadata.labels.map(String)
        if (metadata.properties) md.properties = metadata.properties

        return req.metadata(`nodes`, null, md)
      },
      get: (id, options) =>
        req.metadata(`nodes/${id}?${qs(options)}`),

      patch: (id, data) => req.metadata(`nodes/${id}`, null, data, 'PATCH'),
      list: (options) => req.metadata(`nodes?${qs(options)}`),
      children: {
        add: (parent, child) =>
          req.metadata(`nodes/${parent}/children/${child}`, null, null, 'PUT'),

        move: (child, oldParent, newParent) =>
          req.metadata(`nodes/${newParent}/children`, null, { fromParent: oldParent, childId: child }, 'POST'),

        delete: (parent, child) =>
          req.metadata(`nodes/${parent}/children/${child}`, null, null, 'DELETE'),

        list: (parent, options) =>
          req.metadata(`nodes/${parent}/children?${qs(options)}`)
      },
      properties: {
        add: (id, owner, key, value) =>
          req.metadata(`nodes/${id}/properties/${owner}/${key}`, null, { value }, 'PUT'),

        get: (id, owner, key) =>
          req.metadata(`nodes/${id}/properties/${owner}/${key}`),

        delete: (id, owner, key) =>
          req.metadata(`nodes/${id}/properties/${owner}/${key}`, null, null, 'DELETE'),

        list: (id, owner) =>
          req.metadata(`nodes/${id}/properties/${owner}`)

      }
    },
    trash: {
      add: (id) => req.metadata(`trash/add/${id}`, null, null, 'PUT'),
      list: (options) => req.metadata(`trash?${qs(options)}`),
      restore: (id) => req.metadata(`trash/${id}/restore`, null, null, 'POST')
    }
  }

  // API extras...
  drive.nodes.list.all = (filters, pages = []) =>
    drive.nodes.list({
      filters,
      limit: 200,
      startToken: (pages.length || undefined) && pages[pages.length - 1].nextToken
    })
    .then((page) => {
      const hasData = page.data && page.data.length

      if (hasData) {
        pages = pages.concat(page)
      }
      if (!hasData || !page.nextToken) {
        return pages.reduce((prev, curr) => prev.concat(curr.data), [])
      }

      // get next page
      return drive.nodes.list.all(filters, pages)
    })

  return drive
}
