var gmusic = require('./gmusic.js');
var https = require('https');
var url = require('url');
var stream = require('stream');

BufferedSong = function(songId, callback){
    var self = this;

    self.songId = songId;

    gmusic.getStreamUrl(self.songId, function(err, result){
        if(!err){
            var songUrl = url.parse(result, false, true);
            var options = {
                host: songUrl.host,
                port: '443',
                path: songUrl.path,
                headers: {
                    'Content-Type': 'audio/mpeg'
                }
            };

            var req = https.get(options, function(res){
                var rs = new stream.Readable();
                res.on('data', function(chunk) {
                    rs.push(chunk);
                });
                res.on('end', function() {
                    console.log("Closing Connection...");
                    rs.push(null);//signifies end of stream
					if(rs.length != 0){
						callback(rs);
					} else {
						console.log("Stream is empty");
					}
                });
            }).on('error', function(e) {
                console.log("Got error: " + e.message);
            });
            console.log("Found url: " + songUrl.href);
        }else{
            console.log(err);
        }
    });
};
module.exports = BufferedSong;


