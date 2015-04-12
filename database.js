/**
 * This file configures the data sets used in the app
 *
 * It uses the nedb module for storing data, and returns 
 * an object with all the datasets. It is required in 
 * routes.js
 */ 


// Require the nedb module
var Datastore = require('nedb'),
	watch = require('watch'),
	chokidar = require('chokidar'),
	fs = require('fs');


// Initialize two nedb databases. Notice the autoload parameter.
var photos = new Datastore({ filename: __dirname + '/data/photos', autoload: true }),
	users = new Datastore({ filename: __dirname + '/data/users', autoload: true });

// Create a "unique" index for the photo name and user ip
photos.ensureIndex({fieldName: 'name', unique: true});
users.ensureIndex({fieldName: 'ip', unique: true});

// Load all images from the public/photos folder in the database
// var photos_on_disk = fs.readdirSync(__dirname + '/public/photos');

// // Insert the photos in the database. This is executed on every 
// // start up of your application, but because there is a unique
// // constraint on the name field, subsequent writes will fail 
// // and you will still have only one record per image:

// photos_on_disk.forEach(function(photo){
// 	photos.insert({
// 		name: photo,
// 		likes: 0,
// 		dislikes: 0,
// 		viewed: 0,
// 		time_added: 0,
// 		time_viewed: 0,
// 		time_saved: 0
// 	});
// });


// watcher function
chokidar.watch(__dirname + '/public/photos', {ignored: /[\/\\]\./}).on('all', function(event, path) {
  console.log(event, path);
  console.log("stuff");

  if(event == 'add'){
	 //  var newFile = fs.readFile(path, function (err, data) {
		//   if (err) throw err;
		//   console.log(data);
		// });

		photos.insert({
			name: path.replace(/^.*[\\\/]/, ''),
			likes: 0,
			dislikes: 0,
			viewed: 0,
			time_added: 0,
			time_viewed: 0,
			time_saved: 0
		});
	}
});

var watcher = chokidar.watch('file, dir, or glob', {
  ignored: /[\/\\]\./,
  persistent: true
});

var log = console.log.bind(console);

watcher
  .on('add', function(path) { 
  		log('File', path, 'has been added'); 
  		photos.insert({
  			name: path.replace(/^.*[\\\/]/, ''),
			likes: 0,
			dislikes: 0,
			viewed: 0,
			time_added: 0,
			time_viewed: 0,
			time_saved: 0
  		});
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

console.log("THIS IS IN DATABASE.JS")

// Make the photos and users data sets available to the code
// that uses require() on this module:

module.exports = {
	photos: photos,
	users: users
};