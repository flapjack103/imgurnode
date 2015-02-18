var ImgurClient = require('./client');
var imgurTestRefreshToken = '4b71b351b62624f553cdd1638d2994974daafaa6'

var client = new ImgurClient(imgur_id, imgur_secret, imgurTestRefreshToken);

client.init(function(err) {
	if(err) {
		console.log('Could not obtain access token');
	}
	else {
		client.getAccountFavorites('me', function(err, data) {
			if(err) console.log(err);
			else console.log(data);
		});

		client.getGalleryFavorites('me', function(err, data) {
			if(err) console.log(err);
			else console.log(data);
		});
	}
});
