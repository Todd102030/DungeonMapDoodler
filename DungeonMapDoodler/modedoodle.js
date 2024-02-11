"use strict";

var Doodle = (function(){
	var self={
		borderSize: 3,
		fillColor: "#ffffff",
		outlineColor: "#000000",
		hatchSize: 50,
		id:8,
		size: 70,
		shape: Shape.Circle,
		title: "Pen Settings",
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
            doodler.drawLoop();
		},
		changeSize: function(evt, fromInput){
			self.size = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("doodleSizeLabel", self.size);
			}else{
				ir.set("doodleSize", self.size);
			}
            doodler.drawLoop();
		},
		changeBorderSize: function(evt, fromInput){
			self.borderSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("doodleBorderSizeLabel", self.borderSize);
			}else{
				ir.set("doodleBorderSize", self.borderSize);
			}
            doodler.drawLoop();
		},
		changeHatchSize: function(evt, fromInput){
			self.hatchSize = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("doodleHatchSizeLabel", self.hatchSize);
			}else{
				ir.set("doodleHatchSize", self.hatchSize);
			}
            doodler.drawLoop();
		},
		changeShape: function(evt){
			self.shape = Shape[evt.target.value];
            doodler.drawLoop();
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
				if(!doodler.drawRough){
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
				}
				else{
					var rcopts = { roughness: 1, bowing:0.5, disableMultiStroke:true, fill:self.fillColor, fillStyle:'solid', stroke:"none"};
					var rc = rough.canvas(ctx.canvas);
					rc.circle(xpos, ypos, size, rcopts);
					rc.circle(expos, eypos, size, rcopts);
				}

				//Outline Drawing
				ctx = data.outlineCtx;
				ctx.fillStyle = self.outlineColor;
				if(!doodler.drawRough){
					
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
				}
				else{
					var rcopts = { roughness: 1, bowing:0.5, disableMultiStroke:true, fill:self.outlineColor, fillStyle:'solid'};
					var rc = rough.canvas(ctx.canvas);
					rc.circle(xpos, ypos, size+border*2, rcopts);
					rc.circle(expos, eypos, size+border*2, rcopts);
				}
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
            doodler.updateFrameBuffer();
		},
        drawOverlay: function(xpos, ypos, data){
            var wh = doodler;
            var offX = wh.globalOffsetX;
            var offY = wh.globalOffsetY;
            var zoom = wh.zoomLevel;
			var size = self.size;
			var border=self.borderSize;
			var ctx = doodler.overlayCtx;
			var hatchSize = self.hatchSize;
			var expos = self.doodleEndX;
			var eypos = self.doodleEndY;
			
			
			if(self.shape == Shape.Circle){
				//Connecting lines
				//Path Drawing
				//ctx = data.doodleCtx;
				ctx.fillStyle = self.fillColor;
				ctx.strokeStyle = self.fillColor;
                var filter = doodler.filter;
                ctx.filter = filter;
				if(!doodler.drawRough){
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
                    
				}
				else{
					var rcopts = { roughness: 1, bowing:0.5, disableMultiStroke:true, fill:self.fillColor, fillStyle:'solid', stroke:"none"};
					var rc = rough.canvas(ctx.canvas);
					rc.circle(xpos, ypos, size, rcopts);
					rc.circle(expos, eypos, size, rcopts);
				}

				
			}else{
				//Path Drawing
				ctx = data.doodleCtx;
				ctx.fillStyle = self.fillColor;
                var filter = doodler.filter;
                ctx.filter = filter;
				ctx.fillRect(xpos-(self.size/2),ypos-(self.size/2), size,size);

			}	
            ctx.filter = "none";
			
        },
        
		drawCursor : function(ctx, xpos, ypos, data){
            var wh = doodler;
            var offX = wh.globalOffsetX;
            var offY = wh.globalOffsetY;
            var zoom = wh.zoomLevel;
            var size = self.size;
            var border=self.borderSize;
			var hatchSize = self.hatchSize;
			var expos = self.doodleEndX;
			var eypos = self.doodleEndY;
            var filter = doodler.filter;
            //ctx.filter = filter;
			ctx.strokeStyle = "rgb(240,60,60)";
            ctx.fillStyle = "white"; //self.fillColor;
            ctx.strokeStyle = "white";//self.fillColor;
            if(doodler.shiftDown){
                ctx.fillStyle = "rgb(237, 148, 148)"; //self.fillColor;
                ctx.strokeStyle = "rgb(237, 148, 148)";
            }
			if(!doodler.disableFilters){
            	var filter = doodler.filter;
            	ctx.filter = filter;
			}
			if(self.shape == Shape.Circle){
                ctx.beginPath();
                ctx.arc(xpos, ypos, size/2, 0, 2 * Math.PI);
                ctx.fill();
                
			}
			else{
				ctx.strokeRect(xpos-(self.size/2)*zoom,ypos-(self.size/2)*zoom,self.size*zoom,self.size*zoom)
			}
			ctx.filter = "none";
			//Draw current texture onto cursor
			var dobg = ir.bool("drawFGBG");
			var layer = doodler.layers[doodler.currentLayer];
			ctx.globalCompositeOperation = "source-atop";
			if(dobg){
				if(layer.hatchImg != null){
					ctx.drawImage(layer.hatchImg,0,0,layer.doodleCanvas.width, layer.doodleCanvas.height)
				}
			}else{
				if(layer.floorImg != null){
					ctx.drawImage(layer.floorImg,0,0,layer.doodleCanvas.width, layer.doodleCanvas.height)
				}
			}
			ctx.globalCompositeOperation = "source-over"
            
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
			console.log("Doodle mousedown");
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
				//self.draw(self.doodleStartX, self.doodleStartY, data);
                self.drawOverlay(self.doodleStartX, self.doodleStartY, data);
				self.doodleStartX = xpos;
				self.doodleStartY = ypos;
			}
		},
		mouseUp: function(xpos, ypos, data){
			self.isDoodling = false;
            doodler.drawOverlayCommit(xpos, ypos, data);
			doodler.updateCurrentImage(false, true);
            self.doodleStartX = 0;
            self.doodleStartY = 0;
            self.doodleEndX = 0;
            self.doodleEndY = 0;
            //doodler.updateFrameBuffer();
		},
		setParameterBox: function(container){
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<div class='paramTitle'>Size: </div><input type='number' style='width:60px' id='doodleSizeLabel' value="${self.size}" onchange='Modes.Doodle.changeSize(event, true)' oninput='Modes.Doodle.changeSize(event, true)'><br>
						<input style='width:100px' type="range" id="doodleSize" name="doodleSize" min="1" max="150" value='${self.size}' onchange='Modes.Doodle.changeSize(event)' oninput='Modes.Doodle.changeSize(event)'><br>
						
						
						<input type='color' value='${self.fillColor}' id='doodleFillColor' onchange="Modes.Doodle.changeColor(event, 'fill')">
						<label for="doodleFillColor">Fill Color</label><br>
						`;
            /*<div class='paramTitle'>Hatch: </div><input type='number' style='width:60px' id='doodleHatchSizeLabel' value="${self.hatchSize}" onchange='Modes.Doodle.changeHatchSize(event, true)' oninput='Modes.Doodle.changeHatchSize(event, true)'><br>
						<input style='width:100px' type="range" id="doodleHatchSize" name="doodleHatchSize" min="1" max="150" value='${self.hatchSize}' onchange='Modes.Doodle.changeHatchSize(event)' oninput='Modes.Doodle.changeHatchSize(event)'><br>
						<div class='paramTitle'>Wall Thickness: </div><input type='number' style='width:60px' id='doodleBorderSizeLabel' value="${self.borderSize}" onchange='Modes.Doodle.changeBorderSize(event, true)' oninput='Modes.Doodle.changeBorderSize(event, true)'><br>
                        <input style='width:100px' type="range" id="doodleBorderSize" name="doodleBorderSize" min="0" max="25" value='${self.borderSize}' onchange='Modes.Doodle.changeBorderSize(event)' oninput='Modes.Doodle.changeBorderSize(event)'><br>
						<input type="radio" id="doodleSquare" name="doodleShape" value="Square" onchange='Modes.Doodle.changeShape(event)'>
						<label for="doodleSquare">Square</label><br>
						<input type="radio" id="doodleCircle" name="doodleShape" value="Circle" onchange='Modes.Doodle.changeShape(event)'>
						<label for="doodleCircle">Circle</label><br>*/
			container.innerHTML = htm;
		},
	}; return self;
})()