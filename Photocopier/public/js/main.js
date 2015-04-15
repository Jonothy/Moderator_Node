// Canvas display and manipulation

var canvas = document.getElementById('previewCanvas');
var context = canvas.getContext('2d');
var hiddencanvas = document.getElementById('hiddenCanvas');
var hiddencontext = hiddencanvas.getContext('2d');
var imageObj = new Image();
var saveObj = new Image();
var compositeObj = new Image();
var saveImageData;
var pollTimer1, pollTimer2;
var clear = false;


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
	// negativeFilter(imageData.data);
	contrastImage(imageData.data, 200);
    context.putImageData(imageData, 0, 0);

	// composite the image
	context.globalCompositeOperation = "source-over";
	// context.globalCompositeOperation = "destination-over";
	context.drawImage(compositeObj,-100,-10);

    // full size image save 

	// performing a negative filter
	// negativeFilter(saveImageData.data);
	contrastImage(saveImageData.data, 200);
    hiddencontext.putImageData(saveImageData, 0, 0);

    hiddencontext.globalCompositeOperation = "source-over";
	hiddencontext.drawImage(compositeObj,-100,-10);

    // var uri = hiddencanvas.toDataURL("image/jpeg");

	// saveObj.src = uri;
	console.log('processed!');

    document.getElementById('moderation-action').style.display = 'none';
    document.getElementById('image-submit').style.display = 'block';

});

// slider bar
function showValue(newValue)
{
	document.getElementById("range").innerHTML=newValue;
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
        	console.log(data);
            //if fails      
        }
    });
    e.preventDefault(); //STOP default action
    // e.unbind(); //unbind. to stop multiple form submit.
});

function requestNext(data){

	if(data.photoName !== undefined && data.photoName !== null){
    	nameOfPhoto = data.photoName.name;
        context.clearRect(0, 0, canvas.width, canvas.height);
        hiddencontext.clearRect(0, 0, hiddencanvas.width, hiddencanvas.height);

        imageObj.src = "photos/"+nameOfPhoto;
        // imageObj.src = "images/incoming/"+nameOfPhoto;
        document.getElementById('photo-name').value = nameOfPhoto;
	}

	else{

		clear = false;
		console.log("no more photos!");
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
			        context.clearRect(0, 0, canvas.width, canvas.height);
			        hiddencontext.clearRect(0, 0, hiddencanvas.width, hiddencanvas.height);

			        imageObj.src = "photos/"+nameOfPhoto;
			        // imageObj.src = "images/incoming/"+nameOfPhoto;

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
    // pollTimer1();
}

