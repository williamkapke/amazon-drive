const auth = require('./auth.json')
const drive = require('../drive.js')({
  refresh: () => {
    throw new Error('GAH!')
  },
  access_token: auth.access_token
})

const log = (data) => console.log(data) || data

drive.nodes.list({ limit: 2, filters: 'kind:FILE AND name:Pictures.*' }).then(log)
.then((results) => {
  drive.nodes.get(results.data[0].id).then(console.log)
})
.catch((e) => {
  console.error(e.statusCode, e.statusMessage)
  console.error(e.headers)
  console.error(String(e))
})
