const auth = require('./auth.json')
const path = require('path')
const drive = require('../drive.js')({
  refresh: () => { throw new Error('GAH!') },
  access_token: auth.access_token
})

function log (data) {
  console.log(JSON.parse(data))
  return data
}

drive.nodes.upload(path.resolve(__dirname, '../drive.js'))
.then(log)
.then((info) =>
  // this _probably_ won't be ready right away... It seems
  // to take little bit on Amazon's side to before it is available
  drive.nodes.download(info.id).then((stream) => {
    stream.pipe(process.stdout)
  })
)
.catch((e) => {
  console.log(e.statusCode, e.statusMessage)
  console.log(e.headers)
  console.log(String(e))
})
