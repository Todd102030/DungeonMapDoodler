"use strict";

var Move = (function(){
	var self={
		borderSize: 3,
		hatchSize: 30,
		id:8,
		inset:0,
		size: 20,
		title: "Move Settings",
		draw: function(xpos, ypos, data){

		},
		drawCursor : function(ctx, xpos, ypos, data){

		},
		/**
		 * Draws a rectangle using given dimensions and clips all drawings contained
		 * within it
		 */
		drawClipRec : function(ctx,dim) {
			ctx.save();
			ctx.beginPath();
			ctx.globalAlpha = 0;
			ctx.rect(dim.x + 0.25, dim.y + 0.25, dim.w - 0.6, dim.h - 0.6);
			ctx.stroke();
			ctx.clip();
			ctx.globalAlpha = 1;
		},
		endMode: function(){
			pgWarehouseMap.canvas.style.cursor = "unset";
		},
		mouseDown: function(xpos, ypos, data){
            var wh = pgWarehouseMap;
            self.mouseIsDown = true;
			wh.canvas.style.cursor = 'grabbing';
            self.mouseMovedWhileDown = false;
            //var mrect = {x:xpos,y:ypos,w:1,h:1};
            /*var hit = self.hitTestLocations(mrect);
            if(hit != null){
            	self.movingId = hit;
            }*/
            wh.offsetX = parseFloat(wh.mouseX) - parseFloat(wh.globalOffsetX); 
            wh.offsetY = parseFloat(wh.mouseY) - parseFloat(wh.globalOffsetY); 
		},
		mouseMove: function(xpos, ypos, data){
            var wh = pgWarehouseMap;
			if(self.mouseIsDown){
            	self.mouseMovedWhileDown = true;
                wh.globalOffsetX = wh.mouseX-wh.offsetX;
                wh.globalOffsetY = wh.mouseY-wh.offsetY;
            }
		},
		mouseUp: function(xpos, ypos,data){
            self.mouseIsDown = false;
			pgWarehouseMap.canvas.style.cursor = 'grab';
		},
		setParameterBox: function(container){
			var htm = "";
			container.innerHTML = htm;
		},
	}; return self;
})()