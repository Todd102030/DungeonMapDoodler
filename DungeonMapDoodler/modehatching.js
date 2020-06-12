"use strict";

var Hatching = (function(){
	var self={
		borderSize: 3,
		fillColor: "white",
		outlineColor: "black",
		hatchSize: 30,
		id:8,
		size: 20,
		shape: Shape.Square,
		title: "Hatching",
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
		},
		changeHatchSize: function(evt){
			self.hatchSize = parseInt(evt.target.value);
			ir.set("hatchingHatchSizeLabel", self.hatchSize);
		},
		changeShape: function(evt){
			self.shape = Shape[evt.target.value];
		},
		draw: function(xpos, ypos, data){
			var size = self.size;
			var border=self.borderSize;
			var ctx = data.hatchCtx;
			var hatchSize = self.hatchSize;
			// Radii of the white glow.
			var innerRadius = self.size * 0.15;
			var outerRadius = self.size*2+hatchSize;
			// Radius of the entire circle.
			var radius = self.size*2.1+hatchSize;

			var gradient = ctx.createRadialGradient(xpos, ypos, innerRadius, xpos, ypos, outerRadius);
			gradient.addColorStop(0, self.fillColor);
			gradient.addColorStop(1, 'transparent');

			ctx.arc(xpos, ypos, radius, 0, 2 * Math.PI);

			ctx.fillStyle = gradient;
			ctx.fill();
		},
		drawCursor : function(ctx, xpos, ypos, data){
			ctx.strokeStyle = "rgb(60,200,200)";
			var radius = self.size*2.1+self.hatchSize;
			ctx.beginPath();
			ctx.arc(xpos, ypos, radius*pgWarehouseMap.zoomLevel, 0, 2 * Math.PI);
			ctx.stroke();
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
		mouseDown: function(xpos, ypos, data){
			self.isDoodling = true;
            self.doodleStartX = xpos;
            self.doodleStartY = ypos;
            self.doodleEndX = xpos;
            self.doodleEndY = ypos;
			self.draw(xpos, ypos, data);
		},
		mouseMove: function(xpos, ypos, data){
			if (self.isDoodling){
				self.doodleEndX = xpos;
				self.doodleEndY = ypos;
				self.draw(xpos, ypos, data);
				self.doodleStartX = xpos;
				self.doodleStartY = ypos;
			}
		},
		mouseUp: function(xpos, ypos){
			self.isDoodling = false;
            self.doodleStartX = 0;
            self.doodleStartY = 0;
            self.doodleEndX = 0;
            self.doodleEndY = 0;
		},
		setParameterBox: function(container){
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<div class='paramTitle'>Hatch Size: </div><label for='hatchingHatchSize' id='hatchingHatchSizeLabel'>${self.hatchSize}</label><br>
						<input style='width:78px' type="range" id="hatchingHatchSize" name=hatchingHatchSize" min="1" max="200" value='${self.hatchSize}' onchange='Modes.Hatching.changeHatchSize(event)' oninput='Modes.Hatching.changeHatchSize(event)'><br>
						
						`;
			//<input type='color' value='${self.fillColor}' id='hatchingColor' onchange="Modes.Hatching.changeColor(event, 'fill')">
						//<label for="hatchingColor">Hatching Color</label><br>
			container.innerHTML = htm;
		},
	}; return self;
})()