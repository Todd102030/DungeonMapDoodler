"use strict";

var Wall = (function(){
	var self={
		borderSize: 3,
		fillColor: "#ffffff",
		outlineColor: "#000000",
		hatchSize: 30,
		id:8,
        isSnapping: true,
		size: 10,
		shape: Shape.Line,
		title: "Wall Settings",
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
				ir.set("wallSizeLabel", self.size);
			}else{
				ir.set("wallSize", self.size);
			}
		},
        changeBorderSize: function(evt, fromInput){
			self.borderSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("wallBorderSizeLabel", self.borderSize);
			}else{
				ir.set("wallBorderSize", self.borderSize);
			}
		},
		changeHatchSize: function(evt, fromInput){
			self.hatchSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("wallHatchSizeLabel", self.hatchSize);
			}else{
				ir.set("wallHatchSize", self.hatchSize);
			}
		},
        changeSnapping: function(evt){
			self.isSnapping = ir.bool("wallIsSnapping");
		},
		changeShape: function(evt){
			self.shape = Shape[evt.target.value];
		},
		draw: function(xpos, ypos, expos, eypos, data){
			var size = self.size;
			var border=self.borderSize;
			var ctx = data.hatchCtx;
			var hatchSize = self.hatchSize;
			
			if(self.shape == Shape.Line){
                //Path Drawing
                ctx = data.doodleCtx;
                ctx.save();
                ctx.globalCompositeOperation = "destination-out";
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(xpos, ypos, size/2+border, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(expos, eypos, size/2+border, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.lineWidth = size+border*2;
                ctx.moveTo(xpos,ypos);
                ctx.lineTo(expos,eypos);
                ctx.stroke();
                ctx.restore();

                //Outline Drawing
                ctx = data.outlineCtx;
                ctx.save();
                ctx.globalCompositeOperation = "destination-out";
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(xpos, ypos, size/2, 0, 2 * Math.PI);
                ctx.arc(expos, eypos, size/2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.lineWidth = (size);
                ctx.moveTo(xpos,ypos);
                ctx.lineTo(expos,eypos);
                ctx.stroke();
                ctx.restore();
            }else{
                //Do square room stuff
                
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
			
			//Wall
            var gridxy = getGridXY2(xpos, ypos);
            
            if(self.isSnapping){
                xpos = gridxy.xgridmid//+gridxy.step/2;
                ypos = gridxy.ygridmid//+gridxy.step/2;
            }
			ctx.strokeStyle = "rgb(240,60,60)";
            //ctx.beginPath();
            //ctx.arc(xpos, ypos, (self.size/2)*doodler.zoomLevel, 0, 2 * Math.PI);
            //ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(self.doodleStartX*zoom+offx || xpos, self.doodleStartY*zoom+offy || ypos, (self.size/2)*doodler.zoomLevel, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(self.doodleEndX*zoom+offx || xpos, self.doodleEndY*zoom+offy || ypos, (self.size/2)*doodler.zoomLevel, 0, 2 * Math.PI);
            ctx.stroke();
            
            
            if(self.doodleEndX != null && self.isDoodling){
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(self.doodleStartX*zoom+offx, self.doodleStartY*zoom+offy);
                ctx.lineTo(self.doodleEndX*zoom+offx || xpos, self.doodleEndY*zoom+offy || ypos);
                ctx.stroke();
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
            var gridxy = getGridXY2(xpos, ypos);
            if(self.isSnapping){
				self.doodleStartX = gridxy.xgridmid;//+gridxy.step/2;
				self.doodleStartY = gridxy.ygridmid;//+gridxy.step/2;
				//self.doodleEndX = gridxy.xpos;
				//self.doodleEndY = gridxy.ypos;
			}else{
				self.doodleStartX = xpos;
				self.doodleStartY = ypos;
				//self.doodleEndX = xpos;
				//self.doodleEndY = ypos;
			}
			//self.draw(xpos, ypos, xpos, ypos, data);
		},
		mouseMove: function(xpos, ypos, data){
			var gridxy = getGridXY2(xpos, ypos);
			if(self.isSnapping){
				self.doodleEndX = gridxy.xgridmid;//+gridxy.step/2;
				self.doodleEndY = gridxy.ygridmid;//+gridxy.step/2;
			}else{
				self.doodleEndX = xpos;
				self.doodleEndY = ypos;
			}
		},
		mouseUp: function(xpos, ypos, data){
	        self.isDoodling = false;
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
						<div class='paramTitle'>Width: </div><input type='number' style='width:60px' id='wallSizeLabel' value="${self.size}" onchange='Modes.Wall.changeSize(event, true)' oninput='Modes.Wall.changeSize(event, true)'><br>
						<input style='width:100px' type="range" id="wallSize" name=wallSize" min="1" max="150" value='${self.size}' onchange='Modes.Wall.changeSize(event)' oninput='Modes.Wall.changeSize(event)'><br>
                        <div class='paramTitle'>Hatch: </div><input type='number' style='width:60px' id='wallHatchSizeLabel' value="${self.hatchSize}" onchange='Modes.Wall.changeHatchSize(event, true)' oninput='Modes.Wall.changeHatchSize(event, true)'><br>
						<input style='width:100px' type="range" id="wallHatchSize" name="wallHatchSize" min="1" max="150" value='${self.hatchSize}' onchange='Modes.Wall.changeHatchSize(event)' oninput='Modes.Wall.changeHatchSize(event)'><br>
						<div class='paramTitle'>Wall Thickness: </div><input type='number' style='width:60px' id='wallBorderSizeLabel' value="${self.borderSize}" onchange='Modes.Wall.changeBorderSize(event, true)' oninput='Modes.Wall.changeBorderSize(event, true)'><br>
						<input style='width:100px' type="range" id="wallBorderSize" name="wallBorderSize" min="0" max="25" value='${self.borderSize}' onchange='Modes.Wall.changeBorderSize(event)' oninput='Modes.Wall.changeBorderSize(event)'><br>
						<input type='checkbox' id='wallIsSnapping' onclick='Modes.Wall.changeSnapping(event)'><label for='wallIsSnapping'>Snap To Grid</label><br>
						
						`;
			container.innerHTML = htm;
            
            ir.set("wallIsSnapping", self.isSnapping);
		},
	}; return self;
})()