"use strict";

var Hatching = (function(){
	var self={
		borderSize: 3,
		fillColor: "white",
		outlineColor: "black",
		imageStyle: "hatchingImg",
		floorStyle: "hatchingImgJPStone",
		hatchSize: 30,
		renderScale: 1,
		id:8,
		size: 20,
		shape: Shape.Square,
		title: "Hatch Settings",
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
		},
		changeImageStyle: function(evt){
			self.imageStyle = ir.v("hatchImageStyle");
			console.log("Image style is ", self.imageStyle);
			doodler.hatchGenerated = false;
			doodler.hatchStyleImage = self.imageStyle;
			var layer = doodler.layers[doodler.currentLayer];
			layer.hatchStyle = self.imageStyle;
			layer.hatchImg = null;
			layer.hatchGenerated = false;
		},
		changeFloorStyle: function(evt){
			self.floorStyle = ir.v("hatchFloorStyle");
			console.log("Floor style is ", self.floorStyle);
			//doodler.hatchGenerated = false;
			doodler.floorStyle = self.floorStyle;
			var layer = doodler.layers[doodler.currentLayer];
			layer.floorStyle = self.floorStyle;
			layer.floorImg = null;
			layer.floorGenerated = false;
		},
		changeHatchSize: function(evt, fromInput){
			self.hatchSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("hatchingHatchSizeLabel", self.hatchSize);
			}else{
				ir.set("hatchingHatchSize", self.hatchSize);
			}
		},
		changeScale: function(evt, fromInput){
			self.renderScale = parseFloat(evt.target.value);
			if(!fromInput){
				ir.set("hatchingScaleLabel", self.renderScale);
			}else{
				ir.set("hatchingScale", self.renderScale);
			}
		},
		changeScaleAndRender: function(evt){
			self.changeScale(evt);
			doodler.hatchGenerated = false;
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
			ctx.arc(xpos, ypos, radius*doodler.zoomLevel, 0, 2 * Math.PI);
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
			doodler.updateUndoStack();
            self.doodleStartX = 0;
            self.doodleStartY = 0;
            self.doodleEndX = 0;
            self.doodleEndY = 0;
		},
		setParameterBox: function(container){
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<div class='paramTitle'>Hatch Size: </div><input type='number' style='width:60px' id='hatchingHatchSizeLabel' value="${self.hatchSize}" onchange='Modes.Hatching.changeHatchSize(event, true)' oninput='Modes.Hatching.changeHatchSize(event, true)'><br>
						<input style='width:100px' type="range" id="hatchingHatchSize" name="hatchingHatchSize" min="1" max="200"  value='${self.hatchSize}' onchange='Modes.Hatching.changeHatchSize(event)' oninput='Modes.Hatching.changeHatchSize(event)'><br>
						<div class='paramTitle'>Scale: </div><input type='number' min='0.125' max='4' step='0.125' style='width:60px' id='hatchingScaleLabel' value="${self.renderScale}" onchange='Modes.Hatching.changeScaleAndRender(event, true)' oninput='Modes.Hatching.changeScale(event, true)'><br>
						<input style='width:100px' type="range" id="hatchingScale" name="hatchingScale" min="1" max="4" step='0.125' value='${self.renderScale}' oninput='Modes.Hatching.changeScale(event)' onchange='Modes.Hatching.changeScaleAndRender(event)'><br>
						`;
			
			htm += `<div class='paramTitle'>Hatch Style</div><br><select id='hatchImageStyle' onchange='Modes.Hatching.changeImageStyle(event)'>`;
			htm += "<option name='Hatching' value='hatchingImg'>Hatching</option>";
			htm += "<option name='JPCross' value='hatchingImgJPCrosshatch'>Dense Hatching</option>";
			htm += "<option name='JPHalftone' value='hatchingImgJPHalftone'>Drawn Halftone</option>";
			htm += "<option name='JPStipple' value='hatchingImgJPStipple'>Drawn Stipple</option>";
			htm += "<option name='JPStone' value='hatchingImgJPStone'>Drawn Stone</option>";
			htm += "<option name='JPGrass' value='hatchingImgJPGrass'>Drawn Grass</option>";
			htm += "<option name='Dots' value='hatchingImgDots'>Dots</option>";
			htm += "<option name='Grass' value='hatchingImgGrass'>Grass</option>";
			htm += "<option name='Rock' value='hatchingImgRock'>Rocks</option>";
			htm += "</select><br>";
			
			/*htm += `<div class='paramTitle'>Floor Style</div><br><select id='hatchFloorStyle' onchange='Modes.Hatching.changeFloorStyle(event)'>`;
			htm += `<option name='Stone' value='hatchingImgJPStone'>Drawn Stone</option>`;
			htm += `<option name='Stone' value='hatchingImgJPGrass'>Drawn Grass</option>`;
			htm += `<option name='Stone' value='hatchingImgGrass'>Grass</option>`;
			htm += `<option name='Stone' value='hatchingImgRock'>Rock</option>`;
			htm += "</select>";*/
			
			//<input type='color' value='${self.fillColor}' id='hatchingColor' onchange="Modes.Hatching.changeColor(event, 'fill')">
						//<label for="hatchingColor">Hatching Color</label><br>
			container.innerHTML = htm;
			
			ir.set("hatchImageStyle", self.imageStyle);
			
			
			
		},
	}; return self;
})()
