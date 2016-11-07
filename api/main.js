var gmusic = require('./gmusic.js');
var array = require('array');
var Player = require('./player.js');
var www = require('../bin/www');
var bufferSong = require('./bufferedSong.js');
var config = require('../config.json');
var Rx = require('rx');
var ShadowCopy = require('./shadowcopy.js');
var fs = require('fs');

var songQueue = new array();
var player = new Player();
var nowPlaying = null;

ShadowCopy(songQueue, gmusic);

/* Entire history that's been played */
var songHistory = new array();

var greetingMessage$ = new Rx.ReplaySubject(1);
var nowPlaying$ = new Rx.ReplaySubject(1);

var users = {};

greetingMessage$.onNext(config.greetingMessage);

function play(){
    if(nowPlaying === null && songQueue.length !== 0){
        nowPlaying = songQueue.shift();
        nowPlaying$.onNext(nowPlaying);
        bufferSong(nowPlaying.nid, function(nowPlaying){
            if(nowPlaying.length !== 0){
                console.log('playing song');
                player.play(nowPlaying);
            }
        });
    }
}

songQueue.on('add', play);

player.on('finish', function () {
    console.log("Song finished, playing next in Queue...");
    if (songQueue.length !== 0) {
        songHistory.push(nowPlaying);
    }
    nowPlaying = null;
    nowPlaying$.onNext(nowPlaying);
    console.log(songHistory);
    play();
});

var app = {

    startServerWithShadow: function() {
        www.startServer();
    }, 

    startServer: function () {

        fs.unlink('./queue.shadow', function(err){
            if (err && err.code == 'ENOENT')
                return console.log ("Error starting server clean: ",err);
        });

        www.startServer();
    },


    search: function (searchText, cb) {
        gmusic.search(searchText, cb);
    },

    clearQueue: function () {
        songQueue.length = [];
        player.clearPlayer();
    },

    addSongToQueue: function (song) {
        if (!songQueue.has(song) && song !== '{}') {
            song.score = 0;
            song.votes = {};
            songQueue.push(song);
        }
    },

    removeSongFromQueue: function (song) {
        var pos = songQueue.indexOf(song);
        songQueue.splice(pos, 1);
    },

    getHistory: function () {
        return songHistory;
    },

    getSongQueue: function () {
        return songQueue;
    },

    playQueue: function () {
        player.play();
    },

    pauseQueue: function () {
        player.pause();
    },

    skipQueue: function () {
        player.next();
    },

    /**
     * Set's the user's vote for a specific song in the queue
     *
     * @returns boolean True if succesfully set, else false
     */
    setVote: function (vote) {

        if (!vote.nid || !vote.uid || !vote.vote) {
            console.log("Invalid vote: ", vote);
            return false;
        }

        for (var i = 0; i < songQueue.length; ++i) {
            if (songQueue[i].nid === vote.nid) {

                // set the users vote
                songQueue[i].votes[vote.uid] = vote.vote;

                // recalculate score
                var score = 0;
                for (var key in songQueue[i].votes) {
                    score += songQueue[i].votes[key];
                }

                // Set score and sort
                songQueue[i].score = score;
                songQueue.sort('score', 'descending');
                return true;
            }
        }

    },

    getPlayer: function (){
        return player;
    },

    getGreetingMessage$: function () {
        return greetingMessage$;
    },

    setGreetingMessage: function (message) {
        greetingMessage$.onNext(message);
    },

    getNowPlaying$: function() {
        return nowPlaying$;
    },

    setUsersName: function(uid, name) {
        if(!users[uid]){
            users[uid] = {};
        }
        users[uid].name = name;
    },

    /**
     * Returns true if password matches what's in the config, else false.
     */
    setUsersPassword: function(uid, password){
        if(!users[uid]){
            users[uid] = {};
        }
        users[uid].password = password;
        return password === config.adminPassword;
    }

}

module.exports = app;
