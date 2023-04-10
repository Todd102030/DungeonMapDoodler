"use strict";

var RoomTool = (function(){
	var self={
		borderSize: 3,
		hatchSize: 30,
		id:8,
		inset:0,
		size:30,
		fillColor: "#ffffff",
		outlineColor: "#000000",
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
		changeInset: function(evt, fromInput){
			self.inset = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("roomToolInsetLabel", self.inset);
			}else{
				ir.set("roomToolInset", self.inset);
			}
		},
        changeBorderSize: function(evt, fromInput){
			self.borderSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("roomToolBorderSizeLabel", self.borderSize);
			}else{
				ir.set("roomToolBorderSize", self.borderSize);
			}
		},
		changeHatchSize: function(evt, fromInput){
			self.hatchSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("roomToolHatchSizeLabel", self.hatchSize);
			}else{
				ir.set("roomToolHatchSize", self.hatchSize);
			}
		},
		changeShape: function(evt){
			self.shape = Shape[evt.target.value];
		},
		changeSnapping: function(evt){
			self.isSnapping = ir.bool("roomToolIsSnapping");
		},
		changeSubtractive: function(evt){
			self.isSubtractive = ir.bool("roomToolIsSubtractive");
		},
		draw: function(xpos, ypos, data){
			//TODO: Add square/circle funcitonality
			//data.doodleCtx.strokeStyle = "black";
			//data.doodleCtx.fillRect(self.doodleStartX, self.doodleStartY, self.doodleEndX, self.doodleEndY);
			
			var wh = doodler;
            var offX = wh.globalOffsetX;
            var offY = wh.globalOffsetY;
            var zoom = 1;//wh.zoomLevel;
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

			//ctx = data.hatchCtx;
			//ctx.fillStyle = "black";
            
			//if(self.isSubtractive || data.event.shiftKey){
				/*ctx.save();
				ctx.globalCompositeOperation = "destination-out";
				ctx.fillStyle = 'black';
				ctx.drawImage(ir.get("squarefuzzImg"),Math.min(self.doodleStartX,self.doodleEndX)-border-hatchSize, Math.min(self.doodleStartY,self.doodleEndY)-border-hatchSize, 
					   Math.abs(self.doodleStartX-self.doodleEndX)+(border*2+hatchSize*2), Math.abs(self.doodleStartY-self.doodleEndY)+(border*2+hatchSize*2))
				ctx.restore();*/

				//Path Drawing
				ctx = doodler.overlayCtx;
                ctx.fillStyle = self.fillColor;
				ctx.strokeStyle = self.fillColor;
				//ctx.save();
                if(!doodler.disableFilters){
                    var filter = doodler.filter;
                    ctx.filter = filter;
                }
				//ctx.globalCompositeOperation = "destination-out";
				//ctx.fillStyle = 'black';
				ctx.fillStyle = self.fillColor;
				ctx.fillRect(Math.min(self.doodleStartX,self.doodleEndX), Math.min(self.doodleStartY,self.doodleEndY), 
						   Math.abs(self.doodleStartX-self.doodleEndX), Math.abs(self.doodleStartY-self.doodleEndY));
				//ctx.restore();
				
				//Outline Drawing
				/*ctx = data.outlineCtx;
				ctx.save();
				ctx.globalCompositeOperation = "destination-out";
				ctx.fillStyle = 'black';
				ctx.fillStyle = self.outlineColor;
				ctx.fillRect(Math.min(self.doodleStartX,self.doodleEndX)-inset, Math.min(self.doodleStartY,self.doodleEndY)-inset, 
						   Math.abs(self.doodleStartX-self.doodleEndX)+inset*2, Math.abs(self.doodleStartY-self.doodleEndY)+inset*2);
				ctx.restore();*/
			//}else{
                /*for(var i=0;i<4;i++){
				    ctx.drawImage(ir.get("squarefuzzImg"),Math.min(self.doodleStartX,self.doodleEndX)-border-hatchSize, Math.min(self.doodleStartY,self.doodleEndY)-border-hatchSize, 
					   Math.abs(self.doodleStartX-self.doodleEndX)+(border*2+hatchSize*2), Math.abs(self.doodleStartY-self.doodleEndY)+(border*2+hatchSize*2))
                }*/
				//Path Drawing
				/*ctx = doodler.overlayCtx;
                if(!doodler.disableFilters){
                    var filter = doodler.filter;
                    ctx.filter = filter;
                }
				ctx.fillStyle = self.fillColor;
				if(!doodler.drawRough){
					ctx.fillRect(Math.min(self.doodleStartX,self.doodleEndX)-inset, Math.min(self.doodleStartY,self.doodleEndY)-inset, 
						   Math.abs(self.doodleStartX-self.doodleEndX)+inset*2, Math.abs(self.doodleStartY-self.doodleEndY)+inset*2);
				}else{
					var rcopts = { roughness: 2, bowing:2, disableMultiStroke:false, fill:self.fillColor, fillStyle:'solid', stroke:"none"};
					var rc = rough.canvas(ctx.canvas);
					rc.rectangle(Math.min(self.doodleStartX,self.doodleEndX)-inset, Math.min(self.doodleStartY,self.doodleEndY)-inset, 
						   Math.abs(self.doodleStartX-self.doodleEndX)+inset*2, Math.abs(self.doodleStartY-self.doodleEndY)+inset*2, rcopts);
				}*/
				//Outline Drawing
				/*ctx = data.outlineCtx;
				ctx.fillStyle = self.outlineColor;
				if(!doodler.drawRough){
					ctx.fillRect(Math.min(self.doodleStartX,self.doodleEndX)-border-inset, Math.min(self.doodleStartY,self.doodleEndY)-border-inset, 
						   Math.abs(self.doodleStartX-self.doodleEndX)+(border*2)+inset*2, Math.abs(self.doodleStartY-self.doodleEndY)+(border*2)+inset*2);
				}else{
					var rcopts = { roughness: 2, bowing:2, disableMultiStroke:false, fill:self.outlineColor, fillStyle:'solid'};
					var rc = rough.canvas(ctx.canvas);
					rc.rectangle(Math.min(self.doodleStartX,self.doodleEndX)-border-inset, Math.min(self.doodleStartY,self.doodleEndY)-border-inset, 
						   Math.abs(self.doodleStartX-self.doodleEndX)+(border*2)+inset*2, Math.abs(self.doodleStartY-self.doodleEndY)+(border*2)+inset*2, rcopts);
				}*/
			//}
            ctx.filter = "none";
            doodler.updateFrameBuffer();
				
		},
		drawCursor : function(ctx, xpos, ypos, data){
			if(self.mouseIsDown){
				self.drawOutlineBox(ctx, xpos, ypos, data);
			}else{
                if(!doodler.disableFilters){
                    var filter = doodler.filter;
                    ctx.filter = filter;
                }
				if(doodler.shiftDown){
                    ctx.fillStyle = "rgb(237, 148, 148)";
                }else{
                    ctx.fillStyle = "#ffffff";
                }
				var gridxy = getGridXY2(xpos, ypos);
				var offx = doodler.globalOffsetX;
				var offy = doodler.globalOffsetY;
				var zoom = doodler.zoomLevel;
				if(self.isSnapping){
					ctx.fillRect(gridxy.xpos, gridxy.ypos, gridxy.step, gridxy.step);
				}else{
					ctx.fillRect(xpos, ypos, 2, 2);
				}
			}
            ctx.filter = "none";
		},
		drawOutlineBox: function(ctx, xpos, ypos, data){
			//if(self.isSubtractive /*|| data.event.shiftKey*/){
			/*	ctx.strokeStyle = "rgb(55, 222, 126)";
			}else{
				ctx.strokeStyle = "rgb(240,60,60)";
			}*/
            if(!doodler.disableFilters){
                var filter = doodler.filter;
                ctx.filter = filter;
            }
            if(doodler.shiftDown){
                ctx.fillStyle = "rgb(237, 148, 148)";
            }else{
                ctx.fillStyle = "#ffffff";
            }
			var offx = doodler.globalOffsetX;
			var offy = doodler.globalOffsetY;
			var zoom = doodler.zoomLevel;
			if(self.isSnapping){
				var grid1 = getGridXY2(Math.min(self.doodleStartX,self.doodleEndX), Math.min(self.doodleStartY,self.doodleEndY));
				var grid2 = getGridXY2(Math.max(self.doodleStartX,self.doodleEndX), Math.max(self.doodleStartY,self.doodleEndY));
				ctx.fillRect(grid1.xpos, grid1.ypos, 
						   Math.abs(grid1.xpos-grid2.xpos), Math.abs(grid1.ypos-grid2.ypos));
			}
			else{
				ctx.fillRect((Math.min(self.doodleStartX,self.doodleEndX)), (Math.min(self.doodleStartY,self.doodleEndY)), 
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
			doodler.canvas.style.cursor = "unset";
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
            var wh = doodler;
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
			doodler.drawOverlayCommit(xpos, ypos, data);
			doodler.updateCurrentImage(false, true);
            self.doodleStartX = 0;
            self.doodleStartY = 0;
            self.doodleEndX = 0;
            self.doodleEndY = 0;
		},
		setParameterBox: function(container){
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<div class='paramTitle'>In/Outset: </div><input type='number' style='width:60px' id='roomToolInsetLabel' value="${self.inset}" onchange='Modes.RoomTool.changeInset(event, true)' oninput='Modes.RoomTool.changeInset(event, true)'><br>
						<input style='width:100px' type="range" id="roomToolInset" name="roomToolInset" min="${doodler.dimensions.footPixel * doodler.dimensions.stepSize * -1}" max="${doodler.dimensions.footPixel * doodler.dimensions.stepSize}" value='${self.inset}' onchange='Modes.RoomTool.changeInset(event)' oninput='Modes.RoomTool.changeInset(event)'><br>
                        <div class='paramTitle'>Hatch: </div><input type='number' style='width:60px' id='roomToolHatchSizeLabel' value="${self.hatchSize}" onchange='Modes.RoomTool.changeHatchSize(event, true)' oninput='Modes.RoomTool.changeHatchSize(event, true)'><br>
						<input style='width:100px' type="range" id="roomToolHatchSize" name="roomToolHatchSize" min="1" max="150" value='${self.hatchSize}' onchange='Modes.RoomTool.changeHatchSize(event)' oninput='Modes.RoomTool.changeHatchSize(event)'><br>
						<div class='paramTitle'>Wall Thickness: </div><input type='number' style='width:60px' id='roomToolBorderSizeLabel' value="${self.borderSize}" onchange='Modes.RoomTool.changeBorderSize(event, true)' oninput='Modes.RoomTool.changeBorderSize(event, true)'><br>
						<input style='width:100px' type="range" id="roomToolBorderSize" name="roomToolBorderSize" min="0" max="25" value='${self.borderSize}' onchange='Modes.RoomTool.changeBorderSize(event)' oninput='Modes.RoomTool.changeBorderSize(event)'><br>
						<input type='checkbox' id='roomToolIsSnapping' onclick='Modes.RoomTool.changeSnapping(event)'><label for='roomToolIsSnapping'>Snap To Grid</label><br>
						<input type='checkbox' id='roomToolIsSubtractive' } onclick='Modes.RoomTool.changeSubtractive(event)'><label for='roomToolIsSubtractive' >Subtractive</label><br>
						<input type='color' value='${self.fillColor}' id='roomToolFillColor' onchange="Modes.RoomTool.changeColor(event, 'fill')">
						<label for="roomToolFillColor">Fill Color</label><br>
						<input type='color' value='${self.outlineColor}' id='roomToolOutlineColor' onchange="Modes.RoomTool.changeColor(event, 'outline')">
						<label for="roomToolOutlineColor">Outline Color</label><br>
						`;
			/*<input type="radio" id="roomToolSquare" name="roomToolShape" value="Square" onchange='Modes.RoomTool.changeShape(event)'>
			<label for="roomToolSquare">Square</label><br>
			<input type="radio" id="roomToolCircle" name="roomToolShape" value="Circle" onchange='Modes.RoomTool.changeShape(event)'>
			<label for="roomToolCircle">Circle</label><br>*/
			
			container.innerHTML = htm;

			ir.set("roomToolIsSnapping", self.isSnapping);
			ir.set("roomToolIsSubtractive", self.isSubtractive);
			
			
		},
	}; return self;
})()