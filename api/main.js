var gmusic = require('./gmusic.js');
var array = require('array');
var Player = require('./player.js');
var www = require('../bin/www');
var bufferSong = require('./bufferedSong.js');

var songHistory = new array();

var player = new Player();

/**
 * Entire history that's been played
 */
var songHistory = [];

var songQueue = new array();

var nowPlaying = null;

songQueue.on('change', function () {
    console.log(player.bufferNewSong());
    if (player.bufferNewSong() && songQueue.length !== 0) {
        var song = songQueue.last();
        bufferSong(song.nid, function (song) {
            if (song.length !== 0) {
                player.setNext(song);
                player.play();
            }
        });
    } else {
        console.log("Kaleb does not know what to do here");
    }
});

player.on('finish', function () {
    console.log("Song finished, playing next in Queue...");
    if (songQueue.length !== 0) {
        songHistory.push(songQueue.shift());
    }
    console.log(songHistory);
});

var app = {

    startServer : function () {
        www.startServer();
    },


    search : function (searchText, cb) {
        gmusic.search(searchText, cb);
    },
    
    clearQueue : function () {
        songQueue.length = [];
        player.clearPlayer();
    },
    
    addSongToQueue : function (song) {
        if (!songQueue.has(song) && song !== '{}') {
            songQueue.push(song);
        }
    },
    
    removeSongFromQueue : function (song) {
        var pos = songQueue.indexOf(song);
        songQueue.splice(pos, 1);
    },
    
    getHistory : function () {
        return songHistory;
    },
    
    getSongQueue : function () {
        return songQueue;
    },
    
    playQueue : function () {
        player.play();
    },
    
    pauseQueue : function () {
        player.pause();
    },
    
    skipQueue : function () {
        player.next();
    },

    /**
     * Finds a song with nid matching target and increments the vote
     * If the song is found and incrememnted it returns true.
     * 
     * If something goes wrong and can not find the song returns false
     */
    upVote : function (target) {
        for (var i = 0; i < songQueue.length; ++i) {
            if (songQueue[i].nid === target) {
                songQueue[i].score++;
                songQueue.sort('score', 'descending');
                return true;
            }
        }
        return false;
    },

    downVote : function (target) {
        for (var i = 0; i < songQueue.length; ++i) {
            if (songQueue[i].nid === target) {
                songQueue[i].score--;
                songQueue.sort('score', 'descending');
                return true;
            }
        }
        return false;
    }

}

module.exports = app;

