"use strict";

var Line = (function(){
	var self={
		borderSize: 3,
		fillColor: "#ffffff",
		outlineColor: "#000000",
		hatchSize: 30,
		id:8,
		size: 20,
		shape: Shape.Circle,
		title: "Line Settings",
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
		},
		changeSize: function(evt, fromInput){
			self.size = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("lineSizeLabel", self.size);
			}else{
				ir.set("lineSize", self.size);
			}
		},
        changeBorderSize: function(evt, fromInput){
			self.borderSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("lineBorderSizeLabel", self.borderSize);
			}else{
				ir.set("lineBorderSize", self.borderSize);
			}
		},
		changeHatchSize: function(evt, fromInput){
			self.hatchSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("lineHatchSizeLabel", self.hatchSize);
			}else{
				ir.set("lineHatchSize", self.hatchSize);
			}
		},
		changeShape: function(evt){
			self.shape = Shape[evt.target.value];
		},
		draw: function(xpos, ypos, expos, eypos, data){
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
			gradient.addColorStop(0, 'black');
			gradient.addColorStop(1, 'transparent');

			ctx.arc(xpos, ypos, radius, 0, 2 * Math.PI);

			ctx.fillStyle = gradient;
			ctx.fill();
			if(self.shape == Shape.Circle){
				//Path Drawing
				ctx = data.doodleCtx;
				ctx.fillStyle = self.fillColor;
				ctx.strokeStyle = self.fillColor;
				ctx.beginPath();
				ctx.arc(xpos, ypos, size, 0, 2 * Math.PI);
				ctx.fill();
				ctx.beginPath();
				ctx.arc(expos, eypos, size, 0, 2 * Math.PI);
				ctx.fill();
				ctx.beginPath();
				ctx.lineWidth = size*2;
				ctx.moveTo(xpos,ypos);
    			ctx.lineTo(expos,eypos);
				ctx.stroke();

				//Outline Drawing
				ctx = data.outlineCtx;
				ctx.fillStyle = self.outlineColor;
				ctx.strokeStyle = self.outlineColor;
				ctx.beginPath();
				ctx.arc(xpos, ypos, size+border, 0, 2 * Math.PI);
				ctx.arc(expos, eypos, size+border, 0, 2 * Math.PI);
				ctx.fill();
				ctx.beginPath();
				ctx.lineWidth = (size+border)*2;
				ctx.moveTo(xpos,ypos);
    			ctx.lineTo(expos,eypos);
				ctx.stroke();
				//ctx.fillRect(xpos-size-border,ypos-size-border, (size+border)*2,(size+border)*2);
			}else{
				//Path Drawing
				ctx = data.doodleCtx;
				ctx.fillStyle = self.fillColor;
				ctx.strokeStyle = self.fillColor;
				ctx.fillRect(xpos-size,ypos-size, size*2,size*2);
				ctx.fillRect(expos-size,eypos-size, size*2,size*2);
				ctx.beginPath();
				var lineWidth = Math.sqrt(Math.pow(size,2)+Math.pow(size,2));
				ctx.lineWidth = (lineWidth+border)*2;
				ctx.moveTo(xpos,ypos);
    			ctx.lineTo(expos,eypos);
				ctx.stroke();


				//Outline Drawing
				ctx = data.outlineCtx;
				ctx.fillStyle = self.outlineColor;
				ctx.strokeStyle = self.outlineColor;
				ctx.fillRect(xpos-size-border,ypos-size-border, (size+border)*2,(size+border)*2);
				ctx.fillRect(expos-size-border,eypos-size-border, (size+border)*2,(size+border)*2);
				ctx.beginPath();
				var lineWidth = Math.sqrt(Math.pow(size,2)+Math.pow(size,2));
				ctx.lineWidth = (lineWidth+border)*2;
				ctx.moveTo(xpos,ypos);
    			ctx.lineTo(expos,eypos);
				ctx.stroke();
			}	
            doodler.updateFrameBuffer();
		},
		drawCursor : function(ctx, xpos, ypos, data){
			ctx.strokeStyle = "rgb(60,200,200)";
			var radius = self.size*2.1+self.hatchSize;
			var zoom = doodler.zoomLevel;
			var offx = doodler.globalOffsetX;
			var offy = doodler.globalOffsetY;
			var size = self.size;
			//ctx.beginPath();
			//ctx.arc(xpos, ypos, radius*doodler.zoomLevel, 0, 2 * Math.PI);
			//ctx.stroke();
			
			//Line
			ctx.strokeStyle = "rgb(240,60,60)";
			if(self.shape == Shape.Circle ){
				ctx.beginPath();
				ctx.arc(xpos, ypos, (self.size)*doodler.zoomLevel, 0, 2 * Math.PI);
				ctx.stroke();
				
				ctx.beginPath();
				ctx.arc(self.doodleStartX*zoom+offx || xpos, self.doodleStartY*zoom+offy || ypos, (self.size)*doodler.zoomLevel, 0, 2 * Math.PI);
				ctx.stroke();
				
				ctx.beginPath();
				ctx.arc(self.doodleEndX*zoom+offx || xpos, self.doodleEndY*zoom+offy || ypos, (self.size)*doodler.zoomLevel, 0, 2 * Math.PI);
				ctx.stroke();
				
				if(self.doodleEndX != null){
					ctx.lineWidth = 3;
					ctx.beginPath();
					ctx.moveTo(self.doodleStartX*zoom+offx, self.doodleStartY*zoom+offy);
					ctx.lineTo(self.doodleEndX*zoom+offx || xpos, self.doodleEndY*zoom+offy || ypos);
					ctx.stroke();
				}
			}
			else{
				
				ctx.strokeRect((self.doodleStartX*zoom+offx || xpos)-size,(self.doodleStartY*zoom+offy || ypos)-size, size*2,size*2);
				ctx.strokeRect((self.doodleEndX*zoom+offx || xpos)-size,(self.doodleEndY*zoom+offy || ypos)-size, size*2,size*2);
				
				if(self.doodleEndX != null){
					ctx.lineWidth = 3;
					ctx.beginPath();
					ctx.moveTo(self.doodleStartX*zoom+offx, self.doodleStartY*zoom+offy);
					ctx.lineTo(self.doodleEndX*zoom+offx || xpos, self.doodleEndY*zoom+offy || ypos);
					ctx.stroke();
				}
			}
			
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
			
		},
		mouseDown: function(xpos, ypos, data){
			self.isDoodling = true;
            self.doodleStartX = xpos;
            self.doodleStartY = ypos;
            self.doodleEndX = xpos;
            self.doodleEndY = ypos;
			//self.draw(xpos, ypos, xpos, ypos, data);
		},
		mouseMove: function(xpos, ypos, data){
			if (self.isDoodling){
				self.doodleEndX = xpos;
				self.doodleEndY = ypos;
			}
		},
		mouseUp: function(xpos, ypos, data){
			var steps = 15;
			var dx = Math.abs(self.doodleStartX-self.doodleEndX);
			var dy = Math.abs(self.doodleStartY-self.doodleEndY);
			var sx = self.doodleStartX;
			var sy = self.doodleStartY;
			var ex = self.doodleEndX;
			var ey = self.doodleEndY;
			/*if(ex < sx){
				var tmp = ex;
				ex = sx;
				sx = tmp;	
			}
			if(ey < sy){
				var tmp2 = ey
				ey = sy;
				sy = tmp2;	
			}*/
			//for(var x=sx, y=sy;x<ex;x+=dx/steps,y+=dy/steps){
			self.draw(sx, sy, ex,ey, data);
			//}
			
			
			doodler.updateCurrentImage(false, true);
			
			self.isDoodling = false;
            self.doodleStartX = null;
            self.doodleStartY = null;
            self.doodleEndX = null;
            self.doodleEndY = null;
		},
		setParameterBox: function(container){
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<div class='paramTitle'>Width: </div><input type='number' style='width:60px' id='lineSizeLabel' value="${self.size}" onchange='Modes.Line.changeSize(event, true)' oninput='Modes.Line.changeSize(event, true)'><br>
						<input style='width:100px' type="range" id="lineSize" name=lineSize" min="1" max="150" value='${self.size}' onchange='Modes.Line.changeSize(event)' oninput='Modes.Line.changeSize(event)'><br>
                        <div class='paramTitle'>Hatch: </div><input type='number' style='width:60px' id='lineHatchSizeLabel' value="${self.hatchSize}" onchange='Modes.Line.changeHatchSize(event, true)' oninput='Modes.Line.changeHatchSize(event, true)'><br>
						<input style='width:100px' type="range" id="lineHatchSize" name="lineHatchSize" min="1" max="150" value='${self.hatchSize}' onchange='Modes.Line.changeHatchSize(event)' oninput='Modes.Line.changeHatchSize(event)'><br>
						<div class='paramTitle'>Wall Thickness: </div><input type='number' style='width:60px' id='lineBorderSizeLabel' value="${self.borderSize}" onchange='Modes.Line.changeBorderSize(event, true)' oninput='Modes.Line.changeBorderSize(event, true)'><br>
						<input style='width:100px' type="range" id="lineBorderSize" name="lineBorderSize" min="0" max="25" value='${self.borderSize}' onchange='Modes.Line.changeBorderSize(event)' oninput='Modes.Line.changeBorderSize(event)'><br>
						<!--<input type="radio" id="lineSquare" name="lineShape" value="Square" onchange='Modes.Line.changeShape(event)'>
						<label for="lineSquare">Square</label><br>
						<input type="radio" id="lineCircle" name="lineShape" value="Circle" onchange='Modes.Line.changeShape(event)'>
						<label for="lineCircle">Circle</label><br>-->
						<input type='color' value='${self.fillColor}' id='lineFillColor' onchange="Modes.Line.changeColor(event, 'fill')">
						<label for="lineFillColor">Fill Color</label><br>
						<input type='color' value='${self.outlineColor}' id='lineOutlineColor' onchange="Modes.Line.changeColor(event, 'outline')">
						<label for="lineOutlineColor">Outline Color</label><br>
						`;
			container.innerHTML = htm;
		},
	}; return self;
})()