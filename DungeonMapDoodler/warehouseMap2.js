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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function StampObj(x, y, w, h, img, imgPath, angle, layer, colour, canColour) {
	var self = this;
	img.onload = function(){
		self.ratio = this.naturalWidth/this.naturalHeight;
		self.ctx.drawImage(this, 0, 0, w, h);
		if(canColour){
			self.ctx.globalCompositeOperation = "source-in";
			self.ctx.fillStyle = colour || "#000000";
			self.ctx.fillRect(0,0,self.canvas.width, self.canvas.height);
		}
		doodler.updateFrameBuffer();
	}
	this.canvas = document.createElement("canvas");
	this.canvas.width = w;
	this.canvas.height = h;
	
	this.ctx = this.canvas.getContext("2d")
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
	this.colour = colour;
	this.canColour = canColour;
	this.img = img;
	this.img.width=w;
	this.img.height=h;
	this.path = imgPath;
	this.angle = angle;
    this.layer = layer || 0;
    return this;
};

function TextField(text, x, y, isVertical, fontSize, font, justify){
	this.text = text;
	this.x = x;
	this.y = y;
	this.vert = isVertical;
	this.f = fontSize;
	this.font = font;
    this.justify = justify;
	return this;
}

function Layer(name, layerIndex, hatchCanvas, hatchCtx, outlineCanvas, outlineCtx, doodleCanvas, doodleCtx, hatchStyle, floorStyle, showFloor){
	this.layerIndex = layerIndex;
	this.hatchCanvas = hatchCanvas;
	this.outlineCanvas = outlineCanvas;
	this.doodleCanvas = doodleCanvas;
	this.hatchCtx = hatchCtx;
	this.outlineCtx = outlineCtx;
	this.doodleCtx = doodleCtx;
	this.hatchStyle = hatchStyle;
	this.visible = true;
	this.hatchVisible = true;
	this.name = name;
	this.hatchImg = null;
	this.hatchGenerated = false;
    this.floorImg = null;
	this.floorGenerated = false;
    this.floorStyle = floorStyle;
    this.showFloor = showFloor;
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
