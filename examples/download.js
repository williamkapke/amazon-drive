const auth = require('./auth.json')
const drive = require('../drive.js')({
  refresh: () => { throw new Error('GAH!') },
  access_token: auth.access_token
})

drive.nodes.download('2VnnFApJQOiou5cIv82PNw')
.then((stream) => {
  stream.pipe(process.stdout)
})
.catch((e) => {
  console.log(e.statusCode, e.statusMessage)
  console.log(e.headers)
  console.log(String(e))
})
