// Canvas display and manipulation

var canvas = document.getElementById('previewCanvas');
var context = canvas.getContext('2d');
var hiddencanvas = document.getElementById('hiddenCanvas');
var hiddencontext = hiddencanvas.getContext('2d');
var imageObj = new Image();
var saveObj = new Image();

imageObj.onload = function() {

	/* image preview */
	context.drawImage(imageObj, 0, 0);

	// console.log("image width and height");
	// console.log(imageObj.width);
	// console.log(imageObj.height);



};

// if you accept, then you apply filter
var acceptButton = document.getElementById('btn-accept');
acceptButton.addEventListener('click', function (e) {
    console.log("accepted!");
    var imageData = context.getImageData(0,0,imageObj.width, imageObj.height);
	// var data = imageData.data;

	// performing a negative filter
	// negativeFilter(data);
    context.putImageData(imageData, 0, 0);

    // overlay
    var compositeTest = document.getElementById('overlay-0');
	// composite the image
	context.globalCompositeOperation = "source-over";
	// context.globalCompositeOperation = "destination-over";
	context.drawImage(compositeTest,-100,-10);

    /* full size image save */

    hiddencanvas.width = imageObj.width;
	hiddencanvas.height = imageObj.height;
    hiddencontext.drawImage(imageObj, 0, 0);
	var saveImageData = hiddencontext.getImageData(0,0, imageObj.width, imageObj.height);
	// var saveData = saveImageData.data;

	// performing a negative filter
	// negativeFilter(saveData);
    hiddencontext.putImageData(saveImageData, 0, 0);
    var uri = hiddencanvas.toDataURL("image/png");
	// userImage.src = uri;
	// console.log(uri);
	// imgtag.width = imageObj.width;
	// imgtag.height = imageObj.height;
	// imgtag.src = uri;
	saveObj.width = imageObj.width;
	saveObj.height = imageObj.height;
	saveObj.src = uri;

	// console.log(imgtag);
	// document.getElementById('upload').value = imgtag.src;
    document.getElementById('moderation-action').style.display = 'none';
    document.getElementById('image-submit').style.display = 'block';

});

