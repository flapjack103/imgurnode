var config = require('../config');
var querystring = require('querystring');
var https = require('https');

function sendPostReq(data, host, path, callback) {
	data = querystring.stringify(data);

	var options = {
	    host: host,
	    port: 443,
	    path: path,
	    method: 'POST',
	    headers: {
	        'Content-Type': 'application/x-www-form-urlencoded',
	        'Content-Length': Buffer.byteLength(data)
	    }
	};

	var req = https.request(options, function(res) {
	    res.setEncoding('utf8');
	    var statusCode = res.statusCode;
	    var data = '';

	    res.on('data', function (chunk) {
	    	data += chunk;
	    });

	    res.on('end', function() {
	    	data = JSON.parse(data);
	    	if(statusCode == 200) {
	    		callback(null, data.access_token);
	    	}
	    	else {
	    		var err = data.data.error;
	    		callback(err, null);
	    	}
	    });
	});

	req.write(data);
	req.end();
}

function AuthWrapper(accessToken, refreshToken, clientID, clientSecret) {
	this.accessToken = accessToken;

	this.getRefreshToken = function() {
		return refreshToken;
	};

	this.getAccessToken = function() {
		return this.accessToken;
	};

	// Refresh the access token
	this.refresh = function(callback) {
		var path = '/oauth2/token';
		var that = this;
		var data = {};
		data.refresh_token = refreshToken;
		data.client_id = clientID;
		data.client_secret = clientSecret;
		data.grant_type = 'refresh_token';

		sendPostReq(data, config.imgur.base_url, path, function(err, newAccessToken) {
			console.log('Setting new access token: ', newAccessToken);
			if(!err) that.accessToken = newAccessToken;
			else console.log('Refresh token error:', err);
			callback(err);
		});
	}
}

module.exports = AuthWrapper;