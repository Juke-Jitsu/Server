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

    startServer: function () {
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

                // If this song hasn't been voted on..
                if (!songQueue[i].votes) {
                    songQueue[i].votes = {};
                }

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

    }

}

module.exports = app;

