# Amazon Drive Node.js Client

Simple rest client based on the cloud drive API:<br>
https://developer.amazon.com/public/apis/experience/cloud-drive/content/restful-api-getting-started

This is a `Promise` based API.

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Authentication
Amazon Drive uses the "Login with Amazon" to authenticate. It is an OAuth workflow that requires visiting an
Amazon login page. This means we need to jump through some hoops to get started. The good news is that you'll
get an `acceess_token` **and** a `refresh_token`-- which allows us to renew the credentials programmatically.

### The auth object
In the examples you will see `request('./auth.json')`. This file contains the auth object return from a
successful OAuth response. It will look like this:
```js
{
  "access_token": "Atza|<really_long_string_of_characters>",
  "refresh_token": "Atzr|<really_long_string_of_characters>",
  "token_type": "bearer",
  "expires_in": 3600
}
```

## The basics
The javascript API matches the REST API the best it can.
```js
let urlsCache
const drive = require('amazon-drive')({
  cacheUrls: (urls) => {
    // urls passed in: save them
    if (urls) urlsCache = urls
    return Promise.resolve(urlsCache)
  },
  refresh: () => {
    // When this OAuth token expires (401 returned) this will be called.
    // You will need to refresh the token and return an updated auth object.
    // See: examples/refresh.js
  }
})

// get the urls for your account and cache them
drive.getUrls()
.then((urls) => {
  console.log(urls.metadataUrl)
  console.log(urls.contentUrl)
})
.catch(console.error)
```

## API
### Account
#### drive.getUrls()
All endpoints will call this internally to retrieve the account's endpoints. If they are retrieved
from the Amazon Drive API, it will call `cacheUrls(urls)` for you to cache them somewhere. Amazon
requests that they be cached for 3 to 5 days.

#### drive.account.endpoint()
This is what `drive.getUrls()` calls- but without caching.

#### drive.account.info()
#### drive.account.quota()
#### drive.account.usage()

### Nodes (Files & Folders)
#### drive.nodes.upload(fullpath, metadata = {}, suppress = false)
#### drive.nodes.overwrite(id, fullpath)
#### drive.nodes.download(id)

#### drive.nodes.create(name, metadata = {})
Creates a folder
#### drive.nodes.get(id, options = undefined)
#### drive.nodes.patch(id, properties)
#### drive.nodes.list(options)
#### drive.nodes.list.all(filters = undefined)

#### drive.nodes.children.add(parent, child)
#### drive.nodes.children.move(child, oldParent, newParent)
#### drive.nodes.children.delete(parent, child)
#### drive.nodes.children.list(parent, options = undefined)

#### drive.nodes.properties.add(id, owner, key, value)
#### drive.nodes.properties.get(id, owner, key)
#### drive.nodes.properties.delete(id, owner, key)
#### drive.nodes.properties.list(id, owner)

### Trash
#### drive.trash.add(id)
#### drive.trash.list(options = undefined)
#### drive.trash.restore(id)

### Changes
#### drive.changes(options = undefined)

## Credits
Thanks to [@alex-phillips](https://github.com/alex-phillips) for the work on
[node-clouddrive](https://github.com/alex-phillips/node-clouddrive). I used hints in his code and leveraged
the authentication server he hosts to help get me started.

See:
* https://github.com/alex-phillips/node-clouddrive
* https://github.com/alex-phillips/node-clouddrive/issues/9
* https://github.com/alex-phillips/clouddrive-endpoint

# License
[MIT Copyright (c) William Kapke](/LICENSE)
