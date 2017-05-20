const auth = require('./auth.json')
const path = require('path')
const drive = require('../drive.js')({
  refresh: () => { throw new Error('GAH!') },
  access_token: auth.access_token
})

drive.nodes.upload(path.resolve(__dirname, '../drive.js'))
.then(console.log)
.catch((e) => {
  console.log(e.statusCode, e.statusMessage)
  console.log(e.headers)
  console.log(String(e))
})
