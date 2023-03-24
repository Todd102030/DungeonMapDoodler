"use strict";

var Hatching = (function(){
	var self={
		borderSize: 3,
		fillColor: "white",
		outlineColor: "black",
		imageStyle: "hatchingImg",
		floorStyle: "plainWhite",
        fullHatch: false,
		hatchSize: 30,
		renderScale: 1,
		id:8,
		size: 70,
		shape: Shape.Square,
		title: "Hatch Settings",
		changeColor: function(evt, type){
			if(type=='fill'){
				self.fillColor = evt.target.value;
			}else{
				self.outlineColor = evt.target.value;
			}
		},
		changeImageStyle: async function(evt){
            //only gets set if clicked from texture images, null otherwise. Overrides the drawFGBG value;
			var doBackground = doodler.doBackground;
            
			var layer = doodler.layers[doodler.currentLayer];
            var doBg = ir.vn("drawFGBG")
            if(doBackground != null && doBackground>0){
                doBg = doBackground == 1;
            }
            if(doBg == 1){
                self.imageStyle = evt.target.value;// ir.v("hatchImageStyle");
                doodler.hatchStyleImage = self.imageStyle;
                layer.hatchStyle = self.imageStyle;
                layer.hatchImg = null;
                layer.hatchGenerated = false;
                console.log("ir.get(layer.hatchStyle).src" , ir.get(layer.hatchStyle).src);
                var myimg = ir.get("backgroundTexture");
                myimg.style.backgroundImage = "url('"+ir.get(layer.hatchStyle).src+"') ";
            }
            else{
                self.floorStyle = evt.target.value;//ir.v("hatchFloorStyle");
                doodler.floorStyle = self.floorStyle;
                layer.floorStyle = self.floorStyle;
                layer.floorImg = null;
                layer.floorGenerated = false;
                console.log("ir.get(layer.floorStyle).src" , ir.get(layer.floorStyle).src);
                var myimg = ir.get("foregroundTexture");
                myimg.style.backgroundImage = "url('"+ir.get(layer.floorStyle).src+"') ";
                //await self.loadLayerImage();
            }
			doodler.doBackground = 0;
            
            doodler.updateFrameBuffer();
            
		},
        loadLayerImage: async function(){
            var layer = doodler.layers[doodler.currentLayer];
            
            if(!layer.floorGenerated){	
            
                var img = new Image();
                img.src = ir.get(layer.floorStyle).src;
                console.log("Generating floor style from " + layer.floorStyle);
                /// draw the image to be clipped
                //ctx.drawImage(img, 0, 0, 500, 500);
                //////
                await img.decode();
                //img.onload = function(){
                    var iw = img.naturalWidth*Modes.Hatching.renderScale;
                    var ih = img.naturalHeight*Modes.Hatching.renderScale;
                    var xplus = iw*(1/sX);//*self.zoomLevel;
                    var yplus = ih*(1/sY);//*self.zoomLevel;


                    layer.floorGenerated = true;
                    var canv2 = document.createElement("canvas");
                    //By foot count
                    canv2.width = xfeet*dim.footPixel+1;
                    canv2.height = yfeet*dim.footPixel+1;
                    //console.log("Generating hatch of size ", canv2.width, canv2.height, " from stepSize=", dim.stepSize, "and footPixel=", dim.footPixel, " and boxSize is ", step, " and stepX is ", stepX, " and stepY is ", stepY);
                    var ctx2 = canv2.getContext("2d", {desynchronized:true});
                    ctx2.lineWidth = 1;
                    ctx2.strokeStyle = "#fff";
                    for(var x=0;x<canv2.width;x+=xplus){
                        for(var y=0;y<canv2.height;y+=yplus){					
                            ctx2.drawImage(img, x,y,Math.floor(iw*(1/sX)), Math.floor(ih*(1/sY)));
                        }
                    }
                    var img2 = new Image();
                    var dataurl = canv2.toDataURL();

                    img2.onload = function() {
                        img2.width = canv2.width;
                        img2.height = canv2.height;
                        layer.floorImg = img2;
                        self.updateFrameBuffer();
                    };
                    img2.src = dataurl;

                    layer.floorGenerated = true;
                //}
            }
        },
		changeFloorStyle: function(evt){
			self.floorStyle = ir.v("hatchFloorStyle");
			//doodler.hatchGenerated = false;
			doodler.floorStyle = self.floorStyle;
			var layer = doodler.layers[doodler.currentLayer];
			layer.floorStyle = self.floorStyle;
			layer.floorImg = null;
			layer.floorGenerated = false;
            doodler.updateFrameBuffer();
		},
        changeFullHatch: function(){
			self.fullHatch = ir.v("hatchingFullHatch");
            doodler.updateFrameBuffer();
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
			var zoom = doodler.zoomLevel;
			var hatchSize = self.hatchSize;
			// Radii of the white glow.
			var innerRadius = self.size * 0.15;
			var outerRadius = self.size*2+hatchSize;
			// Radius of the entire circle.
			var radius = self.size*2.1+hatchSize;
            
            //hatchCtx is part of the layer object, need to paste down a circle of the hatchimg from layer.hatchImg onto hatchCtx/Canvas, then in doodle drawCrossHatchMask just draw hatchCanvas as normal
            // if we change hatchImg then we'll be pasting down a new circle of stuff, but unless we clear hatchCanvas, it should now have two different textures pasted onto it
            
			/*var gradient = ctx.createRadialGradient(xpos, ypos, innerRadius, xpos, ypos, outerRadius);
			gradient.addColorStop(0, self.fillColor);
			gradient.addColorStop(1, 'transparent');
			ctx.arc(xpos, ypos, radius, 0, 2 * Math.PI);
			ctx.fillStyle = gradient;
			ctx.fill();*/
            var filter = doodler.filter;
            doodler.tmpCtx.filter = filter;
            var drawOnBG = ir.bool("drawFGBG");
            
            if(!drawOnBG){
                var ctx = data.doodleCtx;
                doodler.tmpCtx.clearRect(0,0,doodler.tmpCanvas.width,doodler.tmpCanvas.height);
                //Draw circle to tmpCanvas
                doodler.tmpCtx.drawImage(ir.get("circlefuzzImg"), xpos-radius, ypos-radius, radius*2, radius*2);
                doodler.tmpCtx.globalCompositeOperation = "source-in";
                doodler.tmpCtx.drawImage(data.floorImg,0,0,data.doodleCanvas.width, data.doodleCanvas.height)
                doodler.tmpCtx.globalCompositeOperation = "source-over";
                //Draw tmpCanvas to hatchCtx
                ctx.globalCompositeOperation = "source-atop";
                ctx.drawImage(doodler.tmpCanvas, 0,0,doodler.tmpCanvas.width,doodler.tmpCanvas.height);
                ctx.globalCompositeOperation = "source-over";
            }else{
                var ctx = data.hatchCtx;
                doodler.tmpCtx.clearRect(0,0,doodler.tmpCanvas.width,doodler.tmpCanvas.height);
                //Draw circle to tmpCanvas
                doodler.tmpCtx.drawImage(ir.get("circlefuzzImg"), xpos-radius, ypos-radius, radius*2, radius*2);
                doodler.tmpCtx.globalCompositeOperation = "source-in";
                doodler.tmpCtx.drawImage(data.hatchImg,0,0,data.hatchCanvas.width, data.hatchCanvas.height)
                doodler.tmpCtx.globalCompositeOperation = "source-over";
                //Draw tmpCanvas to hatchCtx
                ctx.drawImage(doodler.tmpCanvas, 0,0,doodler.tmpCanvas.width,doodler.tmpCanvas.height);
            }
            doodler.updateFrameBuffer();
		},
		drawOverlay: function(xpos, ypos, data){
			var size = self.hatchSize;
			var border=self.borderSize;
			var zoom = doodler.zoomLevel;
			var hatchSize = self.hatchSize;
			// Radii of the white glow.
			var innerRadius = self.size * 0.15;
			var outerRadius = self.size*2+hatchSize;
			// Radius of the entire circle.
			var radius = innerRadius; //self.size*2.1+hatchSize;
            
            //hatchCtx is part of the layer object, need to paste down a circle of the hatchimg from layer.hatchImg onto hatchCtx/Canvas, then in doodle drawCrossHatchMask just draw hatchCanvas as normal
            // if we change hatchImg then we'll be pasting down a new circle of stuff, but unless we clear hatchCanvas, it should now have two different textures pasted onto it
            
			/*var gradient = ctx.createRadialGradient(xpos, ypos, innerRadius, xpos, ypos, outerRadius);
			gradient.addColorStop(0, self.fillColor);
			gradient.addColorStop(1, 'transparent');
			ctx.arc(xpos, ypos, radius, 0, 2 * Math.PI);
			ctx.fillStyle = gradient;
			ctx.fill();*/
            
            var drawOnBG = ir.bool("drawFGBG");
            var filter = doodler.filter;
            
            
            if(!drawOnBG){
                var ctx = doodler.overlayCtx;
       /*         ctx.filter = filter;
                doodler.tmpCtx.clearRect(0,0,doodler.tmpCanvas.width,doodler.tmpCanvas.height);
                //Draw circle to tmpCanvas
				ctx.fillStyle = "white";
				ctx.strokeStyle = "white";
                ctx.beginPath();
                ctx.arc(xpos, ypos, size/2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.globalCompositeOperation = "source-in";
                ctx.drawImage(data.doodleCanvas,0,0,data.doodleCanvas.width, data.doodleCanvas.height)
                ctx.globalCompositeOperation = "source-over";*/
                //Draw tmpCanvas to hatchCtx
                //ctx.drawImage(doodler.tmpCanvas, 0,0,doodler.tmpCanvas.width,doodler.tmpCanvas.height);
                doodler.tmpCtx.filter = filter;
                doodler.tmpCtx.clearRect(0,0,doodler.tmpCanvas.width,doodler.tmpCanvas.height);
                //Draw circle to tmpCanvas
                doodler.tmpCtx.fillStyle = "white";
				doodler.tmpCtx.strokeStyle = "white";
                doodler.tmpCtx.beginPath();
                doodler.tmpCtx.arc(xpos, ypos, size, 0, 2 * Math.PI);
                doodler.tmpCtx.fill();
                //doodler.tmpCtx.drawImage(ir.get("circlefuzzImg"), xpos-radius, ypos-radius, radius*2, radius*2);
                doodler.tmpCtx.globalCompositeOperation = "source-in";
                doodler.tmpCtx.drawImage(data.hatchImg,0,0,data.doodleCanvas.width, data.doodleCanvas.height)
                doodler.tmpCtx.filter = "none";
                //THESE GUYS NEED TO GO SOMEWHERE ELSE, BUT DON'T KNOW WHERE. CAUSES WEIRD BLEEDING FROM TRANSPARENT TEXTURES
                doodler.tmpCtx.drawImage(data.doodleCanvas,0,0,data.doodleCanvas.width, data.doodleCanvas.height)
                doodler.tmpCtx.globalCompositeOperation = "source-over";
                //Draw tmpCanvas to hatchCtx
                ctx.drawImage(doodler.tmpCanvas, 0,0,doodler.tmpCanvas.width,doodler.tmpCanvas.height);
            }else{
                var ctx = doodler.overlayCtx;
                doodler.tmpCtx.filter = filter;
                doodler.tmpCtx.clearRect(0,0,doodler.tmpCanvas.width,doodler.tmpCanvas.height);
                //Draw circle to tmpCanvas
                doodler.tmpCtx.fillStyle = "white";
				doodler.tmpCtx.strokeStyle = "white";
                doodler.tmpCtx.beginPath();
                doodler.tmpCtx.arc(xpos, ypos, size, 0, 2 * Math.PI);
                doodler.tmpCtx.fill();
                //doodler.tmpCtx.drawImage(ir.get("circlefuzzImg"), xpos-radius, ypos-radius, radius*2, radius*2);
                doodler.tmpCtx.globalCompositeOperation = "source-in";
                doodler.tmpCtx.drawImage(data.hatchImg,0,0,data.hatchCanvas.width, data.hatchCanvas.height)
                doodler.tmpCtx.filter = "none";
                doodler.tmpCtx.drawImage(data.hatchCanvas,0,0,data.hatchCanvas.width, data.hatchCanvas.height)
                doodler.tmpCtx.globalCompositeOperation = "source-over";
                //Draw tmpCanvas to hatchCtx
                ctx.drawImage(doodler.tmpCanvas, 0,0,doodler.tmpCanvas.width,doodler.tmpCanvas.height);
            }
            doodler.updateFrameBuffer();
		},
		drawCursor : function(ctx, xpos, ypos, data){
			var wh = doodler;
            var zoom = wh.zoomLevel;
            var size = self.hatchSize;
            var filter = doodler.filter;
            ctx.filter = filter;
			ctx.strokeStyle = "rgb(240,60,60)";
            ctx.fillStyle = "white"; //self.fillColor;
            ctx.strokeStyle = "white";//self.fillColor;
            if(doodler.shiftDown){
                ctx.fillStyle = "rgb(237, 148, 148)"; //self.fillColor;
                ctx.strokeStyle = "rgb(237, 148, 148)";
            }
            var filter = doodler.filter;
            ctx.filter = filter;
			//if(self.shape == Shape.Circle){
                ctx.beginPath();
                ctx.arc(xpos, ypos, size, 0, 2 * Math.PI);
                ctx.fill();
                
			//}
			//else{
			//	ctx.strokeRect(xpos-(self.size/2)*zoom,ypos-(self.size/2)*zoom,self.size*zoom,self.size*zoom)
			//}
            ctx.filter = "none";
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
			self.drawOverlay(xpos, ypos, data);
		},
		mouseMove: function(xpos, ypos, data){
			if (self.isDoodling){
				self.doodleEndX = xpos;
				self.doodleEndY = ypos;
				self.drawOverlay(xpos, ypos, data);
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
		},
		setParameterBox: function(container){
			var htm = `<div class='paramTitle'>${self.title}</div><br>
						<div class='paramTitle'>Hatch Size: </div><input type='number' style='width:60px' id='hatchingHatchSizeLabel' value="${self.hatchSize}" onchange='Modes.Hatching.changeHatchSize(event, true)' oninput='Modes.Hatching.changeHatchSize(event, true)'><br>
						<input style='width:100px' type="range" id="hatchingHatchSize" name="hatchingHatchSize" min="1" max="200"  value='${self.hatchSize}' onchange='Modes.Hatching.changeHatchSize(event)' oninput='Modes.Hatching.changeHatchSize(event)'><br>
						<div class='paramTitle'>Scale: </div><input type='number' min='0.125' max='4' step='0.125' style='width:60px' id='hatchingScaleLabel' value="${self.renderScale}" onchange='Modes.Hatching.changeScaleAndRender(event, true)' oninput='Modes.Hatching.changeScale(event, true)'><br>
						<input style='width:100px' type="range" id="hatchingScale" name="hatchingScale" min="1" max="4" step='0.125' value='${self.renderScale}' oninput='Modes.Hatching.changeScale(event)' onchange='Modes.Hatching.changeScaleAndRender(event)'><br>
						
                        `;
            htm += `<button type="button" class="canvBtn" onclick="doodler.pop('hatchPopup');doodler.popupShowing = true;">Select Texture</button>`
            /*htm +=`<div class="tooltipParent">
                <div class="toggle">
                    <input type="radio" name="drawFGBG" value="0" id="drawFG" checked="checked" />
                    <label for="drawFG">Foreground</label>
                    <input type="radio" name="drawFGBG" value="1" id="drawBG" />
                    <label for="drawBG">Background</label>
                </div>
                <div class="tooltipError">A message popup above toggle?</div>
            </div>`;*/
			
			/*htm += `<div class='paramTitle'>Hatch Style</div><br><select id='hatchImageStyle' style='max-width:100px;' onchange='Modes.Hatching.changeImageStyle(event)'>`;
			htm += "<option name='Hatching' value='hatchingImg'>Hatching</option>";
			htm += "<option name='JPCross' value='hatchingImgJPCrosshatch'>Dense Hatching</option>";
			htm += "<option name='JPHalftone' value='hatchingImgJPHalftone'>Drawn Halftone</option>";
			htm += "<option name='JPStipple' value='hatchingImgJPStipple'>Drawn Stipple</option>";
			htm += "<option name='JPStone' value='hatchingImgJPStone'>Drawn Stone</option>";
			htm += "<option name='JPGrass' value='hatchingImgJPGrass'>Drawn Grass</option>";
			htm += "<option name='Dots' value='hatchingImgDots'>Dots</option>";
            htm += `<option name='wood1' value='wood1'>Cartoon Wood Flooring</option>`;            
            htm += `<option name='metal1' value='metal1'>Cartoon Metal Flooring</option>`;
            htm += `<option name='stone1' value='stone1'>Cartoon Stone</option>`;
			htm += `<option name='brick1' value='brick1'>Cartoon Brick</option>`;
			htm += `<option name='sand1' value='sand1'>Cartoon Sand</option>`;
			htm += `<option name='sand2' value='sand2'>Cartoon Sand 2</option>`;
			htm += `<option name='magma1' value='magma1'>Cartoon Magma</option>`;
			htm += `<option name='water1' value='water1'>Cartoon Water</option>`;
			htm += `<option name='space1' value='space1'>Space 1</option>`;
			htm += `<option name='space2' value='space2'>Space 2</option>`;
			htm += `<option name='space3' value='space3'>Space 3</option>`;
			htm += `<option name='space4' value='space4'>Space 4</option>`;
			htm += "<option name='Grass' value='hatchingImgGrass'>Grass</option>";
			htm += "<option name='Rock' value='hatchingImgRock'>Rocks</option>";
			htm += "<option name='Grass1' value='grass1'>Grass1</option>";
			htm += "<option name='Grass2' value='grass2'>Grass2</option>";
			htm += "<option name='Grass3' value='grass3'>Grass3</option>";
			htm += "<option name='f1' value='f1'>f1</option>";
			htm += "<option name='f2' value='f2'>f2</option>";
			htm += "<option name='f3' value='f3'>f3</option>";
			htm += "<option name='f4' value='f4'>f4</option>";
			htm += "<option name='f5' value='f5'>f5</option>";
			htm += "<option name='f6' value='f6'>f6</option>";
            
            htm += "<option name='d1' value='d1'>d1</option>";
			htm += "<option name='d2' value='d2'>d2</option>";
			htm += "<option name='d3' value='d3'>d3</option>";
			htm += "<option name='d4' value='d4'>d4</option>";
            
            htm += "<option name='w1' value='w1'>w1</option>";
			htm += "<option name='w2' value='w2'>w2</option>";
			htm += "<option name='w3' value='w3'>w3</option>";
			htm += "<option name='w4' value='w4'>w4</option>";
			htm += "<option name='SolidBlack' value='hatchingImgSolidBlack'>Solid Black</option>";
			htm += "</select><br>";
			
			htm += `<div class='paramTitle'>Floor Style</div><br><select id='hatchFloorStyle' style='max-width:100px;' onchange='Modes.Hatching.changeFloorStyle(event)'>`;
			htm += `<option name='' value=''>None</option>`;
			htm += "<option name='Hatching' value='hatchingImg'>Hatching</option>";
			htm += "<option name='JPCross' value='hatchingImgJPCrosshatch'>Dense Hatching</option>";
			htm += "<option name='JPHalftone' value='hatchingImgJPHalftone'>Drawn Halftone</option>";
			htm += "<option name='JPStipple' value='hatchingImgJPStipple'>Drawn Stipple</option>";
			htm += "<option name='JPStone' value='hatchingImgJPStone'>Drawn Stone</option>";
			htm += "<option name='JPGrass' value='hatchingImgJPGrass'>Drawn Grass</option>";
			htm += "<option name='Dots' value='hatchingImgDots'>Dots</option>";
            htm += `<option name='wood1' value='wood1'>Cartoon Wood Flooring</option>`;
            htm += `<option name='metal1' value='metal1'>Cartoon Metal Flooring</option>`;
            htm += `<option name='stone1' value='stone1'>Cartoon Stone</option>`;
			htm += `<option name='brick1' value='brick1'>Cartoon Brick</option>`;
			htm += `<option name='sand1' value='sand1'>Cartoon Sand</option>`;
			htm += `<option name='sand2' value='sand2'>Cartoon Sand 2</option>`;
			htm += `<option name='magma1' value='magma1'>Cartoon Magma</option>`;
			htm += `<option name='water1' value='water1'>Cartoon Water</option>`;
			htm += `<option name='space1' value='space1'>Space 1</option>`;
			htm += `<option name='space2' value='space2'>Space 2</option>`;
			htm += `<option name='space3' value='space3'>Space 3</option>`;
			htm += `<option name='space4' value='space4'>Space 4</option>`;
			htm += "<option name='Grass' value='hatchingImgGrass'>Grass</option>";
			htm += "<option name='Rock' value='hatchingImgRock'>Rocks</option>";
			htm += "<option name='Grass1' value='grass1'>Grass1</option>";
			htm += "<option name='Grass2' value='grass2'>Grass2</option>";
			htm += "<option name='Grass3' value='grass3'>Grass3</option>";
            htm += "<option name='f1' value='f1'>f1</option>";
			htm += "<option name='f2' value='f2'>f2</option>";
			htm += "<option name='f3' value='f3'>f3</option>";
			htm += "<option name='f4' value='f4'>f4</option>";
			htm += "<option name='f5' value='f5'>f5</option>";
			htm += "<option name='f6' value='f6'>f6</option>";
            
            htm += "<option name='d1' value='d1'>d1</option>";
			htm += "<option name='d2' value='d2'>d2</option>";
			htm += "<option name='d3' value='d3'>d3</option>";
			htm += "<option name='d4' value='d4'>d4</option>";
            
            htm += "<option name='w1' value='w1'>w1</option>";
			htm += "<option name='w2' value='w2'>w2</option>";
			htm += "<option name='w3' value='w3'>w3</option>";
			htm += "<option name='w4' value='w4'>w4</option>";
			htm += "</select>";*/
			
			//<input type='color' value='${self.fillColor}' id='hatchingColor' onchange="Modes.Hatching.changeColor(event, 'fill')">
						//<label for="hatchingColor">Hatching Color</label><br>
			container.innerHTML = htm;
			
			ir.set("hatchingFullHatch", self.fullHatch);
			ir.set("hatchImageStyle", doodler.layers[doodler.currentLayer].hatchStyle);
			ir.set("hatchFloorStyle", doodler.layers[doodler.currentLayer].floorStyle);
			
			
			
		},
	}; return self;
})()
