// Canvas display and manipulation

// preview canvas
var canvas = document.getElementById('previewCanvas');
var context = canvas.getContext('2d');

// hidden canvas for saving the correct size
var hiddencanvas = document.getElementById('hiddenCanvas');
var hiddencontext = hiddencanvas.getContext('2d');

// original image to be modified
var imageObj = new Image();
// modified image to be sent
var saveObj = new Image();

// overlay object
var compositeObj = new Image();
var compositeSaveObj = new Image();

var imageData;
var saveImageData;

// ajax polling variables
var pollTimer1, pollTimer2;
var clear = false;

// loading composite object
compositeObj.src = "img/sequence01.png";


imageObj.onload = function() {

	/* image preview */
	context.drawImage(imageObj, 0, 0);

	hiddencanvas.width = imageObj.width;
	hiddencanvas.height = imageObj.height;

	hiddencontext.drawImage(imageObj, 0, 0);
	
	saveObj.width = imageObj.width;
	saveObj.height = imageObj.height;

	console.log("image loaded!");

	imageData = context.getImageData(0,0,canvas.width, canvas.height);
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

    // Preview canvas work

	// imageData = context.getImageData(0,0,canvas.width, canvas.height);
	var contrastedImg = contrastImage(imageData, 100);
    context.putImageData(contrastedImg, 0, 0);
    // overlay
    // composite the image
	context.globalCompositeOperation = "source-over";
	context.drawImage(compositeObj,-100,-10);
    

    // full size image save 
	// saveImageData = hiddencontext.getImageData(0,0, imageObj.width, imageObj.height);
	
	// filter
	var contrastedSave = contrastImage(saveImageData, 100);
    hiddencontext.putImageData(contrastedSave, 0, 0);
    // overlay
    hiddencontext.globalCompositeOperation = "source-over";
	hiddencontext.drawImage(compositeObj,-100,-10);
	// cssContrast(hiddencanvas, 50);

	console.log('processed!');

	document.getElementById('controls').style.display = 'block';
    document.getElementById('moderation-action').style.display = 'none';
    document.getElementById('image-submit').style.display = 'block';

});

// slider bar to apply filters
function showValue(newValue)
{
	console.log("changed slider!");
	document.getElementById("range").innerHTML=newValue;
	
	var contrastedImg = contrastImage(imageData, newValue);
	context.putImageData(contrastedImg, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.drawImage(compositeObj,-100,-10);
	var contrastedSave = contrastImage(saveImageData, newValue);
    hiddencontext.putImageData(contrastedSave, 0, 0);
    hiddencontext.globalCompositeOperation = "source-over";
	hiddencontext.drawImage(compositeObj,-100,-10);

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
    var postData = 'photo=' + document.getElementById('photo-name').value;
    // console.log(postData);
    var canvasData = hiddenCanvas.toDataURL("image/jpg");
	postData += "&imgData=";
	postData +=canvasData.replace(/^data:image\/(png|jpg);base64,/, "");
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
        imageObj.src = "images/incoming/"+nameOfPhoto;
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
			        imageObj.src = "images/incoming/"+nameOfPhoto;

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

