# Amazon Drive Node.js Client

Simple rest client based on the cloud drive API:
https://developer.amazon.com/public/apis/experience/cloud-drive/content/restful-api-getting-started

# Authentication
Amazon Drive uses the "Login with Amazon" to authenticate. It is an OAuth workflow that requires visiting an
Amazon login page. This means we need to jump through some hoops to get started. The good news is that you'll
get an `acceess_token` **and** a `refresh_token`-- which allows us to renew the credentials programmatically.

# Credits
Thanks to [@alex-phillips](https://github.com/alex-phillips) for the work on
[node-clouddrive](https://github.com/alex-phillips/node-clouddrive). I used hints in his code and leveraged
the authentication server he hosts to help get me started.

See:
* https://github.com/alex-phillips/node-clouddrive
* https://github.com/alex-phillips/node-clouddrive/issues/9
* https://github.com/alex-phillips/clouddrive-endpoint

# License
MIT
