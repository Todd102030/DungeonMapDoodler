"use strict";

var StampTool = (function(){
	var self={
		angle: 0,
		borderSize: 3,
        custStampIndex:0,
		fillColor: "white",
		outlineColor: "black",
		hatchSize: 30,
		chosenStamp: {
            path:'stampsnew/ Dungeon Map Doodler/Decor/bed.svg',
            name: "Bed",
            alias: "",
            group: StampGroup.Decor,
            defMult: 1,
        },
		chosenStampImg: null,
		id:8,
		isSnapping: true,
		isPaintMode: false,
		multiplyer:1,
		paintVariance: 0,
		paintDistance: 50,
        recolorStamp: false,
        redRed: 255,
        redGreen: 0,
        redBlue: 0,
        
        greenRed: 0,
        greenGreen: 255,
        greenBlue: 0,
        
        blueRed: 0,
        blueGreen: 0,
        blueBlue: 255,
		size: 50,
        //ratio of default bed.svg stamp
		stampRatio: 0.602,
        scrolledStamp: 0,
        recentStamps: [{
            path:'stampsnew/ Dungeon Map Doodler/Decor/bed.svg',
            name: "Bed",
            alias: "",
            group: StampGroup.Decor,
            defMult: 1,
        }],
		title: "Stamp Settings",
		addStamp: function(fromPopup){
			ir.get("stampUpload").click();
            if(fromPopup){
                doodler.unpop("stampPopup");
            }
		},
		readAddStamp: function(){
			if ( this.files && this.files[0] ) {
            var FR= new FileReader();
            FR.onload = function(e) {
                var img = new Image();
                //Load the image in from the user, scale it to best fit the canvas, reset the offsets
                img.onload = function() {
                    self.custStampIndex++;
					Stamps.push({src:img.src, ratio:(img.naturalWidth/img.naturalHeight), name:"Custom"+self.custStampIndex, group:StampGroup.Custom, defMult: 1,alias:""});
                    //self.sortedStamps.push({src:img.src, ratio:(img.naturalWidth/img.naturalHeight), name:"Custom"+self.custStampIndex, group:StampGroup.Custom, defMult: 1,alias:""});
					self.setParameterBox(ir.get("paramBox"));
                    self.changeStamp(self.sortedStamps.length-1, true);
                };

                img.src = e.target.result;
            };       
            FR.readAsDataURL( this.files[0] );
        	}
		},
		changeAngle: function(evt){
			self.angle = evt.target.value;	
            doodler.drawLoop();
		},
		changeSnapping: function(evt){
			self.isSnapping = ir.bool("stampsIsSnapping");
            
            ir.enable("stampSize",!self.isSnapping);
            ir.enable("stampSizeLabel", !self.isSnapping);
            doodler.drawLoop();
            
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
            
            self.rebuildChosenStamp();
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
            self.rebuildChosenStamp();
		},
        rebuildChosenStamp: function(){
            self.chosenStampImg = new Image();
            self.chosenStampImg.onload = function(){
                self.stampRatio = this.naturalWidth/this.naturalHeight;
                //Upscale small svgs
                if((self.chosenStamp.path && self.chosenStamp.path.endsWith(".svg")) || (self.chosenStamp.src && self.chosenStamp.src.endsWith(".svg"))) {
                    if(self.chosenStampImg.width < 300){
                        self.chosenStampImg.width *= self.multiplyer;
                        self.chosenStampImg.height *= self.multiplyer;
                        console.log("Setting stamp image sizes to ", self.chosenStampImg.width, self.chosenStampImg.height);
                    }
                }
            }
            self.chosenStampImg.src = self.chosenStamp.path || self.chosenStamp.src;
            self.recoloredChosenStamp = null;
        },
        changeStampNew: function(name, path){
            self.changeStamp({alias:"", group:0, defMult:1, name:name, path:path}, true);
        },
		changeStamp: function(stamp, hidePopup){
            if(hidePopup){  
                if(typeof stamp === 'object'){
                    self.chosenStamp = stamp;
                }else{
                    self.chosenStamp = self.sortedStamps[stamp];
                }
                //insert into recentstamps if not already there
                var doinsert = true;
                self.recentStamps.forEach(function(st, i){
                    if(st.path == self.chosenStamp.path /*&& st.name == self.chosenStamp.name*/){
                        doinsert = false;
                    }
                })
                if(doinsert){
                    self.recentStamps.unshift(self.chosenStamp);
                }
            }else{
                self.chosenStamp = self.recentStamps[stamp];
            }
			//if(self.chosenStampImg==null){
				self.chosenStampImg = new Image();
			//}
            self.chosenStampImg.onload = function(){
                self.stampRatio = this.naturalWidth/this.naturalHeight;
                //Upscale small svgs
                if((self.chosenStamp.path && self.chosenStamp.path.endsWith(".svg")) || (self.chosenStamp.src && self.chosenStamp.src.endsWith(".svg"))) {
                    if(self.chosenStampImg.width < 300){
                        self.chosenStampImg.width *= self.multiplyer;
                        self.chosenStampImg.height *= self.multiplyer;
                        console.log("Setting stamp image sizes to ", self.chosenStampImg.width, self.chosenStampImg.height);
                    }
                }
            }
			self.chosenStampImg.src = self.chosenStamp.path || self.chosenStamp.src;
            self.recoloredChosenStamp = null;
            
			//self.multiplyer = self.chosenStamp.defMult;
			//ir.set("stampSizeMultLabel", self.chosenStamp.defMult);
			//ir.set("stampSizeMult", self.chosenStamp.defMult);
            ir.get("stampsCurrentStamp").src = self.chosenStampImg.src;
            ir.get("stampsCurrentStampBtn").title = self.chosenStamp.name;
            self.setParameterBox(ir.get("paramBox"));

            

            if(hidePopup){
                doodler.unpop("stampPopup");
            }
            doodler.popupShowing = false;
            self.stampSelected = null;
            doodler.drawLoop();
		},
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
            doodler.drawLoop();
		},
        recolorRedHex: "#ff0000",
        recolorGreenHex: "#00ff00",
        recolorBlueHex: "#0000ff",
        changeRecolorRed: function(evt){
            self.recolorRedHex = evt.target.value;
            var colors = self.hexToRGB(self.recolorRedHex);
            self.redRed = colors.red;
            self.redGreen = colors.green;
            self.redBlue = colors.blue;
            self.recoloredChosenStamp = null;
        },
        changeRecolorGreen: function(evt){
            self.recolorGreenHex = evt.target.value;
            var colors = self.hexToRGB(self.recolorGreenHex);
            self.greenRed = colors.red;
            self.greenGreen = colors.green;
            self.greenBlue = colors.blue;
            self.recoloredChosenStamp = null;
        },
        changeRecolorBlue: function(evt){
            self.recolorBlueHex = evt.target.value;
            var colors = self.hexToRGB(self.recolorBlueHex);
            self.blueRed = colors.red;
            self.blueGreen = colors.green;
            self.blueBlue = colors.blue;
            self.recoloredChosenStamp = null;
        },
        hexToRGB: function(h) {
            let r = 0, g = 0, b = 0;
          
            // 3 digits
            if (h.length == 4) {
              r = "0x" + h[1] + h[1];
              g = "0x" + h[2] + h[2];
              b = "0x" + h[3] + h[3];
          
            // 6 digits
            } else if (h.length == 7) {
              r = "0x" + h[1] + h[2];
              g = "0x" + h[3] + h[4];
              b = "0x" + h[5] + h[6];
            }
            
            return { red:+r, green: +g, blue: +b };
        },
		changePaintMode: function(evt){
			self.isPaintMode = ir.bool("stampsIsPaintMode");
			ir.show("stampPaintStuff",self.isPaintMode);
            doodler.drawLoop();
		},
        toggleRecolor: function(evt){
			self.recolorStamp = ir.bool("stampsRecolorStamp");
			ir.show("stampRecolorStuff",self.recolorStamp);
            doodler.drawLoop();
		},
		changePaintVariance: function(evt, fromInput){
			self.paintVariance = parseFloat(evt.target.value);   
			if(!fromInput){
				ir.set("stampPaintVarianceLabel", self.paintVariance);
			}else{
				ir.set("stampPaintVariance", self.paintVariance);
			}
            doodler.drawLoop();
		},
		changePaintDistance: function(evt, fromInput){
			self.paintDistance = parseFloat(evt.target.value);  
			if(!fromInput){
				ir.set("stampPaintDistanceLabel", self.paintDistance);
			}else{
				ir.set("stampPaintDistance", self.paintDistance);
			}
            doodler.drawLoop();
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
            ir.hide("stampsDeleteBtn");
            doodler.updateFrameBuffer();
            doodler.drawLoop();
		},
		draw: function(xpos, ypos, data){
			var size = self.size;
            var zoom = doodler.zoomLevel;
            var offX = doodler.globalOffsetX;
            var offY = doodler.globalOffsetY;
            
			var border=self.borderSize;
			var newimg = self.chosenStampImg;
			var stampobj = null;
            //if(self.chosenStamp.canColour){
            //    self.chosenColour = ir.v("stampColor");
            //}
            if(self.isPaintMode){
                var ctx = doodler.overlayCtx;
                if(self.stampRatio<1){
                    self.stepx = self.size;
                    self.stepy = self.size / self.stampRatio;
                }else{
                    self.stepx = self.size * self.stampRatio;
                    self.stepy = self.size;
                }
                var img2 = newimg;
                if(self.recolorStamp){
                    img2 = self.recolorImage(newimg, img2, 255, 0, 0, self.redRed, self.redGreen, self.redBlue);
                    img2 = self.recolorImage(newimg, img2, 0, 255, 0, self.greenRed, self.greenGreen, self.greenBlue);
                    img2 = self.recolorImage(newimg, img2, 0, 0, 255, self.blueRed, self.blueGreen, self.blueBlue);
                }
                self.drawImageRotated(ctx, img2,xpos-(self.stepx*self.multiplyer)/2, ypos-(self.stepy*self.multiplyer)/2, self.stepx*self.multiplyer, self.stepy*self.multiplyer, self.angle, false);
            }
            else{
                xpos = xpos*zoom+offX;
                ypos = ypos*zoom+offY;
                if((self.isSnapping && !doodler.shiftDown) || (!self.isSnapping && doodler.shiftDown)){
                    var gridxy = getGridXY(xpos, ypos);
                    
                    if(self.stampRatio<1){
                        gridxy.stepx = gridxy.step;
                        gridxy.stepy = gridxy.step / self.stampRatio;
                    }else{
                        gridxy.stepx = gridxy.step * self.stampRatio;
                        gridxy.stepy = gridxy.step;
                    }                
                    var img2 = newimg;
                    if(self.recolorStamp){
                        img2 = self.recolorImage(newimg, img2, 255, 0, 0, self.redRed, self.redGreen, self.redBlue);
                        img2 = self.recolorImage(newimg, img2, 0, 255, 0, self.greenRed, self.greenGreen, self.greenBlue);
                        img2 = self.recolorImage(newimg, img2, 0, 0, 255, self.blueRed, self.blueGreen, self.blueBlue);
                    }
                    stampobj = new StampObj(((gridxy.xgridmid-gridxy.step/2)-offX)/zoom, ((gridxy.ygridmid-gridxy.step/2)-offY)/zoom, gridxy.stepx/zoom*self.multiplyer, gridxy.stepy/zoom*self.multiplyer, img2, self.chosenStamp.path||self.chosenStamp.src, self.angle, doodler.layers[doodler.currentLayer].layerIndex, self.chosenColour, self.chosenStamp.canColour);
                    doodler.stamps.push(stampobj);
                    doodler.updateFrameBuffer();
                }
                else{
                    console.log("Clicking to create stamp")
                    if(self.stampRatio<1){
                        self.stepx = self.size;
                        self.stepy = self.size / self.stampRatio;
                    }else{
                        self.stepx = self.size * self.stampRatio;
                        self.stepy = self.size;
                    }
                    var img2 = newimg;
                    if(self.recolorStamp){
                        img2 = self.recolorImage(newimg, img2, 255, 0, 0, self.redRed, self.redGreen, self.redBlue);
                        img2 = self.recolorImage(newimg, img2, 0, 255, 0, self.greenRed, self.greenGreen, self.greenBlue);
                        img2 = self.recolorImage(newimg, img2, 0, 0, 255, self.blueRed, self.blueGreen, self.blueBlue);
                    }
                    stampobj = new StampObj(((xpos-(self.stepx*zoom/2))-offX)/zoom, ((ypos-(self.stepy*zoom/2))-offY)/zoom, self.stepx*self.multiplyer, self.stepy*self.multiplyer, img2, self.chosenStamp.path||self.chosenStamp.src, self.angle, doodler.layers[doodler.currentLayer].layerIndex, self.chosenColour, self.chosenStamp.canColour);
                    doodler.stamps.push(stampobj);
                    doodler.updateFrameBuffer();
                    
                }
            }
		},
        recoloredChosenStamp: null,
		drawCursor : function(ctx, xpos, ypos, data){
			if(self.chosenStampImg==null){
				self.chosenStampImg = new Image();
				self.chosenStampImg.src = self.chosenStamp.path||self.chosenStamp.src;
				/*self.chosenStampImg.onload = function() {
                    //console.log("Setting stamp ratio", this.naturalWidth, this.naturalHeight);
					self.stampRatio = this.naturalWidth/this.naturalHeight;
                    if((self.chosenStampImg.path && self.chosenStampImg.path.endsWith(".svg")) || self.chosenStampImg.src && self.chosenStampImg.src.endsWith(".svg")) {
                        self.chosenStampImg.width *= 4;
                        self.chosenStampImg.height *= 4;
                    }
				}*/
			}
            var zoom = doodler.zoomLevel;
			var offX = doodler.globalOffsetX;
			var offY = doodler.globalOffsetY;
            
			self.stampMoveHit = doodler.hitTestStamps({x:(xpos),y:(ypos),w:1,h:1});
			ctx.strokeStyle = "rgb(60,200,200)";
			ctx.beginPath();
			if(self.stampMoveHit == null && !self.isMovingStamp && self.stampSelected==null && !self.stampRotater && !self.rotatingStamp){
				if((self.isSnapping && !doodler.shiftDown) || (!self.isSnapping && doodler.shiftDown)){
					var gridxy = getGridXY2(xpos, ypos);
					if(self.stampRatio<1){
						gridxy.stepx = gridxy.step;
						gridxy.stepy = gridxy.step / self.stampRatio;
					}else{
						gridxy.stepx = gridxy.step * self.stampRatio;
						gridxy.stepy = gridxy.step;
					}
                    var img2 = self.chosenStampImg;
                    if(self.recolorStamp && self.recoloredChosenStamp == null){
                        img2 = self.recolorImage(self.chosenStampImg, img2, 255, 0, 0, self.redRed, self.redGreen, self.redBlue);
                        img2 = self.recolorImage(self.chosenStampImg, img2, 0, 255, 0, self.greenRed, self.greenGreen, self.greenBlue);
                        img2 = self.recolorImage(self.chosenStampImg, img2, 0, 0, 255, self.blueRed, self.blueGreen, self.blueBlue);
                        self.recoloredChosenStamp = img2;
                    }
                    if(self.recolorStamp){
                        img2 = self.recoloredChosenStamp;
                    }
					self.drawImageRotated(ctx, img2, gridxy.xgridmid-gridxy.step/2, gridxy.ygridmid-gridxy.step/2, gridxy.stepx*self.multiplyer, gridxy.stepy*self.multiplyer, self.angle, true);				
				}
				else{
					if(self.stampRatio<1){
						self.stepx = self.size;
						self.stepy = self.size / self.stampRatio;
					}else{
						self.stepx = self.size * self.stampRatio;
						self.stepy = self.size;
					}
                    var img2 = self.chosenStampImg;
                    if(self.recolorStamp && self.recoloredChosenStamp == null){
                        img2 = self.recolorImage(self.chosenStampImg, img2, 255, 0, 0, self.redRed, self.redGreen, self.redBlue);
                        img2 = self.recolorImage(self.chosenStampImg, img2, 0, 255, 0, self.greenRed, self.greenGreen, self.greenBlue);
                        img2 = self.recolorImage(self.chosenStampImg, img2, 0, 0, 255, self.blueRed, self.blueGreen, self.blueBlue);
                        self.recoloredChosenStamp = img2;
                    }
                    if(self.recolorStamp){
                        img2 = self.recoloredChosenStamp;
                    }
					self.drawImageRotated(ctx, img2, xpos-(self.stepx/2), ypos-(self.stepy/2), self.stepx*self.multiplyer, self.stepy*self.multiplyer, self.angle, true);
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

            var img2 = image;
         
            
			ctx.drawImage(img2, Math.floor(-width / 2), Math.floor(-height / 2), width, height);
			ctx.rotate(-angleInRadians);
			ctx.translate(-x-width/2, -y-height/2);
            if(transparent){
                ctx.globalAlpha = 1;
            }
            return img2;
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
				
				st.x = ((gridxy.xgridmid-gridxy.step/2));
				st.y = ((gridxy.ygridmid-gridxy.step/2));

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
            self.isDoodling = true;
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
			else if(self.isPaintMode && self.isDoodling){
				self.doodleEndX = xpos;
				self.doodleEndY = ypos;
				var distSinceLast = Math.hypot((self.paintX||0)-xpos, (self.paintY||0)-ypos);
				if(self.paintX == null || distSinceLast > self.paintDistance){
					
					var angle = 0;
					self.angle = angle + (Math.random()*self.paintVariance*2*360) - (self.paintVariance*360);
					self.draw(xpos, ypos, data);
					
					//self.angle = angle;
					self.paintX = xpos;
					self.paintY = ypos;
				}
				
			}
			else if (self.placingStamp){
				var wh = doodler;
				//self.draw(xpos*wh.zoomLevel+wh.globalOffsetX, ypos*wh.zoomLevel+wh.globalOffsetY, data);
				self.doodleEndX = xpos;
				self.doodleEndY = ypos;
				//self.doodleStartX = xpos;
				//self.doodleStartY = ypos;
			}
			
		},
		mouseUp: function(xpos, ypos, data){
			self.isDoodling = false;
            if(self.isPaintMode){
                doodler.drawOverlayStampCommit(xpos, ypos, data);
			    doodler.updateCurrentImage(false, true);
            }
            else if(self.placingStamp && !self.rotatingStamp){
				self.draw(xpos, ypos, data);
			}
            if(self.stampHit != null){
                self.stampSelected = self.stampHit;
                ir.show("stampsDeleteBtn");
            }else{
                ir.hide("stampsDeleteBtn");
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
        recolorImage: function(checkimg, img, oldRed, oldGreen, oldBlue, newRed, newGreen, newBlue) {

            var c = document.createElement('canvas');
            var ctx = c.getContext("2d");
            var checkc = document.createElement('canvas');
            var checkctx = checkc.getContext("2d");
            var w = img.width;
            var h = img.height;
            c.width = w;
            c.height = h;
            checkc.width = w;
            checkc.height = h;

        
            // draw the image on the temporary canvas
            ctx.drawImage(img, 0, 0, w, h);
            checkctx.drawImage(checkimg, 0, 0, w, h);
        
            // pull the entire image into an array of pixel data
            var imageData = ctx.getImageData(0, 0, w, h);
            var check = checkctx.getImageData(0, 0, w, h);
        
            // examine every pixel, 
            // change any old rgb to the new-rgb
            for (var i = 0; i < check.data.length; i += 4) {
                // if pixel red has any red in it, change it to a proportional amount of newred (newRed * (oldRed/255))
                // in darker red, red value isn't just lower, green and blue are higher, but match
                if (check.data[i] > 0 && oldRed > 0 && check.data[i] >check.data[i+1] && check.data[i] >check.data[i+2]) {
                    // change to your new rgb
                    var redIntensity = (check.data[i])/255;
                    imageData.data[i] = newRed * redIntensity;
                    imageData.data[i + 1] = newGreen * redIntensity;
                    imageData.data[i + 2] = newBlue * redIntensity;
                }
                else if (check.data[i+1] > 0 && oldGreen > 0  && check.data[i+1] >check.data[i] && check.data[i+1] >check.data[i+2]) {
                    imageData.data[i] = newRed * ((check.data[i+1])/255);
                    imageData.data[i + 1] = newGreen * ((check.data[i+1])/255);
                    imageData.data[i + 2] = newBlue * ((check.data[i+1])/255);
                }
                else if (check.data[i+2] > 0 && oldBlue > 0  && check.data[i+2] >check.data[i+1] && check.data[i+2] >check.data[i]) {
                    imageData.data[i] = newRed * ((check.data[i+2])/255);
                    imageData.data[i + 1] = newGreen * ((check.data[i+2])/255);
                    imageData.data[i + 2] = newBlue * ((check.data[i+2])/255);
                }
            }
            // put the altered data back on the canvas  
            ctx.putImageData(imageData, 0, 0);
        
            return c;
        
        },
        stopDebug: false,
        scrollStamp: function(delta){
            self.scrolledStamp += delta ;
            if(self.scrolledStamp >= self.recentStamps.length){
                self.scrolledStamp = 0;
            }
            if(self.scrolledStamp < 0){
                self.scrolledStamp = self.recentStamps.length-1;
            }
            if(self.recentStamps && self.recentStamps.length>0){
                self.changeStamp(self.scrolledStamp, false);
            }
        },
        searchStamp: function(event){
            self.searchText = event.target.value.toLowerCase();
            self.showStampPopup(true);
        },
		setParameterBox: function(container){
            var colourStampHtm = "";
            //if(self.chosenStamp.canColour){
            //    colourStampHtm = `<div class='paramTitle'>Colour</div><input list value='${self.chosenColour}'' type='color' id='stampColor'>`;
            //}

            var recentStamps = self.recentStamps;
            var recHtm = "";
            if(recentStamps.length>0){
			 recHtm += `<details open><summary>Recent Stamps</summary>`
            }
			recentStamps.forEach(function(stamp, i){
				recHtm += `<div class='stampBtn' title='${stamp.name}' onclick='Modes.StampTool.changeStamp(${i})'><img src='${stamp.path || stamp.src}' style='transform:unset;'  ></div>`;
			});
            recHtm += `</details>`;

			var htm = `<div class='paramTitle'>${self.title}</div><br>
                        <div class='paramTitle' title='Click to choose stamp'>Current Stamp: </div><br>
                        <div style='background-color:#aaa;' class='stampBtn' id='stampsCurrentStampBtn' title='${self.chosenStamp.name}' onclick='Modes.StampTool.showStampPopup()'><img id='stampsCurrentStamp' style='transform:unset;' src='${self.chosenStamp.path || self.chosenStamp.src}' ></div><br><div class='stampBtn' style='display:none;' id='stampsDeleteBtn' title='Delete selected stamp' onclick='Modes.StampTool.deleteFn(true)'><img id='stampsDeleteStamp' src='images/delete.png' ></div><br>
						${colourStampHtm}
                        ${recHtm}
                        <div class='paramTitle'>Size: </div><input type='number' style='width:60px' id='stampSizeLabel' value="${self.size}" onchange='Modes.StampTool.changeSize(event, true)' oninput='Modes.StampTool.changeSize(event, true)'><br>
						<input style='width:100px' type="range" id="stampSize" name="stampSize" min="1" max="200" value='${self.size}' onchange='Modes.StampTool.changeSize(event)' oninput='Modes.StampTool.changeSize(event)'><br>
						<div class='paramTitle'>Multiplier: </div><input type='number' style='width:60px' step='0.5' id='stampSizeMultLabel' value="${self.multiplyer}" onchange='Modes.StampTool.changeSizeMult(event, true)' oninput='Modes.StampTool.changeSizeMult(event, true)'><br>
						<input style='width:100px' type="range" id="stampSizeMult" name="stampSizeMult" step='0.5' min="0.5" max="5" value='${self.multiplyer}' onchange='Modes.StampTool.changeSizeMult(event)' oninput='Modes.StampTool.changeSizeMult(event)'><br>
						<div class='paramTitle'>Rotate Degrees: </div><br>
						<input type="number" id="stampAngle" name="stampAngle" min="0" max="360" style='width:60px' value='${self.angle}' onchange='Modes.StampTool.changeAngle(event)' oninput='Modes.StampTool.changeAngle(event)'><br>
						<input type='checkbox' id='stampsIsSnapping' onclick='Modes.StampTool.changeSnapping(event)'><label for='stampsIsSnapping'>Snap To Grid</label><br>
						<input type='checkbox' id='stampsIsPaintMode' onclick='Modes.StampTool.changePaintMode(event)'><label for='stampsIsPaintMode'>Paint Mode</label><br>
						<div id='stampPaintStuff'><div class='paramTitle' id='stampDistTitle'>Paint Distance: </div><input type='number' style='width:60px' step='1' id='stampPaintDistanceLabel' value="${self.paintDistance}" onchange='Modes.StampTool.changePaintDistance(event, true)' oninput='Modes.StampTool.changePaintDistance(event, true)'><br>
						<input style='width:100px' type="range" id="stampPaintDistance" name="stampPaintDistance" step='1' min="1" max="200" value='${self.paintDistance}' onchange='Modes.StampTool.changePaintDistance(event)' oninput='Modes.StampTool.changePaintDistance(event)'><br>
						<div class='paramTitle' id='stampVarTitle'>Paint Variance: </div><input type='number' style='width:60px' step='0.01' id='stampPaintVarianceLabel' value="${self.paintVariance}" onchange='Modes.StampTool.changePaintVariance(event, true)' oninput='Modes.StampTool.changePaintVariance(event, true)'><br>
						<input style='width:100px' type="range" id="stampPaintVariance" name="stampPaintVariance" step='0.01' min="0" max="1" value='${self.paintVariance}' onchange='Modes.StampTool.changePaintVariance(event)' oninput='Modes.StampTool.changePaintVariance(event)'><br>
                        </div>
                        <input type='checkbox' id='stampsRecolorStamp' onclick='Modes.StampTool.toggleRecolor(event)'><label for='stampsRecolorStamp'>Custom Stamp Colors</label><br>
                        <div id='stampRecolorStuff'>
                        <div class='paramTitle'>Red</div><input list value='${self.recolorRedHex}' type='color' id='stampRecolorRed' onchange='Modes.StampTool.changeRecolorRed(event)'><br>
                        <div class='paramTitle'>Green</div><input list value='${self.recolorGreenHex}' type='color' id='stampRecolorGreen' onchange='Modes.StampTool.changeRecolorGreen(event)'><br>
                        <div class='paramTitle'>Blue</div><input list value='${self.recolorBlueHex}' type='color' id='stampRecolorBlue' onchange='Modes.StampTool.changeRecolorBlue(event)'>
                        </div>
						`;
			
			htm += `<br><a href='#' class='' onclick='Modes.StampTool.addStamp()'>+ Add Stamp</a><br> `
            
			htm += `<div style='max-width:150px;'>`
			
			var sortedStamps = Stamps.sort(function(a,b){
				return a.group - b.group;
			});
            self.sortedStamps = sortedStamps;
			//console.log("Sorted stamps is ", sortedStamps);
            
           

			container.innerHTML = htm;
			
			ir.set("stampsIsSnapping", self.isSnapping);
			ir.set("stampsIsPaintMode", self.isPaintMode);
			ir.set("stampsRecolorStamp", self.recolorStamp);
            ir.enable("stampSize",!self.isSnapping);
            ir.enable("stampSizeLabel", !self.isSnapping);
            ir.show("stampPaintStuff", self.isPaintMode);
            ir.show("stampRecolorStuff", self.recolorStamp);
            
		},
        showStampPopup: function(fromSearch){
            doodler.popupShowing = true;
            var container = ir.get("stampPopupList");
            if(container.innerHTML.length>10 && fromSearch==undefined){
                doodler.pop("stampPopup");
                return;
            }
            var htm = "";
            var searchText = self.searchText || "";
			
            var filteredStamps = Stamps.filter(function(a){
                return searchText=="" || a.name.toLowerCase().indexOf(searchText)>-1 || a.alias.toLowerCase().indexOf(searchText)>-1 || StampGroupName[a.group].toLowerCase().indexOf(searchText)>-1;
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

            //new stamp directory stuff

            var stampDir = allStampJson;
            stampDir.children.sort((a, b)=>{
                if (a.name < b.name) {
                    return -1;
                  }
                  if (a.name > b.name) {
                    return 1;
                  }
            })
            this.stampHtml = "";
            for(var i=0;i<stampDir.children.length;i++){
                this.processDir(stampDir.children[i], 0);
            }
			container.innerHTML = this.stampHtml;            
            doodler.pop("stampPopup");
        },
        stampHtml: "",
        processDir: function(myDir, depth){
            var searchText = self.searchText || "";
            if(searchText.length >= 2){
                if(myDir.type == "folder" && myDir.children != null){
                    myDir.children.sort((a, b)=>{
                        if (a.name < b.name) {
                            return -1;
                        }
                        if (a.name > b.name) {
                            return 1;
                        }
                    })
                    for(var i=0;i<myDir.children.length;i++){
                        this.processDir(myDir.children[i], depth +1);
                    }
                }
                if(myDir.type == "file" && (myDir.path.endsWith(".png") || myDir.path.endsWith(".jpg") || myDir.path.endsWith(".svg")) && (searchText=="" || myDir.name.toLowerCase().indexOf(searchText)>-1)){
                    
                    this.stampHtml += `<div class='stampBtn' style='background-color:#aaa;text-align:center;width:60px;height:60px;line-height:60px;' title='${myDir.name}' 
                    onclick="Modes.StampTool.changeStampNew('${myDir.name}', 'stampsnew/${ myDir.path.substring(2)}')"><img loading="lazy" src='stampsnew/${myDir.path.substring(2)}' ></div>`;
                }
            }else{
                if(myDir.type == "folder" && myDir.children != null){
                    if(depth == 0){
                        this.stampHtml += `<details style='font-size:18pt;text-align:left;margin-left:${depth*6}px;' ><summary>${myDir.name}</summary>`;
                    }else{
                        this.stampHtml += `<details style='font-size:14pt;text-align:left;margin-left:${depth*6}px;'><summary>${myDir.name}</summary>`;
                    }
                    myDir.children.sort((a, b)=>{
                        if (a.name < b.name) {
                            return -1;
                        }
                        if (a.name > b.name) {
                            return 1;
                        }
                    })
                    for(var i=0;i<myDir.children.length;i++){
                        this.processDir(myDir.children[i], depth +1);
                    }
                    this.stampHtml += `</details>`;
                }else if(myDir.type == "file" && (myDir.path.endsWith(".png") || myDir.path.endsWith(".jpg") || myDir.path.endsWith(".svg")) && (searchText=="" || myDir.name.toLowerCase().indexOf(searchText)>-1)){
                    
                    this.stampHtml += `<div class='stampBtn' style='background-color:#aaa;text-align:center;width:60px;height:60px;line-height:60px;' title='${myDir.name}' 
                    onclick="Modes.StampTool.changeStampNew('${myDir.name}', 'stampsnew/${ myDir.path.substring(2)}')"><img loading="lazy" src='stampsnew/${myDir.path.substring(2)}' ></div>`;
                }
            }
        },

	}; return self;
	})()