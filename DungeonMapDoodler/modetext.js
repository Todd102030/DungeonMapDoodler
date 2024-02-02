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
		isSnapping: false,
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
		changeDoCurve: function(evt){
			var text = doodler.textFields[ir.vn("textEditId")];
			
			text.doCurve = ir.bool("textEditCurvedText");
			text.curveIntensity = ir.vn("textEditCurveIntensity");
			doodler.drawLoop();
		},
		changeCurveIntensity: function(evt){
			var text = doodler.textFields[ir.vn("textEditId")];
			
			text.doCurve = ir.bool("textEditCurvedText");
			text.curveIntensity = ir.vn("textEditCurveIntensity");
			doodler.drawLoop();
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
				doodler.textFields.splice(self.textHit,1);
				self.textHit = null;
				self.isMovingText = null;
			}
		},
		draw: function(xpos, ypos, data){
			var size = self.size;
            var zoom = doodler.zoomLevel;
            var offX = doodler.globalOffsetX;
            var offY = doodler.globalOffsetY;
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
					
					doodler.textFields.push(stampobj);
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
					
					doodler.textFields.push(stampobj);
				//}
				//ratioImg.src = self.chosenStamp.path||self.chosenStamp.src;
				
			}
			*/
		},
		updateCurrentText: function(evt){
			var field = self.textBeingEdited;
			field.text = ir.v("textEditVal")

			doodler.drawLoop();
		},
		getCurveTextRadius: function(intensity){
			return (11.001-Math.abs(intensity)) * 100 * doodler.zoomLevel;
		},
		drawTextAlongArc: function(context, textField, str, centerX, centerY, intensity) {
			//Use like: 
			//drawTextAlongArc(doodler.ctx, "Hello Curved World", 500, 500, 150, Math.PI*0.8, true) 
			//need values from user input - radius, angle, doinside, bool curvedText
			//better to have one slider value of curve upwards to curve downwards, maybe -10 to 10 scale
			//  if negative value, set doinside to true
			//  closer to flat means bigger radius with smaller angle, closer to -10/10 means smaller radius with bigger value

			//applyTextPopup and applyEditTextPopup need new value added to them

			var radius = self.getCurveTextRadius(intensity);
			var angle = Math.PI * 0.3 * Math.abs(intensity+0.01);
			var doInside = intensity < 0;
			context.fontKerning = "none";
			doodler.setFont(textField.f * doodler.zoomLevel, textField.font, context, "left");

			var len = str.length,
			  s;
			var totalSize = context.measureText(str).width;
			var lastCharWidth = 0;
			context.save();
			if(!doInside){
				
				centerY += radius;
				context.translate(centerX, centerY);
				context.rotate(-1 * totalSize/radius / 2);
				//context.rotate(-1 * (angle / len) / 2);
				for (var n = 0; n < len; n++) {
					//doodler.setFont(textField.f * doodler.zoomLevel*50, textField.font, context, textField.justify);
					var width = context.measureText(str[n]).width;
					//doodler.setFont(textField.f * doodler.zoomLevel, textField.font, context, textField.justify);
					context.rotate(lastCharWidth/radius);
					context.save();
					context.translate(0, -1 * radius);
					s = str[n];
					context.fillText(s, 0, 0);
					//context.strokeRect(0,-60,width, 60)
					context.restore();
					lastCharWidth = width;
				}
			}
			else{
				angle *= -1;
				centerY -= radius
				context.translate(centerX, centerY);
				context.rotate(totalSize/radius / 2);
				//context.rotate(-1 * (angle / len) / 2);
				for (var n = 0; n < len; n++) {
					var width = context.measureText(str[n]).width;
					context.rotate(-1*lastCharWidth/radius);
					context.save();
					context.translate(0, radius);
					s = str[n];
					context.fillText(s, 0, 0);
					context.restore();
					lastCharWidth = width;
				}
			}
			context.restore();
		},
		drawTextAlongArcOld: function(context, textField, str, centerX, centerY, intensity) {
			//Use like: 
			//drawTextAlongArc(doodler.ctx, "Hello Curved World", 500, 500, 150, Math.PI*0.8, true) 
			//need values from user input - radius, angle, doinside, bool curvedText
			//better to have one slider value of curve upwards to curve downwards, maybe -10 to 10 scale
			//  if negative value, set doinside to true
			//  closer to flat means bigger radius with smaller angle, closer to -10/10 means smaller radius with bigger value

			//applyTextPopup and applyEditTextPopup need new value added to them

			var radius = (11-Math.abs(intensity)) * 30;
			var angle = Math.PI * 0.3 * Math.abs(intensity+0.01);
			var doInside = intensity < 0;

			//I don't think the angle should change based on intensity but it definitely needs to change per individual character size

			var len = str.length,
			  s;
			var totalSize = context.measureText(str).width
			context.save();
			if(!doInside){
				
				centerY += radius
				context.translate(centerX, centerY);
				context.rotate(-1 * angle / 2);
				context.rotate(-1 * (angle / len) / 2);
				for (var n = 0; n < len; n++) {
					context.rotate(angle / len);
					context.save();
					context.translate(0, -1 * radius);
					s = str[n];
					context.fillText(s, 0, 0);
					context.restore();
				}
			}
			else{
				angle *= -1;
				centerY -= radius
				context.translate(centerX, centerY);
				context.rotate(-1 * angle / 2);
				context.rotate(-1 * (angle / len) / 2);
				for (var n = 0; n < len; n++) {
					var width = context.measureText(str[n]).width;
					context.rotate(angle/len);
					context.save();
					context.translate(0, radius);
					s = str[n];
					console.log(s, width);
					context.fillText(s, 0, 0);
					context.restore();
				}
			}
			context.restore();
		},
		drawCursor : function(ctx, xpos, ypos, data){
			if(self.chosenStampImg==null){
				self.chosenStampImg = new Image();
				self.chosenStampImg.src = self.chosenStamp;
				self.chosenStampImg.onload = function() {
					self.stampRatio = this.naturalWidth/this.naturalHeight;
				}
			}
            var zoom = doodler.zoomLevel;
			var offX = doodler.globalOffsetX;
			var offY = doodler.globalOffsetY;
			self.textMoveHit = doodler.hitTestText({x:xpos,y:ypos,w:1,h:1});
			ctx.strokeStyle = "rgb(60,200,200)";
			ctx.beginPath();
			if(self.textBeingEdited != null){
				doodler.canvas.style.cursor='default';
				self.drawMoveHighlight(doodler.ctx,xpos, ypos,data, self.textBeingEdited, true);
			}
			else if(self.textMoveHit == null && !self.isMovingText){
                ctx.fillStyle = "#000";
                doodler.canvas.style.cursor = 'text';
                //var msg = "Click to place text";
                //var size = ctx.measureText(msg);
                //doodler.setFont(16, "Arial", ctx, "center");
                //ctx.fillText(msg, xpos, ypos);
				if(self.isSnapping){
					var gridxy = getGridXY2(xpos, ypos);
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
			else if(self.textMoveHit != null){
				doodler.canvas.style.cursor='default';
				self.drawMoveHighlight(doodler.ctx,xpos, ypos,data, doodler.textFields[self.textMoveHit]);
			}
            
            if(self.stampSelected != null){
				doodler.canvas.style.cursor='default';
                self.drawMoveHighlight(doodler.ctx,xpos, ypos,data, doodler.textFields[self.stampSelected]);
                self.drawResizeMarkers(doodler.ctx,xpos, ypos,data, doodler.textFields[self.stampSelected]);
                

            }
			ctx.stroke();
			
		},
		drawMoveHighlight : function(ctx, xpos, ypos, data, text, isEditHighlight){
            if(text == null){
                return;
            }
			if((self.textMoveHit == null && isEditHighlight==null ) || (isEditHighlight && self.textBeingEdited==null)){
				return;
			}
			
           
          
            var txt = text.text;
            var txtSize = ctx.measureText(txt);
            txtSize.height = txt.split(/\r?\n/g).length * text.f;
            doodler.setFont(text.f * self.zoomLevel, text.font, ctx, text.justify);
            
            var zoom = doodler.zoomLevel;
			var wh = doodler;
            
            var rect = doodler.getTextBounds(text);
			
			ctx.strokeStyle = "rgb(60,200,200)";
			ctx.fillStyle = "rgba(60,200,200,0.3)";
			if(isEditHighlight){
				ctx.strokeStyle = "rgb(200,60,60)";
				ctx.fillStyle = "rgba(200,60,60,0.1)";
			}
			ctx.beginPath();
            
			
			//ctx.fillRect(wh.globalOffsetX + ((st.x) * wh.zoomLevel*(1/sX)),wh.globalOffsetY + ((st.y) * wh.zoomLevel*(1/sY)), st.w * wh.zoomLevel*(1/sX), st.h * wh.zoomLevel*(1/sY));	
			//ctx.strokeRect(wh.globalOffsetX + ((st.x) * wh.zoomLevel*(1/sX)),wh.globalOffsetY + ((st.y) * wh.zoomLevel*(1/sY)), st.w * wh.zoomLevel*(1/sX), st.h * wh.zoomLevel*(1/sY));	
			ctx.fillRect(wh.globalOffsetX +rect.x * zoom, wh.globalOffsetY + rect.y * zoom, rect.w * wh.zoomLevel+4, rect.h * wh.zoomLevel+4);	
			ctx.strokeRect(wh.globalOffsetX +rect.x * zoom, wh.globalOffsetY + rect.y * zoom, rect.w * wh.zoomLevel+4, rect.h * wh.zoomLevel+4);	
			
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
			var st = doodler.textFields[id];
			if(st==null){
				return;
			}
			var size = self.size;
			var zoom = doodler.zoomLevel;
            var offX = doodler.globalOffsetX;
            var offY = doodler.globalOffsetY;
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
			self.textHit = doodler.hitTestText({x:xpos,y:ypos,w:1,h:1});
			if(self.textHit != null){
				self.offsetX = parseFloat(xpos) - parseFloat(doodler.textFields[self.textHit].x); 
            	self.offsetY = parseFloat(ypos) - parseFloat(doodler.textFields[self.textHit].y); 
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
				var wh = doodler;
				//self.draw(xpos*wh.zoomLevel+wh.globalOffsetX, ypos*wh.zoomLevel+wh.globalOffsetY, data);
				self.doodleEndX = xpos;
				self.doodleEndY = ypos;
				self.doodleStartX = xpos;
				self.doodleStartY = ypos;
			}
		},
		mouseUp: function(xpos, ypos, data){
			if(!self.moveHappened && self.textHit != null){
				doodler.popupTextEdit(self.textHit);
			}
			else if(self.isPlacingText){
				var offX = doodler.globalOffsetX;
				var offY = doodler.globalOffsetY;
				var zoom = doodler.zoomLevel;
				//self.draw(xpos, ypos, data);
				doodler.popupTextInput(xpos, ypos);
				//doodler.popupTextInput(xpos, ypos);
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