var SocketMessageType = require('juke-protocols');
var ToClientMessages = SocketMessageType.ToClientMessages;
var ToServerMessages = SocketMessageType.ToServerMessages;
var api = require("./api/main");

module.exports = function (io) {

    var lastMessage = ""

    api.getGreetingMessage$().subscribe(function (message) {
        lastMessage = message;
        io.emit(ToClientMessages.GreetingMessage, message);
    });

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

        // Send what's in the queue immediately
        socket.emit(ToClientMessages.EntireQ, api.getSongQueue());
        socket.emit(ToClientMessages.GreetingMessage, lastMessage);

        socket.on(ToServerMessages.AddToQ, function (songToAdd) {
            if (!api.getSongQueue().has(songToAdd) && songToAdd !== '{}') {
                api.addSongToQueue(songToAdd);
            }
        });


        socket.on(ToServerMessages.SetVote, function (vote) {
            api.setVote(vote);
            io.emit(ToClientMessages.EntireQ, api.getSongQueue());
        })

    });

};
