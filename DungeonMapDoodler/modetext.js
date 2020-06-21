"use strict";

var TextTool = (function(){
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
		multiplyer:1,
		size: 30,
		stampRatio: 1,
		title: "Text Settings",
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
					console.log("Loaded img ratio is ", img.naturalWidth/img.naturalHeight);
					Stamps.push({src:img.src, ratio:(img.naturalWidth/img.naturalHeight)});
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
		changeFontPopup: function(evt, id){
			ir.get(id).style.fontFamily = evt.target.value;
		},
		changeSnapping: function(evt){
			self.isSnapping = ir.bool("textIsSnapping");
		},
		changeSize: function(evt){
			self.size = parseInt(evt.target.value);
			ir.set("stampSizeLabel", self.size);
		},
		changeSizeMult: function(evt){
			self.multiplyer = parseInt(evt.target.value);
			ir.set("stampSizeMultLabel", self.multiplyer);
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
			if(self.textHit != null && self.isMovingText){
				pgWarehouseMap.textFields.splice(self.textHit,1);
				self.textHit = null;
				self.isMovingText = null;
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
			/*if(self.isSnapping){
				var gridxy = getGridXY(xpos, ypos);
				
				if(self.stampRatio<1){
					gridxy.stepx = gridxy.step;
					gridxy.stepy = gridxy.step / self.stampRatio;
				}else{
					gridxy.stepx = gridxy.step * self.stampRatio;
					gridxy.stepy = gridxy.step;
				}
				
				//var ratioImg = new Image();
				//ratioImg.onload = function(){
					//ctx.drawImage(self.chosenStampImg, gridxy.xpos*zoom, gridxy.ypos*zoom, gridxy.step/zoom, gridxy.step/zoom);	
					stampobj = new StampObj(((gridxy.xgridmid)-offX)/zoom, ((gridxy.ygridmid)-offY)/zoom, gridxy.stepx/zoom*self.multiplyer, gridxy.stepy/zoom*self.multiplyer, newimg, self.chosenStamp.path||self.chosenStamp.src, self.angle);
					
					pgWarehouseMap.textFields.push(stampobj);
				//}
				//ratioImg.src = self.chosenStamp.path||self.chosenStamp.src;
				
				

			}
			else{
				
				if(self.stampRatio<1){
					self.stepx = self.size;
					self.stepy = self.size / self.stampRatio;
				}else{
					self.stepx = self.size * self.stampRatio;
					self.stepy = self.size;
				}
				//var ratioImg = new Image();
				//ratioImg.onload = function(){
					stampobj = new StampObj(((xpos-(self.stepx*zoom/2))-offX)/zoom, ((ypos-(self.stepy*zoom/2))-offY)/zoom, self.stepx*self.multiplyer, self.stepy*self.multiplyer, newimg, self.chosenStamp.path||self.chosenStamp.src, self.angle);
					
					pgWarehouseMap.textFields.push(stampobj);
				//}
				//ratioImg.src = self.chosenStamp.path||self.chosenStamp.src;
				
			}
			*/
		},
		drawCursor : function(ctx, xpos, ypos, data){
			if(self.chosenStampImg==null){
				self.chosenStampImg = new Image();
				self.chosenStampImg.src = self.chosenStamp;
				self.chosenStampImg.onload = function() {
					self.stampRatio = this.naturalWidth/this.naturalHeight;
				}
			}
            var zoom = pgWarehouseMap.zoomLevel;
			var offX = pgWarehouseMap.globalOffsetX;
			var offY = pgWarehouseMap.globalOffsetY;
			self.stampMoveHit = pgWarehouseMap.hitTestText({x:(xpos-offX)/zoom,y:(ypos-offY)/zoom,w:1,h:1});
			ctx.strokeStyle = "rgb(60,200,200)";
			ctx.beginPath();
			if(self.stampMoveHit == null && !self.isMovingText){
				if(self.isSnapping){
					var gridxy = getGridXY(xpos, ypos);
					if(self.stampRatio<1){
						gridxy.stepx = gridxy.step;
						gridxy.stepy = gridxy.step / self.stampRatio;
					}else{
						gridxy.stepx = gridxy.step * self.stampRatio;
						gridxy.stepy = gridxy.step;
					}
					//self.drawImageRotated(ctx, self.chosenStampImg, gridxy.xgridmid, gridxy.ygridmid, gridxy.stepx*self.multiplyer, gridxy.stepy*self.multiplyer, self.angle);				
				}
				else{
					if(self.stampRatio<1){
						self.stepx = self.size;
						self.stepy = self.size / self.stampRatio;
					}else{
						self.stepx = self.size * self.stampRatio;
						self.stepy = self.size;
					}
					//self.drawImageRotated(ctx, self.chosenStampImg,xpos-(self.stepx/2*zoom), ypos-(self.stepy/2*zoom), self.stepx*zoom*self.multiplyer, self.stepy*zoom*self.multiplyer, self.angle);
				}
				
			}
			else{
				//self.drawMoveHighlight(pgWarehouseMap.ctx,xpos, ypos,data);
			}
			ctx.stroke();
			
		},
		drawMoveHighlight : function(ctx, xpos, ypos, data){
			if(self.stampMoveHit == null){
				return;
			}
			var st = pgWarehouseMap.textFields[self.stampMoveHit];
            var zoom = pgWarehouseMap.zoomLevel;
			var wh = pgWarehouseMap
			var sX =wh.dimensions.scaleX;
			var sY =wh.dimensions.scaleY;
			ctx.strokeStyle = "rgb(60,200,200)";
			ctx.fillStyle = "rgba(60,200,200,0.3)";
			ctx.beginPath();
			
			//ctx.fillRect(wh.globalOffsetX + ((st.x) * wh.zoomLevel*(1/sX)),wh.globalOffsetY + ((st.y) * wh.zoomLevel*(1/sY)), st.w * wh.zoomLevel*(1/sX), st.h * wh.zoomLevel*(1/sY));	
			//ctx.strokeRect(wh.globalOffsetX + ((st.x) * wh.zoomLevel*(1/sX)),wh.globalOffsetY + ((st.y) * wh.zoomLevel*(1/sY)), st.w * wh.zoomLevel*(1/sX), st.h * wh.zoomLevel*(1/sY));	
			ctx.fillRect(wh.globalOffsetX +st.x * zoom, wh.globalOffsetY + st.y * zoom, 100 * wh.zoomLevel*(1/sX), 100 * wh.zoomLevel*(1/sY));	
			ctx.strokeRect(wh.globalOffsetX + ((st.x) * wh.zoomLevel*(1/sX)),wh.globalOffsetY + ((st.y) * wh.zoomLevel*(1/sY)), 100 * wh.zoomLevel*(1/sX), 100 * wh.zoomLevel*(1/sY));	
			
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
			var st = pgWarehouseMap.textFields[id];
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
			
			self.moveHappened = false;
            self.doodleStartX = xpos;
            self.doodleStartY = ypos;
            self.doodleEndX = xpos;
            self.doodleEndY = ypos;
			//self.draw(xpos, ypos, data);
			self.textHit = pgWarehouseMap.hitTestText({x:xpos,y:ypos,w:1,h:1});
			if(self.textHit != null){
				self.offsetX = parseFloat(xpos) - parseFloat(pgWarehouseMap.textFields[self.textHit].x); 
            	self.offsetY = parseFloat(ypos) - parseFloat(pgWarehouseMap.textFields[self.textHit].y); 
				self.isMovingText = true;
			}else{
				self.isPlacingText = true;
				
			}
			
		},
		mouseMove: function(xpos, ypos, data){
			self.moveHappened = true;
			if(self.isMovingText){
				self.moveStamp(self.textHit,xpos, ypos);
			}
			else if (self.isPlacingText){
				var wh = pgWarehouseMap;
				//self.draw(xpos*wh.zoomLevel+wh.globalOffsetX, ypos*wh.zoomLevel+wh.globalOffsetY, data);
				self.doodleEndX = xpos;
				self.doodleEndY = ypos;
				self.doodleStartX = xpos;
				self.doodleStartY = ypos;
			}
		},
		mouseUp: function(xpos, ypos, data){
			if(!self.moveHappened && self.textHit != null){
				pgWarehouseMap.popupTextEdit(self.textHit);
			}
			else if(self.isPlacingText){
				var offX = pgWarehouseMap.globalOffsetX;
				var offY = pgWarehouseMap.globalOffsetY;
				var zoom = pgWarehouseMap.zoomLevel;
				//self.draw(xpos, ypos, data);
				pgWarehouseMap.popupTextInput((xpos-offX)/zoom, (ypos-offX)/zoom);
			}
			self.isPlacingText = false;
			self.isMovingText = false;
			self.textHit = 0;
            self.doodleStartX = 0;
            self.doodleStartY = 0;
            self.doodleEndX = 0;
            self.doodleEndY = 0;
		},
		setParameterBox: function(container){
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<!--<div class='paramTitle'>Size: </div><label for='stampSize' id='stampSizeLabel'>${self.size}</label><br>
						<input style='width:100px' type="range" id="stampSize" name="stampSize" min="1" max="200" value='${self.size}' onchange='Modes.TextTool.changeSize(event)' oninput='Modes.TextTool.changeSize(event)'><br>
						<div class='paramTitle'>Multiplyer: </div><label for='stampSizeMult' id='stampSizeMultLabel'>${self.multiplyer}</label><br>
						<input style='width:100px' type="range" id="stampSizeMult" name="stampSizeMult" min="1" max="5" value='${self.multiplyer}' onchange='Modes.TextTool.changeSizeMult(event)' oninput='Modes.TextTool.changeSizeMult(event)'><br>
						<div class='paramTitle'>Rotate Degrees: </div><br>
						<input type="number" id="stampAngle" name="stampAngle" min="0" max="360" style='width:60px' value='${self.angle}' onchange='Modes.TextTool.changeAngle(event)' oninput='Modes.TextTool.changeAngle(event)'><br>-->
						<input type='checkbox' id='textIsSnapping' onclick='Modes.TextTool.changeSnapping(event)'><label for='textIsSnapping'>Snap To Grid</label><br>
						`;
			
			
			container.innerHTML = htm;
			
			ir.set("textIsSnapping", self.isSnapping);
		},
	}; return self;
	})()