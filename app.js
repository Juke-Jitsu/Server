var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var array = require('array');

var gmusic = require('./api/gmusic.js');
var Player = require('./api/player.js');
var bufferSong = require('./api/bufferedSong.js');

var config = require('./config.json');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var self = this;

app.use(favicon(path.join(__dirname, 'public/src/img/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(config.client)); 

self.songQueue = new array();
self.songHistory = new array();
self.player = new Player();
self.nowPlaying= null;


/* "Main" */
self.songQueue.on('change', function(){
    console.log(self.player.bufferNewSong());
    if(self.player.bufferNewSong() && self.songQueue.length !== 0){
        var song = self.songQueue.last();
        bufferSong(song.nid, function(song) {
            if (song.length !== 0) {
                self.player.setNext(song);
                self.player.play();
            }
        });
    }else{
        console.log("Kaleb does not know what to do here");
    }
});

self.player.on('finish', function(){
    console.log("Song finished, playing next in Queue...");
    if(self.songQueue.length !== 0){
        self.songHistory.push(self.songQueue.shift());
    }
    console.log(self.songHistory);
});



require('./SocketSetup')(io, self.songQueue);

/* Routes */
app.get('/api/search', function(req, res){
    gmusic.search(req.query.str, function(results){
        res.json(results);
    });
});

app.post('/api/addQ', function(req, res){
    var metaData = req.body;
    if(!self.songQueue.has(metaData) && metaData !== '{}'){
        self.songQueue.push(metaData);
    }
    res.json(self.songQueue);
});

app.post('/api/rmQ', function(req, res){
    var pos = self.songQueue.indexOf(req.query);
    self.songQueue.splice(pos,1);
    res.json(self.songQueue);
});

app.get('/api/getQ', function(req, res){
    res.json(self.songQueue);
});

//ISSUE: need to refresh queue view after clear
app.post('/api/clearQ', function(req, res){
    self.songQueue.length = [];
    self.player.clearPlayer();
    res.send("Queue Cleared");
});

app.post('/api/upvote', function(req, res){
    var target = req.body.nid;
    if(target !== null){
        var ret = {nid: target, "status":"unchanged"};
        for(var i = 0; i < self.songQueue.length; ++i){
            if(self.songQueue[i].nid === target){
                self.songQueue[i].score++;
				self.songQueue.sort('score', 'descending');
                ret["status"] = "upvoted";
            }
        }
    }
    res.json(ret);
});

app.post('/api/downvote', function(req, res){
    var target = req.body.nid;
    if(target !== null){
        var ret = {nid: target, "status":"unchanged"};
        for(var i = 0; i < self.songQueue.length; ++i){
            if(self.songQueue[i].nid === target){
                self.songQueue[i].score--;
                self.songQueue.sort('score', 'descending');
                ret["status"] = "downvoted";
            }
        }
    }
    res.json(ret);
});

app.post('/api/playQ', function(req, res) {
    self.player.play();
    res.send("PlayQ");
});

app.post('/api/pauseQ', function(req, res){
    self.player.pause();
    res.send("PauseQ")
});

app.post('/api/skipQ', function(req, res){
    self.player.next();
    res.send("SkipQ");
});

//Maybe use this terrible idea later #2muchdrank
//app.post('/api/nuke', function(req, res){
//    res.send("nuke(uid, mid)");
//});
//
//app.post('/api/partyHat', function(req, res){
//    res.send("partyHat(uid, mid)");
//});

//app.post('/api/adjustVolume', function(req, res){
//    res.send("adjustVolume(value)");
//});
//
//app.post('/api/getPartyInfo', function(req, res){
//    res.json(config.PartyInfo);
//});

/* error handlers */
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

module.exports = http;

