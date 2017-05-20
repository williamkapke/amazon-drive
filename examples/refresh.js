var auth = require('./auth.json')
const urls = require('./urls.json')
const req = require('get-then')
const fs = require('fs')
const dir = __dirname

const drive = require('../drive.js')({
  cache: () => Promise.resolve(urls),
  refresh: () =>
    req('https://data-mind-687.appspot.com/clouddrive?refresh_token=' + auth.refresh_token, { 'Content-Type': 'application/json' })
    .then(JSON.parse)
    .then(newAuth => {
      // console.log(JSON.stringify(newAuth, null, 2))
      fs.writeFile(dir + '/auth.json', JSON.stringify(newAuth, null, 2))
      return (auth = newAuth)
    }),

  get access_token () { return auth.access_token }
})

drive.account.info()
.then(console.log)
.catch(e => {
  if (e.statusCode) {
    console.log(e.statusCode, e.statusMessage)
    console.log(String(e))
  } else {
    console.log(e)
  }
})
