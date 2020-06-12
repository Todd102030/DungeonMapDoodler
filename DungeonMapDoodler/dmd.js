"use strict";

var Shape = {
	Circle: 1,
	Square: 2,
}

function getGridXY(xpos, ypos){
	var wh = pgWarehouseMap;
	var dim = pgWarehouseMap.dimensions;
	var xfeet = dim.wf;
	var yfeet = dim.hf;
	var sx = dim.scaleX;
	var sy = dim.scaleY;
	var zoom = wh.zoomLevel;
	var step = dim.footPixel * dim.stepSize / sx * zoom;
	var offx = (wh.globalOffsetX % step);
	var offy = (wh.globalOffsetY % step);
	var xgridtop = Math.floor((xpos-offx)/step)*step+offx;
	var ygridtop = Math.floor((ypos-offy)/step)*step+offy;
	
	var xgridmid = Math.floor((xpos-offx)/step*2)*step/2+offx;
	var ygridmid = Math.floor((ypos-offy)/step*2)*step/2+offy;
	return {xpos:xgridtop, ypos:ygridtop, step:step, xgridmid: xgridmid, ygridmid: ygridmid};
}

function getGridXY2(xpos, ypos){
	var dim = pgWarehouseMap.dimensions;
	var xfeet = dim.wf;
	var yfeet = dim.hf;
	var sx = dim.scaleX;
	var sy = pgWarehouseMap.dimensions.scaleY;
	var step = dim.footPixel * dim.stepSize / sx;
	var zoom = pgWarehouseMap.zoomLevel;
	var xgridtop = Math.floor(xpos/step)*step;
	var ygridtop = Math.floor(ypos/step)*step;
	var xgridmid = Math.floor((xpos)/step*2)*step/2;
	var ygridmid = Math.floor((ypos)/step*2)*step/2;
	
	return {xpos:xgridtop, ypos:ygridtop, step:step, xgridmid: xgridmid, ygridmid: ygridmid};
}



var ModeHelper = (function(){
	var self={
		drawCrossHatchCircle: function(ctx, xpos, ypos, size, border, hatchSize){
			ctx.fillStyle = "black";
			if(!self.circleFuzz){
				self.circleFuzz = ir.get("circlefuzzImg");
			}
			ctx.drawImage(self.circleFuzz,xpos-(size/2)-border-hatchSize, ypos-(size/2)-border-hatchSize, 
					   size+(border*2+hatchSize*2), size+(border*2+hatchSize*2))
		},
	
    zz_modeHelper: 0};
  return self;
})();