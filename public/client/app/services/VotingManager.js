/* 
 * The MIT License
 *
 * Copyright 2016 Eli Davis.
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


var Rx = require('rx');
module.exports = VotingManager;

/*
 * @ngInject
 */
function VotingManager($http, Toast, sessionManager) {

    var self = this;
    
    var _history = [];

    // This variable should never be changed as soon as the app starts up.
    var VOTING_HISTORY_STORAGE_NAME = "voting history";

    var _addToHistory = function(song) {
            _history.push(song);
            localStorage[VOTING_HISTORY_STORAGE_NAME] = JSON.stringify(_history);
    };

    var _clearHistory = function() { 
            localStorage[VOTING_HISTORY_STORAGE_NAME] = "{}";
    };

    var _loadHistory = function() {

        var loadResults = localStorage[VOTING_HISTORY_STORAGE_NAME];

        try {
                _history = JSON.parse(loadResults);
        } catch (e) {
                _history = [];
        }

    };

    _loadHistory();

    self.getCurrentVoteOnSong = function (nid) {

        var cur = 0;

        // Start from the bottom and work up.  Higher up in array the more recent
        for (var i = 0; i < _history.length; i++) {
            if (_history[i].nid === nid) {
                cur = _history[i].status === "upvoted" ? 1 : -1;
            }
        }

        return cur;

    };

    self.voting = new Rx.ReplaySubject(1);
    
    self.voting.subscribe(function(d){
        console.log("new vote: ",d);
    });

    self.upvoteSong = function (nid) {

        $http( {
            method: 'POST',
            url: '/api/upvote',
            headers: {
                'Content-Type': "application/json"
            },
            data: {"nid": nid}
        } ).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            response.time = Date.now();
            self.voting.onNext(response.data);
            _addToHistory(response.data);
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log(response.data);
            Toast.informUser("Unable to upvote song");
        } );
    };

    self.downvoteSong = function (nid) {

        $http({
            method: 'POST',
            url: '/api/downvote',
            headers: {
                'Content-Type': "application/json"
            },
            data: { "nid": nid }
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            response.time = Date.now();
            self.voting.onNext(response.data);
            _addToHistory(response.data);
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            _console.log(response.data);
            Toast.informUser("Unable to downvote song");
        } );
    };

}
