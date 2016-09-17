var PlayMusic = require('playmusic');
var fs = require('fs');
var util = require('util');
var http = require('http');

var pm = new PlayMusic();
var config = require('../config.json');

pm.login({email: config.email, password: config.password, androidId: config.androidId}, function (err, resp) {
    if (err)
        console.error(err, resp);
});

pm.init(config, function (err) {
    if (err)
        console.error(err);
});

var search = function (searchString, cb) {
    pm.search(searchString, 12, function (err, data) { // max 12 to make a gut grid luls
        if (data.entries !== undefined) {

            var song = data.entries.sort(function (a, b) { // sort by match score
                return a.score < b.score;
            });
            
            cb(song);

        } else {
            cb({"results":"none"});
        }
    }, function (message, body, err, httpResponse) {
        cb(message);
    });

};

var getStreamUrl = function(songId, cb){
    pm.getStreamUrl(songId, function(err, resp) {
        cb(err, resp);
    });
};

/*var getLibrary = pm.getLibrary(function(err, library) {
         if(err) console.error(err);
         var song = library.data.items.pop();
         console.log(song);
         pm.getStreamUrl(song.id, function(err, streamUrl) {
             if(err) console.error(err);
             console.log(streamUrl);
         });
});*/
    
/*var getPlayLists = pm.getPlayLists(function(err, data) {
         console.log(data.data.items);
});*/
   
/*var getPlayListEntries = pm.getPlayListEntries(function(err, data) {
        console.log(data.data.items);
});*/

/*var getAlbum = pm.getAlbum("Bw2kk345y5ivx4m35tflhzsvg6a", true, function(err, data) {
       console.log(util.inspect(data, {color: true, depth: 10}));
});*/

/*var getStations = pm.getStations(function(err, data) {
       if(err) console.error(util.inspect(err, {color: true, depth: 10}));
       console.log(util.inspect(data, {color: true, depth: 10}));
});*/

/*var createStation = pm.createStation("test123123123", "Tslarazlflb7nou3ljjtyxutbji", "track", function(err, data) {
      if(err) console.error(util.inspect(err, {color: true, depth: 10}));
      console.log(util.inspect(data, {color: true, depth: 10}));
             pm.getStationTracks("95d01d83-05b6-3053-a83e-7f7280f529bc", 10, function(err, data) {
                 if(err) console.error(util.inspect(err, {color: true, depth: 10}));
                 console.log(util.inspect(data, {color: true, depth: 10}));
             });
});*/

module.exports = {
    "search": search,
    "getStreamUrl": getStreamUrl
};
