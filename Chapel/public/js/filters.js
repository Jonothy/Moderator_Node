/* image filter functions */

/* negative filter */
function negativeFilter(pixelData){

	for(var i = 0; i < pixelData.length; i += 4) {
      // red
      pixelData[i] = 255 - pixelData[i];
      // green
      pixelData[i + 1] = 255 - pixelData[i + 1];
      // blue
      pixelData[i + 2] = 255 - pixelData[i + 2];
    }

}

function camanContrast(canvas, contrastVal){
  Caman(canvas, function () {
    // manipulate image here
    this.contrast(contrastVal).render();
  });
}

function contrastImage(pixelData, contrast) {

    console.log("contrast to");
    console.log(contrast);
    var tempData = pixelData;
    var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for(var i=0;i<tempData.data.length;i+=4)
    {
        tempData.data[i] = factor * (tempData.data[i] - 128) + 128;
        tempData.data[i+1] = factor * (tempData.data[i+1] - 128) + 128;
        tempData.data[i+2] = factor * (tempData.data[i+2] - 128) + 128;
    }

    // for (var i = 0; i < tempData.data.length; i += 4) {
    //  // var contrast = 10;
    //  var average = Math.round( ( tempData.data[i] + tempData.data[i+1] + tempData.data[i+2] ) / 3 );
    //   if (average > 127){
    //     tempData.data[i] += ( tempData.data[i]/average ) * contrast;
    //     tempData.data[i+1] += ( tempData.data[i+1]/average ) * contrast;
    //     tempData.data[i+2] += ( tempData.data[i+2]/average ) * contrast;
    //   }else{
    //     tempData.data[i] -= ( tempData.data[i]/average ) * contrast;
    //     tempData.data[i+1] -= ( tempData.data[i+1]/average ) * contrast;
    //     tempData.data[i+2] -= ( tempData.data[i+2]/average ) * contrast;
    //   }
    // }
    return tempData;
}

function brightness(pixelData, adjustment) {
  console.log("adjustment");
  console.log(adjustment);
  var tempData = pixelData;

  for (var i=0; i<tempData.data.length; i+=4) {
    tempData.data[i] = tempData.data[i] + adjustment;
    tempData.data[i+1] = tempData.data[i+1] + adjustment;
    tempData.data[i+2] = tempData.data[i+2] + adjustment;
  }
  return tempData;
};

function cssContrast(canvasi, contrast) {

  console.log("css contrast");

  var contrast_arg = 'contrast('+contrast+')';
  console.log(contrast_arg);
  canvasi.style.webkitFilter = contrast_arg;
  canvasi.style.filter = contrast_arg;

}

// image scaling for preview canvas


// function contrastImage(imageData, contrast) {

//     var data = imageData.data;
//     var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

//     for(var i=0;i<data.length;i+=4)
//     {
//         data[i] = factor * (data[i] - 128) + 128;
//         data[i+1] = factor * (data[i+1] - 128) + 128;
//         data[i+2] = factor * (data[i+2] - 128) + 128;
//     }
//     return imageData;
// }