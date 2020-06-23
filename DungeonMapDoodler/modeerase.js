"use strict";

var Erase = (function(){
	var self={
		borderSize: 3,
		eraseHatch: true,
		eraseOutline: true,
		eraseRoom: true,
		eraseStamps: true,
		fillColor: "#ffffff",
		outlineColor: "#000000",
		hatchSize: 1,
		id:8,
		isSnapping: false,
		size: 50,
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
			self.eraseStamps = ir.v("eraseStamps");	
		},
		changeSize: function(evt, fromInput){
			self.size = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("eraseSizeLabel", self.size);
			}else{
				ir.set("eraseSize", self.size);
			}
		},
		changeBorderSize: function(evt, fromInput){
			self.borderSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("eraseBorderSizeLabel", self.borderSize);
			}else{
				ir.set("eraseBorderSize", self.borderSize);
			}
		},
		changeHatchSize: function(evt, fromInput){
			self.hatchSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("eraseHatchSizeLabel", self.hatchSize);
			}else{
				ir.set("eraseHatchSize", self.hatchSize);
			}
		},
		changeShape: function(evt){
			self.shape = Shape[evt.target.value];
		},
		changeSnap: function(){
			self.isSnapping = ir.v("eraseSnapToGrid");
		},
		draw: function(xpos, ypos, data){
            var wh = doodler;
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
				Modes.StampTool.stampHit = doodler.hitTestStamps({x:xpos,y:ypos,w:1,h:1});
				Modes.StampTool.isMovingStamp = true;
				Modes.StampTool.deleteFn();
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
				
            	var offX = doodler.globalOffsetX;
            	var offY = doodler.globalOffsetY;
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
            var wh = doodler;
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
			doodler.updateUndoStack();
            self.doodleStartX = 0;
            self.doodleStartY = 0;
            self.doodleEndX = 0;
            self.doodleEndY = 0;
		},
		setParameterBox: function(container){
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<input type='checkbox' id='eraseSnapToGrid' onclick='Modes.Erase.changeSnap()'><label for='eraseSnapToGrid'>Snap To Grid</label><br>
						<div class='paramTitle'>Size: </div><input type='number' style='width:60px' id='eraseSizeLabel' value="${self.size}" onchange='Modes.Erase.changeSize(event, true)' oninput='Modes.Erase.changeSize(event, true)'><br>
						<input style='width:100px' type="range" id="eraseSize" name="eraseSize" min="1" max="200" value='${self.size}' onchange='Modes.Erase.changeSize(event)' oninput='Modes.Erase.changeSize(event)'><br>
						<div class='paramTitle'>Hatch: </div><input type='number' style='width:60px' id='eraseHatchSizeLabel' value="${self.hatchSize}" onchange='Modes.Erase.changeHatchSize(event, true)' oninput='Modes.Erase.changeHatchSize(event, true)'><br>
						<input style='width:100px' type="range" id="eraseHatchSize" name="eraseHatchSize" min="1" max="150" value='${self.hatchSize}' onchange='Modes.Erase.changeHatchSize(event)' oninput='Modes.Erase.changeHatchSize(event)'><br>
						<div class='paramTitle'>Border: </div><input type='number' style='width:60px' id='eraseBorderSizeLabel' value="${self.borderSize}" onchange='Modes.Erase.changeBorderSize(event, true)' oninput='Modes.Erase.changeBorderSize(event, true)'><br>
						<input style='width:100px' type="range" id="eraseBorderSize" name="eraseBorderSize" min="0" max="25" value='${self.borderSize}' onchange='Modes.Erase.changeBorderSize(event)' oninput='Modes.Erase.changeBorderSize(event)'><br>
						<input type="radio" id="eraseSquare" name="eraseShape" value="Square" onchange='Modes.Erase.changeShape(event)'>
						<label for="eraseSquare">Square</label><br>
						<input type="radio" id="eraseCircle" name="eraseShape" value="Circle" onchange='Modes.Erase.changeShape(event)'>
						<label for="eraseCircle">Circle</label><br>
						<input type='checkbox' id='eraseHatch' onclick='Modes.Erase.changeErases()'><label for='eraseHatch'>Erase Hatching</label><br>
						<input type='checkbox' id='eraseOutline' onclick='Modes.Erase.changeErases()'><label for='eraseOutline'>Erase Outline</label><br>
						<input type='checkbox' id='eraseRoom' onclick='Modes.Erase.changeErases()'><label for='eraseRoom'>Erase Rooms</label><br>
						<input type='checkbox' id='eraseStamps' onclick='Modes.Erase.changeErases()'><label for='eraseStamps'>Erase Stamps</label><br>
						`;
			container.innerHTML = htm;
			ir.set("eraseHatch", self.eraseHatch);
			ir.set("eraseOutline", self.eraseOutline);
			ir.set("eraseRoom", self.eraseRoom);
			ir.set("eraseSnapToGrid", self.isSnapping);
			ir.set("eraseStamps", self.eraseStamps);
		
			
		},
	}; return self;
})()