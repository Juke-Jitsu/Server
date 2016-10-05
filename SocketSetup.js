var SocketMessageType = require('juke-protocols');
var ToClientMessages = SocketMessageType.ToClientMessages;
var ToServerMessages = SocketMessageType.ToServerMessages;
var api = require("./api/main");

module.exports = function (io) {

    /**
     * Keep up with the last set greeting message for newly connecting users
     */
    var lastGreetingMessage = "";

    /**
     * Keep up with the last set now playing song for newly connecting users
     */
    var lastNowPlaying = null;

    // Keep users updated with the greeting message
    api.getGreetingMessage$().subscribe(function (message) {
        lastGreetingMessage = message;
        io.emit(ToClientMessages.GreetingMessage, message);
    });

    // Keep users updated with what's now playing
    api.getNowPlaying$().subscribe(function(nowPlaying) {
        lastNowPlaying = nowPlaying;
        io.emit(ToClientMessages.NowPlaying, nowPlaying);
    });

    // Whenever a song finished up send the users the new queue
    api.getPlayer().on('finish', function () {
        io.emit(ToClientMessages.EntireQ, api.getSongQueue());
    });

    /**
     * Whenever the queue changes send the whole thing through.
     *
     * TODO: This can be optimized to only send what actually gets changed.
     *       Said solution would introduce more complexity in syncing up and
     *       making sure everyone sees the same thing so this sort of thing
     *       should probably happen wayyy later down the road.
     */
    api.getSongQueue().on('change', function () {
        io.emit(ToClientMessages.EntireQ, api.getSongQueue());
    });

    io.on('connection', function (socket) {

        console.log("User Connected!");

        // Update newly connected users to what's going on
        socket.emit(ToClientMessages.EntireQ, api.getSongQueue());
        socket.emit(ToClientMessages.GreetingMessage, lastGreetingMessage);
        socket.emit(ToClientMessages.NowPlaying, lastNowPlaying);

        // Whenever a user adds something to the queue
        socket.on(ToServerMessages.AddToQ, function (songToAdd) {
            if (!api.getSongQueue().has(songToAdd) && songToAdd !== '{}') {
                api.addSongToQueue(songToAdd);
            }
        });

        // Whenever a user votes on a song
        socket.on(ToServerMessages.SetVote, function (vote) {
            api.setVote(vote);
            io.emit(ToClientMessages.EntireQ, api.getSongQueue());
        });

        socket.on(ToServerMessages.SetUsername, function (name) {
            api.setUsersName(name);
        })

        socket.on(ToServerMessages.SetAdminPassword, function (pw) {
            console.log(pw);
            io.emit(ToClientMessages.SetAdminPrivledgeLevel, api.setUsersPassword(pw.ui, pw.password));
        })

    });

};
