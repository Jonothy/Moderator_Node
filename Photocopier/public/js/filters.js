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

function contrastImage(pixelData, contrast) {

    // var data = imageData.data;
    var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for(var i=0;i<pixelData.length;i+=4)
    {
        pixelData[i] = factor * (pixelData[i] - 128) + 128;
        pixelData[i+1] = factor * (pixelData[i+1] - 128) + 128;
        pixelData[i+2] = factor * (pixelData[i+2] - 128) + 128;
    }
    return imageData;
}

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