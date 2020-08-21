"use strict";

var StampTool = (function(){
	var self={
		angle: 0,
		borderSize: 3,
		fillColor: "white",
		outlineColor: "black",
		hatchSize: 30,
		chosenStamp: {
            path:'stamps/decor/bed.svg',
            name: "Bed",
            alias: "",
            group: StampGroup.Decor,
            defMult: 1,
        },
		chosenStampImg: null,
		id:8,
		isSnapping: true,
		multiplyer:1,
		size: 50,
		stampRatio: 1,
		title: "Stamp Settings",
		addStamp: function(fromPopup){
			ir.get("stampUpload").click();
            if(fromPopup){
                ir.hide("stampPopup");
            }
		},
		readAddStamp: function(){
			if ( this.files && this.files[0] ) {
            var FR= new FileReader();
            FR.onload = function(e) {
                var img = new Image();
                //Load the image in from the user, scale it to best fit the canvas, reset the offsets
                img.onload = function() {
					Stamps.push({src:img.src, ratio:(img.naturalWidth/img.naturalHeight), name:"Custom", group:StampGroup.Custom, defMult: 1,alias:""});
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
            
            ir.enable("stampSize",!self.isSnapping);
            ir.enable("stampSizeLabel", !self.isSnapping);
            
		},
		changeSize: function(evt, fromInput){
			self.size = parseInt(evt.target.value);
			if(!fromInput){
				ir.set("stampSizeLabel", self.size);
			}else{
				ir.set("stampSize", self.size);
			}
            if(self.stampSelected != null){
                var st = doodler.stamps[self.stampSelected];
                var gridxy = getGridXY(0, 0);//just using for grid size
                if(self.isSnapping){
                    if(st.ratio<1){
                        gridxy.stepx = gridxy.step;
                        gridxy.stepy = gridxy.step / st.ratio;
                    }else{
                        gridxy.stepx = gridxy.step * st.ratio;
                        gridxy.stepy = gridxy.step;
                    }
                    
                }else{
                    if(st.ratio<1){
                        gridxy.stepx = self.size;
                        gridxy.stepy = self.size / st.ratio;
                    }else{
                        gridxy.stepx = self.size * st.ratio;
                        gridxy.stepy = self.size;
                    }
                }
                st.w = gridxy.stepx*self.multiplyer;
                st.h = gridxy.stepy*self.multiplyer;
            }
		},
		changeSizeMult: function(evt, fromInput){
			self.multiplyer = parseFloat(evt.target.value);
			if(!fromInput){
				ir.set("stampSizeMultLabel", self.multiplyer);
			}else{
				ir.set("stampSizeMult", self.multiplyer);
			}
            if(self.stampSelected != null){
                var st = doodler.stamps[self.stampSelected];
                var gridxy = getGridXY(0, 0);//just using for grid size
                if(self.isSnapping){
                    if(st.ratio<1){
                        gridxy.stepx = gridxy.step;
                        gridxy.stepy = gridxy.step / st.ratio;
                    }else{
                        gridxy.stepx = gridxy.step * st.ratio;
                        gridxy.stepy = gridxy.step;
                    }
                    
                }else{
                    if(st.ratio<1){
                        gridxy.stepx = self.size;
                        gridxy.stepy = self.size / st.ratio;
                    }else{
                        gridxy.stepx = self.size * st.ratio;
                        gridxy.stepy = self.size;
                    }
                }
                st.w = gridxy.stepx*self.multiplyer;
                st.h = gridxy.stepy*self.multiplyer;
            }
		},
		changeStamp: function(stamp, hidePopup){
            if(hidePopup){  
                self.chosenStamp = self.sortedStamps[stamp];	
            }else{
                self.chosenStamp = Stamps[stamp];
            }
			if(self.chosenStampImg==null){
				self.chosenStampImg = new Image();
			}
			self.chosenStampImg.src = self.chosenStamp.path || self.chosenStamp.src;
			self.multiplyer = self.chosenStamp.defMult;
			ir.set("stampSizeMultLabel", self.chosenStamp.defMult);
			ir.set("stampSizeMult", self.chosenStamp.defMult);
            ir.get("stampsCurrentStamp").src = self.chosenStampImg.src;
            ir.get("stampsCurrentStampBtn").title = self.chosenStamp.name;
            if(hidePopup){
                ir.hide("stampPopup");
            }
            doodler.popupShowing = false;
            self.stampSelected = null;
		},
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
		},
		deleteFn: function(fromBtn){
            if(!fromBtn){
                if(self.stampHit != null && self.isMovingStamp){
                    doodler.stamps.splice(self.stampHit,1);
                    self.stampHit = null;
                    self.isMovingStamp = null;
                }
            }else{
                if(self.stampSelected != null){
                    doodler.stamps.splice(self.stampSelected,1);
                    self.stampHit = null;
                    self.isMovingStamp = null;
                    self.stampSelected = null;
                }
            }
		},
		draw: function(xpos, ypos, data){
			var size = self.size;
            var zoom = doodler.zoomLevel;
            var offX = doodler.globalOffsetX;
            var offY = doodler.globalOffsetY;
            xpos = xpos*zoom+offX;
            ypos = ypos*zoom+offY;
			var border=self.borderSize;
			var ctx = data.hatchCtx;
			var newimg = new Image();
			newimg.src = self.chosenStampImg.src;
			var stampobj = null;
			if((self.isSnapping && !doodler.shiftDown) || (!self.isSnapping && doodler.shiftDown)){
				var gridxy = getGridXY(xpos, ypos);
				
				if(self.stampRatio<1){
					gridxy.stepx = gridxy.step;
					gridxy.stepy = gridxy.step / self.stampRatio;
				}else{
					gridxy.stepx = gridxy.step * self.stampRatio;
					gridxy.stepy = gridxy.step;
				}
				stampobj = new StampObj(((gridxy.xgridmid)-offX)/zoom, ((gridxy.ygridmid)-offY)/zoom, gridxy.stepx/zoom*self.multiplyer, gridxy.stepy/zoom*self.multiplyer, newimg, self.chosenStamp.path||self.chosenStamp.src, self.angle, doodler.currentLayer);
				doodler.stamps.push(stampobj);
                doodler.updateFrameBuffer();
			}
			else{
				
				if(self.stampRatio<1){
					self.stepx = self.size;
					self.stepy = self.size / self.stampRatio;
				}else{
					self.stepx = self.size * self.stampRatio;
					self.stepy = self.size;
				}
				stampobj = new StampObj(((xpos-(self.stepx*zoom/2))-offX)/zoom, ((ypos-(self.stepy*zoom/2))-offY)/zoom, self.stepx*self.multiplyer, self.stepy*self.multiplyer, newimg, self.chosenStamp.path||self.chosenStamp.src, self.angle, doodler.currentLayer);
				doodler.stamps.push(stampobj);
                doodler.updateFrameBuffer();
				
			}
            
		},
		drawCursor : function(ctx, xpos, ypos, data){
			if(self.chosenStampImg==null){
				self.chosenStampImg = new Image();
				self.chosenStampImg.src = self.chosenStamp.path||self.chosenStamp.src;
				self.chosenStampImg.onload = function() {
					self.stampRatio = this.naturalWidth/this.naturalHeight;
				}
			}
            var zoom = doodler.zoomLevel;
			var offX = doodler.globalOffsetX;
			var offY = doodler.globalOffsetY;
            
			self.stampMoveHit = doodler.hitTestStamps({x:(xpos-offX)/zoom,y:(ypos-offY)/zoom,w:1,h:1});
			ctx.strokeStyle = "rgb(60,200,200)";
			ctx.beginPath();
			if(self.stampMoveHit == null && !self.isMovingStamp && self.stampSelected==null && !self.stampRotater && !self.rotatingStamp){
				if((self.isSnapping && !doodler.shiftDown) || (!self.isSnapping && doodler.shiftDown)){
					var gridxy = getGridXY(xpos, ypos);
					if(self.stampRatio<1){
						gridxy.stepx = gridxy.step;
						gridxy.stepy = gridxy.step / self.stampRatio;
					}else{
						gridxy.stepx = gridxy.step * self.stampRatio;
						gridxy.stepy = gridxy.step;
					}
					self.drawImageRotated(ctx, self.chosenStampImg, gridxy.xgridmid, gridxy.ygridmid, gridxy.stepx*self.multiplyer, gridxy.stepy*self.multiplyer, self.angle, true);				
				}
				else{
					if(self.stampRatio<1){
						self.stepx = self.size;
						self.stepy = self.size / self.stampRatio;
					}else{
						self.stepx = self.size * self.stampRatio;
						self.stepy = self.size;
					}
					self.drawImageRotated(ctx, self.chosenStampImg,xpos-(self.stepx/2*zoom), ypos-(self.stepy/2*zoom), self.stepx*zoom*self.multiplyer, self.stepy*zoom*self.multiplyer, self.angle, true);
				}
				
			}
			else if(self.stampMoveHit != null){
				self.drawMoveHighlight(doodler.ctx,xpos, ypos,data, doodler.stamps[self.stampMoveHit]);
			}
            
            if(self.stampSelected != null){
                self.drawMoveHighlight(doodler.ctx,xpos, ypos,data, doodler.stamps[self.stampSelected]);
                self.drawResizeMarkers(doodler.ctx,xpos, ypos,data, doodler.stamps[self.stampSelected]);
                

            }
			ctx.stroke();
		},
		drawMoveHighlight : function(ctx, xpos, ypos, data, st){
			
            if(st == null){
                return;
            }
            var zoom = doodler.zoomLevel;
			var wh = doodler;
			var sX =wh.dimensions.scaleX;
			var sY =wh.dimensions.scaleY;
			ctx.strokeStyle = "rgb(60,200,200)";
			ctx.fillStyle = "rgba(60,200,200,0.3)";
			ctx.beginPath();
            var width = st.w * wh.zoomLevel*(1/sX);
            var height = st.h * wh.zoomLevel*(1/sY);
			
            //(ctx,st.img, self.globalOffsetX + (st.x * self.zoomLevel*(1/sX)),self.globalOffsetY + (st.y * self.zoomLevel*(1/sY)), st.w * self.zoomLevel*(1/sX), st.h * self.zoomLevel*(1/sY), st.angle)
            
            var x = wh.globalOffsetX +(st.x * zoom);
            var y = wh.globalOffsetY + (st.y * zoom)
            
            //rotation
            var angleInRadians = parseFloat(st.angle) / 180 * Math.PI;
            //var x = xpos;
            //var y = ypos;
			ctx.translate(x+width/2, y+height/2);
			ctx.rotate(angleInRadians);
            
			ctx.fillRect(-width / 2, -height / 2, width, height);	
			ctx.strokeRect(-width / 2, -height / 2, width, height);	
            
            
			
            //unrotate
            ctx.rotate(-angleInRadians);
			ctx.translate(-x-width/2, -y-height/2);
            
			ctx.stroke();
		},
		drawImageRotated: function(ctx, image, x, y, width, height, angleDeg, transparent){
            if(transparent){
                ctx.globalAlpha = 0.5;
            }
			var angleInRadians = angleDeg / 180 * Math.PI;
			ctx.translate(x+width/2, y+height/2);
			ctx.rotate(angleInRadians);
			ctx.drawImage(image, -width / 2, -height / 2, width, height);
			ctx.rotate(-angleInRadians);
			ctx.translate(-x-width/2, -y-height/2);
            if(transparent){
                ctx.globalAlpha = 1;
            }
		},
        drawResizeMarkers: function(ctx, xpos, ypos, data, st){
            if(st == null){
                return;
            }
            var zoom = doodler.zoomLevel;
            var offX = doodler.globalOffsetX;
            var offY = doodler.globalOffsetY;
			var wh = doodler;
			var sX =wh.dimensions.scaleX;
			var sY =wh.dimensions.scaleY;
			
			
            var width = st.w * wh.zoomLevel*(1/sX);
            var height = st.h * wh.zoomLevel*(1/sY);
            
            var x = wh.globalOffsetX +(st.x * zoom);
            var y = wh.globalOffsetY + (st.y * zoom);
            
            //rotation
            var angleInRadians = parseFloat(st.angle) / 180 * Math.PI;
            var mrect = {x:(xpos-x-width/2),y:(ypos-height/2-y),w:1,h:1};
    
			ctx.translate(x+width/2, y+height/2);
            
            //Draw text before rotating
            if(self.rotatingStamp || self.hitStampRotater || self.hitTestStampRotater(mrect, st)){  
                //Draw degrees text here
                ctx.fillStyle = "white";
                ctx.strokeStyle = "black";
                ctx.textAlign = "center";
                ctx.lineWidth = 1;
                ctx.font = "bold 28px Arial"
                ctx.fillText(parseInt(st.angle) + "\u00B0", 0, 0);
                ctx.strokeText(parseInt(st.angle) + "\u00B0", 0, 0);
            }
            ctx.strokeStyle = "rgb(209, 50, 117)";
			ctx.fillStyle = "rgba(209, 50, 117,0.3)";
            
			ctx.rotate(angleInRadians);
            
			//Corner markers
            /*
            ctx.beginPath();
            ctx.arc(-width / 2, -height / 2, 6, 0, 2 * Math.PI); //TOP LEFT
            ctx.fill();
            ctx.stroke(); 
            ctx.beginPath();
            ctx.arc(-width / 2 + width, -height / 2, 6, 0, 2 * Math.PI); //TOP RIGHT
            ctx.fill();
            ctx.stroke(); 
            ctx.beginPath();
            ctx.arc(-width / 2, -height / 2 + height, 6, 0, 2 * Math.PI); //BOT LEFT
            ctx.fill();
            ctx.stroke(); 
            ctx.beginPath();
            ctx.arc(-width / 2 + width, -height / 2 + height, 6, 0, 2 * Math.PI); //BOT RIGHT
            ctx.fill();
            ctx.stroke(); 
            */
            
            //hittest rotater
            var circleSize = 6;
                 
   
            if(self.rotatingStamp || self.hitStampRotater || self.hitTestStampRotater(mrect, st)){  
                
                ctx.fillStyle = "rgb(209, 50, 117)";
                circleSize = 12;    
            }
      
            ctx.beginPath();
            ctx.moveTo(-width / 2 + width, 0);
            ctx.lineTo(-width / 2 + width+30, 0);
            ctx.stroke(); 
            
            
            //Rotater stick
            ctx.beginPath();
            ctx.arc(-width / 2 + width+30, 0, circleSize, 0, 2 * Math.PI); 
            ctx.fill();
            ctx.stroke(); 
            
            //unrotate
            ctx.rotate(-angleInRadians);
			ctx.translate(-x-width/2, -y-height/2);
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
        hitTestStampRotater: function(mrect,st){
            var zoom = doodler.zoomLevel;
            var width = st.w * doodler.zoomLevel;
            var height = st.h * doodler.zoomLevel;
            
            var x = doodler.globalOffsetX +(st.x * zoom);
            var y = doodler.globalOffsetY + (st.y * zoom);
            //var mrect = {x:(xpos-x-width/2),y:(ypos-height/2-y),w:1,h:1};
            
            //factor in existing angle of stamp
            var length = width/2+30;
            var angleInRadians = parseFloat(st.angle) / 180 * Math.PI + Math.PI/2;
            var rotX = Math.sin(angleInRadians)*length;
            var rotY = Math.cos(angleInRadians)*-length;
            var rotW = Math.sin(angleInRadians-Math.PI/2)*width;
            var rotH = Math.sin(angleInRadians-Math.PI/2)*-height;
   
            
            //if(doodler.hitTest(mrect,{x:width+30-5, y:-5, w:10, h:10})){
            if(doodler.hitTest(mrect,{x:rotX-20, y:rotY-20, w:40, h:40})){
                self.stampRotater = st;
                return true;
            }else{
                self.stampRotater = null;
            }
            
            return null;
        },
        hitTestStampCorners: function(mrect){
            var a = doodler.stamps;
            for(var i=0,z=a.length;i<z;i++){
                var b = a[i]
                //if(self.hitTest(mrect,{x:b.x-b.w/2, y:b.y-b.h/2, w:b.w, h:b.h})){
                if(doodler.hitTest(mrect,b)){
                    return i;
                }
            }
            return null;
        },
		moveStamp: function(id, xpos, ypos){
			var st = doodler.stamps[id];
			if(st==null){
				return;
			}
			var size = self.size;
			var zoom = doodler.zoomLevel;
            var offX = doodler.globalOffsetX;
            var offY = doodler.globalOffsetY;
			var border=self.borderSize;
			if((self.isSnapping && !doodler.shiftDown) || (!self.isSnapping && doodler.shiftDown)){
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
            doodler.updateFrameBuffer();
		},
		mouseDown: function(xpos, ypos, data){
			
            self.doodleStartX = xpos;
            self.doodleStartY = ypos;
            self.doodleEndX = xpos;
            self.doodleEndY = ypos;
			//self.draw(xpos, ypos, data);
            
			
            if(self.stampSelected != null){
                //Hit test stamp rotater here
                var st = doodler.stamps[self.stampSelected];
                var zoom = doodler.zoomLevel;
                var width = st.w * zoom;
                var height = st.h * zoom;
                var xp = xpos * zoom + doodler.globalOffsetX;
                var yp = ypos * zoom + doodler.globalOffsetY;
                var offX = doodler.globalOffsetX;
                var offY = doodler.globalOffsetY;
                var x = doodler.globalOffsetX + (st.x * zoom);
                var y = doodler.globalOffsetY + (st.y * zoom);
                //rotation
                var angleInRadians = parseFloat(st.angle) / 180 * Math.PI;
                var ctx = doodler.ctx;
                ctx.translate(x+width/2, y+height/2);
                ctx.rotate(angleInRadians);
                var mrect = {x:(xp-x-width/2),y:(yp-height/2-y),w:1,h:1};
                self.hitStampRotater = self.hitTestStampRotater(mrect, st);
                ctx.rotate(-angleInRadians);
                ctx.translate(-x-width/2, -y-height/2);
                ctx.stroke();
            }
            //Only hittest a new hit stamp if we didn't click the rotater
            if(!self.hitStampRotater){
                self.stampHit = doodler.hitTestStamps({x:xpos,y:ypos,w:1,h:1});
            }
			if(self.stampHit != null && !self.hitStampRotater){
				self.offsetX = parseFloat(xpos) - parseFloat(doodler.stamps[self.stampHit].x); 
            	self.offsetY = parseFloat(ypos) - parseFloat(doodler.stamps[self.stampHit].y); 
				self.isMovingStamp = true;
			}else if(self.stampSelected == null){
				self.placingStamp = true;
			}
            if(!self.stampRotater){
                self.stampSelected = null;
            }else{
                self.rotatingStamp = true;
            }
			
		},
		mouseMove: function(xpos, ypos, data){
            self.moved = true;
			if(self.isMovingStamp){
				self.moveStamp(self.stampHit,xpos, ypos);
			}
            else if(self.rotatingStamp){
                self.rotateStamp(self.stampSelected, xpos, ypos);
            }
			else if (self.placingStamp){
				var wh = doodler;
				//self.draw(xpos*wh.zoomLevel+wh.globalOffsetX, ypos*wh.zoomLevel+wh.globalOffsetY, data);
				self.doodleEndX = xpos;
				self.doodleEndY = ypos;
				self.doodleStartX = xpos;
				self.doodleStartY = ypos;
			}
		},
		mouseUp: function(xpos, ypos, data){
            if(self.placingStamp && !self.rotatingStamp){
				self.draw(xpos, ypos, data);
			}
            if(self.stampHit != null){
                self.stampSelected = self.stampHit;
            }
            doodler.reloadLayerPreview(doodler.currentLayer);
			self.placingStamp = false;
			self.isMovingStamp = false;
            self.doodleStartX = 0;
            self.doodleStartY = 0;
            self.doodleEndX = 0;
            self.doodleEndY = 0;
            self.rotatingStamp = false;
            self.hitStampRotater = false;
            self.moved = false;
		},
        rotateStamp: function(id, xpos, ypos){
            var st = doodler.stamps[id];
            if(st == null){
                return;
            }
            var ctx = doodler.ctx;
            var zoom = doodler.zoomLevel;
            var offX = doodler.globalOffsetX;
            var offY = doodler.globalOffsetY;
			var wh = doodler;
			var sX =wh.dimensions.scaleX;
			var sY =wh.dimensions.scaleY;
			ctx.strokeStyle = "rgb(209, 50, 117)";
			ctx.fillStyle = "rgba(209, 50, 117,0.3)";
			ctx.beginPath();
            var width = st.w * zoom;
            var height = st.h * zoom;
            
            var x = wh.globalOffsetX +(st.x * zoom);
            var y = wh.globalOffsetY + (st.y * zoom);
            var x2 = wh.globalOffsetX +(st.x);
            var y2 = wh.globalOffsetY + (st.y);
            
            //rotation
            var angleInRadians = parseFloat(st.angle) / 180 * Math.PI;
            //var x = xpos;
            //var y = ypos;
			ctx.translate(x+width/2, y+height/2);
			ctx.rotate(angleInRadians);
            var mrect = {x:(xpos-x2-(width/2/zoom)+offX),y:(ypos-(height/2/zoom)-y2+offY),w:1,h:1};
            
            st.angle = self.getAngle(0,0,mrect.x, mrect.y);
            
            
            //unrotate
            ctx.rotate(-angleInRadians);
			ctx.translate(-x-width/2, -y-height/2);
			ctx.stroke();
            doodler.updateFrameBuffer();
        },
        getAngle: function(cx, cy, ex, ey) {
            var dy = ey - cy;
            var dx = ex - cx;
            var theta = Math.atan2(dy, dx); // range (-PI, PI]
            theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
            if (theta < 0) theta = 360 + theta; // range [0, 360)
            if((self.isSnapping && !doodler.shiftDown) || (!self.isSnapping && doodler.shiftDown)){
                theta = parseInt(Math.round(parseFloat(theta / 45)))*45;
            }
            
            return theta;
        },
        searchStamp: function(event){
            self.searchText = event.target.value.toLowerCase();
            self.showStampPopup();
        },
		setParameterBox: function(container){
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<div class='paramTitle'>Size: </div><input type='number' style='width:60px' id='stampSizeLabel' value="${self.size}" onchange='Modes.StampTool.changeSize(event, true)' oninput='Modes.StampTool.changeSize(event, true)'><br>
						<input style='width:100px' type="range" id="stampSize" name="stampSize" min="1" max="200" value='${self.size}' onchange='Modes.StampTool.changeSize(event)' oninput='Modes.StampTool.changeSize(event)'><br>
						<div class='paramTitle'>Multiplier: </div><input type='number' style='width:60px' step='0.5' id='stampSizeMultLabel' value="${self.multiplyer}" onchange='Modes.StampTool.changeSizeMult(event, true)' oninput='Modes.StampTool.changeSizeMult(event, true)'><br>
						<input style='width:100px' type="range" id="stampSizeMult" name="stampSizeMult" step='0.5' min="0.5" max="5" value='${self.multiplyer}' onchange='Modes.StampTool.changeSizeMult(event)' oninput='Modes.StampTool.changeSizeMult(event)'><br>
						<div class='paramTitle'>Rotate Degrees: </div><br>
						<input type="number" id="stampAngle" name="stampAngle" min="0" max="360" style='width:60px' value='${self.angle}' onchange='Modes.StampTool.changeAngle(event)' oninput='Modes.StampTool.changeAngle(event)'><br>
						<input type='checkbox' id='stampsIsSnapping' onclick='Modes.StampTool.changeSnapping(event)'><label for='stampsIsSnapping'>Snap To Grid</label><br>
                        <div class='paramTitle' title='Click to choose stamp'>Current Stamp: </div><br>
                        <div class='stampBtn' id='stampsCurrentStampBtn' title='${self.chosenStamp.name}' onclick='Modes.StampTool.showStampPopup()'><img id='stampsCurrentStamp' src='${self.chosenStamp.path || self.chosenStamp.src}' ></div><div class='stampBtn' id='stampsDeleteBtn' title='Delete selected stamp' onclick='Modes.StampTool.deleteFn(true)'><img id='stampsDeleteStamp' src='images/delete.png' ></div>
						`;
			
			htm += `<div style='max-width:150px;'>`
			
			var sortedStamps = Stamps.sort(function(a,b){
				return a.group - b.group;
			});
            self.sortedStamps = sortedStamps;
			//console.log("Sorted stamps is ", sortedStamps);
			
			sortedStamps.forEach(function(stamp, i){
				if(i==0 || sortedStamps[i-1].group != stamp.group){
					htm += `<details ${i==0?"open":""}><summary>${StampGroupName[stamp.group]}</summary>`;
				}
				
				htm += `<div class='stampBtn' title='${stamp.name}' onclick='Modes.StampTool.changeStamp(${i})'><img src='${stamp.path || stamp.src}' ></div>`;
				if(sortedStamps[i+1]==null || ( sortedStamps[i+1] && sortedStamps[i+1].group != stamp.group)){
					htm += `</details>`;
				}
			});
			htm += `</div>`;
			
			htm += `<a href='#' class='' onclick='Modes.StampTool.addStamp()'>Add</a> `
			
			htm +=`	
						`;
			container.innerHTML = htm;
			
			ir.set("stampsIsSnapping", self.isSnapping);
            ir.enable("stampSize",!self.isSnapping);
            ir.enable("stampSizeLabel", !self.isSnapping);
		},
        showStampPopup: function(){
            doodler.popupShowing = true;
            var container = ir.get("stampPopupList");
            var htm = "";
            var searchText = self.searchText || "";
			
            var filteredStamps = Stamps.filter(function(a){
                return searchText=="" || a.name.toLowerCase().indexOf(searchText)>-1 || a.alias.toLowerCase().indexOf(searchText)>-1;
            })
            
			var sortedStamps = filteredStamps.sort(function(a,b){
				return a.group - b.group;
			});
            self.sortedStamps = sortedStamps;
			sortedStamps.forEach(function(stamp, i){
				if(i==0 || sortedStamps[i-1].group != stamp.group){
					htm += `<details open><summary>${StampGroupName[stamp.group]}</summary>`;
				}

				htm += `<div class='stampBtn' style='width:60px;height:60px;line-height:60px;' title='${stamp.name}' onclick='Modes.StampTool.changeStamp(${i}, true)'><img src='${stamp.path || stamp.src}' ></div>`;
				if(sortedStamps[i+1]==null || ( sortedStamps[i+1] && sortedStamps[i+1].group != stamp.group)){
					htm += `</details>`;
				}
			});
			htm += `</div>`;
			container.innerHTML = htm;            
            ir.show("stampPopup");
        },
	}; return self;
	})()