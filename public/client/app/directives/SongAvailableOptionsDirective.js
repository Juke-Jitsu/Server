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


module.exports = SongOptionsDirective;

function SongOptionsDirective() {

    return {
        "restrict": "E",
        "templateUrl": "partial/song-available-options-directive.html",
        "scope": {
            songData: '=song'
        },
        "controller": /* @ngInject */ function ($scope, queueManager, votingManager, observeOnScope) {

            var self = this;

            $scope.onQueue = false;

            self.songData$ = observeOnScope($scope, 'songData');

            self.songData$.subscribe(function (change) {
                console.log(change);
                if($scope.songData){
                    $scope.usersVote = votingManager.getCurrentVoteOnSong($scope.songData.nid);
                }
            });

            self.songData$.combineLatest(queueManager.queue$, function(song, queue) {
                return queue;
            }).safeApply($scope, function (queue) {

                $scope.onQueue = false;

                queue.forEach(function (song) {

                    if (!song || !$scope.songData){
                        return;
                    }

                    if (song.nid === $scope.songData.nid) {
                        $scope.onQueue = true;
                    }
                });

            }).subscribe();

            $scope.addToQueue = function () {
                queueManager.addSong({
                    "artist": $scope.songData.artist,
                    "durationMillis": $scope.songData.durationMillis,
                    "title": $scope.songData.title,
                    "genre": $scope.songData.genre,
                    "albumArtRef": [{"url": $scope.songData.albumArtRef[0].url}],
                    "nid": $scope.songData.nid
                });
            };


//            $scope.usersVote = votingManager.getCurrentVoteOnSong($scope.songData.nid);

            $scope.upvote = function () {
                $scope.usersVote = 1;
                votingManager.upvoteSong($scope.songData.nid);
            };


            $scope.downvote = function () {
                $scope.usersVote = -1;
                votingManager.downvoteSong($scope.songData.nid);
            };
        }

    };

}