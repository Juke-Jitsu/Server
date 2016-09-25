var lame = require('lame');
var Volume = require('pcm-volume');
var Speaker = require('speaker');
var stream = require('stream');
var events = require('events');

Player = function(){
    var self = this;

    self.play = function(song){
        song.on('error', function(err){console.log("Welp. Thats raw.")})
            .pipe(new lame.Decoder())
            .on('format', function(f) {
                var pcm_out = new Speaker();
                var decoder = stream
                    .Readable(f)
                    .on('error', function(err){console.log(err);});

                self.player = {
                    'readableStream': this,
                    'Speaker': pcm_out
                };
                
                self.player.readableStream.pipe(pcm_out)
                    .on('finish', self.finish);
            });
    };
    
    self.pause = function(){
        if(self.playing) {
            console.log("Pause");
			if(self.player != null) {
				self.player.readableStream.unpipe();
                self.playing = false;
			}
        } else {
            console.log("Song is already paused...")
        }
    };
    
    self.resume = function(){
        if(!self.playing) {
            console.log("Resume");
            self.player.readableStream.pipe(self.player.Speaker);
            self.playing = true;
        } else {
            console.log("Song is already playing...");
        }
    };
    
    self.finish = function() {
        self.player.readableStream.unpipe();
        delete self.player.readableStream;
        delete self.player.Speaker;
        self.emit('finish');
    };

};
Player.prototype = new events.EventEmitter;
module.exports = Player;
