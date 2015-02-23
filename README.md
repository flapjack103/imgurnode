imgurnode
============

Node package for interacting with the Imgur API. This is a port of the official Python Imgur API, imgurpython. See: https://github.com/Imgur/imgurpython

## Installation

```shell
  npm install imgurnode
```

## Usage Example

```js
  var ImgurClient = require('imgurnode');

  // Constructor params - Client ID, client secret, refresh token, access token
  var client = new ImgurClient(config.imgur.clientID, config.imgur.clientSecret, token);

  // Call init to validate access token
  // Will refresh access token if refresh token was passed into constructor
  client.init(function(err) {
    if(err) console.log(err);
    else console.log('Successfully refreshed access token');
  }

  // Get favorites for self
  client.getAccountFavorites('me', function(err, data) {
    if(err) console.log(err)
    else console.log('Favorites: ', data);
  });
```

## Supported API Calls

# Notes: 
* All callback params are in the form (err, data)
* 'me' can be used in place of username
* sort parameter options (may not apply to all API calls) - 'newest', 'viral', 'best', 'time'
* anon parameter set to true forces anonymous 

# Account-related API calls
* client.getAccount(username, callback)
* client.getGalleryFavorites(username, callback)
* client.getAccountFavorites(username, callback)
* client.getAccountSubmissions(username, pageNumber, callback)
* client.getAccountSettings(username, callback)
* client.getAccountAlbums(username, pageNumber, callback)
* client.getAccountAlbumIds(username, pageNumber, callback)
* client.getAccountAlbumCount(username, callback)
* client.getAccountComments(username, sort, pageNumber, callback)
* client.getAccountCommentIds(username, sort, pageNumber, calllback)
* client.getAccountCommentCount(username, callback)
* client.getAccountImages(username, pageNumber, callback)
* client.getAccountImageIds(username, pageNumber, callback)
* client.getAccountImagesCount(username, callback)

# Image-related API calls
* client.getImage(imageId, callback)
* client.uploadImageFromURL(url, anon, callback)
* client.deleteImage(imageId, callback)
* client.favoriteImage(imageId, callback)

## Release History

* 0.1.0 Initial release