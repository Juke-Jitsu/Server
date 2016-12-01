var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var config = require('./config.json');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var api = require("./api/main");

var self = this;

app.use(favicon(path.join(__dirname, 'public/src/img/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

require('./SocketSetup')(io);

/* Routes */
app.get('/api/search', function (req, res) {
    api.search(req.query.str, function (results) {
        res.json(results);
    });
});

app.post('/api/addQ', function (req, res) {
    api.addSongToQueue(req.body);
    res.json(api.getSongQueue());
});

app.post('/api/rmQ', function (req, res) {
    api.removeSongFromQueue(req.query)
    res.json(api.getSongQueue());
});

app.get('/api/getQ', function (req, res) {
    res.json(api.getSongQueue());
});

//ISSUE: need to refresh queue view after clear
app.post('/api/clearQ', function (req, res) {
    api.clearQueue();
    res.send("Queue Cleared");
});

app.post('/api/playQ', function (req, res) {
    api.playQueue();
    res.send("PlayQ");
});

app.post('/api/pauseQ', function (req, res) {
    api.pauseQueue();
    res.send("PauseQ")
});

app.post('/api/skipQ', function (req, res) {
    api.skipQueue();
    res.send("SkipQ");
});

app.use(express.static(config.client));

/* error handlers */
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: {}
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

module.exports = http;

