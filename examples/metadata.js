const auth = require('./auth.json')
const drive = require('../drive.js')({
  refresh: () => {
    throw new Error('GAH!')
  },
  access_token: auth.access_token
})

function log (data) {
  console.log(JSON.parse(data))
}

drive.nodes.list({ limit: 2, filters: 'kind:FILE AND name:Pictures.*' }).then(log)
.then(() => {
  drive.nodes.get('-pTvp3NERJqBTY5jfCm2BQ').then(log)
})
.catch((e) => {
  console.log(e.statusCode, e.statusMessage)
  console.log(e.headers)
  console.log(String(e))
})
