
/* 
Assistance writing to a file was found at: http://stackoverflow.com/questions/2496710/writing-files-in-node-js
http://stackoverflow.com/questions/33678298/fs-writefile-not-overwriting-file
*/
var fs = require('fs');

module.exports = ShadowCopy;

/**
 * Keeps up with the state of the server for an easy time to resume whenever the server
 * unexpectadly crashes.
 *
 * Called on server startup.
 */

function ShadowCopy(queue, gmusic) {


	gmusic.loggedIn$.subscribe(function(loggedIn){
		console.log("SHADOW COPY FUNCTION")

		fs.readFile("./queue.shadow", function read(err, data) {
		    
		    // If file doesn't exist, throw error
		    if (err && err.code == 'ENOENT')
		        return console.log (err);

		 	else {
				var obj = JSON.parse(data);

				obj.forEach(function (song) {
					queue.push(song);
				})
			}
		})
	});


	queue.on('add', function(){
		console.log("ShadowCopy: Queue Add");

		fs.writeFile("./queue.shadow", JSON.stringify(queue.toArray()), function(err) {
		    if (err) {
		        return console.log(err);
		    }
		}); 
	});
	

	queue.on('remove', function(){
		console.log("ShadowCopy: Queue Remove");
		
		fs.unlink('./queue.shadow', function(err){

			if (queue.toArray().length > 0) {

			    // If file doesn't exist, throw error
			    if (err && err.code == 'ENOENT')
			        return console.log (err);

			    fs.writeFile('./queue.shadow', JSON.stringify(queue.toArray()), function(err) {
			        if (err) {
			        	return console.log(err);
			        }
			    });
			}
		});
	});
}