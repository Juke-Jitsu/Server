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
 * all copies or substantial portions of the Software.  *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


var Rx = require('rx');

module.exports = SongSearch;

/*
 * @ngInject
 */
function SongSearch($http, Toast, sessionManager) {

    var self = this;

    var _searchResults = new Rx.Subject();

    self.searchResults = _searchResults
        .filter(function (data) {
            return data.results !== "none";
        }).map(function (data) {
            
            if(data !== undefined && data.data !== undefined){
                return data.data.filter(function(d){
                    return d.track !== undefined;
                }).map(function(d){
                    return d.track;
                });
            }
            
            return data;
        }).share();

    self.search = function (music) {

        var searchCall = '/api/search?str=' + music.toString();

        $http({
            method: 'GET',
            url: searchCall
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            _searchResults.onNext(response);
            sessionManager.switchToSearch();
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            Toast.informUser("Error Retrieving Search Results!");
            _searchResults.onNext(response);
        });

    };

}
