"use strict";

var ShapeTool = (function(){
	var self={
		borderSize: 3,
		hatchSize: 30,
		id:8,
		inset:0,
		size:30,
		fillColor: "#ffffff",
		outlineColor: "#000000",
		hatchSize: 30,
		numSides: 8,
		shape: Shape.Square,
		isSnapping: true,
		isSubtractive: false,
		title: "Room Tool Settings",
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
		},
		changeInset: function(evt){
			self.inset = parseInt(evt.target.value);
			ir.set("shapeToolInsetLabel", self.inset);
		},
		changeShape: function(evt){
			self.shape = Shape[evt.target.value];
		},
		changeSnapping: function(evt){
			self.isSnapping = ir.bool("shapeToolIsSnapping");
		},
		changeSubtractive: function(evt){
			self.isSubtractive = ir.bool("shapeToolIsSubtractive");
		},
		changeSides: function(evt){
			self.numSides = evt.target.value;
			ir.set("shapeToolNumSidesLabel", self.numSides);
		},
		draw: function(xpos, ypos, data){
			//TODO: Add square/circle funcitonality
			//data.doodleCtx.strokeStyle = "black";
			//data.doodleCtx.fillRect(self.doodleStartX, self.doodleStartY, self.doodleEndX, self.doodleEndY);
			
			var wh = pgWarehouseMap;
            var offX = wh.globalOffsetX;
            var offY = wh.globalOffsetY;
            var zoom = wh.zoomLevel;
			var size = self.size;
			var border=self.borderSize;
			var ctx = data.hatchCtx;
			var hatchSize = self.hatchSize*5;
			// Radii of the white glow.
			var innerRadius = self.size * 0.15;
			var outerRadius = self.size*2+hatchSize;
			// Radius of the entire circle.
			var radius = self.size*2.1+hatchSize;
			var inset=self.inset;

		
			//Hatch
			var xmid = Math.min(self.doodleStartX,self.doodleEndX) + Math.abs(self.doodleStartX-self.doodleEndX)/2
			var ymid = Math.min(self.doodleStartY,self.doodleEndY) + Math.abs(self.doodleStartY-self.doodleEndY)/2

			ctx = data.hatchCtx;
			ctx.fillStyle = "black";
			if(self.isSubtractive || data.event.shiftKey){
				/*ctx.save();
				ctx.globalCompositeOperation = "destination-out";
				ctx.fillStyle = 'black';
				ctx.drawImage(ir.get("squarefuzzImg"),Math.min(self.doodleStartX,self.doodleEndX)-border-hatchSize, Math.min(self.doodleStartY,self.doodleEndY)-border-hatchSize, 
					   Math.abs(self.doodleStartX-self.doodleEndX)+(border*2+hatchSize*2), Math.abs(self.doodleStartY-self.doodleEndY)+(border*2+hatchSize*2))
				ctx.restore();*/
				
				/*var numberOfSides = self.numSides,
					size = Math.abs(self.doodleStartX-self.doodleEndX),
					Xcenter = self.doodleStartX/zoom,
					Ycenter = self.doodleStartY/zoom;
*/
				var numberOfSides = self.numSides,
				size = Math.abs(self.doodleStartX-self.doodleEndX),
				Xcenter = self.doodleStartX,
				Ycenter = self.doodleStartY;
			
				
				//Path Drawing
				ctx = data.doodleCtx;
				ctx.save();
				ctx.globalCompositeOperation = "destination-out";
				ctx.fillStyle = 'black';
				ctx.fillStyle = self.fillColor;
				ctx.beginPath();
				ctx.moveTo (Xcenter +  size * Math.cos(0), Ycenter +  size *  Math.sin(0));          

				for (var i = 1; i <= numberOfSides;i += 1) {
				  ctx.lineTo (Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides));
				}
				ctx.fill();
				ctx.restore();
				
				//Outline Drawing
				ctx = data.outlineCtx;
				ctx.save();
				ctx.globalCompositeOperation = "destination-out";
				ctx.fillStyle = 'black';
				ctx.fillStyle = self.outlineColor;
				size -= (border + inset);

				ctx.beginPath();
				ctx.moveTo (Xcenter +  size * Math.cos(0), Ycenter +  size *  Math.sin(0));          

				for (var i = 1; i <= numberOfSides;i += 1) {
				  ctx.lineTo (Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides));
				}
				ctx.fill();
				ctx.restore();
			}else{
				
				/*var numberOfSides = self.numSides,
					size = Math.abs(self.doodleStartX-self.doodleEndX),
					Xcenter = self.doodleStartX/zoom,
					Ycenter = self.doodleStartY/zoom;
				*/
				var numberOfSides = self.numSides,
				size = Math.abs(self.doodleStartX-self.doodleEndX),
				Xcenter = self.doodleStartX,
				Ycenter = self.doodleStartY;
			
		
				
				ctx.drawImage(ir.get("circlefuzzImg"),Xcenter-border-hatchSize-size, Ycenter-border-hatchSize-size, 
					   size*2+(border*2+hatchSize*2), size*2+(border*2+hatchSize*2))

				//Path Drawing
				ctx = data.doodleCtx;
				ctx.fillStyle = self.fillColor;
				//ctx.fillRect(Math.min(self.doodleStartX,self.doodleEndX)-inset, Math.min(self.doodleStartY,self.doodleEndY)-inset, 
				//		   Math.abs(self.doodleStartX-self.doodleEndX)+inset*2, Math.abs(self.doodleStartY-self.doodleEndY)+inset*2);
				
				ctx.beginPath();
				ctx.moveTo (Xcenter +  size * Math.cos(0), Ycenter +  size *  Math.sin(0));          

				for (var i = 1; i <= numberOfSides;i += 1) {
				  ctx.lineTo (Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides));
				}
				ctx.fill();
				
				
				//Outline Drawing
				ctx = data.outlineCtx;
				ctx.fillStyle = self.outlineColor;
				size += border + inset;
				ctx.beginPath();
				ctx.moveTo (Xcenter +  size * Math.cos(0), Ycenter +  size *  Math.sin(0));          

				for (var i = 1; i <= numberOfSides;i += 1) {
				  ctx.lineTo (Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides));
				}
				ctx.fill();
			}
			
				
		},
		drawCursor : function(ctx, xpos, ypos, data){
			if(self.mouseIsDown){
				self.drawOutlineBox(ctx, xpos, ypos, data);
			}else{
				if(self.isSubtractive /*|| data.event.shiftKey*/){
					ctx.strokeStyle = "rgb(55, 222, 126)";
				}else{
					ctx.strokeStyle = "rgb(240,60,60)";
				}
				var gridxy = getGridXY(xpos, ypos);
				var offx = pgWarehouseMap.globalOffsetX;
				var offy = pgWarehouseMap.globalOffsetY;
				var zoom = pgWarehouseMap.zoomLevel;
				if(self.isSnapping){
					ctx.strokeRect(gridxy.xpos, gridxy.ypos, 2, 2);
				}else{
					ctx.strokeRect(xpos, ypos, 2, 2);
				}
				
				
				
				
				
			}
		},
		drawOutlineBox: function(ctx, xpos, ypos, data){
			if(self.isSubtractive /*|| data.event.shiftKey*/){
				ctx.strokeStyle = "rgb(55, 222, 126)";
			}else{
				ctx.strokeStyle = "rgb(240,60,60)";
			}
			var offx = pgWarehouseMap.globalOffsetX;
			var offy = pgWarehouseMap.globalOffsetY;
			var zoom = pgWarehouseMap.zoomLevel;
			/*if(self.isSnapping){
				var grid1 = getGridXY2(Math.min(self.doodleStartX,self.doodleEndX), Math.min(self.doodleStartY,self.doodleEndY));
				var grid2 = getGridXY2(Math.max(self.doodleStartX,self.doodleEndX), Math.max(self.doodleStartY,self.doodleEndY));
				ctx.strokeRect(grid1.xpos*zoom+offx, grid1.ypos*zoom+offy, 
						   Math.abs(grid1.xpos-grid2.xpos)*zoom, Math.abs(grid1.ypos-grid2.ypos)*zoom);
			}
			else{
				ctx.strokeRect((Math.min(self.doodleStartX,self.doodleEndX))/zoom, (Math.min(self.doodleStartY,self.doodleEndY))/zoom, 
						   Math.abs(self.doodleStartX-self.doodleEndX), Math.abs(self.doodleStartY-self.doodleEndY));
			}*/
			
			//var gridxy = getGridXY2(Math.min(self.doodleStartX,self.doodleEndX), Math.min(self.doodleStartY,self.doodleEndY));
			
			var numberOfSides = self.numSides,
				size = Math.abs(self.doodleStartX-self.doodleEndX)*zoom,
				Xcenter = self.doodleStartX*zoom + offx,
				Ycenter = self.doodleStartY*zoom + offy;
			
			

			ctx.beginPath();
			ctx.moveTo (Xcenter +  size * Math.cos(0), Ycenter +  size *  Math.sin(0));          

			for (var i = 1; i <= numberOfSides;i += 1) {
			  ctx.lineTo (Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides));
			}
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
		endMode: function(){
			pgWarehouseMap.canvas.style.cursor = "unset";
		},
		mouseDown: function(xpos, ypos, data){
            
			var gridxy = getGridXY2(xpos, ypos);
			
            self.mouseIsDown = true;
			
			if(self.isSnapping){
				self.doodleStartX = gridxy.xpos;
				self.doodleStartY = gridxy.ypos;
				self.doodleEndX = gridxy.xpos;
				self.doodleEndY = gridxy.ypos;
			}else{
				self.doodleStartX = xpos;
				self.doodleStartY = ypos;
				self.doodleEndX = xpos;
				self.doodleEndY = ypos;
			}
            
		},
		mouseMove: function(xpos, ypos, data){
            var wh = pgWarehouseMap;
			var gridxy = getGridXY2(xpos, ypos);
			if(self.isSnapping){
				self.doodleEndX = gridxy.xpos+gridxy.step;
				self.doodleEndY = gridxy.ypos+gridxy.step;
			}else{
				self.doodleEndX = xpos;
				self.doodleEndY = ypos;
			}
		},
		mouseUp: function(xpos, ypos,data){
            self.mouseIsDown = false;
			self.draw(xpos, ypos,data);
			
			pgWarehouseMap.updateUndoStack();
            self.doodleStartX = 0;
            self.doodleStartY = 0;
            self.doodleEndX = 0;
            self.doodleEndY = 0;
		},
		setParameterBox: function(container){
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<!--<div class='paramTitle'>In/Outset: </div><label for='shapeToolInset' id='shapeToolInsetLabel'>${self.inset}</label><br>
						<input style='width:100px' type="range" id="shapeToolInset" name="shapeToolInset" min="${pgWarehouseMap.dimensions.footPixel * pgWarehouseMap.dimensions.stepSize * -1}" max="${pgWarehouseMap.dimensions.footPixel * pgWarehouseMap.dimensions.stepSize}" value='${self.inset}' onchange='Modes.ShapeTool.changeInset(event)' oninput='Modes.ShapeTool.changeInset(event)'><br>-->
						<div class='paramTitle'>Number of Sides: </div><label for='shapeToolNumSides' id='shapeToolNumSidesLabel'>${self.numSides}</label><br>
						<input style='width:100px' type="range" id="shapeToolNumSides" name="shapeToolNumSides" min="3" max="20" value='${self.numSides}' onchange='Modes.ShapeTool.changeSides(event)' oninput='Modes.ShapeTool.changeSides(event)'><br>
						<input type='checkbox' id='shapeToolIsSnapping' onclick='Modes.ShapeTool.changeSnapping(event)'><label for='shapeToolIsSnapping'>Snap To Grid</label><br>
						<input type='checkbox' id='shapeToolIsSubtractive' } onclick='Modes.ShapeTool.changeSubtractive(event)'><label for='shapeToolIsSubtractive' >Subtractive</label><br>
						<input type='color' value='${self.fillColor}' id='shapeToolFillColor' onchange="Modes.ShapeTool.changeColor(event, 'fill')">
						<label for="shapeToolFillColor">Fill Color</label><br>
						<input type='color' value='${self.outlineColor}' id='shapeToolOutlineColor' onchange="Modes.ShapeTool.changeColor(event, 'outline')">
						<label for="shapeToolOutlineColor">Outline Color</label><br>
						`;
			/*<input type="radio" id="shapeToolSquare" name="shapeToolShape" value="Square" onchange='Modes.ShapeTool.changeShape(event)'>
			<label for="shapeToolSquare">Square</label><br>
			<input type="radio" id="shapeToolCircle" name="shapeToolShape" value="Circle" onchange='Modes.ShapeTool.changeShape(event)'>
			<label for="shapeToolCircle">Circle</label><br>*/
			
			container.innerHTML = htm;

			ir.set("shapeToolIsSnapping", self.isSnapping);
			ir.set("shapeToolIsSubtractive", self.isSubtractive);
			
			
		},
	}; return self;
})()