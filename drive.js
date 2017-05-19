const querystring = require('querystring')
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
  if (typeof config.cache !== 'function') config.cache = cache
  const urls = () =>
    config.cache()
    .then((urls) => urls ||
      drive.account.endpoint()
      .then(JSON.parse)
      .then(config.cache)
    )
  const req = require('./lib/req.js')(config, urls)

  const drive = {
    req,
    changes: require('./lib/changes.js')(config, urls),
    urls,
    account: {
      endpoint: () => req('https://drive.amazonaws.com/drive/v1/account/endpoint'),
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
      download: (id) => urls().then((urls) =>
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

  return drive
}
