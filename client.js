var AuthWrapper = require('./auth');
var https = require('https');
var config = require('./config');

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

	this.makeRequest = function(method, path, data, force, callback) {

		var options = {
		    host: config.imgur.base_url,
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
		    	}
		    	catch(e) {
		    		throw new Error('Bad JSON response');
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
		    		//callback('Please refresh access token', null);
		    	}
		    	else if(statusCode == 429) {
		    		throw new Error('Rate limit error');
		    	}
		    	else {
		    		var err = data.data.error;
		    		callback(err, null);
			    }
		    });
		});

		if(method == 'POST' && data != null)
			req.write(data);

		req.end();
	}
}

ImgurClient.prototype.getAccount = function(username, callback) {
	this.validateUserContext(username);
	this.makeRequest('GET', '/account/' + username, null, false, function(err, data) {
		callback(err, data);
	});
}

ImgurClient.prototype.getGalleryFavorites = function(username, callback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/gallery_favorites';
	this.makeRequest('GET', path, null, false, function(err, data) {
		callback(err, data);
	});
}

ImgurClient.prototype.getAccountFavorites = function(username, callback) {
	this.validateUserContext(username);
	var path = '/account/' + username + '/favorites';
	this.makeRequest('GET', path, null, false, function(err, data) {
		callback(err, data);
	});
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

	this.makeRequest('POST', '/oauth2/token', data, true, function(err, data) {
		callback(err,data);
	});
}


module.exports = ImgurClient;


// TODO
// get_account_submissions(username, page=0)
// get_account_settings(username)
// change_account_settings(username, fields)
// get_email_verification_status(username)
// send_verification_email(username)
// get_account_albums(username, page=0)
// get_account_album_ids(username, page=0)
// get_account_album_count(username)
// get_account_comments(username, sort='newest', page=0)
// get_account_comment_ids(username, sort='newest', page=0)
// get_account_comment_count(username)
// get_account_images(username, page=0)
// get_account_image_ids(username, page=0)
// get_account_album_count(username)