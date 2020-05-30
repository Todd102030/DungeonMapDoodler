"use strict";

var Shape = {
	Circle: 1,
	Square: 2,
}

var Modes = {
	Doodle : (function(){
	var self={
		borderSize: 3,
		fillColor: "white",
		outlineColor: "black",
		hatchSize: 30,
		id:8,
		size: 30,
		shape: Shape.Circle,
		title: "Pen Settings",
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
		},
		changeSize: function(evt){
			self.size = parseInt(evt.target.value);
			ir.set("doodleSizeLabel", self.size);
		},
		changeBorderSize: function(evt){
			self.borderSize = parseInt(evt.target.value);
			ir.set("doodleBorderSizeLabel", self.borderSize);
		},
		changeHatchSize: function(evt){
			self.hatchSize = parseInt(evt.target.value);
			ir.set("doodleHatchSizeLabel", self.hatchSize);
		},
		changeShape: function(evt){
			self.shape = Shape[evt.target.value];
		},
		draw: function(xpos, ypos, data){
            var wh = pgWarehouseMap;
            var offX = wh.globalOffsetX;
            var offY = wh.globalOffsetY;
            var zoom = wh.zoomLevel;
			var size = self.size;
			var border=self.borderSize;
			var ctx = data.hatchCtx;
			var hatchSize = self.hatchSize;
			var expos = self.doodleEndX;
			var eypos = self.doodleEndY;
			// Radii of the white glow.
			var innerRadius = self.size * 0.15;
			var outerRadius = self.size/2+hatchSize;
			// Radius of the entire circle.
			var radius = self.size/2+hatchSize;
			
			ModeHelper.drawCrossHatchCircle(ctx,xpos,ypos,size,border,hatchSize);

			//var gradient = ctx.createRadialGradient(xpos, ypos, innerRadius, xpos, ypos, outerRadius);
			//gradient.addColorStop(0, 'black');
			//gradient.addColorStop(1, 'transparent');

			//ctx.arc(xpos, ypos, radius, 0, 2 * Math.PI);
            
			//ctx.fillStyle = gradient;
			//ctx.fill();
			if(self.shape == Shape.Circle){
				//More like a stamp
				/*//Path Drawing
				ctx = data.doodleCtx;
				ctx.fillStyle = self.fillColor;
				ctx.beginPath();
				ctx.arc(xpos,ypos, size/2, 0, 2 * Math.PI);
				ctx.fill();

				//Outline Drawing
				ctx = data.outlineCtx;
				ctx.fillStyle = self.outlineColor;
				ctx.beginPath();
				ctx.arc(xpos, ypos, (size/2)+border, 0, 2 * Math.PI);
				ctx.fill();
				*/
				//Connecting lines
				//Path Drawing
				ctx = data.doodleCtx;
				ctx.fillStyle = self.fillColor;
				ctx.strokeStyle = self.fillColor;
				ctx.beginPath();
				ctx.arc(xpos, ypos, size/2, 0, 2 * Math.PI);
				ctx.fill();
				ctx.beginPath();
				ctx.arc(expos, eypos, size/2, 0, 2 * Math.PI);
				ctx.fill();
				ctx.beginPath()
				ctx.lineWidth = size;
				ctx.moveTo(xpos,ypos);
    			ctx.lineTo(expos,eypos);
				ctx.stroke();

				//Outline Drawing
				ctx = data.outlineCtx;
				ctx.fillStyle = self.outlineColor;
				ctx.strokeStyle = self.outlineColor;
				ctx.beginPath();
				ctx.arc(xpos, ypos, size/2+border, 0, 2 * Math.PI);
				ctx.arc(expos, eypos, size/2+border, 0, 2 * Math.PI);
				ctx.fill();
				ctx.beginPath();
				ctx.lineWidth = (size)+(border*2);
				ctx.moveTo(xpos,ypos);
    			ctx.lineTo(expos,eypos);
				ctx.stroke();
			}else{
				//Path Drawing
				ctx = data.doodleCtx;
				ctx.fillStyle = self.fillColor;
				ctx.fillRect(xpos-(self.size/2),ypos-(self.size/2), size,size);

				//Outline Drawing
				ctx = data.outlineCtx;
				ctx.fillStyle = self.outlineColor;
				ctx.fillRect(xpos-(self.size/2)-border,ypos-(self.size/2)-border, size+(border*2),size+(border*2));
			}	
		},
		drawCursor : function(ctx, xpos, ypos, data){
            var wh = pgWarehouseMap;
            var offX = wh.globalOffsetX;
            var offY = wh.globalOffsetY;
            var zoom = wh.zoomLevel;
			ctx.strokeStyle = "rgb(240,60,60)";
			if(self.shape == Shape.Circle){
				ctx.beginPath();
				ctx.arc(xpos, ypos, (self.size/2)*zoom, 0, 2 * Math.PI);
				ctx.stroke();
			}
			else{
				ctx.strokeRect(xpos-(self.size/2)*zoom,ypos-(self.size/2)*zoom,self.size*zoom,self.size*zoom)
			}
			ctx.strokeStyle = "rgb(60,200,200)";
			var radius = self.size/2+self.hatchSize;
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
				self.draw(self.doodleStartX, self.doodleStartY, data);
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
						<div class='paramTitle'>Size: </div><label for='doodleSize' id='doodleSizeLabel'>${self.size}</label><br>
						<input style='width:78px' type="range" id="doodleSize" name="doodleSize" min="1" max="150" width='60px' value='${self.size}' onchange='Modes.Doodle.changeSize(event)' oninput='Modes.Doodle.changeSize(event)'><br>
						<div class='paramTitle'>Hatch: </div><label for='doodleHatchSize' id='doodleHatchSizeLabel'>${self.hatchSize}</label><br>
						<input style='width:78px' type="range" id="doodleHatchSize" name="doodleHatchSize" min="1" max="150" value='${self.hatchSize}' onchange='Modes.Doodle.changeHatchSize(event)' oninput='Modes.Doodle.changeHatchSize(event)'><br>
						<div class='paramTitle'>Border: </div><label for='doodleBorderSize' id='doodleBorderSizeLabel'>${self.borderSize}</label><br>
						<input style='width:78px' type="range" id="doodleBorderSize" name="doodleBorderSize" min="0" max="25" value='${self.borderSize}' onchange='Modes.Doodle.changeBorderSize(event)' oninput='Modes.Doodle.changeBorderSize(event)'><br>
						<input type="radio" id="doodleSquare" name="doodleShape" value="Square" onchange='Modes.Doodle.changeShape(event)'>
						<label for="doodleSquare">Square</label><br>
						<input type="radio" id="doodleCircle" name="doodleShape" value="Circle" onchange='Modes.Doodle.changeShape(event)'>
						<label for="doodleCircle">Circle</label><br>
						<input type='color' value='#ffffff' id='doodleFillColor' onchange="Modes.Doodle.changeColor(event, 'fill')">
						<label for="doodleFillColor">Fill Color</label><br>
						<input type='color' value='#000000' id='doodleOutlineColor' onchange="Modes.Doodle.changeColor(event, 'outline')">
						<label for="doodleOutlineColor">Outline Color</label><br>
						`;
			container.innerHTML = htm;
		},
	}; return self;
	})(),
	Erase : (function(){
	var self={
		borderSize: 3,
		eraseHatch: true,
		eraseOutline: true,
		eraseRoom: true,
		eraseStamps: true,
		fillColor: "white",
		outlineColor: "black",
		hatchSize: 30,
		id:8,
		isSnapping: true,
		size: 30,
		shape: Shape.Circle,
		title: "Erase Settings",
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
			ir.set("eraseSizeLabel", self.size);
		},
		changeErases: function(){
			self.eraseHatch = ir.v("eraseHatch");
			self.eraseOutline = ir.v("eraseOutline");
			self.eraseRoom = ir.v("eraseRoom");	
		},
		changeSize: function(evt){
			self.size = parseInt(evt.target.value);
			ir.set("eraseSizeLabel", self.size);
		},
		changeBorderSize: function(evt){
			self.borderSize = parseInt(evt.target.value);
			ir.set("eraseBorderSizeLabel", self.borderSize);
		},
		changeHatchSize: function(evt){
			self.hatchSize = parseInt(evt.target.value);
			ir.set("eraseHatchSizeLabel", self.hatchSize);
		},
		changeShape: function(evt){
			self.shape = Shape[evt.target.value];
		},
		changeSnap: function(){
			self.isSnapping = ir.v("eraseSnapToGrid");
		},
		draw: function(xpos, ypos, data){
            var wh = pgWarehouseMap;
            var offX = wh.globalOffsetX;
            var offY = wh.globalOffsetY;
            var zoom = wh.zoomLevel;
			var size = self.size;
			var border=self.borderSize;
			var ctx = data.hatchCtx;
			var hatchSize = self.hatchSize;
			var expos = self.doodleEndX;
			var eypos = self.doodleEndY;
			// Radii of the white glow.
			var innerRadius = self.size * 0.15;
			var outerRadius = self.size-hatchSize;
			// Radius of the entire circle.
			var radius = self.size-hatchSize;
			if(radius < 1){
				radius = 1;
			}
			if(outerRadius < 1){
				outerRadius = 1;
			}
			
			if(self.eraseStamps){
				//if(self.stampHit != null && self.isMovingStamp){
				Modes.Stamps.stampHit = pgWarehouseMap.hitTestStamps({x:xpos,y:ypos,w:1,h:1});
				Modes.Stamps.isMovingStamp = true;
				Modes.Stamps.deleteFn();
			}
			
			if(self.eraseHatch){
				ctx.save();
				ctx.globalCompositeOperation = "destination-out";
				ModeHelper.drawCrossHatchCircle(ctx,xpos,ypos,size,border,hatchSize);
				//ctx.globalCompositeOperation = "source-over";
				ctx.restore();
			}
			var gridxy = getGridXY2(xpos, ypos);
			if(self.isSnapping){
				
            	var offX = pgWarehouseMap.globalOffsetX;
            	var offY = pgWarehouseMap.globalOffsetY;
				//Path Drawing
				if(self.eraseRoom){
					ctx = data.doodleCtx;
					ctx.save();
					ctx.globalCompositeOperation = "destination-out";
					ctx.fillStyle = 'black';
					//TODO Figure out what's going wrong with zoom on erasing
					ctx.fillRect((gridxy.xpos-border),(gridxy.ypos-border), (gridxy.step+border*2),(gridxy.step+border*2));
					//ctx.globalCompositeOperation = "source-over";
					ctx.restore();
				}

				//Outline Drawing
				if(self.eraseOutline){
					ctx = data.outlineCtx;
					ctx.save();
					ctx.globalCompositeOperation = "destination-out";
					ctx.fillStyle = 'black';
					ctx.fillRect((gridxy.xpos),(gridxy.ypos), gridxy.step,gridxy.step);
					
					//ctx.globalCompositeOperation = "source-over";
					ctx.restore();
				}
			}
			else if(self.shape == Shape.Circle){
				//Connecting lines
				//Path Drawing
				if(self.eraseRoom){
					ctx = data.doodleCtx;
					ctx.save();
					ctx.globalCompositeOperation = "destination-out";
					ctx.fillStyle = 'black';
					ctx.strokeStyle = 'black';
					ctx.beginPath();
					ctx.arc(xpos, ypos, size/2+border, 0, 2 * Math.PI);
					ctx.fill();
					ctx.beginPath();
					ctx.arc(expos, eypos, size/2+border, 0, 2 * Math.PI);
					ctx.fill();
					ctx.beginPath()
					ctx.lineWidth = size+border*2;
					ctx.moveTo(xpos,ypos);
					ctx.lineTo(expos,eypos);
					ctx.stroke();
					//ctx.globalCompositeOperation = "source-over";
					ctx.restore();
				}

				//Outline Drawing
				if(self.eraseOutline){
					ctx = data.outlineCtx;
					ctx.save();
					ctx.globalCompositeOperation = "destination-out";
					ctx.fillStyle = 'black';
					ctx.strokeStyle = 'black';
					ctx.beginPath();
					ctx.arc(xpos, ypos, size/2, 0, 2 * Math.PI);
					ctx.arc(expos, eypos, size/2, 0, 2 * Math.PI);
					ctx.fill();
					ctx.beginPath();
					ctx.lineWidth = size;
					ctx.moveTo(xpos,ypos);
					ctx.lineTo(expos,eypos);
					ctx.stroke();
					//ctx.globalCompositeOperation = "source-over";
					ctx.restore();
				}
			}else{
				//Path Drawing
				if(self.eraseRoom){
					ctx = data.doodleCtx;
					ctx.save();
					ctx.globalCompositeOperation = "destination-out";
					ctx.fillStyle = 'black';
					ctx.fillRect(xpos-(self.size/2)-border,ypos-(self.size/2)-border, size+(border*2),size+(border*2));
					//ctx.globalCompositeOperation = "source-over";
					ctx.restore();
				}

				//Outline Drawing
				if(self.eraseOutline){
					ctx = data.outlineCtx;
					ctx.save();
					ctx.globalCompositeOperation = "destination-out";
					ctx.fillStyle = 'black';
					ctx.fillRect(xpos-(self.size/2),ypos-(self.size/2), size,size);
					//ctx.globalCompositeOperation = "source-over";
					ctx.restore();
				}
			}	
			
		},
		drawCursor : function(ctx, xpos, ypos, data){
            var wh = pgWarehouseMap;
            var offX = wh.globalOffsetX;
            var offY = wh.globalOffsetY;
            var zoom = wh.zoomLevel;
			ctx.strokeStyle = "rgb(240,60,60)";
			if(self.isSnapping){
				var gridxy = getGridXY(xpos,ypos);
				ctx.strokeRect(gridxy.xpos,gridxy.ypos,gridxy.step,gridxy.step)
			}
			else if(self.shape == Shape.Circle){
				ctx.beginPath();
				ctx.arc(xpos, ypos, (self.size/2)*zoom, 0, 2 * Math.PI);
				ctx.stroke();
			}
			else{
				ctx.strokeRect(xpos-(self.size/2)*zoom,ypos-(self.size/2)*zoom,self.size*zoom,self.size*zoom)
			}
			ctx.strokeStyle = "rgb(60,200,200)";
			var radius = self.size-self.hatchSize;
			ctx.beginPath();
			if(radius < 0){
				radius = 0;
			}
			ctx.arc(xpos, ypos, radius*zoom, 0, 2 * Math.PI);
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
				self.draw(self.doodleStartX, self.doodleStartY, data);
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
						<input type='checkbox' id='eraseSnapToGrid' onclick='Modes.Erase.changeSnap()'><label for='eraseSnapToGrid'>Snap To Grid</label><br>
						<div class='paramTitle'>Size: </div><label for='eraseSize' id='eraseSizeLabel'>${self.size}</label><br>
						<input style='width:78px' type="range" id="eraseSize" name="eraseSize" min="1" max="200" width='60px' value='${self.size}' onchange='Modes.Erase.changeSize(event)' oninput='Modes.Erase.changeSize(event)'><br>
						<div class='paramTitle'>Hatch: </div><label for='eraseHatchSize' id='eraseHatchSizeLabel'>${self.hatchSize}</label><br>
						<input style='width:78px' type="range" id="eraseHatchSize" name="eraseHatchSize" min="1" max="150" value='${self.hatchSize}' onchange='Modes.Erase.changeHatchSize(event)' oninput='Modes.Erase.changeHatchSize(event)'><br>
						<div class='paramTitle'>Border: </div><label for='eraseBorderSize' id='eraseBorderSizeLabel'>${self.borderSize}</label><br>
						<input style='width:78px' type="range" id="eraseBorderSize" name="eraseBorderSize" min="0" max="25" value='${self.borderSize}' onchange='Modes.Erase.changeBorderSize(event)' oninput='Modes.Erase.changeBorderSize(event)'><br>
						<input type="radio" id="eraseSquare" name="eraseShape" value="Square" onchange='Modes.Erase.changeShape(event)'>
						<label for="eraseSquare">Square</label><br>
						<input type="radio" id="eraseCircle" name="eraseShape" value="Circle" onchange='Modes.Erase.changeShape(event)'>
						<label for="eraseCircle">Circle</label><br>
						<input type='checkbox' id='eraseHatch' onclick='Modes.Erase.changeErases()'><label for='eraseHatch'>Erase Hatching</label><br>
						<input type='checkbox' id='eraseOutline' onclick='Modes.Erase.changeErases()'><label for='eraseOutline'>Erase Outline</label><br>
						<input type='checkbox' id='eraseRoom' onclick='Modes.Erase.changeErases()'><label for='eraseRoom'>Erase Rooms</label><br>
						`;
			container.innerHTML = htm;
			ir.set("eraseHatch", self.eraseHatch);
			ir.set("eraseOutline", self.eraseOutline);
			ir.set("eraseRoom", self.eraseRoom);
			ir.set("eraseSnapToGrid", self.isSnapping);
		
			
		},
	}; return self;
	})(),
	Hatching : (function(){
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
	})(),
	Line : (function(){
	var self={
		borderSize: 3,
		fillColor: "white",
		outlineColor: "black",
		hatchSize: 30,
		id:8,
		size: 20,
		shape: Shape.Circle,
		title: "Line Tool",
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
			ir.set("doodleSizeLabel", self.size);
		},
		changeSize: function(evt){
			self.size = parseInt(evt.target.value);
			ir.set("lineSizeLabel", self.size);
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
		},
		drawCursor : function(ctx, xpos, ypos, data){
			ctx.strokeStyle = "rgb(60,200,200)";
			var radius = self.size*2.1+self.hatchSize;
			var zoom = pgWarehouseMap.zoomLevel;
			var offx = pgWarehouseMap.globalOffsetX;
			var offy = pgWarehouseMap.globalOffsetY;
			var size = self.size;
			//ctx.beginPath();
			//ctx.arc(xpos, ypos, radius*pgWarehouseMap.zoomLevel, 0, 2 * Math.PI);
			//ctx.stroke();
			
			//Line
			ctx.strokeStyle = "rgb(240,60,60)";
			if(self.shape == Shape.Circle ){
				ctx.beginPath();
				ctx.arc(xpos, ypos, (self.size)*pgWarehouseMap.zoomLevel, 0, 2 * Math.PI);
				ctx.stroke();
				
				ctx.beginPath();
				ctx.arc(self.doodleStartX*zoom+offx || xpos, self.doodleStartY*zoom+offy || ypos, (self.size)*pgWarehouseMap.zoomLevel, 0, 2 * Math.PI);
				ctx.stroke();
				
				ctx.beginPath();
				ctx.arc(self.doodleEndX*zoom+offx || xpos, self.doodleEndY*zoom+offy || ypos, (self.size)*pgWarehouseMap.zoomLevel, 0, 2 * Math.PI);
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
			
			
			
			self.isDoodling = false;
            self.doodleStartX = null;
            self.doodleStartY = null;
            self.doodleEndX = null;
            self.doodleEndY = null;
		},
		setParameterBox: function(container){
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<div class='paramTitle'>Width: </div><label for='lineSize' id='lineSizeLabel'>${self.size}</label><br>
						<input style='width:78px' type="range" id="lineSize" name=lineSize" min="1" max="150" value='${self.size}' onchange='Modes.Line.changeSize(event)' oninput='Modes.Line.changeSize(event)'><br>
						<!--<input type="radio" id="lineSquare" name="lineShape" value="Square" onchange='Modes.Line.changeShape(event)'>
						<label for="lineSquare">Square</label><br>
						<input type="radio" id="lineCircle" name="lineShape" value="Circle" onchange='Modes.Line.changeShape(event)'>
						<label for="lineCircle">Circle</label><br>-->
						<input type='color' value='#ffffff' id='lineFillColor' onchange="Modes.Line.changeColor(event, 'fill')">
						<label for="lineFillColor">Fill Color</label><br>
						<input type='color' value='#000000' id='lineOutlineColor' onchange="Modes.Line.changeColor(event, 'outline')">
						<label for="lineOutlineColor">Outline Color</label><br>
						`;
			container.innerHTML = htm;
		},
	}; return self;
	})(),
	Move : (function(){
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
	})(),
	RoomTool : (function(){
	var self={
		borderSize: 3,
		hatchSize: 30,
		id:8,
		inset:0,
		size:30,
		fillColor: "white",
		outlineColor: "black",
		hatchSize: 30,
		shape: Shape.Square,
		isSnapping: true,
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
			ir.set("roomToolInsetLabel", self.inset);
		},
		changeShape: function(evt){
			self.shape = Shape[evt.target.value];
		},
		changeSnapping: function(evt){
			self.isSnapping = ir.bool("roomToolIsSnapping");
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
			var hatchSize = self.hatchSize+40;
			// Radii of the white glow.
			var innerRadius = self.size * 0.15;
			var outerRadius = self.size*2+hatchSize;
			// Radius of the entire circle.
			var radius = self.size*2.1+hatchSize;
			var inset=self.inset;

			//var gradient = ctx.createRadialGradient(xpos, ypos, innerRadius, xpos, ypos, outerRadius);
			//gradient.addColorStop(0, 'black');
			//gradient.addColorStop(1, 'transparent');

			//ctx.arc(xpos, ypos, radius, 0, 2 * Math.PI);
            
			//ctx.fillStyle = gradient;
			
			//ctx.fill();
			if(self.shape == Shape.Circle){
				//Path Drawing
				ctx = data.doodleCtx;
				ctx.fillStyle = self.fillColor;
				ctx.beginPath();
				ctx.arc(xpos,ypos, size/2, 0, 2 * Math.PI);
				ctx.fill();

				//Outline Drawing
				ctx = data.outlineCtx;
				ctx.fillStyle = self.outlineColor;
				ctx.beginPath();
				ctx.arc(xpos, ypos, (size/2)+border, 0, 2 * Math.PI);
				ctx.fill();
				//ctx.fillRect(xpos-size-border,ypos-size-border, (size+border)*2,(size+border)*2);
			}else{
				//Hatch
				var xmid = Math.min(self.doodleStartX,self.doodleEndX) + Math.abs(self.doodleStartX-self.doodleEndX)/2
				var ymid = Math.min(self.doodleStartY,self.doodleEndY) + Math.abs(self.doodleStartY-self.doodleEndY)/2
				
				ctx = data.hatchCtx;
				ctx.fillStyle = "black";
				ctx.drawImage(ir.get("squarefuzzImg"),Math.min(self.doodleStartX,self.doodleEndX)-border-hatchSize, Math.min(self.doodleStartY,self.doodleEndY)-border-hatchSize, 
						   Math.abs(self.doodleStartX-self.doodleEndX)+(border*2+hatchSize*2), Math.abs(self.doodleStartY-self.doodleEndY)+(border*2+hatchSize*2))
				
				//Path Drawing
				ctx = data.doodleCtx;
				ctx.fillStyle = self.fillColor;
				ctx.fillRect(Math.min(self.doodleStartX,self.doodleEndX)-inset, Math.min(self.doodleStartY,self.doodleEndY)-inset, 
						   Math.abs(self.doodleStartX-self.doodleEndX)+inset*2, Math.abs(self.doodleStartY-self.doodleEndY)+inset*2);
				//Outline Drawing
				ctx = data.outlineCtx;
				ctx.fillStyle = self.outlineColor;
				ctx.fillRect(Math.min(self.doodleStartX,self.doodleEndX)-border-inset, Math.min(self.doodleStartY,self.doodleEndY)-border-inset, 
						   Math.abs(self.doodleStartX-self.doodleEndX)+(border*2)+inset*2, Math.abs(self.doodleStartY-self.doodleEndY)+(border*2)+inset*2);
			}	
			
			
		},
		drawCursor : function(ctx, xpos, ypos, data){
			if(self.mouseIsDown){
				self.drawOutlineBox(ctx, xpos, ypos, data);
			}else{
				ctx.strokeStyle = "rgb(240,60,60)";
				var gridxy = getGridXY(xpos, ypos);
				var offx = pgWarehouseMap.globalOffsetX;
				var offy = pgWarehouseMap.globalOffsetY;
				var zoom = pgWarehouseMap.zoomLevel;
				if(self.isSnapping){
					ctx.strokeRect(gridxy.xpos, gridxy.ypos, gridxy.step, gridxy.step);
				}else{
					ctx.strokeRect(xpos, ypos, 2, 2);
				}
			}
		},
		drawOutlineBox: function(ctx, xpos, ypos, data){
			ctx.strokeStyle = "rgb(240,60,60)";
			
			var offx = pgWarehouseMap.globalOffsetX;
			var offy = pgWarehouseMap.globalOffsetY;
			var zoom = pgWarehouseMap.zoomLevel;
			if(self.isSnapping){
				var grid1 = getGridXY2(Math.min(self.doodleStartX,self.doodleEndX), Math.min(self.doodleStartY,self.doodleEndY));
				var grid2 = getGridXY2(Math.max(self.doodleStartX,self.doodleEndX), Math.max(self.doodleStartY,self.doodleEndY));
				ctx.strokeRect(grid1.xpos*zoom+offx, grid1.ypos*zoom+offy, 
						   Math.abs(grid1.xpos-grid2.xpos)*zoom, Math.abs(grid1.ypos-grid2.ypos)*zoom);
			}
			else{
				ctx.strokeRect((Math.min(self.doodleStartX,self.doodleEndX))/zoom, (Math.min(self.doodleStartY,self.doodleEndY))/zoom, 
						   Math.abs(self.doodleStartX-self.doodleEndX), Math.abs(self.doodleStartY-self.doodleEndY));
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
            self.doodleStartX = 0;
            self.doodleStartY = 0;
            self.doodleEndX = 0;
            self.doodleEndY = 0;
		},
		setParameterBox: function(container){
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<div class='paramTitle'>In/Outset: </div><label for='roomToolInset' id='roomToolInsetLabel'>${self.inset}</label><br>
						<input style='width:78px' type="range" id="roomToolInset" name="roomToolInset" min="${pgWarehouseMap.dimensions.footPixel * pgWarehouseMap.dimensions.stepSize * -1}" max="${pgWarehouseMap.dimensions.footPixel * pgWarehouseMap.dimensions.stepSize}" value='${self.inset}' onchange='Modes.RoomTool.changeInset(event)' oninput='Modes.RoomTool.changeInset(event)'><br>
						<input type='checkbox' id='roomToolIsSnapping' onclick='Modes.RoomTool.changeSnapping(event)'><label for='roomToolIsSnapping'>Snap To Grid</label><br>
						<input type='color' value='#ffffff' id='roomToolFillColor' onchange="Modes.RoomTool.changeColor(event, 'fill')">
						<label for="roomToolFillColor">Fill Color</label><br>
						<input type='color' value='#000000' id='roomToolOutlineColor' onchange="Modes.RoomTool.changeColor(event, 'outline')">
						<label for="roomToolOutlineColor">Outline Color</label><br>
						`;
			/*<input type="radio" id="roomToolSquare" name="roomToolShape" value="Square" onchange='Modes.RoomTool.changeShape(event)'>
			<label for="roomToolSquare">Square</label><br>
			<input type="radio" id="roomToolCircle" name="roomToolShape" value="Circle" onchange='Modes.RoomTool.changeShape(event)'>
			<label for="roomToolCircle">Circle</label><br>*/
			
			container.innerHTML = htm;
			ir.set("roomToolIsSnapping", self.isSnapping);

			
		},
	}; return self;
	})(),
	SnapToGrid : (function(){
	var self={
		borderSize: 3,
		fillColor: "white",
		outlineColor: "black",
		hatchSize: 30,
		id:8,
		inset:0,
		size: 20,
		title: "Snap To Grid Settings",
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
		},
		changeInset: function(evt){
			self.inset = parseInt(evt.target.value);
			ir.set("snapToGridLabel", self.inset);
		},
		draw: function(xpos, ypos, data){
			var size = self.size;
			var border=self.borderSize;
			var ctx = data.hatchCtx;
			var hatchSize = self.hatchSize;


			var dim = pgWarehouseMap.dimensions;
			var xfeet = dim.wf;
			var yfeet = dim.hf;
			var sx = dim.scaleX;
			var sy = pgWarehouseMap.dimensions.scaleY;
			var step = dim.footPixel * dim.stepSize / sx;
			var zoom = pgWarehouseMap.zoomLevel;
			var xgridtop = Math.floor(xpos/step)*step;
			var ygridtop = Math.floor(ypos/step)*step;
			// Radii of the white glow.
			var innerRadius = self.size * 0.15;
			var outerRadius = self.size*2+hatchSize;
			// Radius of the entire circle.
			var radius = self.size*2.1+hatchSize;

			/*var gradient = ctx.createRadialGradient(xpos, ypos, innerRadius, xpos, ypos, outerRadius);
			gradient.addColorStop(0, 'black');
			gradient.addColorStop(1, 'transparent');

			ctx.arc(xpos, ypos, radius, 0, 2 * Math.PI);

			ctx.fillStyle = gradient;
			ctx.fill();
*/
			ModeHelper.drawCrossHatchCircle(ctx,xpos,ypos,size*4,border,hatchSize);
			
			
			var inset=self.inset;
			//Path Drawing
			ctx = data.doodleCtx;
			ctx.fillStyle = self.fillColor;
			ctx.fillRect(xgridtop-inset, ygridtop-inset, step+inset*2, step+inset*2);

			//Outline Drawing
			ctx = data.outlineCtx;
			ctx.fillStyle = self.outlineColor;
			ctx.fillRect(xgridtop-border-inset, ygridtop-border-inset, ((border+inset)*2)+step, ((border+inset)*2)+step);

		},
		drawCursor : function(ctx, xpos, ypos, data){
			ctx.strokeStyle = "rgb(240,60,60)";
			var dim = pgWarehouseMap.dimensions;
			var xfeet = dim.wf;
			var yfeet = dim.hf;
			var sx = dim.scaleX;
			var sy = dim.scaleY;
            var zoom = pgWarehouseMap.zoomLevel;
			var gridxy = getGridXY(xpos, ypos);
			var inset = self.inset;
			//ctx.strokeRect(xgridtop-inset, ygridtop-inset, step*zoom+inset*2, step*zoom+inset*2);
			ctx.strokeRect(gridxy.xpos-inset*zoom, gridxy.ypos-inset*zoom, gridxy.step+inset*2*zoom, gridxy.step+inset*2*zoom);
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
		endMode: function(){
			
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
						<div class='paramTitle'>In/Outset: </div><label for='snapToGridInset' id='snapToGridLabel'>${self.inset}</label><br>
						<input style='width:78px' type="range" id="snapToGridInset" name="snapToGridInset" min="${pgWarehouseMap.dimensions.footPixel * pgWarehouseMap.dimensions.stepSize * -1}" max="${pgWarehouseMap.dimensions.footPixel * pgWarehouseMap.dimensions.stepSize}" value='${self.inset}' onchange='Modes.SnapToGrid.changeInset(event)' oninput='Modes.SnapToGrid.changeInset(event)'><br>
						<input type='color' value='#ffffff' id='snapToGridFillColor' onchange="Modes.SnapToGrid.changeColor(event, 'fill')">
						<label for="snapToGridFillColor">Fill Color</label><br>
						<input type='color' value='#000000' id='snapToGridOutlineColor' onchange="Modes.SnapToGrid.changeColor(event, 'outline')">
						<label for="snapToGridOutlineColor">Outline Color</label><br>
						`;
			container.innerHTML = htm;
		},
	}; return self;
	})(),
	Stamps : (function(){
	var self={
		angle: 0,
		borderSize: 3,
		fillColor: "white",
		outlineColor: "black",
		hatchSize: 30,
		chosenStamp: "star.png",
		chosenStampImg: null,
		id:8,
		isSnapping: true,
		size: 30,
		title: "Stamps",
		addStamp: function(){
			ir.get("stampUpload").click();
		},
		readAddStamp: function(){
			if ( this.files && this.files[0] ) {
            var FR= new FileReader();
            FR.onload = function(e) {
                var img = new Image();
                //Load the image in from the user, scale it to best fit the canvas, reset the offsets
                img.onload = function() {
					Stamps.push({src:img.src});
					self.setParameterBox(ir.get("paramBox"));
                };

                img.src = e.target.result;
            };       
            FR.readAsDataURL( this.files[0] );
        	}
		},
		changeAngle: function(evt){
			self.angle = evt.target.value;	
		},
		changeSnapping: function(evt){
			self.isSnapping = ir.bool("stampsIsSnapping");
		},
		changeSize: function(evt){
			self.size = parseInt(evt.target.value);
			ir.set("stampSizeLabel", self.size);
		},
		changeStamp: function(stamp){
			self.chosenStamp = Stamps[stamp];	
			if(self.chosenStampImg==null){
				self.chosenStampImg = new Image();
			}
			self.chosenStampImg.src = self.chosenStamp.path || self.chosenStamp.src;
		},
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
		},
		deleteFn: function(){
			if(self.stampHit != null && self.isMovingStamp){
				pgWarehouseMap.stamps.splice(self.stampHit,1);
				self.stampHit = null;
				self.isMovingStamp = null;
			}
		},
		draw: function(xpos, ypos, data){
			var size = self.size;
            var zoom = pgWarehouseMap.zoomLevel;
            var offX = pgWarehouseMap.globalOffsetX;
            var offY = pgWarehouseMap.globalOffsetY;
			var border=self.borderSize;
			var ctx = data.hatchCtx;
			var newimg = new Image();
			newimg.src = self.chosenStampImg.src;
			var stampobj = null;
			if(self.isSnapping){
				var gridxy = getGridXY(xpos, ypos);
				//ctx.drawImage(self.chosenStampImg, gridxy.xpos*zoom, gridxy.ypos*zoom, gridxy.step/zoom, gridxy.step/zoom);	
				stampobj = new StampObj(((gridxy.xgridmid)-offX)/zoom, ((gridxy.ygridmid)-offY)/zoom, gridxy.step/zoom, gridxy.step/zoom, newimg, self.chosenStamp.path||self.chosenStamp.src, self.angle);

			}
			else{
				stampobj = new StampObj(((xpos-(size*zoom/2))-offX)/zoom, ((ypos-(size*zoom/2))-offY)/zoom, size, size, newimg, self.chosenStamp.path||self.chosenStamp.src, self.angle);
			}
			pgWarehouseMap.stamps.push(stampobj);
		},
		drawCursor : function(ctx, xpos, ypos, data){
			if(self.chosenStampImg==null){
				self.chosenStampImg = new Image();
				self.chosenStampImg.src = self.chosenStamp;
			}
            var zoom = pgWarehouseMap.zoomLevel;
			var offX = pgWarehouseMap.globalOffsetX;
			var offY = pgWarehouseMap.globalOffsetY;
			self.stampMoveHit = pgWarehouseMap.hitTestStamps({x:(xpos-offX)/zoom,y:(ypos-offY)/zoom,w:1,h:1});
			ctx.strokeStyle = "rgb(60,200,200)";
			ctx.beginPath();
			if(self.stampMoveHit == null && !self.isMovingStamp){
				if(self.isSnapping){
					var gridxy = getGridXY(xpos, ypos);
					self.drawImageRotated(ctx, self.chosenStampImg, gridxy.xgridmid, gridxy.ygridmid, gridxy.step, gridxy.step, self.angle);				
				}
				else{
					self.drawImageRotated(ctx, self.chosenStampImg,xpos-(self.size/2*zoom), ypos-(self.size/2*zoom), self.size*zoom, self.size*zoom, self.angle);
				}
				
			}
			else{
				self.drawMoveHighlight(pgWarehouseMap.ctx,xpos, ypos,data);
			}
			ctx.stroke();
		},
		drawMoveHighlight : function(ctx, xpos, ypos, data){
			if(self.stampMoveHit == null){
				return;
			}
			var st = pgWarehouseMap.stamps[self.stampMoveHit];
            var zoom = pgWarehouseMap.zoomLevel;
			var wh = pgWarehouseMap
			var sX =wh.dimensions.scaleX;
			var sY =wh.dimensions.scaleY;
			ctx.strokeStyle = "rgb(60,200,200)";
			ctx.fillStyle = "rgba(60,200,200,0.3)";
			ctx.beginPath();
			
			//ctx.fillRect(wh.globalOffsetX + ((st.x) * wh.zoomLevel*(1/sX)),wh.globalOffsetY + ((st.y) * wh.zoomLevel*(1/sY)), st.w * wh.zoomLevel*(1/sX), st.h * wh.zoomLevel*(1/sY));	
			//ctx.strokeRect(wh.globalOffsetX + ((st.x) * wh.zoomLevel*(1/sX)),wh.globalOffsetY + ((st.y) * wh.zoomLevel*(1/sY)), st.w * wh.zoomLevel*(1/sX), st.h * wh.zoomLevel*(1/sY));	
			ctx.fillRect(wh.globalOffsetX +st.x * zoom, wh.globalOffsetY + st.y * zoom, st.w * wh.zoomLevel*(1/sX), st.h * wh.zoomLevel*(1/sY));	
			ctx.strokeRect(wh.globalOffsetX + ((st.x) * wh.zoomLevel*(1/sX)),wh.globalOffsetY + ((st.y) * wh.zoomLevel*(1/sY)), st.w * wh.zoomLevel*(1/sX), st.h * wh.zoomLevel*(1/sY));	
			
			ctx.stroke();
		},
		drawImageRotated: function(ctx, image, x, y, width, height, angleDeg){
			var angleInRadians = angleDeg / 180 * Math.PI;
			ctx.translate(x+width/2, y+height/2);
			ctx.rotate(angleInRadians);
			ctx.drawImage(image, -width / 2, -height / 2, width, height);
			ctx.rotate(-angleInRadians);
			ctx.translate(-x-width/2, -y-height/2);
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
		moveStamp: function(id, xpos, ypos){
			var st = pgWarehouseMap.stamps[id];
			if(st==null){
				return;
			}
			var size = self.size;
			var zoom = pgWarehouseMap.zoomLevel;
            var offX = pgWarehouseMap.globalOffsetX;
            var offY = pgWarehouseMap.globalOffsetY;
			var border=self.borderSize;
			if(self.isSnapping){
				var gridxy = getGridXY2(xpos, ypos);
				//stampobj = new StampObj(((gridxy.xgridmid)-offX)/zoom, ((gridxy.ygridmid)-offY)/zoom, gridxy.step/zoom, gridxy.step/zoom, newimg, self.angle);
				
				st.x = ((gridxy.xgridmid));
				st.y = ((gridxy.ygridmid));

			}
			else{
				//stampobj = new StampObj(((xpos-(size*zoom/2))-offX)/zoom, ((ypos-(size*zoom/2))-offY)/zoom, size, size, newimg, self.angle);
				st.x = ((xpos))-self.offsetX;
				st.y = ((ypos))-self.offsetY;
			}
		},
		mouseDown: function(xpos, ypos, data){
			
            self.doodleStartX = xpos;
            self.doodleStartY = ypos;
            self.doodleEndX = xpos;
            self.doodleEndY = ypos;
			//self.draw(xpos, ypos, data);
			self.stampHit = pgWarehouseMap.hitTestStamps({x:xpos,y:ypos,w:1,h:1});
			if(self.stampHit != null){
				self.offsetX = parseFloat(xpos) - parseFloat(pgWarehouseMap.stamps[self.stampHit].x); 
            	self.offsetY = parseFloat(ypos) - parseFloat(pgWarehouseMap.stamps[self.stampHit].y); 
				self.isMovingStamp = true;
			}else{
				self.isDoodling = true;
			}
			
		},
		mouseMove: function(xpos, ypos, data){
			if(self.isMovingStamp){
				self.moveStamp(self.stampHit,xpos, ypos);
			}
			else if (self.isDoodling){
				var wh = pgWarehouseMap;
				//self.draw(xpos*wh.zoomLevel+wh.globalOffsetX, ypos*wh.zoomLevel+wh.globalOffsetY, data);
				self.doodleEndX = xpos;
				self.doodleEndY = ypos;
				self.doodleStartX = xpos;
				self.doodleStartY = ypos;
			}
		},
		mouseUp: function(xpos, ypos, data){
			if(self.isDoodling){
				self.draw(xpos, ypos, data);
			}
			self.isDoodling = false;
			self.isMovingStamp = false;
            self.doodleStartX = 0;
            self.doodleStartY = 0;
            self.doodleEndX = 0;
            self.doodleEndY = 0;
		},
		setParameterBox: function(container){
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<div class='paramTitle'>Size: </div><label for='stampSize' id='stampSizeLabel'>${self.size}</label><br>
						<input style='width:78px' type="range" id="stampSize" name="stampSize" min="1" max="200" width='60px' value='${self.size}' onchange='Modes.Stamps.changeSize(event)' oninput='Modes.Stamps.changeSize(event)'><br>
						<div class='paramTitle'>Rotate Degrees: </div><br>
						<input style='width:78px' type="number" id="stampAngle" name="stampAngle" min="0" max="360" width='60px' value='${self.angle}' onchange='Modes.Stamps.changeAngle(event)' oninput='Modes.Stamps.changeAngle(event)'><br>
						<input type='checkbox' id='stampsIsSnapping' onclick='Modes.Stamps.changeSnapping(event)'><label for='stampsIsSnapping'>Snap To Grid</label><br>
						`;
			
			htm += `<div style='max-height:150px;max-width:150px;overflow-y:auto;'>`
			Stamps.forEach(function(stamp, i){
				htm += `<div class='modeBtn' onclick='Modes.Stamps.changeStamp(${i})'><img src='${stamp.path || stamp.src}' width='32px' height='32px'></div>`;
			});
			htm += `</div>`;
			
			htm += `<a href='#' class='' onclick='Modes.Stamps.addStamp()'>Add</a> `
			
			htm +=`	
						`;
			container.innerHTML = htm;
			
			ir.set("stampsIsSnapping", self.isSnapping);
		},
	}; return self;
	})(),
};


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


var Stamps = [
	{
		path:'star.png',
	},
	{
		path:'stairs_left.png',
	},
	{
		path:'stairs_right.png',
	},
	{
		path:'stairs_up.png',
	},
	{
		path:'stairs_down.png',
	},
	{
		path:'door_up_down.png',
	},
	{
		path:'door_left_right.png',
	},
	{
		path:'images/Table2.png',
	},
	{
		path:'stamps/numbers/0circ.png',
	},
	{
		path:'stamps/numbers/1circ.png',
	},
	{
		path:'stamps/numbers/2circ.png',
	},
	{
		path:'stamps/numbers/3circ.png',
	},
	{
		path:'stamps/numbers/4circ.png',
	},
	{
		path:'stamps/numbers/5circ.png',
	},
	{
		path:'stamps/numbers/6circ.png',
	},
	{
		path:'stamps/numbers/7circ.png',
	},
	{
		path:'stamps/numbers/8circ.png',
	},
	{
		path:'stamps/numbers/9circ.png',
	},
	{
		path:'stamps/decor/barrelside.png',
	},
	{
		path:'stamps/decor/bed.png',
	},
	{
		path:'stamps/decor/chair.png',
	},
	{
		path:'stamps/decor/chest.png',
	},
	{
		path:'stamps/doors/door.png',
	},
	{
		path:'stamps/doors/doubledoor.png',
	},
	{
		path:'stamps/doors/lockeddoor.png',
	},
	{
		path:'stamps/doors/secretdoor.png',
	},
	{
		path:'stamps/hazards/cracks.png',
	},
	{
		path:'stamps/hazards/pit.png',
	},
	{
		path:'stamps/markers/city.png',
	},
	{
		path:'stamps/markers/flag.png',
	},
	{
		path:'stamps/markers/starcircle.png',
	},
	{
		path:'stamps/nature/cave.png',
	},
	{
		path:'stamps/nature/hills.png',
	},
	{
		path:'stamps/nature/pond.png',
	},
	{
		path:'stamps/nature/rocks.png',
	}
];



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