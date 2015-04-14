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

var nasSavePath = '/Volumes/nas';

module.exports = function(app){

	console.log("ROUTES.JS");
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

	app.get('/stats', function(req, res){

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
			res.render('stats', { standings: all_photos, numApproved: approved.length, 
					numRejected : rejected.length, numPhotos: all_photos.length });

		});

	});


	// to be executed when a filtered image is received
	app.post('/saveProcessed', saveProcessed);
	
	function saveProcessed(req, res){

		// add uploaded image
		// console.log(req.body);	
		// console.log(res);
		console.log("processed photo");

		var data = req.body.imgData;
		var photoName = req.body.photo;
		
		var buf = new Buffer(data.replace(/ /g, '+'), 'base64');
		fs.writeFile('public/uploads/modified_'+photoName, buf, function (err) {
		  if (err) throw err;
		  console.log('It\'s saved!');
		  fs.rename('public/uploads/modified_'+photoName, 'public/uploads/finalized_'+photoName, function (err) {
		  	if (err) throw err;
		  	console.log('finalized!');
		  });
		});

		fs.writeFile(nasSavePath+'/modified_'+photoName, buf, function (err) {
		  if (err) throw err;
		  console.log('It\'s saved!');
		  fs.rename(nasSavePath+'/modified_'+photoName, nasSavePath + '/finalized_'+photoName, function (err) {
		  	if (err) throw err;
		  	console.log('finalized!');
		  });
		});

		// stream option in case for some reason too memory intensive
		// var stream = fs.createWriteStream('public/uploads/meow.png');
		// stream.write(buf);
		// stream.on("end", function() {
		// 	stream.end();
		// });
		console.log("SAVE BUFFER DATA");
		console.log(photoName);

		photos.find({ name: photoName }, function(err, found){

			if(found.length == 1){

				console.log(found[0]);
				photos.update(found[0], {$inc : {likes:1}});

				users.update({ip: req.ip}, { $addToSet: { votes: found[0]._id}}, function(){
					// res.redirect('../');

					console.log("user update");
					// ajax response
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

						res.status(200);
						res.json({'success': true, 'photoName': image_to_show});
					// 	res.redirect('../');

					});
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

		// res.status(200);
		// res.json({'success': true});

	}

	// possible hook for adding photos via POST request
	app.post('/newImage', newImage);


	function newImage(req, res){

		res.redirect('../');
	}


	// to be executed when a new image is requested from client
	app.post('/requestNext', requestNext);

	function requestNext(req, res){

		// send non-viewed image or tell client that there is none currently
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

			res.status(200);
			res.json({'success': true, 'photoName': image_to_show});
		// 	res.redirect('../');

		});
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

		// photos.find({ name: req.body.photo }, function(err, found){

		// 	if(found.length == 1){

		// 		photos.update(found[0], {$inc : what[req.path]});

		// 		users.update({ip: req.ip}, { $addToSet: { votes: found[0]._id}}, function(){
		// 			res.redirect('../');

		// 			// ajax response
		// 			// Find all photos
		// 			// photos.find({}, function(err, all_photos){

		// 			// 	var not_viewed = all_photos.filter(function(photo){
		// 			// 		if(photo.viewed == 0){
		// 			// 			return all_photos.indexOf(photo.viewed == 0);
		// 			// 		}
		// 			// 	});

		// 			// 	var image_to_show = null;

		// 			// 	if(not_viewed.length > 0){
		// 			// 		var viewed_time = new Date();
		// 			// 		// Choose a random image
		// 			// 		image_to_show = not_viewed[Math.floor(Math.random()*not_viewed.length)];
		// 			// 		// update photo as viewed and update time of viewing
		// 			// 		photos.update(image_to_show, {$inc : {viewed:1}, $set: {time_viewed: viewed_time.toString()}});
		// 			// 	}

		// 			// 	res.status(200);
		// 			// 	res.json({'success': true, 'photoName': image_to_show});
		// 			// 	res.redirect('../');

		// 			// });
		// 		});

		// 		/* if photo is liked and we want to save a processed photo */
		// 		if(req.path == '/accepted')
		// 		{
		// 			console.log("we should save this photo");
		// 		}

		// 	}
		// 	else{
		// 		res.redirect('../');
		// 	}

		// });
	}
};