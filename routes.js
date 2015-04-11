/**
 * This file defines the routes used in your application
 * It requires the database module that we wrote previously.
 */ 

var path = require('path'),
	formidable = require('formidable'),
	http = require('http'),
	sys = require('sys'),
	fs = require('fs'),
	db = require('./database'),
	photos = db.photos,
	users = db.users;


module.exports = function(app){

	// Homepage
	app.get('/', function(req, res){

		// Find all photos
		photos.find({}, function(err, all_photos){

			var not_viewed = all_photos.filter(function(photo){
				if(photo.viewed == 0){
					return all_photos.indexOf(photo.viewed == 0);
				}
			});

			var image_to_show = null;

			if(not_viewed.length > 0){
				var viewed_time = new Date();
				// Choose a random image
				image_to_show = not_viewed[Math.floor(Math.random()*not_viewed.length)];
				// update photo as viewed and update time of viewing
				photos.update(image_to_show, {$inc : {viewed:1}, $set: {time_viewed: viewed_time.toString()}});
			}

			res.render('home', {photo: image_to_show });

		});

	});

	app.get('/standings', function(req, res){

		photos.find({}, function(err, all_photos){

			// Sort the photos 

			all_photos.sort(function(p1, p2){
				return (p2.likes - p2.dislikes) - (p1.likes - p1.dislikes);
			});

			// add up number of approved photos
			var approved = all_photos.filter(function(photo){
				if(photo.likes == 1){
					return all_photos.indexOf(photo.likes == 0);
				}
			});

			// add up number of rejected photos
			var rejected = all_photos.filter(function(photo){
				if(photo.dislikes == 1){
					return all_photos.indexOf(photo.dislikes == 0);
				}
			});

			// add up number of total photos there is

			// Render the standings template and pass the photos and stats
			res.render('standings', { standings: all_photos, numApproved: approved.length, 
					numRejected : rejected.length, numPhotos: all_photos.length });

		});

	});


	// to be executed when a filtered image is received
	app.post('/saveProcessed', saveProcessed);
	
	function saveProcessed(req, res){

		// add uploaded image
		// console.log(req.body);	
		// console.log(res);
		console.log("new photo")

		var data = req.body.imgData;
		
		var buf = new Buffer(data.replace(/ /g, '+'), 'base64');
		fs.writeFile('public/uploads/testImage.png', buf);


		// stream option in case for some reason too memory intensive
		// var stream = fs.createWriteStream('public/uploads/meow.png');
		// stream.write(buf);
		// stream.on("end", function() {
		// 	stream.end();
		// });
		console.log("SAVE BUFFER DATA");

		res.status(200);
		res.json({'success': true});

	}

	// to be executed when a new image is registered
	app.post('/newImage', newImage);


	function newImage(req, res){

		// possible future more sophisticated form parsing

		// var form = new formidable.IncomingForm();
		//  form.parse(req, function(err, fields, files) {
		//      // `file` is the name of the <input> field of type `file`
		//      console.log(files);
		//      console.log(files.path);
		//      var old_path = files.path.path;

		//      console.log("what is old path?")

		//   var file_size = files.file.size,
		//          file_ext = files.file.name.split('.').pop(),
		//          index = old_path.lastIndexOf('/') + 1,
		//          file_name = old_path.substr(index),
		//          new_path = path.join(process.env.PWD, '/uploads/', file_name + '.' + file_ext);

				// console.log("before file read");
		//      fs.readFile(old_path, function(err, data) {
		//          fs.writeFile(new_path, data, function(err) {
		//              fs.unlink(old_path, function(err) {
		//                  if (err) {
		//                      res.status(500);
		//                      res.json({'success': false});
		//                  } else {
		//                      res.status(200);
		//                      res.json({'success': true});
		//                  }
		//              });
		//          });
		//      });
		//  });

		// var photo = req.something?

		// photos.insert({
		// 	name: photo,
		// 	likes: 0,
		// 	dislikes: 0,
		// 	viewed: 0,
		// 	time_added: 0,
		// 	time_viewed: 0
		// });

		res.redirect('../');
	}

	function decodeBase64Image(dataString) {
		var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
		response = {};

		if (matches.length !== 3) {
			console.log("error decoding");
			return new Error('Invalid input string');
		}

		console.log("matches");

		response.type = matches[1];
		response.data = new Buffer(matches[2], 'base64');

		return response;
	}

	// to be executed when a new image is requested from client
	app.get('/requestNext', requestNext);

	function requestNext(req, res){

		// send non-viewed image or tell client that there is none currently

	}

	// This is executed before the next two post requests
	app.post('*', function(req, res, next){
		
		// Register the user in the database by ip address

		users.insert({
			ip: req.ip,
			votes: []
		}, function(){
			// Continue with the other routes
			next();
		});
		
	});

	app.post('/accepted', vote);
	app.post('/declined', vote);


	function vote(req, res){

		// Which field to increment, depending on the path
		console.log("req");
		// console.log(req);
		console.log(req.body);
		// console.log("res");
		// console.log(res);
		var what = {
			'/accepted': {likes:1},
			'/declined': {dislikes:1}
		};

		// Find the photo, increment the vote counter and mark that the user has voted on it.

		photos.find({ name: req.body.photo }, function(err, found){

			if(found.length == 1){

				photos.update(found[0], {$inc : what[req.path]});

				users.update({ip: req.ip}, { $addToSet: { votes: found[0]._id}}, function(){
					res.redirect('../');
				});

				/* if photo is liked and we want to save a processed photo */
				if(req.path == '/accepted')
				{
					console.log("we should save this photo");
				}

			}
			else{
				res.redirect('../');
			}

		});
	}
};