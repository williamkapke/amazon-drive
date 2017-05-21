const req = require('get-then')
const extend = require('extend')
const path = require('path')
const fs = require('fs')
const https = require('https')
const zlib = require('zlib')
const FormData = require('form-data')
const urlParse = require('url').parse

exports = module.exports = (config, getUrls) => {
  function request (url, headers, data, method, retry = 0) {
    const defaults = { authorization: 'Bearer ' + config.access_token, 'content-type': 'application/json' }

    return req(url, extend(defaults, headers), data, method)
    .catch((e) =>
      // refresh token and retry...?
      (e.statusCode !== 401 || typeof config.refresh !== 'function' || retry > 0)
        ? Promise.reject(e)
        : config.refresh()
          .then(() =>
            request(url, headers, data, method, ++retry)
          )
    )
  }

  request.metadata = (path, headers, data, method) =>
    getUrls()
    .then((urls) =>
      request(urls.metadataUrl + path, headers, data, method)
      .then(JSON.parse)
    )

  request.upload = (fullpath, metadata = {}, suppress = false) =>
    getUrls()
    .then((urls) => {
      suppress = suppress ? 'suppress=true' : ''
      const required = { name: path.basename(fullpath) }

      const form = new FormData()
      form.append('metadata', JSON.stringify(extend(required, metadata, { kind: 'FILE' })))
      form.append('content', fs.createReadStream(fullpath))

      const headers = form.getHeaders()
      headers.authorization = 'Bearer ' + config.access_token
      return request(urls.contentUrl + `nodes?${suppress}`, headers, form)
            .then(JSON.parse)
    })

  request.overwrite = (id, fullpath) =>
    getUrls()
    .then((urls) => {
      const form = new FormData()
      form.append('content', fs.createReadStream(fullpath))

      const headers = form.getHeaders()
      headers.authorization = 'Bearer ' + config.access_token
      return request(urls.contentUrl + `nodes/${id}/content`, headers, form, 'PUT')
            .then(JSON.parse)
    })

  request.stream = (url, data, method, retry = 0) => {
    const options = urlParse(url)
    options.method = method || (data ? 'POST' : 'GET')
    options.headers = {
      'authorization': 'Bearer ' + config.access_token,
      'content-type': 'application/json',
      'accept-encoding': 'gzip'
    }

    return new Promise(function (resolve, reject) {
      const req = https.request(options, (res) => {
        // refresh token and retry...?
        if (res.statusCode === 401 && typeof config.refresh === 'function' && retry === 0) {
          return resolve(config.refresh()
            .then(() =>
              request.stream(url, data, method, ++retry))
          )
        }

        if (res.statusCode !== 200) {
          return reject(new Error(res.statusCode + ' ' + res.statusMessage))
        }

        let gz = res.headers['content-encoding'] === 'gzip'
        resolve(gz ? res.pipe(zlib.createGunzip()) : res)
      })
      .on('error', reject)

      if (data) {
        req.write(JSON.stringify(data))
      }
      req.end()
    })
  }

  return request
}
