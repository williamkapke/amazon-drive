const auth = require('./auth.json')
const drive = require('../drive.js')({
  refresh: () => {
    throw new Error('GAH!')
  },
  access_token: auth.access_token
})

drive.account.endpoint().then(console.log)
.then(() =>
  drive.account.info().then(console.log)
)
.then(() =>
  drive.account.quota().then(console.log)
)
.then(() =>
  drive.account.usage().then(console.log)
)
.catch((e) => {
  console.log(e.statusCode, e.statusMessage)
  console.log(e.headers)
  console.log(String(e))
})
