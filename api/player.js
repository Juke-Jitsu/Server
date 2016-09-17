var lame = require('lame');
var Volume = require('pcm-volume');
var Speaker = require('speaker');
var stream = require('stream');
var events = require('events');

Player = function(){
    var self = this;

    self.streamQueue = [];
    self.player = null;
    self.playing = false;
    self.loadSong = true;

    self.play = function(){
        if(self.loadSong){
            var songStream = self.streamQueue[0];

            songStream
                .on('error', function(err){console.log("Welp. Thats raw.")})
                .pipe(new lame.Decoder())
                .on('format',onPlaying);

            self.playing = true;
            self.loadSong = false;
        }else{
            self.resume();
        }

        function onPlaying(f) {
            var pcm_out = new Speaker();
            var decoder = stream
                .Readable(f)
                .on('error', function(err){console.log(err);});

            self.player = {
                'readableStream': this,
                'Speaker': pcm_out
            };
            
            self.player.readableStream.pipe(pcm_out)
                .on('finish', self.next);
        }

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
            console.log("Song is already playing...")
        }
    };

    self.next = function(){
        self.pause();
        self.streamQueue.shift();
        delete self.player.readableStream;
        delete self.player.Speaker;
        self.playing = false;
        self.loadSong = true;
        self.emit('finish');
    }
    
    self.setNext = function(songstream){
        console.log("Next Song Set");
        self.streamQueue.push(songstream);
    };
    
    self.bufferNewSong = function(){
        //buffer only 3 songs
        return (self.streamQueue.length < 3);
    };
    
    self.clearPlayer = function() {
        self.pause();
        delete self.player.readableStream;
        delete self.player.Speaker;
        self.streamQueue = [];
        self.player = null;
        self.playing = false;
        self.loadSong = true;
    };

};
Player.prototype = new events.EventEmitter;
module.exports = Player;
