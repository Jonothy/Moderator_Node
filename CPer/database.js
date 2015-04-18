/**
 * This file configures the data sets used in the app
 *
 * It uses the nedb module for storing data, and returns 
 * an object with all the datasets. It is required in 
 * routes.js
 */ 

var debug = 1;
// var win7 = 0;
// var nasLoadPath = '/Volumes/OCULTO/Photocopier/incoming';
var nasLoadPath = 'Z:/Photocopier/incoming';
// var nasLoadPath = ['/Volumes/OCULTO/Photocopier/incoming', 'Z:/Photocopier/incoming'];
var debugLoadPath = __dirname + '/images/incoming';
var loadPath = [nasLoadPath, debugLoadPath];
var readyString = "good_";

// Require the nedb module
var Datastore = require('nedb'),
	chokidar = require('chokidar'),
	gaze = require('gaze'),
	watchr = require('watchr'),
	fs = require('fs');


// Initialize two nedb databases. Notice the autoload parameter.
var photos = new Datastore({ filename: __dirname + '/data/photos', autoload: true }),
	users = new Datastore({ filename: __dirname + '/data/users', autoload: true });

// Create a "unique" index for the photo name and user ip
photos.ensureIndex({fieldName: 'name', unique: true});
users.ensureIndex({fieldName: 'ip', unique: true});

console.log(loadPath[debug]);
console.log(typeof(loadPath[debug]));
// watcher function
// chokidar.watch(loadPath[debug], {ignored: /[\/\\]\./}).on('all', function(event, path) {
chokidar.watch('/Users/JohnnyLu/Documents/Developer/web/nodeIMG/NoMod/CPer/images/incoming', {ignored: /[\/\\]\./}).on('all', function(event, path) {
  console.log(event, path);
  console.log("stuff");

  if(event == 'add'){
	 //  var newFile = fs.readFile(path, function (err, data) {
		//   if (err) throw err;
		//   console.log(data);
		// });

		// location_id will be based on the path the file was found in
		var location_id = 0;

		if(path.indexOf(readyString) >= 0){
			var added_time = new Date();

			photos.insert({
				name: path.replace(/^.*[\\\/]/, ''),
				likes: 0,
				dislikes: 0,
				viewed: 0,
				time_added: added_time.toString(),
				time_viewed: 0,
				time_saved: 0,
				loc_id: location_id,
				filepath: path
			});
		}
	}
});

var watcher = chokidar.watch(loadPath[debug], {
  ignored: /[\/\\]\./,
  persistent: true
});

var log = console.log.bind(console);

watcher
  .on('add', function(path) { 
  		log('File', path, 'has been added'); 
  		// location_id will be based on the path the file was found in
		var location_id = 0;

		if(path.indexOf(readyString) >= 0){

			var added_time = new Date();

			photos.insert({
				name: path.replace(/^.*[\\\/]/, ''),
				likes: 0,
				dislikes: 0,
				viewed: 0,
				time_added: added_time.toString(),
				time_viewed: 0,
				time_saved: 0,
				loc_id: location_id,
				filepath: path
			});
		}
  	})
  // .on('change', function(path) { log('File', path, 'has been changed'); })
  // .on('unlink', function(path) { log('File', path, 'has been removed'); })
  // // More events.
  // .on('addDir', function(path) { log('Directory', path, 'has been added'); })
  // .on('unlinkDir', function(path) { log('Directory', path, 'has been removed'); })
  // .on('error', function(error) { log('Error happened', error); })
  // .on('ready', function() { log('Initial scan complete. Ready for changes.'); })
  // .on('raw', function(event, path, details) { log('Raw event info:', event, path, details); })

	// 'add', 'addDir' and 'change' events also receive stat() results as second
	// argument when available: http://nodejs.org/api/fs.html#fs_class_fs_stats
	watcher.on('change', function(path, stats) {
		log('Change noted');
	  if (stats) console.log('File', path, 'changed size to', stats.size);
	});

// Full list of options. See below for descriptions.
chokidar.watch('file', {
  persistent: true,

  ignored: '*.txt',
  ignoreInitial: false,
  followSymlinks: true,
  cwd: '.',

  useFsEvents: true,
  // usePolling: true,
  alwaysStat: false,
  depth: undefined,
  interval: 1000,

  ignorePermissionErrors: false,
  atomic: true
});

// Make the photos and users data sets available to the code
// that uses require() on this module:

module.exports = {
	photos: photos,
	users: users
};