// Canvas display and manipulation

// preview canvas
var canvas = document.getElementById('previewCanvas');
var context = canvas.getContext('2d');
var testimg = document.getElementById('testimg');


// hidden canvas for saving the correct size
var hiddencanvas = document.getElementById('hiddenCanvas');
var hiddencontext = hiddencanvas.getContext('2d');

// resizing for rapsheet
var resizecanvas=document.getElementById("resizeCanvas");
var resizecontext=resizecanvas.getContext("2d");

// rapsheet canvas for making canvas to print
var rapcanvas = document.getElementById('rapCanvas');
var rapcontext = rapcanvas.getContext('2d');

// original image to be modified
var imageObj = new Image();
// preview image object
var previewImg = new Image();

// overlay object
var compositeObj = new Image();
var prevCompositeObj = new Image();
// filters
var hidNoise = new Image();
var hidBorder = new Image();
var rapNoise = new Image();
var rapBorder = new Image();
// rapsheet graphics
var rapMug = new Image();
var rapFinger = new Image();
var rapBackground = new Image();
var ocultoStamp = new Image();

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
// rapMug.src = "img/mugshot.jpg";
// noise and borders
hidNoise.src = "img/rapnoisesquare.png";
hidBorder.src = "img/rapbordersquare.png";
rapNoise.src = "img/rapnoise.png";
rapBorder.src = "img/rapborder.png";

rapFinger.src ="img/fingerprint.png";
rapBackground.src = "img/background.jpg";
//occultostamp
ocultoStamp.src = "img/stamp.png";

// rapCompositeObj.src = "";

imageObj.onload = function() {

	/* image preview and clipping */
	// var widTarget = canvas.width;
	var cropShift = -100;
	// var canvas.width = canvas.height * (canvas.height / imageObj.height);
	context.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
	resizecontext.drawImage(imageObj, imageObj.width/2 - ((imageObj.height / resizecanvas.height)*resizecanvas.width)/2 + cropShift, 0,(imageObj.height / resizecanvas.height)*resizecanvas.width, imageObj.height, 0, 0, resizecanvas.width,resizecanvas.height);
	// previewImg.src = canvas.toDataURL();
	rapMug.src = resizecanvas.toDataURL();;

	// mugshot resize
	

    // would possibly want to move this out to submit
    // resizecanvas.width=825;
    // resizecanvas.height=1275;
    // resizectx.drawImage(imageObj,0,0,imageObj.width,imageObj.height,0,0,resizecanvas.width,resizecanvas.height);
    // rapMug.src = resizecanvas.toDataURL();

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
	createRapsheet();
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

// rapsheet composition
function createRapsheet(){

	// vars
	var resolution = 150;
	var docWidth = 1650;
	var thumbBoxWidth = 1*resolution;

	var fdate = new Date();
	var fdatestring = ("0" + (fdate.getMonth() + 1).toString()).substr(-2) + "/" + ("0" + fdate.getDate().toString()).substr(-2)  + "/" + (fdate.getFullYear().toString()).substr(2);

	rapcontext.clearRect(0,0,rapcanvas.width,rapcanvas.height);
	// draw white background
	rapcontext.fillStyle = "#FFFFFF";
	rapcontext.fillRect(0,0,rapcanvas.width,rapcanvas.height);

	// draw background img
	rapcontext.drawImage(rapBackground, 0, 0, 1650, 1275);


	
	// draw mug
	rapcontext.drawImage(rapMug, 0, 0, 825, 1275);

	// draw border
	rapcontext.drawImage(rapBorder, 0, 0, 825, 1275);
	// global alpha
	rapcontext.globalAlpha = 0.5;
	// draw noise

	rapcontext.drawImage(rapNoise, 0, 0, 825, 1275);
	// global alpha
	rapcontext.globalAlpha = 1.0;

	// fingerprint boxes
	rapcontext.fillStyle = "#000000";
	rapcontext.strokeStyle = "black";
	rapcontext.beginPath();
	rapcontext.lineWidth = 2;
	rapcontext.strokeRect(docWidth*0.75, 2.25*resolution, 1*resolution, 1.25*resolution);
	rapcontext.strokeRect(docWidth*0.75+thumbBoxWidth+15, 2.25*resolution, 1*resolution, 1.25*resolution);
	// rapcontext.strokeStyle = "black";
	rapcontext.stroke();
	rapcontext.lineWidth = 1;
	rapcontext.beginPath();
	rapcontext.moveTo(docWidth*0.75, 2.44*resolution);
	rapcontext.lineTo(docWidth*0.75+thumbBoxWidth, 2.44*resolution);
	rapcontext.stroke();
	rapcontext.beginPath();
	rapcontext.moveTo(docWidth*0.75+thumbBoxWidth+15, 2.44*resolution);
	rapcontext.lineTo(docWidth*0.75+thumbBoxWidth*2+15, 2.44*resolution);
	rapcontext.stroke();
	
	//fingerprint images
	rapcontext.drawImage(rapFinger, docWidth*0.75, 2.52*resolution, 120, 168);
	rapcontext.drawImage(rapFinger, docWidth*0.75+thumbBoxWidth+15, 2.45*resolution, 120, 168);


	//heading section - former background lines
	// rapcontext.beginPath();
	// rapcontext.moveTo(docWidth*0.5+50, 0.5*resolution);
	// rapcontext.lineTo(docWidth-50, 0.5*resolution);
	// rapcontext.stroke();

	rapcontext.font = "40px DotMatrix-TwoRegular";
	rapcontext.textAlign="center";
	rapcontext.fillText("SUSPECT RAP SHEET", docWidth*0.75, 1*resolution);

	// former background lines
	// rapcontext.beginPath();
	// rapcontext.moveTo(docWidth*0.5+50, 1.375*resolution);
	// rapcontext.lineTo(docWidth-50, 1.375*resolution);
	// rapcontext.stroke();

	rapcontext.font = "16px DotMatrix-TwoExtended";
	rapcontext.fillText("LOS SECRETO POLICE DEPARTMENT", docWidth*0.75, 1.65*resolution);
	rapcontext.fillText("13TH PRECINCT", docWidth*0.75, 1.85*resolution);

	// former background lines
	// rapcontext.beginPath();
	// rapcontext.moveTo(docWidth*0.5+50, 2*resolution);
	// rapcontext.lineTo(docWidth-50, 2*resolution);
	// rapcontext.stroke();

	//fingerprint text
	rapcontext.textAlign="center";
	rapcontext.font = "12px bpdotsregular";
	rapcontext.fillText("1. LEFT THUMB", docWidth*0.75+thumbBoxWidth/2, 2.4*resolution);
	rapcontext.fillText("2. RIGHT THUMB", docWidth*0.75+thumbBoxWidth*1.5+15, 2.4*resolution);

	var randomNum = Math.random();
	console.log(randomNum);

	//generate serial number
	var serialNo = (""+Math.random()).substring(2,10);
	var starNo = (""+Math.random()).substring(2,9);

	console.log(serialNo);
	console.log(starNo);
	//info section
	rapcontext.textAlign="left";
	rapcontext.font = "16px DotMatrix-TwoExtended";
	rapcontext.fillText("SERIAL NO.:", docWidth*0.5+50, 2.5*resolution);
	rapcontext.font = "20px DotMatrix-TwoRegular";
	rapcontext.fillText(serialNo, docWidth*0.5+50, 2.75*resolution);
	rapcontext.font = "16px DotMatrix-TwoExtended";
	rapcontext.fillText("DATE OF INCIDENT:", docWidth*0.5+50, 3.17*resolution);
	rapcontext.font = "20px DotMatrix-TwoRegular";
	rapcontext.fillText(fdatestring, docWidth*0.5+50, 3.4*resolution);
	rapcontext.font = "16px DotMatrix-TwoExtended";
	rapcontext.fillText("OFFICER:", docWidth*0.5+50, 4*resolution);
	rapcontext.font = "20px DotMatrix-TwoRegular";
	rapcontext.fillText("WIGGLESWORTH", docWidth*0.5+140, 4*resolution);
	rapcontext.font = "16px DotMatrix-TwoExtended";
	rapcontext.fillText("STAR NO.:", docWidth*0.75, 4*resolution);
	rapcontext.font = "20px DotMatrix-TwoRegular";
	rapcontext.fillText(starNo, docWidth*0.75+100, 4*resolution);

	//list of possible offences
	var OffenceLib = ['Strange browser activity',
	'Loud music playing',
	'Bad music playing',
	'Excessive flirting',
	'Waking up the neighbors',
	'Party fouls',
	'Sleeping all day, partying all night',
	'Overzealous high fiving',
	'Prolonged after-the-fact laughter',
	'Luring friends into the unknown',
	'Not spontaneous enough',
	'Aggressive party food consumption',
	'Extravagant use of hairspray',
	'Wearing sunglasses at night',
	'Popping too many collars',
	'Extreme use of emoji',
	'Using “LOL” in every text message',
	'Wearing pleather',
	'Sleeping too much',
	'Not sleeping enough',
	'Not knowing your friends’ spirit animals',
	'Recurring dreams featuring burritos'];
		
	//create a unique random number between 0-OffenceLib length
	var uniqueRandoms = [];
	var numRandoms = OffenceLib.length;
	function makeUniqueRandom() {
	    // refill the array if needed
	    if (!uniqueRandoms.length) {
	        for (var i = 0; i < numRandoms; i++) {
	            uniqueRandoms.push(i);
	        }
	    }
	    var index = Math.floor(Math.random() * uniqueRandoms.length);
	    var val = uniqueRandoms[index];
	    // now remove that value from the array
	    uniqueRandoms.splice(index, 1);
	    return val;
	}

	// part of background image now
	//activities section
	// rapcontext.beginPath();
	// rapcontext.moveTo(docWidth*0.5+50, 4.2*resolution);
	// rapcontext.lineTo(docWidth-50, 4.2*resolution);
	// rapcontext.stroke();
	//bullets
	rapcontext.fillStyle = "#000000";
	rapcontext.fillRect(docWidth*0.5+100, 5.1*resolution-8, 5, 5);
	rapcontext.fillRect(docWidth*0.5+100, 5.35*resolution-8, 5, 5);
	rapcontext.fillRect(docWidth*0.5+100, 5.6*resolution-8, 5, 5);
	rapcontext.fillRect(docWidth*0.5+100, 5.85*resolution-8, 5, 5);
	rapcontext.fillRect(docWidth*0.5+100, 6.1*resolution-8, 5, 5);
	//Offences
	rapcontext.textAlign="left";
	rapcontext.font = "16px DotMatrix-TwoExtended";
	rapcontext.fillText("SUSPICIOUS ACTIVITY DOCUMENTED:", docWidth*0.5+50, 4.6*resolution);
	rapcontext.font = "26px DotMatrix-TwoRegular";
	rapcontext.fillText(OffenceLib[makeUniqueRandom()], docWidth*0.5+150, 5.1*resolution);
	rapcontext.fillText(OffenceLib[makeUniqueRandom()], docWidth*0.5+150, 5.35*resolution);
	rapcontext.fillText(OffenceLib[makeUniqueRandom()], docWidth*0.5+150, 5.6*resolution);
	rapcontext.fillText(OffenceLib[makeUniqueRandom()], docWidth*0.5+150, 5.85*resolution);
	rapcontext.fillText(OffenceLib[makeUniqueRandom()], docWidth*0.5+150, 6.1*resolution);

	// draw stamp
	rapcontext.drawImage(ocultoStamp, 825, 900);

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
	
	hiddencontext.drawImage(hidBorder, 0, 0);
	// draw noise
	hiddencontext.globalAlpha = 0.5;
	hiddencontext.drawImage(hidNoise, 0, 0);
	var canvasData = hiddenCanvas.toDataURL("image/jpeg");
	hiddencontext.globalAlpha = 1;
	// draw border
	
    // hiddencontext.globalCompositeOperation = "source-over";
	// hiddencontext.drawImage(compositeObj,-100,-10);

    var postData = 'photo=' + document.getElementById('photo-name').value;
    // console.log(postData);
    var rapData = rapCanvas.toDataURL("image/jpeg", 1.0);
	postData += "&imgData=";
	postData += canvasData.replace(/^data:image\/(jpg|jpeg);base64,/, "");
	postData += "&rapData=";
	postData += rapData.replace(/^data:image\/(jpg|jpeg);base64,/, "");
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
		            console.log("in 401");
		            console.log('retrying');
		            setTimeout(sendRequest, period + 1000);
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
                else {
                	console.log("trying to reconnect");
                	if(!clear){
	                    pollTimer2 = setTimeout(sendRequest, period);
	                }
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

