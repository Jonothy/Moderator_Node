// initvals.js 
// values shared in other files

// change these guys
var debug = 0;
var win7 = 1;
var eventFolder = 'copier';
var socket = 8080;

// this gets us the correct base folders based on debug, os, date and event
var fdate = new Date();
Date.prototype.addHours = function(h){
    this.setHours(this.getHours()+h);
    return this;
}
fdate.addHours(-12);
var fdatestring = ("0" + (fdate.getMonth() + 1).toString()).substr(-2) + "_" + ("0" + fdate.getDate().toString()).substr(-2)  + "_" + (fdate.getFullYear().toString()).substr(2);
var nasBasePath = ['/Volumes/OCULTO/'+fdatestring+'/'+eventFolder, 'Z:/'+fdatestring+'/'+eventFolder];
var debugBasePath = __dirname + '/images/'+fdatestring+'/'+eventFolder;
var basePath = [nasBasePath[win7], debugBasePath];

module.exports = {
	debug: debug,
	basePath: basePath,
	eventFolder: eventFolder,
	socket: socket
};