// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/emsfind',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || '4hmbv0B38u8tf7LbiD6CfZm8PogcfuIgWQw4dm6V',
  masterKey: process.env.MASTER_KEY || 'dGwu8i63F3b3aPTnoJ1D3WFYm6iSu8ArgYJZMfCp', //Add your master key here. Keep it secret!
  fileKey: process.env.FILE_KEY || '', // Add the file key to provide access to files already hosted on Parse
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  push: {
    android: {
      senderId: '944041523763', // The Sender ID of GCM
      apiKey: 'AIzaSyA4bYnKSdEFYb63C0hfehJnbNlHDttI-RA' // The Server API Key of GCM
    },
    ios: [
      {
        pfx: __dirname + '/keys/CertificatesDev.p12', // Dev PFX or P12
        bundleId: 'com.emsfind.app',
        production: false // Dev
      },
      {
        pfx: __dirname + '/keys/CertificatesProd.p12', // Prod PFX or P12
        bundleId: 'com.emsfind.app',  
        production: true // Prod
      }
    ]
  },
  oauth: {
   twitter: {
     consumer_key: "BP3dLcZbMdR3Rt6nMafm3Rvbj", // REQUIRED
     consumer_secret: "vfrgKLPKYNmBEskgedieoPB9P609VHnR3sXV3Rjgycbheabpy7" // REQUIRED
   },
   facebook: {
     appIds: "984811911596902"
   }
  },
  clientKey: 's60hMEKTW2bBu5p0vuMIIiLysU4zyU9vxfmT79PX',
  verbose: false
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('Make sure to star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
