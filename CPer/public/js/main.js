// Canvas display and manipulation

// preview canvas
var canvas = document.getElementById('previewCanvas');
var context = canvas.getContext('2d');
var testimg = document.getElementById('testimg');


// hidden canvas for saving the correct size
var hiddencanvas = document.getElementById('hiddenCanvas');
var hiddencontext = hiddencanvas.getContext('2d');

// original image to be modified
var imageObj = new Image();
// preview image object
var previewImg = new Image();

// overlay object
var compositeObj = new Image();
var prevCompositeObj = new Image();

// image data vars for canvas manipulation
var imageData;
var saveImageData;

// default brightness and contrast values
var def_brightness = 0;
var def_contrast = 10;

// ajax polling variables
var pollTimer1, pollTimer2;
var clear = false;

// loading composite object
compositeObj.src = "img/OCL_Xerox_large.png";
prevCompositeObj.src = "img/OCL_Xerox_small.png";


imageObj.onload = function() {

	/* image preview */
	canvas.width = canvas.height * (imageObj.width / imageObj.height);
	context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
	previewImg.src = canvas.toDataURL();

	hiddencanvas.width = imageObj.width;
	hiddencanvas.height = imageObj.height;

	hiddencontext.drawImage(imageObj, 0, 0);

	console.log("image loaded!");

	imageData = context.getImageData(0,0,canvas.width, canvas.height);
	// odata = jQuery.extend(true, {}, imageData);
	saveImageData = hiddencontext.getImageData(0,0, imageObj.width, imageObj.height);

	// show elements
	document.getElementById('controls').style.display = 'none';
	document.getElementById('previewCanvas').style.display = 'block';
	document.getElementById('moderation-action').style.display = 'block';
	document.getElementById('image-submit').style.display = 'none';
	document.getElementById('waiting-new').style.display = 'none';

};

// if you accept, then you apply filter
var acceptButton = document.getElementById('btn-accept');
acceptButton.addEventListener('click', function (e) {
    console.log("accepted!");

    document.getElementById("brightness-bar").value = 0;
    document.getElementById("contrast-bar").value = 10;
    document.getElementById("range-brightness").innerHTML=0;
    document.getElementById("range-contrast").innerHTML=10;

    // Preview canvas work

	// initial filter application
	var cb_image = Filters.brightnessContrast(imageData, 0.0, 1.0);
	context.putImageData(cb_image, 0, 0);

	// initial overlay
	// context.globalCompositeOperation = "source-over";
	// context.drawImage(prevCompositeObj,-100,-10);
    
	console.log('processed!');

	// display elements settings
	document.getElementById('controls').style.display = 'block';
    document.getElementById('moderation-action').style.display = 'none';
    document.getElementById('image-submit').style.display = 'block';

});

// slider bar to apply filters
function showContrast(newValue)
{
	console.log("changed contrast slider!");
	document.getElementById("range-contrast").innerHTML=newValue;

	var brightness = parseFloat(document.getElementById('brightness-bar').value)/10.0;
	var contrast = parseFloat(newValue)/10.0;
	adjustValues(context, brightness, contrast);
}

function showBrightness(newValue)
{
	console.log("changed brightness slider!");
	document.getElementById("range-brightness").innerHTML=newValue;
	var brightness = parseFloat(newValue) / 10.0;
	var contrast = parseFloat(document.getElementById('contrast-bar').value) / 10.0;
	adjustValues(context, brightness, contrast);
}

function adjustValues(ctx, brightness, contrast)
{	
	// reset canvas
	ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
	ctx.drawImage(previewImg, 0, 0);
	ctxImageData = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);
	// apply filter
	var cb_image = Filters.brightnessContrast(imageData, brightness, contrast);
	context.putImageData(cb_image, 0, 0);
	// composite
    // ctx.globalCompositeOperation = "source-over";
    // ctx.drawImage(compositeObj,-100,-10);

}

// rejected behavior
$("#rejected").submit(function(e)
{
    var postData = 'photo=' + document.getElementById('photo-name').value;

    $.ajax(
    {
        url : 'rejected',
        type: "POST",
        data : postData,
        success:function(data, textStatus, jqXHR) 
        {
        	//data: return data from server
        	console.log("successful posting!");
        	// console.log(data);
        	requestNext(data);
            
        },
        error: function(jqXHR, textStatus, errorThrown) 
        {
        	console.log("unsuccesful");
        	console.log(data);
            //if fails      
        }
    });
    e.preventDefault(); //STOP default action
    // e.unbind(); //unbind. to stop multiple form submit.
});

// image accepted and processed behavior
$("#data-submit").submit(function(e)
{

	// Save canvas image for submission
	hiddencontext.clearRect(0, 0, hiddencanvas.width, hiddencanvas.height);
	hiddencontext.drawImage(imageObj, 0, 0);
	saveImageData = hiddencontext.getImageData(0,0, hiddencanvas.width, hiddencanvas.height);
	var hidden_cb_image = Filters.brightnessContrast(saveImageData, parseFloat(document.getElementById('brightness-bar').value) / 10.0, parseFloat(document.getElementById('contrast-bar').value) / 10.0);
	hiddencontext.putImageData(hidden_cb_image, 0, 0);
    hiddencontext.globalCompositeOperation = "source-over";
	hiddencontext.drawImage(compositeObj,-100,-10);

    var postData = 'photo=' + document.getElementById('photo-name').value;
    // console.log(postData);
    var canvasData = hiddenCanvas.toDataURL("image/jpeg");
    console.log(canvasData);
	postData += "&imgData=";
	postData +=canvasData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
	console.log("submit");
	// console.log(postData);



    $.ajax(
    {
        url : 'saveProcessed',
        type: "POST",
        data : postData,
        success:function(data, textStatus, jqXHR) 
        {
        	//data: return data from server
        	console.log("successful posting!");
        	// console.log(data);
        	requestNext(data);

            
        },
        error: function(jqXHR, textStatus, errorThrown) 
        {
        	console.log("unsuccesful");
        	console.log(errorThrown);
            //if fails      
        }
    });
    e.preventDefault(); //STOP default action
    // e.unbind(); //unbind. to stop multiple form submit.
});

function requestNext(data){

	if(data.photoName !== undefined && data.photoName !== null){
    	nameOfPhoto = data.photoName.name;
    	canvas.style.webkitFilter = 'none';
  		canvas.style.filter = 'none';
  		hiddencanvas.style.webkitFilter = 'none';
  		hiddencanvas.style.filter = 'none';
        context.clearRect(0, 0, canvas.width, canvas.height);
        hiddencontext.clearRect(0, 0, hiddencanvas.width, hiddencanvas.height);

        // imageObj.src = "photos/"+nameOfPhoto;
        imageObj.src = "images/1_raw/"+nameOfPhoto;
        document.getElementById('photo-name').value = nameOfPhoto;
	}

	else{

		clear = false;
		console.log("no more photos!");
		document.getElementById('controls').style.display = 'none';
		document.getElementById('moderation-action').style.display = 'none';
		document.getElementById('image-submit').style.display = 'none';
		document.getElementById('previewCanvas').style.display = 'none';
		document.getElementById('waiting-new').style.display = 'block';
		poll("/requestNext", "POST", 1000,
		    function beforeRequest(xhr) {
		        return "beforeRequest";
		    },
		    function onSuccess(xhr) {
		        var data = JSON.parse(xhr.responseText);
		        // show messages...
		        console.log('poll success');
		        console.log(data);
		        if(data.photoName !== undefined && data.photoName !== null){
		        	nameOfPhoto = data.photoName.name;
		        	canvas.style.webkitFilter = 'none';
			  		canvas.style.filter = 'none';
			  		hiddencanvas.style.webkitFilter = 'none';
			  		hiddencanvas.style.filter = 'none';
			        context.clearRect(0, 0, canvas.width, canvas.height);
			        hiddencontext.clearRect(0, 0, hiddencanvas.width, hiddencanvas.height);

			        // imageObj.src = "photos/"+nameOfPhoto;
			        imageObj.src = "images/1_raw/"+nameOfPhoto;

			        document.getElementById('photo-name').value = nameOfPhoto;
			        console.log('found new photo');
			        clearTimeout(pollTimer1);
			        clearTimeout(pollTimer2);
			        clear = true;

	        	}
		    },
		    function onError(xhr, sendRequest, period) {
		        if (xhr.status === 401) {
		            // show dialog to log in user
		            console.log("in 401")
		        }
		        else {
		            // retry the operation
		            console.log('retrying');
		            setTimeout(sendRequest, period + 1000);
		        }
		    }
		);
	}

}

function poll(url, method, period, beforeRequest, onSuccess, onError) {
    var xhr = new XMLHttpRequest(),
        onReadyStateChange= function() {
            if (this.readyState === 4) {
                if (this.status === 200 || this.status === 201) {
                    onSuccess(xhr);
                    if(!clear){
	                    pollTimer2 = setTimeout(sendRequest, period);
	                }

                }
                else if (this.status > 399) {
                    // Allow error handling code to retry the operation
                    onError(xhr, sendRequest, period);
                }
            }
        },
        sendRequest = function() {
            var data = beforeRequest(xhr) || null;
            xhr.open(method, url, true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.send(data);
        };

    xhr.onreadystatechange = onReadyStateChange;

    pollTimer1 = setTimeout(sendRequest, period);
}

