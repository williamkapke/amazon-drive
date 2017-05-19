const auth = require('./auth.json')
const drive = require('../drive.js')({
  refresh: () => { throw new Error('GAH!') },
  access_token: auth.access_token
})

function log (data) {
  console.log(JSON.parse(data))
}

drive.nodes.download('juuQyp8CSum1lLqTSMj7gg')
.then((stream) => {
  //
})
.catch((e) => {
  console.log(e.statusCode, e.statusMessage)
  console.log(e.headers)
  console.log(String(e))
})
