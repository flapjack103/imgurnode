var express = require('express')
  , app = express()
  , http = require('http')
  , config = require('./config')
  , ImgurClient = require('./lib/imgurClient');

var FAV_FIELDS = ['id', 'link', 'is_album', 'animated', 'type'];

app.set('port', (process.env.PORT || config.app.port));

app.get('/favorites/token/:tokenID', function(req, res) {
	var token = req.params.tokenID;
	if(!token) {
		res.status(400).send({'error':'No refresh token'});
		return;
	}

	var client = new ImgurClient(config.imgur.clientID, config.imgur.clientSecret, token);
	client.init(function(err) {
		if(err) res.status(400).send({'error':err});
		else {
			client.getAccountFavorites('me', function(err, data) {
				if(err) res.status(400).send({'error':err});
				else {
					var dataShort = getInterestingFields(FAV_FIELDS, data.data);
					res.status(200).send({'data':dataShort});
				}
			});
		}
	});
});

// Make this https eventually
http.createServer(app).listen(app.get('port'), function() {
	console.log('Server listening on ' + app.get('port'));
});


// Return slim data set with only the properties listed in fields
function getInterestingFields(fields, data) {
	var dataOut = [];
	var dataLen = data.length;
	var fieldLen = fields.length;

	for(var i = 0; i < dataLen; i++) {
		var item = data[i];
		var itemShort = {};
		for(var j = 0; j < fieldLen; j++) {
			var field = fields[j];
			itemShort[field] = item[field];
		}
		dataOut.push(itemShort);
	}
	return dataOut;
}