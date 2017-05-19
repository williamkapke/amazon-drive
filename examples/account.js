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

drive.account.endpoint().then(log)
.then(() =>
  drive.account.info().then(log)
)
.then(() =>
  drive.account.quota().then(log)
)
.then(() =>
  drive.account.usage().then(log)
)
.catch((e) => {
  console.log(e.statusCode, e.statusMessage)
  console.log(e.headers)
  console.log(String(e))
})
