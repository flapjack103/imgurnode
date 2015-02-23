var https = require('https');
var AuthWrapper = require('./auth');
var config = {};
config.imgurAPI= 'api.imgur.com';

function ImgurClient(clientID, clientSecret, refreshToken, accessToken) {
	this.clientID = clientID;
	this.clientSecret = clientSecret;
	this.accessToken = accessToken ? accessToken : null;
	this.refreshToken = refreshToken ? refreshToken : null;

	if(refreshToken) {
		this.auth = new AuthWrapper(accessToken,refreshToken, this.clientID, this.clientSecret);
	}

	this.init = function(callback) {
		if(!accessToken) {
			this.auth.refresh(function(err) {
				if(err) callback(err);
				else callback(null);
			});
		}
	}

	this.validateUserContext = function(username) {
		if(username == 'me' && this.auth == null)
			throw new Error('\'me\' can only be used in the authenticated context.');
	}

	this.loggedIn = function() {
		if(!this.auth)
			throw new Error('Must be logged in to complete this request');
	}

	this.makeRequest = function(method, path, data, force, callback) {

		var options = {
		    host: config.imgurAPI,
		    port: 443,
		    path: '/3' + path,
		    method: method,
		    headers: {}
		};

		if(method == 'POST')
			options.headers = {
		        'Content-Type': 'application/x-www-form-urlencoded',
		        'Content-Length': Buffer.byteLength(data)
		    };

		if(!this.auth || force) {
			if(!this.clientID)
				throw new Error('No client credentials found!');
			else
				options.headers['Authorization'] = 'Client-ID ' + this.clientID;
		}
		else {
			options.headers['Authorization'] = 'Bearer ' + this.auth.getAccessToken();
		}

		var that = this;
		var req = https.request(options, function(res) {
		    res.setEncoding('utf8');
		    var statusCode = res.statusCode;
		    var data = '';

		    res.on('data', function (chunk) {
		    	data += chunk;
		    });

		    res.on('end', function() {
		    	console.log('STATUS: ' + statusCode);
		    	try {
		    		data = JSON.parse(data);
		    	} catch(e) {
		    		callback(new Error('Bad JSON response'), null);
		    	}

		    	if(statusCode == 200) {
		    		callback(null, data);
		    	}
		    	else if(statusCode == 403 && that.auth) {
		    		console.log('Refreshing access token');
		    		that.auth.refresh(function(err) {
		    			if(!err)
		    				that.makeRequest(method, path, data, false, callback);
		    		});	
		    	}
		    	else if(statusCode == 429) {
		    		callback(new Error('Rate limit error'), null);
		    	}
		    	else {
		    		if(data.data && data.data.error) {
			    		var err = data.data.error;
			    		callback(err, null);
			    	}
			    	else callback(new Error('Unknown error occurred'), null);
			    }
		    });
		});

		if(method == 'POST' && data != null)
			req.write(data);

		req.end();
	}
}

ImgurClient.prototype.authorize = function(response, grantType, callback) {
	var data = {};
	data.client_id = this.clientID;
	data.client_secret = this.clientSecret;
	data.grant_type = grantType ? grantType : 'pin';

	if(grantType == 'authorization_code')
		data.code = response;
	else
		data.grant_type = response;

	this.makeRequest('POST', '/oauth2/token', data, true, callback);
}

// Account-related endpoints
ImgurClient.prototype.getAccount = function(username, callback) {
	this.validateUserContext(username);
	this.makeRequest('GET', '/account/' + username, null, false, callback);
}

ImgurClient.prototype.getGalleryFavorites = function(username, callback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/gallery_favorites';
	this.makeRequest('GET', path, null, false, callback);
}

ImgurClient.prototype.getAccountFavorites = function(username, callback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/favorites';
	this.makeRequest('GET', path, null, false, callback);
}

ImgurClient.prototype.getAccountSubmissions = function(username, page, callback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/submissions/' + page;
	this.makeRequest('GET', path, null, false, callback);
}

ImgurClient.prototype.getAccountSettings = function(username, callback) {
	this.loggedIn();
	var path = '/account/' + username + '/settings';
	this.makeRequest('GET', path, null, false, callback);
}

ImgurClient.prototype.changeAccountSettings = function(username, fields, callback) {
 //TODO
}

ImgurClient.prototype.getAccountAlbums = function(username, page, callback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/albums/' + page;
	this.makeRequest('GET', path, null, false, callback);
}

ImgurClient.prototype.getAccountAlbumIds = function(username, page, callback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/albums/ids/' + page;
	this.makeRequest('GET', path, null, false, callback);
}

ImgurClient.prototype.getAccountAlbumCount = function(username, callback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/albums/count';
	this.makeRequest('GET', path, null, false, callback);
}

ImgurClient.prototype.getAccountComments = function(username, sort, page, callback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/comments/' + sort + '/' + page;
	this.makeRequest('GET', path, null, false, callback);
}

ImgurClient.prototype.getAccountCommentIds = function(username, sort, page, calllback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/comments/ids/' + sort + '/' + page;
	this.makeRequest('GET', path, null, false, callback);
}

ImgurClient.prototype.getAccountCommentCount = function(username, callback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/comments/count';
	this.makeRequest('GET', path, null, false, callback);
}

ImgurClient.prototype.getAccountImages = function(username, page, callback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/images/' + page;
	this.makeRequest('GET', path, null, false, callback);
}

ImgurClient.prototype.getAccountImageIds = function(username, page, callback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/images/ids/' + page;
	this.makeRequest('GET', path, null, false, callback);
}

ImgurClient.prototype.getAccountImagesCount = function(username, callback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/images/count';
	this.makeRequest('GET', path, null, false, callback);
}

// Image-related endpoints
ImgurClient.prototype.getImage = function(imageId, callback) {
	var path = '/image/' + imageId;
	this.makeRequest('GET', path, null, false, callback);
}

ImgurClient.prototype.uploadImageFromURL = function(url, anon, callback) {
	var path = '/upload';
	var data = {};
	data.image = url;
	data.type = 'url';
	data.meta = {};

	this.makeRequest('POST', path, data, anon, callback);
}

ImgurClient.prototype.deleteImage = function(imageId, callback) {
	var path = '/image/' + imageId;
	this.makeRequest('DELETE', path, null, false, callback);
}

ImgurClient.prototype.favoriteImage = function(imageId, callback) {
	this.loggedIn();
	var path = '/image/' + imageId + '/favorite';
	this.makeRequest('POST', path, null, false, callback);
}

module.exports = ImgurClient;

