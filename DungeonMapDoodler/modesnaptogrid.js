"use strict";

var SnapToGrid = (function(){
	var self={
		borderSize: 3,
		fillColor: "#ffffff",
		outlineColor: "#000000",
		hatchSize: 50,
		id:8,
		inset:0,
		size: 25,
		title: "Snap To Grid Settings",
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
				ir.get("outlineFilterColor").setAttribute("flood-color", evt.target.value);
				ir.get("offsetFilterColor").setAttribute("flood-color", evt.target.value);
			}
			
            doodler.needsRefresh = true;
            doodler.drawLoop();
		},
		changeInset: function(evt, fromInput){
			self.inset = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("snapToGridInsetLabel", self.inset);
			}else{
				ir.set("snapToGridInset", self.inset);
			}
            doodler.drawLoop();
		},
        changeBorderSize: function(evt, fromInput){
			self.borderSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("snapToGridBorderSizeLabel", self.borderSize);
			}else{
				ir.set("snapToGridBorderSize", self.borderSize);
			}
            doodler.needsRefresh = true;
            doodler.drawLoop();
		},
		changeHatchSize: function(evt, fromInput){
			self.hatchSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("snapToGridHatchSizeLabel", self.hatchSize);
			}else{
				ir.set("snapToGridHatchSize", self.hatchSize);
			}
            doodler.needsRefresh = true;
            doodler.drawLoop();
		},
        changeScale: function(evt, fromInput){
			doodler.dimensions.stepScale = parseFloat(evt.target.value);
			if(!fromInput){
				ir.set("snapToGridScaleLabel", doodler.dimensions.stepScale);
			}else{
				ir.set("snapToGridScale", doodler.dimensions.stepScale);
			}
            doodler.needsRefresh = true;
            doodler.drawLoop();
		},
		draw: function(xpos, ypos, data){
			var size = self.size;
			var border=self.borderSize;
			var ctx = data.hatchCtx;
			var hatchSize = self.hatchSize;


			var dim = doodler.dimensions;
			var xfeet = dim.wf;
			var yfeet = dim.hf;
			var sx = dim.scaleX;
			var sy = doodler.dimensions.scaleY;
			var step = dim.footPixel * dim.stepSize / sx;
			var zoom = doodler.zoomLevel;
			var xgridtop = Math.floor(xpos/step)*step;
			var ygridtop = Math.floor(ypos/step)*step;
			// Radii of the white glow.
			var innerRadius = self.size * 0.15;
			var outerRadius = self.size*2+hatchSize;
			// Radius of the entire circle.
			var radius = self.size*2.1+hatchSize;

			ModeHelper.drawCrossHatchCircle(ctx,xpos,ypos,size*4,border,hatchSize);
			
			
			var inset=self.inset;
			//Path Drawing
			ctx = data.doodleCtx;
			ctx.fillStyle = self.fillColor;
			if(!doodler.drawRough){
				ctx.fillRect(xgridtop-inset, ygridtop-inset, step+inset*2, step+inset*2);
			}else{
				var rcopts = { roughness: 1, bowing:0.5, disableMultiStroke:true, fill:self.fillColor, fillStyle:'solid', stroke:"none"};
				var rc = rough.canvas(ctx.canvas);
				rc.rectangle(xgridtop-inset, ygridtop-inset, step+inset*2, step+inset*2, rcopts);
			}
			//Outline Drawing
			ctx = data.outlineCtx;
			ctx.fillStyle = self.outlineColor;
			if(!doodler.drawRough){
				ctx.fillRect(xgridtop-border-inset, ygridtop-border-inset, ((border+inset)*2)+step, ((border+inset)*2)+step);
			}else{
				var rcopts = { roughness: 1, bowing:0.5, disableMultiStroke:true, fill:self.outlineColor, fillStyle:'solid'};
				var rc = rough.canvas(ctx.canvas);
				rc.rectangle(xgridtop-border-inset, ygridtop-border-inset, ((border+inset)*2)+step, ((border+inset)*2)+step, rcopts);
			}

            doodler.updateFrameBuffer();
		},
        drawOverlay: function(xpos, ypos, data){
            var size = self.size;
			var border=self.borderSize;
			var ctx = doodler.overlayCtx;
			var hatchSize = self.hatchSize;

			var dim = doodler.dimensions;
			var xfeet = dim.wf;
			var yfeet = dim.hf;
			var sx = dim.scaleX;
			var sy = doodler.dimensions.scaleY;
			var step = dim.footPixel * dim.stepSize / sx;
			var zoom = doodler.zoomLevel;
			var xgridtop = Math.floor(xpos/step)*step;
			var ygridtop = Math.floor(ypos/step)*step;
			// Radii of the white glow.
			var innerRadius = self.size * 0.15;
			var outerRadius = self.size*2+hatchSize;
			// Radius of the entire circle.
			var radius = self.size*2.1+hatchSize;
			var inset=self.inset;
			//Path Drawing
			//ctx = data.doodleCtx;
			ctx.fillStyle = self.fillColor;
            var gridxy = getGridXY2(xpos, ypos);
			if(!doodler.drawRough){
				ctx.fillRect(gridxy.xpos-inset, gridxy.ypos-inset, gridxy.step+inset*2, gridxy.step+inset*2);
			}else{
				var rcopts = { roughness: 1, bowing:0.5, disableMultiStroke:true, fill:self.fillColor, fillStyle:'solid', stroke:"none"};
				var rc = rough.canvas(ctx.canvas);
				rc.rectangle(xgridtop-inset, ygridtop-inset, step+inset*2, step+inset*2, rcopts);
			}
			
        },
		drawCursor : function(ctx, xpos, ypos, data){
            ctx.fillStyle = "white"; //self.fillColor;
            ctx.strokeStyle = "white";//self.fillColor;
			if(doodler.shiftDown){
                ctx.fillStyle = "rgb(237, 148, 148)"; //self.fillColor;
                ctx.strokeStyle = "rgb(237, 148, 148)";
            }
			var dim = doodler.dimensions;
			var xfeet = dim.wf;
			var yfeet = dim.hf;
			var sx = dim.scaleX;
			var sy = dim.scaleY;
            var zoom = doodler.zoomLevel;
			var gridxy = getGridXY2(xpos, ypos);
			var inset = self.inset;
			//ctx.strokeRect(xgridtop-inset, ygridtop-inset, step*zoom+inset*2, step*zoom+inset*2);
			ctx.fillRect(gridxy.xpos-inset, gridxy.ypos-inset, gridxy.step+inset*2, gridxy.step+inset*2);

			//Draw current texture onto cursor
			var dobg = ir.bool("drawFGBG");
			var layer = doodler.layers[doodler.currentLayer];
			ctx.globalCompositeOperation = "source-atop";
			if(!doodler.shiftDown){
				if(dobg){
					if(layer.hatchImg != null){
						ctx.drawImage(layer.hatchImg,0,0,layer.doodleCanvas.width, layer.doodleCanvas.height)
					}
				}else{
					if(layer.floorImg != null){
						ctx.drawImage(layer.floorImg,0,0,layer.doodleCanvas.width, layer.doodleCanvas.height)
					}
				}
			}
			ctx.globalCompositeOperation = "source-over";
			/*ctx.strokeStyle = "rgb(60,200,200)";
			var radius = self.size*2.1+self.hatchSize;
			ctx.beginPath();
			ctx.arc(xpos, ypos, radius*doodler.zoomLevel, 0, 2 * Math.PI);
			ctx.stroke();*/

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
            doodler.overlayCtx.clearRect(0,0,doodler.overlayCanvas.width, doodler.overlayCanvas.height);
			self.isDoodling = true;
			//doodler.updateUndoStack();
            self.doodleStartX = xpos;
            self.doodleStartY = ypos;
            self.doodleEndX = xpos;
            self.doodleEndY = ypos;
			//self.draw(xpos, ypos, data);
			self.drawOverlay(xpos, ypos, data);
		},
		mouseMove: function(xpos, ypos, data){
			if (self.isDoodling){
				self.doodleEndX = xpos;
				self.doodleEndY = ypos;
				//self.draw(xpos, ypos, data);
				self.drawOverlay(xpos, ypos, data);
				
				self.doodleStartX = xpos;
				self.doodleStartY = ypos;
			}
		},
		mouseUp: function(xpos, ypos, data){
            //self.draw(xpos, ypos, data);
			self.isDoodling = false;
            doodler.drawOverlayCommit(xpos, ypos, data);
			//doodler.updateUndoStack();
			doodler.updateCurrentImage(false, true);
            self.doodleStartX = 0;
            self.doodleStartY = 0;
            self.doodleEndX = 0;
            self.doodleEndY = 0;
		},
		setParameterBox: function(container){
			
			//<input type='number' style='width:60px' id='lineSizeLabel' value="${self.size}" onchange='Modes.Line.changeSize(event, true)' oninput='Modes.Line.changeSize(event, true)'>
			
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<div class='paramTitle'>In/Outset: </div><input type='number' style='width:60px' id='snapToGridInsetLabel' value="${self.inset}" onchange='Modes.SnapToGrid.changeInset(event, true)' oninput='Modes.SnapToGrid.changeInset(event, true)'><br>
						<input style='width:100px' type="range" id="snapToGridInset" name="snapToGridInset" min="${doodler.dimensions.footPixel * doodler.dimensions.stepSize * -1}" max="${doodler.dimensions.footPixel * doodler.dimensions.stepSize}" value='${self.inset}' onchange='Modes.SnapToGrid.changeInset(event)' oninput='Modes.SnapToGrid.changeInset(event)'><br>
                        
						<div class='paramTitle'>Scale: </div><input type='number' style='width:60px' id='snapToGridScaleLabel' value="${doodler.dimensions.stepScale}" onchange='Modes.SnapToGrid.changeScale(event, true)' oninput='Modes.SnapToGrid.changeScale(event, true)'><br>
						<input style='width:100px' type="range" id="snapToGridScale" name="snapToGridScale" min="0.125" max="2" step="0.125" value='${doodler.dimensions.stepScale}' onchange='Modes.SnapToGrid.changeScale(event)' oninput='Modes.SnapToGrid.changeScale(event)'><br>
						<input type='color' value='${self.fillColor}' id='snapToGridFillColor' onchange="Modes.SnapToGrid.changeColor(event, 'fill')">
						<label for="snapToGridFillColor">Fill Color</label><br>
						`;
            /*<div class='paramTitle'>Hatch: </div><input type='number' style='width:60px' id='snapToGridHatchSizeLabel' value="${self.hatchSize}" onchange='Modes.SnapToGrid.changeHatchSize(event, true)' oninput='Modes.SnapToGrid.changeHatchSize(event, true)'><br>
						<input style='width:100px' type="range" id="snapToGridHatchSize" name="snapToGridHatchSize" min="1" max="150" value='${self.hatchSize}' onchange='Modes.SnapToGrid.changeHatchSize(event)' oninput='Modes.SnapToGrid.changeHatchSize(event)'><br>
						<div class='paramTitle'>Wall Thickness: </div><input type='number' style='width:60px' id='snapToGridBorderSizeLabel' value="${self.borderSize}" onchange='Modes.SnapToGrid.changeBorderSize(event, true)' oninput='Modes.SnapToGrid.changeBorderSize(event, true)'><br>
						<input style='width:100px' type="range" id="snapToGridBorderSize" name="snapToGridBorderSize" min="0" max="25" value='${self.borderSize}' onchange='Modes.SnapToGrid.changeBorderSize(event)' oninput='Modes.SnapToGrid.changeBorderSize(event)'><br> */
			container.innerHTML = htm;
		},
	}; return self;
})()