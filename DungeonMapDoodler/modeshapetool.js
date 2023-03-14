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
		title: "Shape Tool Settings",
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
		},
		changeSides: function(evt, fromInput){
			self.numSides = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("shapeToolNumSidesLabel", self.numSides);
			}else{
				ir.set("shapeToolNumSides", self.numSides);
			}
		},
		changeInset: function(evt){
			self.inset = parseInt(evt.target.value);
			ir.set("shapeToolInsetLabel", self.inset);
		},
        changeBorderSize: function(evt, fromInput){
			self.borderSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("shapeToolBorderSizeLabel", self.borderSize);
			}else{
				ir.set("shapeToolBorderSize", self.borderSize);
			}
		},
		changeHatchSize: function(evt, fromInput){
			self.hatchSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("shapeToolHatchSizeLabel", self.hatchSize);
			}else{
				ir.set("shapeToolHatchSize", self.hatchSize);
			}
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
		draw: function(xpos, ypos, data){
			//TODO: Add square/circle funcitonality
			//data.doodleCtx.strokeStyle = "black";
			//data.doodleCtx.fillRect(self.doodleStartX, self.doodleStartY, self.doodleEndX, self.doodleEndY);
			
			var wh = doodler;
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

			//if(self.isSubtractive || data.event.shiftKey){
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
				size = Math.hypot(Math.abs(self.doodleStartX-self.doodleEndX)*zoom,Math.abs(self.doodleStartY-self.doodleEndY)*zoom),
				Xcenter = self.doodleStartX,
				Ycenter = self.doodleStartY;
				var angleRad = Math.atan2(self.doodleStartY-self.doodleEndY, self.doodleStartX-self.doodleEndX);
			
				
				//Path Drawing
				ctx = doodler.overlayCtx;
                ctx.fillStyle = self.fillColor;
				ctx.strokeStyle = self.fillColor;
                if(!doodler.disableFilters){
                    var filter = doodler.filter;
                    ctx.filter = filter;
                }
				ctx.beginPath();
				ctx.moveTo (Xcenter +  size * Math.cos(angleRad), Ycenter +  size *  Math.sin(angleRad));          

				for (var i = 1; i <= numberOfSides;i += 1) {
				  ctx.lineTo (Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides + angleRad), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides + angleRad));
				}
				ctx.fill();
				
				//Outline Drawing
				/*ctx = data.outlineCtx;
				ctx.save();
				ctx.globalCompositeOperation = "destination-out";
				ctx.fillStyle = 'black';
				ctx.fillStyle = self.outlineColor;
				size -= (border + inset);

				ctx.beginPath();
				ctx.moveTo (Xcenter +  size * Math.cos(angleRad), Ycenter +  size *  Math.sin(angleRad));          

				for (var i = 1; i <= numberOfSides;i += 1) {
				  ctx.lineTo (Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides + angleRad), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides + angleRad));
				}
				ctx.fill();
				ctx.restore();*/
			//}else{
				
				/*var numberOfSides = self.numSides,
					size = Math.abs(self.doodleStartX-self.doodleEndX),
					Xcenter = self.doodleStartX/zoom,
					Ycenter = self.doodleStartY/zoom;
				*/
				/*var numberOfSides = self.numSides,
				size = Math.hypot(Math.abs(self.doodleStartX-self.doodleEndX)*zoom,Math.abs(self.doodleStartY-self.doodleEndY)*zoom),
				Xcenter = self.doodleStartX,
				Ycenter = self.doodleStartY;
				var angleRad = Math.atan2(self.doodleStartY-self.doodleEndY, self.doodleStartX-self.doodleEndX);
		*/
				/*for(var i=0;i<4;i++){
				    ctx.drawImage(ir.get("circlefuzzImg"),Xcenter-border-hatchSize-size, Ycenter-border-hatchSize-size, 
					   size*2+(border*2+hatchSize*2), size*2+(border*2+hatchSize*2))
                }*/
				//Path Drawing
			/*	ctx = doodler.overlayCtx;
                if(!doodler.disableFilters){
                    var filter = doodler.filter;
                    ctx.filter = filter;
                }
				ctx.fillStyle = self.fillColor;
				//ctx.fillRect(Math.min(self.doodleStartX,self.doodleEndX)-inset, Math.min(self.doodleStartY,self.doodleEndY)-inset, 
				//		   Math.abs(self.doodleStartX-self.doodleEndX)+inset*2, Math.abs(self.doodleStartY-self.doodleEndY)+inset*2);
				if(!doodler.drawRough){
					ctx.beginPath();
					ctx.moveTo (Xcenter +  size * Math.cos(angleRad), Ycenter +  size *  Math.sin(angleRad));          

					for (var i = 1; i <= numberOfSides;i += 1) {
					  ctx.lineTo (Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides + angleRad), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides + angleRad));
					}
					ctx.fill();
				}else{
					var poly = [];
					poly.push([Xcenter +  size * Math.cos(angleRad), Ycenter +  size *  Math.sin(angleRad)])
					for (var i = 1; i <= numberOfSides;i += 1) {
					  poly.push([Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides + angleRad), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides + angleRad)]);
					}
					
					var rcopts = { roughness: 2, bowing:3, disableMultiStroke:true, fill:self.fillColor, fillStyle:'solid', stroke:"none"};
					var rc = rough.canvas(ctx.canvas);
					rc.polygon(poly, rcopts);
				}
				*/
				//Outline Drawing
				/*ctx = data.outlineCtx;
				ctx.fillStyle = self.outlineColor;
				size += border + inset;
				if(!doodler.drawRough){
					ctx.beginPath();
					ctx.moveTo (Xcenter +  size * Math.cos(angleRad), Ycenter +  size *  Math.sin(angleRad));          

					for (var i = 1; i <= numberOfSides;i += 1) {
					  ctx.lineTo (Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides + angleRad), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides + angleRad));
					}
					ctx.fill();
				}else{
					poly.push([Xcenter +  size * Math.cos(angleRad), Ycenter +  size *  Math.sin(angleRad)])
					for (var i = 1; i <= numberOfSides;i += 1) {
					  poly.push([Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides + angleRad), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides + angleRad)]);
					}
					var rcopts = { roughness: 2, bowing:3, disableMultiStroke:false, fill:self.outlineColor, fillStyle:'solid', strokeWidth:border};
					var rc = rough.canvas(ctx.canvas);
					rc.polygon(poly, rcopts);
				}*/
			//}
            ctx.filter = "none";
            doodler.updateFrameBuffer();
				
		},
		drawCursor : function(ctx, xpos, ypos, data){
			if(self.mouseIsDown){
				self.drawOutlineBox(ctx, xpos, ypos, data);
			}else{
				//if(self.isSubtractive /*|| data.event.shiftKey*/){
				/*	ctx.strokeStyle = "rgb(55, 222, 126)";
				}else{
					ctx.strokeStyle = "rgb(240,60,60)";
				}*/
                if(doodler.shiftDown){
                    ctx.fillStyle = "rgb(237, 148, 148)";
                }else{
                    ctx.fillStyle = "#ffffff";
                }
                if(!doodler.disableFilters){
                    var filter = doodler.filter;
                    ctx.filter = filter;
                }
				/*var gridxy = getGridXY2(xpos, ypos);
				var offx = doodler.globalOffsetX;
				var offy = doodler.globalOffsetY;
				var zoom = doodler.zoomLevel;
				if(self.isSnapping){
					ctx.fillRect(gridxy.xgridmid, gridxy.ygridmid, 2, 2);
				}else{
					ctx.fillRect(xpos, ypos, 2, 2);
				}*/
				
			    var zoom = doodler.zoomLevel;
				var numberOfSides = self.numSides,
				size = 40*zoom,
				Xcenter = xpos,
				Ycenter = ypos;
                var angleRad = 0;

                ctx.beginPath();
                ctx.moveTo (Xcenter +  size * Math.cos(angleRad), Ycenter +  size *  Math.sin(angleRad));          

                for (var i = 1; i <= numberOfSides;i += 1) {
                  ctx.lineTo (Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides+angleRad), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides+angleRad));
                }
                ctx.fill();
                ctx.filter = "none";
			}
		},
		drawOutlineBox: function(ctx, xpos, ypos, data){
			if(doodler.shiftDown){
                ctx.fillStyle = "rgb(237, 148, 148)";
            }else{
                ctx.fillStyle = "#ffffff";
            }
            if(!doodler.disableFilters){
                var filter = doodler.filter;
                ctx.filter = filter;
            }
			var offx = doodler.globalOffsetX;
			var offy = doodler.globalOffsetY;
			var zoom = doodler.zoomLevel;
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
				size = Math.hypot(Math.abs(self.doodleStartX-self.doodleEndX),Math.abs(self.doodleStartY-self.doodleEndY))*zoom,
				Xcenter = self.doodleStartX,
				Ycenter = self.doodleStartY;
			var angleRad = Math.atan2(self.doodleStartY-self.doodleEndY, self.doodleStartX-self.doodleEndX);
			
			

			ctx.beginPath();
			ctx.moveTo (Xcenter +  size * Math.cos(angleRad), Ycenter +  size *  Math.sin(angleRad));          

			for (var i = 1; i <= numberOfSides;i += 1) {
			  ctx.lineTo (Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides+angleRad), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides+angleRad));
			}
			ctx.fill();
			
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
				self.doodleStartX = gridxy.xgridmid;
				self.doodleStartY = gridxy.ygridmid;
				self.doodleEndX = gridxy.xgridmid;
				self.doodleEndY = gridxy.ygridmid;
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
				self.doodleEndX = gridxy.xgridmid;//+gridxy.step/2;
				self.doodleEndY = gridxy.ygridmid;//+gridxy.step/2;
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
						<!--<div class='paramTitle'>In/Outset: </div><label for='shapeToolInset' id='shapeToolInsetLabel'>${self.inset}</label><br>
						<input style='width:100px' type="range" id="shapeToolInset" name="shapeToolInset" min="${doodler.dimensions.footPixel * doodler.dimensions.stepSize * -1}" max="${doodler.dimensions.footPixel * doodler.dimensions.stepSize}" value='${self.inset}' onchange='Modes.ShapeTool.changeInset(event)' oninput='Modes.ShapeTool.changeInset(event)'><br>-->
                        <div class='paramTitle'>Hatch: </div><input type='number' style='width:60px' id='shapeToolHatchSizeLabel' value="${self.hatchSize}" onchange='Modes.ShapeTool.changeHatchSize(event, true)' oninput='Modes.ShapeTool.changeHatchSize(event, true)'><br>
						<input style='width:100px' type="range" id="shapeToolHatchSize" name="shapeToolHatchSize" min="1" max="150" value='${self.hatchSize}' onchange='Modes.ShapeTool.changeHatchSize(event)' oninput='Modes.ShapeTool.changeHatchSize(event)'><br>
						<div class='paramTitle'>Wall Thickness: </div><input type='number' style='width:60px' id='shapeToolBorderSizeLabel' value="${self.borderSize}" onchange='Modes.ShapeTool.changeBorderSize(event, true)' oninput='Modes.ShapeTool.changeBorderSize(event, true)'><br>
						<input style='width:100px' type="range" id="shapeToolBorderSize" name="shapeToolBorderSize" min="0" max="25" value='${self.borderSize}' onchange='Modes.ShapeTool.changeBorderSize(event)' oninput='Modes.ShapeTool.changeBorderSize(event)'><br>
						<div class='paramTitle'>Number of Sides: </div><input type='number' style='width:60px' id='shapeToolNumSidesLabel' value="${self.numSides}" onchange='Modes.ShapeTool.changeSides(event, true)' oninput='Modes.ShapeTool.changeSides(event, true)'><br>
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