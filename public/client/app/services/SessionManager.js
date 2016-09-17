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

var Rx = require("rx");

module.exports = SessionManager;

/*
 * @ngInject
 */
function SessionManager() {

    var self = this;
    
    // Keep the last item pushed in buffer for new subscribers
    self.currentView$ = new Rx.ReplaySubject(1);
    
    self.currentView$.onNext("queue");
    
    self.switchToQueue = function(){
        self.currentView$.onNext("queue");
    };
    
    self.switchToSearch = function(){
        self.currentView$.onNext("search");
    };
    
    self.songSelectedForView$ = new Rx.ReplaySubject(1);
    
    self.switchToSongView = function(song){
        
        if(song === null || song === undefined){
            console.error("Trying to switch to the song view without a song!");
            return;
        }
        
        self.currentView$.onNext("song");
        self.songSelectedForView$.onNext(song);
    };

}