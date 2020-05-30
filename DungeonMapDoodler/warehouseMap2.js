"use strict";
//Condensed way to round all my numbers to 2 decimal places without the 
//overhead of converting to a string that .toFixed() would add
Number.prototype.f2 = function(){
	var pow = Math.pow(10,2);
	return +( Math.round(this*1e2) / 1e2 );
};

function LocationRect(id, x, y, w, h, crop) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.f = 0;
    this.loc=0;
    return this;
}

function Wall(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    return this;
};

function StampObj(x, y, w, h, img, imgPath, angle) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
	this.img = img;
	this.path = imgPath;
	this.angle = angle;
    return this;
};

function TextField(text, x, y, isVertical, fontSize){
	this.text = text;
	this.x = x;
	this.y = y;
	this.vert = isVertical;
	this.f = fontSize;
	return this;
}
//MODE LIST:
// 1 = Click and drag to pan the entire page around, scroll wheel to zoom in and out
// 2 = Click and drag creates an outline for a location
// 3 = Click and drag to create walls for map
// 4 = Display mode, draws warehouse image as large as possible on screen, if real data is available, show it on screen
// 5 = Click to create text on map
// 6 = Edit mode to delete created objects
// 7 = Mode.DIMENSIONS = Mode for setting initial outer dimensions of warehouse 
var Mode = {
	MOVE: 1,
	LOCATION: 2,
	WALLS: 3,
	DISPLAY: 4,
	TEXT: 5,
	EDIT: 6,
	DIMENSIONS: 7,
    DOODLE: 8
};

Array.max = function( array ){
	return Math.max.apply( Math, array );
};