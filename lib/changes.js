const https = require('https')
const zlib = require('zlib')
const urlParse = require('url').parse
const eachline = require('eachline')

module.exports = (config, urls) =>
  (data, onchunk) =>
    urls()
    .then((urls) => {
      const options = urlParse(urls.metadataUrl + 'changes')
      options.method = 'POST'
      options.headers = {
        'authorization': 'Bearer ' + config.access_token,
        'content-type': 'application/json',
        'accept-encoding': 'gzip'
      }

      return new Promise(function (resolve, reject) {
        const req = https.request(options, (res) => {
          res
          .on('close', reject)
          .on('end', () => resolve(res))
          .pipe(zlib.createGunzip())
          .pipe(eachline((line) =>
            onchunk(JSON.parse(line))
          ))
        })
        .on('error', reject)

        if (data) {
          req.write(JSON.stringify(data))
        }
        req.end()
      })
    })
