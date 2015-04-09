/* image filter functions */

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