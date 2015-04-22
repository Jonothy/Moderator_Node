/**
 * This file defines the routes used in your application
 * It requires the database module that we wrote previously.
 */ 

var initvals = require('./initvals.js');
var savePath = initvals.basePath[initvals.debug]+'/';

var printer_url = "http://172.16.3.24:8000/mugshot";
var waitString = '_incoming';

var path = require('path'),
	formidable = require('formidable'),
	http = require('http'),
	sys = require('sys'),
	fs = require('fs'),
	request = require('request'),
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
			console.log('image to show');
			console.log(image_to_show);

			res.render('home', {photo: image_to_show, eventFolder: initvals.eventFolder });

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
					numRejected : rejected.length, numPhotos: all_photos.length, eventFolder: initvals.eventFolder  });

		});

	});

		// to be executed when a filtered image is received
	app.post('/rejected', rejected);
	
	function rejected(req, res){

		// add uploaded image
		// console.log(req.body);	
		// console.log(res);
		console.log("rejected photo");

		var photoName = req.body.photo;
		
		console.log(photoName);

		photos.find({ name: photoName }, function(err, found){

			if(found.length == 1){

				console.log(found[0]);
				photos.update(found[0], {$inc : {dislikes:1}});

				users.update({ip: req.ip}, { $addToSet: { votes: found[0]._id}}, function(){
					// res.redirect('../');

					console.log("user update");

					// rename file into rejected folder
					fs.rename(savePath+'1_raw/'+photoName, savePath+'2_rejected/'+photoName, function (err) {
					  	if (err) throw err;
					  	console.log('rejected');
					  	var saved_time = new Date();
					  	photos.update(found[0], {$set : { filepath: savePath+ '2_rejected/' + photoName, time_saved: saved_time.toString() }});

					  });
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

					});
				});
			}

			else{
				res.redirect('../');
			}
		});
	}


	// to be executed when a filtered image is received
	app.post('/saveProcessed', saveProcessed);
	
	function saveProcessed(req, res){

		// add uploaded image
		// console.log(req.body);	
		// console.log(res);
		console.log("processed photo");

		var data = req.body.imgData;
		var photoName = req.body.photo;
		var rapdata = req.body.rapData;
		
		// write moderated file for social sharing
		var buf = new Buffer(data.replace(/ /g, '+'), 'base64');
		fs.writeFile(savePath+'3_moderated/'+photoName.substring(0, photoName.lastIndexOf(".")) + "_incoming" + photoName.substring(photoName.lastIndexOf(".")), buf, function (err) {
		  if (err) throw err;
		  console.log('It\'s saved!');
		  // saved so rename to signify so
		  fs.rename(savePath+'3_moderated/'+photoName.substring(0, photoName.lastIndexOf(".")) + "_incoming" + photoName.substring(photoName.lastIndexOf(".")), savePath+'3_moderated/'+photoName, function (err) {
		  	
		  	if (err) throw err;
		  	console.log('finalized!');
		  	// request to printer
		 //  	request({
			//     url: printer_url, //URL to hit
			//     method: 'POST',
			//     //Lets post the following key/values as form
			//     form: { image_name: photoName }
			// }, function(error, response, body){
			//     if(error) {
			//         console.log(error);
			//     } else {
			//         console.log(response.statusCode, body);
			// }
			// });

		  	
		  });
		});

		// write rapsheet for printing
		var rapbuf = new Buffer(rapdata.replace(/ /g, '+'), 'base64');
		fs.writeFile(savePath+'5_rapsheet/'+photoName.substring(0, photoName.lastIndexOf(".")) + "_incoming" + photoName.substring(photoName.lastIndexOf(".")), rapbuf, function (err) {
		  if (err) throw err;
		  console.log('It\'s saved!');
		  // saved so rename to signify so
		  fs.rename(savePath+'5_rapsheet/'+photoName.substring(0, photoName.lastIndexOf(".")) + "_incoming" + photoName.substring(photoName.lastIndexOf(".")), savePath+'5_rapsheet/'+photoName, function (err) {
		  	
		  	if (err) throw err;
		  	console.log('finalized!');
		  	var saved_time = new Date();
			photos.update(found[0], {$set : { time_saved: saved_time.toString() }});

		  	// request to printer
		  	request({
			    url: printer_url, //URL to hit
			    method: 'POST',
			    //Lets post the following key/values as form
			    form: { image_name: photoName }
			}, function(error, response, body){
			    if(error) {
			        console.log(error);
			    } else {
			        console.log(response.statusCode, body);
			}
			});

		  	
		  });
		});

		console.log("SAVE BUFFER DATA");
		console.log(photoName);

		photos.find({ name: photoName }, function(err, found){

			if(found.length == 1){

				console.log(found[0]);
				photos.update(found[0], {$inc : {likes:1}});

				users.update({ip: req.ip}, { $addToSet: { votes: found[0]._id}}, function(){

					console.log("user update");
					// ajax response
					// Find all photos
					var image_to_show = null;
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

	function nextPhoto(){
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

			console.log("nextPhoto photo");
			console.log(image_to_show);
			return image_to_show;

		});
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

	// relics
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

	}
};