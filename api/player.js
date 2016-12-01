var lame = require('lame');
var Volume = require('pcm-volume');
var Speaker = require('speaker');
var stream = require('stream');
var events = require('events');
var Rx = require('rx');

Player = function () {
    var self = this;

    self.pause$ = new Rx.Subject();
    self.resume$ = new Rx.Subject();
    self.status$ = new Rx.BehaviorSubject('finish');

    self.play = function (song) {
        song.on('error', function (err) {
            console.log("Welp. Thats raw.")
            self.status$.onNext("error");
        })
            .pipe(new lame.Decoder())
            .on('format', function (f) {
                var pcm_out = new Speaker();
                var decoder = stream
                    .Readable(f)
                    .on('error', function (err) { console.log(err); });

                self.player = {
                    'readableStream': this,
                    'Speaker': pcm_out
                };
                self.status$.onNext("playing");

                self.player.readableStream.pipe(pcm_out)
                    .on('finish', self.finish);
            });
    };

    

    self.pause = function () {
        self.pause$.onNext(true);
    };
    
    self.resume = function () {
        self.resume$.onNext(true);
    }

    self.pause$.filter(function(x){
        console.log("Pause request, ", self.status$.getValue());
        return self.status$.getValue() === 'playing'
    }).subscribe(function(x){
        if (self.player != null) {
            self.player.readableStream.unpipe();
            self.playing = false;
            self.status$.onNext("paused");
        }
    });

    self.resume$.filter(function () {
        return self.status$.getValue() === 'paused'
    }).subscribe(function(x){
        if (!self.playing) {
            self.player.readableStream.pipe(self.player.Speaker);
            self.playing = true;
            self.status$.onNext("playing");
        } else {
            console.log("Song is already playing...");
        }
    });

    self.finish = function () {
        self.player.readableStream.unpipe();
        delete self.player.readableStream;
        delete self.player.Speaker;
        self.emit('finish');
        self.status$.onNext("finish");
    };

};

Player.prototype = new events.EventEmitter;
module.exports = Player;
