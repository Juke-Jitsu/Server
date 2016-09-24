/* 
 * The MIT License
 *
 * Copyright 2016 Eli.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


var SocketMessageType = require('juke-protocols');
var ToClientMessages = SocketMessageType.ToClientMessages;
var ToServerMessages = SocketMessageType.ToServerMessages;
var api = require("./api/main");

module.exports = function (io) {

    io.on('connection', function (socket) {

        console.log("User Connected!");

        // Send what's in the queue immediately
        socket.emit(ToClientMessages.EntireQ, api.getSongQueue());

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


        socket.on(ToServerMessages.AddToQ, function (songToAdd) {
            if (!api.getSongQueue().has(songToAdd) && songToAdd !== '{}') {
                api.addSongToQueue(songToAdd);
            }
        });


        socket.on(ToServerMessages.SetVote, function (vote){
            api.setVote(vote);
        })
  
    });

};