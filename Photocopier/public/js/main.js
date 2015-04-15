// Canvas display and manipulation

var canvas = document.getElementById('previewCanvas');
var context = canvas.getContext('2d');
var hiddencanvas = document.getElementById('hiddenCanvas');
var hiddencontext = hiddencanvas.getContext('2d');
var imageObj = new Image();
var saveObj = new Image();
var compositeObj = new Image();
var saveImageData;

compositeObj.src = "img/sequence01.png";


imageObj.onload = function() {

	/* image preview */
	context.drawImage(imageObj, 0, 0);
	hiddencanvas.width = imageObj.width;
	hiddencanvas.height = imageObj.height;
	hiddencontext.drawImage(imageObj, 0, 0);
	
	imageData = context.getImageData(0,0,imageObj.width, imageObj.height);
	saveImageData = hiddencontext.getImageData(0,0, imageObj.width, imageObj.height);
	saveObj.width = imageObj.width;
	saveObj.height = imageObj.height;

	console.log("image loaded!");
	document.getElementById('photo-name').value = nameOfPhoto;

	// show elements
	document.getElementById('previewCanvas').style.display = 'block';
	document.getElementById('moderation-action').style.display = 'block';
	document.getElementById('image-submit').style.display = 'none';
	document.getElementById('waiting-new').style.display = 'none';

};

// if you accept, then you apply filter
var acceptButton = document.getElementById('btn-accept');
acceptButton.addEventListener('click', function (e) {
    console.log("accepted!");

	// performing a negative filter
	negativeFilter(imageData.data);
    context.putImageData(imageData, 0, 0);

	// composite the image
	context.globalCompositeOperation = "source-over";
	// context.globalCompositeOperation = "destination-over";
	context.drawImage(compositeObj,-100,-10);

    // full size image save 

	// performing a negative filter
	negativeFilter(saveImageData.data);
    hiddencontext.putImageData(saveImageData, 0, 0);

    hiddencontext.globalCompositeOperation = "source-over";
	hiddencontext.drawImage(compositeObj,-100,-10);

    // var uri = hiddencanvas.toDataURL("image/jpeg");

	// saveObj.src = uri;
	console.log('processed!');

    document.getElementById('moderation-action').style.display = 'none';
    document.getElementById('image-submit').style.display = 'block';

});

