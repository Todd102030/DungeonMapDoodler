"use strict";
var pgWarehouseMap = (function(){
  var self={
    animationId : null,
	  beanColour: "#782632",
    canvas: null,
    //Keep track of top left of canvas to normalize mouse coords
    canvX: null,
    canvY: null,
    ctx: null,
    //dimensions: {isSet: false,sx: null,sy: null,ex: null,ey: null,imgW: 500,imgH: 500,
     // w: null,h: null,wf: null,hf: null,scaleX: null,scaleY: null,stepSize: 4},
	dimensions:{ex: 500,
		ey: 500,
		h: 10,
		hf: 10,
		isSet: true,
		scaleX: 1,
		scaleY: 1,
		stepSize: 5,
		footPixel:10,
		sx: 0,
		sy: 0,
		w: 10,
		wf: 10},
    dimensionsOld: null,
	drawGridOutside: true,
    editMode:false,
    fontSizes: [],
    globalOffsetX: 0,
    globalOffsetY: 0,
    gridImg: null,
	hatchStyleImage: "hatchingImg",
    imageScaleX:1,
    imageScaleY:1,
    isPlacingText: false,
    isRunning: false,
    //Array to hold all the outlined areas being draw on screen
    locations:[],
    //Only while the user is clicking and dragging to create a new location, store the coordinates here to draw a preview outline
    locationSX: null,
    locationSY: null,
    locationEX: null,
    locationEY: null,
    //Give location rectangles a unique index to keep track of them
    locIndex: 0,
    /** Location objects for this warehouse */
    locRows:new KeyedArray("Row"),
    /**self.lots: lot info structs for this warehouse */
    lots:[],
    minLocHeight: 10,
    minLocWidth: 10,
    minFontPx:10,
    //MODE LIST:
    // 1 = Mode.MOVE = Click and drag to pan the entire page around, scroll wheel to zoom in and out
    // 2 = Mode.LOCATION = Click and drag creates an outline for a location
    // 3 = Mode.WALLS = Click and drag to create walls for map
    // 4 = Mode.DISPLAY = Display mode, draws warehouse image as large as possible on screen, if real data is available, show it on screen
    // 5 = Mode.TEXT = Click to create text on map
    // 6 = Mode.EDIT = Edit mode to delete created lots, adds a little X crosshair to indicate they'll remove a lot when clicking it
    // 7 = Mode.DIMENSIONS = Mode for setting initial outer dimensions of warehouse 
    // 8 = Mode.Doodle = Main mode for drawing maps
	  //Deprecated, moving to modes.js object
    mode: 7,    
	mouseMode: Modes.Doodle,
    mouseIsDown: false,
    //Used to determine if we should move an object when they clicked on it, or pop up the edit window
    mouseMovedWhileDown: false,
    //Keep track of mouse coordinates
    mouseX: null,
    mouseY: null,
    movingType: null,
    movingId: null,
    //Single var to keep track of whether or not anything is being moved by the mouse
    isMovingObject: false,
    //Keep track of offset from mouse coords to top left of warehouse image
    offsetX: 0,
    offsetY: 0,
    /** Warehouse object */
    rec:{Row:0,Name:"Warehouse Name"},
    /** SeedPickup objects for this warehouse */
    seeds:[],
	stamps: [],
    //Holds all text displayed on screen
    textFields: [],
    textId: null,
	undoStack: { /* holds arrays of canvas.toDataUrl() calls, in most cases on mouseup event when a drawing tool is used */
		hatch: [],
		outline: [],
		doodle: []
	},
	redoStack: { /* holds arrays of canvas.toDataUrl() calls, in most cases on mouseup event when a drawing tool is used */
		hatch: [],
		outline: [],
		doodle: []
	},
    uploadedNewImage: false,
    //Holds anything to be drawn that isn't a location
    walls: [],
    //Temporary holding variables when creating a new wall
    wallSX: null,
    wallSY: null,
    wallEX: null,
    wallEY: null,
    warehouseAlpha: 1,
    warehouseImg: null,
    zoomLevel: 1,
    addLot: function(sx, sy, ex, ey){
        //Swap values around to make sure sx and sy are the top left
        if(sx > ex){
            var tmp = sx;
            sx = ex;
            ex = tmp;
        }
        if(sy > ey){
            var tmp = sy;
            sy = ey;
            ey = tmp;
        }        
        var index = self.locations.length;
        var loc = new LocationRect(index,sx.f2(), sy.f2(), (ex-sx).f2(), (ey-sy).f2());
        self.locations.push(loc);        
        self.locIndex++; 
    },
    addTableRow: function(index){
        var table = new irtable("locationTbl");
        table.tr();
        table.row.setAttribute("id", "locRow"+index);
        table.tdl("Location " + index);
        var selectbox = "<select>";
        var a = self.locRows.values;
        for(var i=0,z=a.length;i<z;i++){
          var loc = a[i];
          selectbox += "<option onclick='pgWarehouseMap.setLoc("+i+", "+index+")'"
            + " value='" + loc.Row + "'>" 
            + loc.Name + "</option>";
        }
        selectbox += "</select>";
        table.tdc(selectbox);
        table.tdc("<button onclick='pgWarehouseMap.delTableRow("+index+")'>Delete</button>");
    },
    addWall: function(sx, sy, ex, ey){
        //Swap values around to make sure sx and sy are the top left
        if(sx > ex){
            var tmp = sx;
            sx = ex;
            ex = tmp;
        }
        if(sy > ey){
            var tmp = sy;
            sy = ey;
            ey = tmp;
        }
        self.walls.push(new Wall(Number(sx.toFixed(2)), Number(sy.toFixed(2)), Number((ex-sx).toFixed(2)), Number((ey-sy).toFixed(2))));
    },
	applyDimensions: function(callback){   
		ir.hide("dimensionPopup");
    	var xfeet = ir.vn("dimensionPopupX");
    	var yfeet = ir.vn("dimensionPopupY");
    	var stepsize = ir.vn("dimensionPopupStep");
    	var boxsize = ir.vn("dimensionPopupBoxSize");
    	var dim = self.dimensions;
    	dim.isSet = true;
    	dim.wf = xfeet;
    	dim.hf = yfeet;
    	dim.stepSize = stepsize;
		dim.footPixel = boxsize / dim.stepSize;
    	var tmp;
    	if(dim.sx > dim.ex){
            tmp = dim.sx;
            dim.sx = dim.ex;
            dim.ex = tmp;
        }
        if(dim.sy > dim.ey){
            tmp = dim.sy;
            dim.sy = dim.ey;
            dim.ey = tmp;
        }
        dim.w = dim.ex - dim.sx;
        dim.h = dim.ey - dim.sy;
		
		var xsize = dim.footPixel * dim.wf;
		var ysize = dim.footPixel * dim.hf;
		self.hatchImg = null;
		self.hatchGenerated = false;
		
		if(self.hatchCanvas){
			self.hatchCanvas.width = xsize;//self.canvas.width;
			self.hatchCanvas.height = ysize;//self.canvas.height;
			self.doodleCanvas.width = xsize;//self.canvas.width;
			self.doodleCanvas.height = ysize;//self.canvas.height;
			self.outlineCanvas.width = xsize;//self.canvas.width;
			self.outlineCanvas.height = ysize;//self.canvas.height;
		}
    	//dim.scaleX = dim.wf / (dim.ex-dim.sx);
    	//dim.scaleY = dim.hf / (dim.ey-dim.sy);
    	self.generateGrid(callback);    	
    	
    },
    applyDimensionPopup: function(){    	
    	var xfeet = ir.vn("dimensionPopupX");
    	var yfeet = ir.vn("dimensionPopupY");
    	var stepsize = ir.vn("dimensionPopupStep");
    	var dim = self.dimensions;
    	dim.isSet = true;
    	dim.wf = xfeet;
    	dim.hf = yfeet;
    	dim.stepSize = stepsize;
    	var tmp;
    	if(dim.sx > dim.ex){
            tmp = dim.sx;
            dim.sx = dim.ex;
            dim.ex = tmp;
        }
        if(dim.sy > dim.ey){
            tmp = dim.sy;
            dim.sy = dim.ey;
            dim.ey = tmp;
        }
        dim.w = dim.ex - dim.sx;
        dim.h = dim.ey - dim.sy;
    	
    	//dim.scaleX = dim.wf / (dim.ex-dim.sx);
    	//dim.scaleY = dim.hf / (dim.ey-dim.sy);
		if(!self.loadingSave){
    		self.generateGrid();  
		}
    	var imgSlider = ir.get("whImgSlider");
      self.warehouseAlpha = imgSlider.value;
		//Used to be Mode.MOVE;
    	self.setMode(Mode.DOODLE);
    	self.enableButtons(true);
    	ir.hide("dimensionPopup");
    },
    applyCancelTextPopup: function(){
    	ir.hide("textEditPopup");
    	//self.enableButtons(true);
    },
    applyDeleteTextPopup: function(){
    	ir.hide("textEditPopup");
    	var id = ir.vn("textEditId");
    	self.textFields.splice(id, 1);
    	self.enableButtons(true);
    },
    applyEditTextPopup: function(){
    	ir.hide("textEditPopup");
    	var text = self.textFields[ir.vn("textEditId")];
    	text.text = ir.v("textEditVal");
    	text.vert = ir.bool("textEditVert");
    	text.f = ir.vn("textEditFontSize");
    	self.enableButtons(true);
    },
    applyCancelLocPopup: function(){
    	ir.hide("locEditPopup");
    	if(ir.vn("locEditDeleteOnCancel")>0){
    		var id = ir.vn("locEditId");
        	self.locations.splice(id, 1);
    	}
    	self.enableButtons(true);
    },
    applyDeleteLocPopup: function(){
    	ir.hide("locEditPopup");
    	var id = ir.vn("locEditId");
    	self.locations.splice(id, 1);
    	self.enableButtons(true);
    },
    applyEditLocPopup: function(){
    	ir.hide("locEditPopup");
    	var loc = self.locations[ir.vn("locEditId")];
    	loc.w = Math.max(self.minLocWidth,(ir.vn("locEditWidth")/self.dimensions.scaleX).f2());
    	loc.h = Math.max(self.minLocWidth,(ir.vn("locEditHeight")/self.dimensions.scaleY).f2());
    	
    	loc.f = ir.vn("locEditFont");
    	loc.loc = ir.vn("locEditLocation");
    	self.enableButtons(true);
    },
    applyCancelWallPopup: function(){
    	ir.hide("wallEditPopup");
    	self.enableButtons(true);
    },
    applyDeleteWallPopup: function(){
    	ir.hide("wallEditPopup");
    	var id = ir.vn("wallEditId");
    	self.walls.splice(id, 1);
    	self.enableButtons(true);
    },
    applyEditWallPopup: function(){
    	ir.hide("wallEditPopup");
    	var wall = self.walls[ir.vn("wallEditId")];
    	wall.w = (ir.vn("wallEditWidth")/self.dimensions.scaleX).f2();
    	wall.h = (ir.vn("wallEditHeight")/self.dimensions.scaleY).f2();
    	self.enableButtons(true);
    },
    applyTextPopup: function(){
    	var text = ir.get("textPopupVal").value;
    	if(text != ""){
    		ir.hide("textPopup");
    		self.isPlacingText = true;
	    	var isVert = ir.get("drawVerticalText").checked;
	    	var fontSize = ir.vn("textPopupFontSize");
	    	var font = ir.v("textPopupFont");
		
	    	self.textFields.push(new TextField(text, self.tempTextX, self.tempTextY, isVert, fontSize, font));
	    	self.textId = self.textFields.length-1;
	    	self.enableButtons(true);
    	}
    },
    cancelDimensionPopup: function(){
    	self.dimensions = self.dimensionsOld;
    	self.setMode(Mode.MOVE);
    	ir.hide("dimensionPopup");
    	self.enableButtons(true);
    },
    cancelSaveImagePopup: function(){
    	ir.hide("saveImagePopup");
    	self.enableButtons(true);
    },
    cancelTextPopup: function(){
    	ir.hide("textPopup");
    	//self.setMode(Mode.MOVE);
    	//self.enableButtons(true);
    },
    clear: function(){
    	if(self.ctx){
    		self.ctx.clearRect(0,0,self.canvas.width, self.canvas.height);
    	}
    },
	clickMode: function(evt){
		if(self.mouseMode && self.mouseMode.endMode){
			self.mouseMode.endMode();
		}
		var modeName = evt.target.id.substring(4,evt.target.id.length);
		console.log("clicked", modeName);
		self.mouseMode = Modes[modeName];
		self.mouseMode.setParameterBox(ir.get("paramBox"));
		
		var btns = document.getElementsByClassName("modeBtn");
		for(var i=0;i<btns.length;i++){
			btns[i].style.border = "";
			btns[i].style.backgroundColor = "";
			
			//#f8f8ff
		}
		var myBtn = ir.get("mode"+modeName);
		myBtn.style.border = "2px inset darkred";
		myBtn.style.backgroundColor = "#ddd";
	},
    close:function() {
      view.showPrevious();
    },
    deleteLocationsIfRemoved: function(){
      var imgLocs = self.locations;
    	for(var i=0;i<imgLocs;i++){
    	  var imgLoc = imgLocs[i];
    	  if (self.locRows.get(imgLoc.loc) == null){
    	    imgLocs.splice(i, 1);
    	    i--;
    	  }
    	}
    },
    delTableRow: function(index){
      var imgLocs = self.locations;
      for(var i=0,z=imgLocs.length;i<z;i++){
          if(imgLocs[i].id == index){
            imgLocs.splice(i, 1);
            break;
          }
      }
      var row = ir.get("locRow"+index);
      row.parentNode.removeChild(row);
    },
    downloadImage: function(){
    	var a  = document.createElement('a');
        a.href = ir.get("warehouseImagePopImg").src;
        a.download = "Warehouse" + self.rec.Name + "-" + irdate.ymdhmn() + ".png";
        console.log("Clicking download");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },
    drawBackground: function(){
    	//self.ctx.fillStyle = "#c0c0c7";
    	//self.ctx.fillRect(0,0,self.canvas.width, self.canvas.height);
    },
    drawCanvas: function(bypassWHImg, canvas, ctx){
    	//if(bypassWHImg || (/*self.warehouseImg!=null && self.dimensions.isSet*/)){
	        self.drawCanvasNormally(canvas, ctx);
    	//}
    	/*else if(!self.dimensions.isSet){
    		self.clear();
    		self.drawWarehouseImg();
    		self.drawDimensions();
    		self.errorMessage("You must set the dimensions of your map before continuing", "Click and drag to highlight the bounds of the warehouse");
    	}*/
    },
    drawCanvasNormally: function(canvas, ctx){
    	self.clear();
        self.drawBackground();
		if(self.gridImg){
			var canv = canvas || self.canvas;
        	var ct = ctx || self.ctx;
			ct.fillStyle = self.backgroundColor || "white";
			ct.fillRect(self.globalOffsetX,self.globalOffsetY,self.gridImg.width*self.zoomLevel,self.gridImg.height*self.zoomLevel)
		}
		
		
		self.drawCrossHatchMask(canvas, ctx);
		self.drawDoodleMap(canvas, ctx);
		self.drawGrid(canvas, ctx);
		self.drawStamps(canvas, ctx);
		self.drawLocations();
		
    
        self.drawWalls();
        self.drawTextFields();
		self.mouseMode.drawCursor(self.ctx, self.mouseX, self.mouseY,{hatchCtx:self.hatchCtx, doodleCtx:self.doodleCtx, outlineCtx:self.outlineCtx, event:event});
		
		
        if(self.mode == Mode.LOCATION){
          self.drawCurrentLoc();
        }
        else if(self.mode == Mode.WALLS){
          self.drawCurrentWall();
        }       
        else if(self.mode == Mode.EDIT){
        	var xpos = (self.mouseX-self.globalOffsetX)/self.zoomLevel;
          var ypos = (self.mouseY-self.globalOffsetY)/self.zoomLevel;        	
          var mrect = {x:xpos, y:ypos, w:1, h:1};
        	self.drawHitTestWalls(mrect);
        	self.drawHitTestText(mrect);
        	self.drawHitTestLocations(mrect);
        }        
        self.ctx.strokeStyle = "rgb(255,0,0)";
        self.ctx.fillStyle = "rgb(255,0,0)";    
    },
    drawCrossHatchMask: function(canvas, ctx){
		var canv = canvas || self.canvas;
        var ct = ctx || self.ctx;
        /// draw the shape we want to use for clipping
        //ctx1.drawImage(imgClip, 0, 0);
        
		var dim = self.dimensions;
		var sX =self.dimensions.scaleX;
		var sY =self.dimensions.scaleY;
		var xfeet = dim.wf;
    	var yfeet = dim.hf;
		var step = dim.stepSize * dim.footPixel;
		var stepX = xfeet/dim.stepSize;
		var stepY = yfeet/dim.stepSize;
        /// change composite mode to use that shape
        //ctx.globalCompositeOperation = 'xor';
        
        
		/*for(var x=0;x<canv.width;x+=xplus){
			for(var y=0;y<canv.height;y+=yplus){
				if(canvas){
					console.log("putting image at ", x, y);					
				}
				ct.drawImage(img, self.globalOffsetX+x,self.globalOffsetY+y,iw*self.zoomLevel*(1/sX), ih*self.zoomLevel*(1/sY));
			}
		}*/
		
		if(!self.hatchGenerated){
			
			
			var img = new Image();
			img.src = ir.get(self.hatchStyleImage).src;
			/// draw the image to be clipped
			//ctx.drawImage(img, 0, 0, 500, 500);
			//////
			var iw = img.naturalWidth;
			var ih = img.naturalHeight;
			var xplus = iw*(1/sX);//*self.zoomLevel;
			var yplus = ih*(1/sY);//*self.zoomLevel;
			
			
			self.hatchGenerated = true;
			var canv2 = document.createElement("canvas");
			//By foot count
			canv2.width = xfeet*dim.footPixel+1;
			canv2.height = yfeet*dim.footPixel+1;
			console.log("Generating hatch of size ", canv2.width, canv2.height, " from stepSize=", dim.stepSize, "and footPixel=", dim.footPixel, " and boxSize is ", step, " and stepX is ", stepX, " and stepY is ", stepY);
			var ctx2 = canv2.getContext("2d");
			ctx2.lineWidth = 1;
			ctx2.strokeStyle = "#fff";
			for(var x=0;x<canv2.width;x+=xplus){
				for(var y=0;y<canv2.height;y+=yplus){					
					ctx2.drawImage(img, x,y,iw*(1/sX), ih*(1/sY));
				}
			}
			var img2 = new Image();
			var dataurl = canv2.toDataURL();
			
			img2.onload = function() {
				img2.width = canv2.width;
				img2.height = canv2.height;
				pgWarehouseMap.hatchImg = img2;
			};
			img2.src = dataurl;
			
			self.hatchGenerated = true;
		}
		
        
		if(self.hatchImg){
			ct.save();
			// draw the overlay
			ct.drawImage(self.hatchImg, self.globalOffsetX, self.globalOffsetY, self.hatchImg.width*self.zoomLevel*(1/sX), self.hatchImg.height*self.zoomLevel*(1/sY));

			// change composite mode to source-in
			// any new drawing will only overwrite existing pixels
			//ct.globalCompositeOperation = "source-in";

			// draw a purple rectangle the size of the canvas
			// Only the overlay will become purple
		   // ctx.fillStyle = "purple";
			//ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);

			// change the composite mode to destination-atop
			// any new drawing will not overwrite any existing pixels
			ct.globalCompositeOperation = "destination-atop";

			// draw the full logo
			ct.drawImage(self.hatchCanvas, self.globalOffsetX, self.globalOffsetY, self.hatchCanvas.width*self.zoomLevel*(1/sX), self.hatchCanvas.height*self.zoomLevel*(1/sY));
			// restore the context to it's original state
			ct.restore();
		}
    },
	drawDoodleMap: function(canv, ct){
		var canvas = canv || self.canvas;
		var ctx = ct || self.ctx;
		ctx.fillStyle = "white";
		var sX =self.dimensions.scaleX;
		var sY =self.dimensions.scaleY;
		ctx.drawImage(self.outlineCanvas, self.globalOffsetX, self.globalOffsetY, self.outlineCanvas.width*self.zoomLevel*(1/sX), self.outlineCanvas.height*self.zoomLevel*(1/sY));
		ctx.drawImage(self.doodleCanvas, self.globalOffsetX, self.globalOffsetY, self.doodleCanvas.width*self.zoomLevel*(1/sX), self.doodleCanvas.height*self.zoomLevel*(1/sY));
	},
    drawCurrentLoc: function(){
        self.ctx.lineWidth = 1;
        self.ctx.strokeStyle = "rgb(0, 100, 0)";
        self.ctx.setLineDash([3, 3]);        
        self.ctx.strokeRect(self.globalOffsetX+self.locationSX*self.zoomLevel, 
                               self.globalOffsetY+self.locationSY*self.zoomLevel, 
                               (self.locationEX - self.locationSX)*self.zoomLevel, 
                               (self.locationEY - self.locationSY)*self.zoomLevel);
        self.ctx.setLineDash([]);
        var dim = self.dimensions;
        var xfeet = ((self.locationEX - self.locationSX)*dim.scaleX).f2();
        var yfeet = ((self.locationEY - self.locationSY)*dim.scaleY).f2();
        
        self.setFont(24);
        self.ctx.fillStyle = "rgb(0, 0, 0)";
        if(self.locationEX != null && self.locationEY != null && self.locationSX != null && self.locationSY != null){
	        var width = (self.locationEX - self.locationSX)/2;
	        var height = (self.locationEY - self.locationSY)/2;
	        var xfi = self.feetToFootInches(xfeet);
	        var yfi = self.feetToFootInches(yfeet);
	        var txt = xfi.feet + "' "+xfi.inches+"\" x " + yfi.feet + "' "+yfi.inches+"\"";
	        self.ctx.fillText(txt, 
	        		self.globalOffsetX+(self.locationEX-width-self.ctx.measureText(txt).width/2/self.zoomLevel)*self.zoomLevel, 
              self.globalOffsetY+(self.locationEY-height+(12/self.zoomLevel))*self.zoomLevel);
        }
    },
    drawCurrentWall: function(){
        self.ctx.lineWidth = 1;
        self.ctx.strokeStyle = "rgb(0, 100, 0)";
        self.ctx.setLineDash([3, 3]);
        
        self.ctx.strokeRect(self.globalOffsetX+self.wallSX*self.zoomLevel, 
                               self.globalOffsetY+self.wallSY*self.zoomLevel, 
                               (self.wallEX - self.wallSX)*self.zoomLevel, 
                               (self.wallEY - self.wallSY)*self.zoomLevel);
        self.ctx.setLineDash([]);
    },
    drawDimensions: function(){
    	self.ctx.strokeStyle = "rgb(0,255,0)";
    	self.ctx.fillStyle = "rgba(0,230,0,0.4)";
    	self.ctx.lineWidth = 2;
    	var dim = self.dimensions;
    	self.ctx.fillRect(self.globalOffsetX+dim.sx*self.zoomLevel, 
                self.globalOffsetY+dim.sy*self.zoomLevel, 
                (dim.ex - dim.sx)*self.zoomLevel, 
                (dim.ey - dim.sy)*self.zoomLevel);
    	self.ctx.strokeRect(self.globalOffsetX+dim.sx*self.zoomLevel, 
                               self.globalOffsetY+dim.sy*self.zoomLevel, 
                               (dim.ex - dim.sx)*self.zoomLevel, 
                               (dim.ey - dim.sy)*self.zoomLevel);
    },
    drawGrid: function(canv, ct){
		var ctx = ct || self.ctx;
    	ctx.globalAlpha = self.warehouseAlpha;
    	ctx.mozImageSmoothingEnabled = false;
    	ctx.webkitImageSmoothingEnabled = false;
    	ctx.msImageSmoothingEnabled = false;
    	ctx.imageSmoothingEnabled = false;
		
		var sX =self.dimensions.scaleX;
		var sY =self.dimensions.scaleY;
    	var img = self.gridImg;
    	if(img != null){
			
			if(!self.drawGridOutside){
				self.gridCtx.mozImageSmoothingEnabled = false;
				self.gridCtx.webkitImageSmoothingEnabled = false;
				self.gridCtx.msImageSmoothingEnabled = false;
				self.gridCtx.imageSmoothingEnabled = false;
				
				self.gridCtx.fillStyle = "#fff";
				self.gridCtx.fillRect(0,0,self.gridCanvas.width,self.gridCanvas.height)
	        	self.gridCtx.drawImage(img,0,0,img.width*(1/sX),img.height*(1/sY));
				self.gridCtx.globalCompositeOperation = "destination-atop";
				self.gridCtx.drawImage(self.doodleCanvas, 0, 0, self.doodleCanvas.width*(1/sX), self.doodleCanvas.height*(1/sY));
    			self.gridCtx.globalCompositeOperation = "source-over";
				ctx.drawImage(self.gridCanvas,
					self.globalOffsetX, 
					self.globalOffsetY, 
					self.gridCanvas.width*self.zoomLevel*(1/sX),
					self.gridCanvas.height*self.zoomLevel*(1/sY));
				self.gridCtx.mozImageSmoothingEnabled = true;
				self.gridCtx.webkitImageSmoothingEnabled = true;
				self.gridCtx.msImageSmoothingEnabled = true;
				self.gridCtx.imageSmoothingEnabled = true;
			}else{
				ctx.drawImage(img,
				self.globalOffsetX, 
				self.globalOffsetY, 
				self.gridCanvas.width*self.zoomLevel*(1/sX),
				self.gridCanvas.height*self.zoomLevel*(1/sY));
			}
			
		}
    	ctx.globalAlpha = 1;
    	ctx.mozImageSmoothingEnabled = true;
    	ctx.webkitImageSmoothingEnabled = true;
    	ctx.msImageSmoothingEnabled = true;
    	ctx.imageSmoothingEnabled = true;
    },
    drawHitTest : function(rect1, rect2) {
		if (rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x
				&& rect1.y < rect2.y + rect2.h && rect1.h + rect1.y > rect2.y) {
			self.outlineRectForEdit(rect2, "#ff000088");
			return true;
		}
		self.outlineRectForEdit(rect2);
		return false;
	},
    drawHitTestLocations: function(mrect){
		for(var i=0;i<self.locations.length;i++){
			self.drawHitTest(mrect, self.locations[i]);
		}
	},
	drawHitTestText: function(mrect){
		for(var i=0;i<self.textFields.length;i++){
			var txt = self.textFields[i];
			var rect = self.getTextBounds(txt);
			self.drawHitTest(mrect, rect);
		}
	},
	drawHitTestWalls: function(mrect){
		for(var i=0;i<self.walls.length;i++){
			var rect = self.walls[i];
			self.drawHitTest(mrect, rect);
		}
	},
    /** Try and match the set location to the lots currently there. If it matches, 
    * draw a bunch of information to the canvas about the lot
    */
    drawLocationDetails: function(){
		return;
      var locs = self.locations;
      var lots = self.lots;
      var seeds = self.seeds;
      var lotZ = lots.length;
      for(var n=0,z=locs.length;n<z;n++){
          var locRect = locs[n];
          self.ctx.fillStyle = "#000";
          self.ctx.strokeStyle = "#000";
          self.ctx.setLineDash([4*self.zoomLevel, 4*self.zoomLevel]);
          self.ctx.lineWidth = self.zoomLevel;
          self.ctx.strokeRect(
              self.globalOffsetX+locRect.x*self.zoomLevel+2, self.globalOffsetY+locRect.y*self.zoomLevel+2,
              locRect.w*self.zoomLevel-4, 
              locRect.h*self.zoomLevel-4);
          self.ctx.setLineDash([]);
          var lotList = [];
          for(var i=0;i<lotZ; i++){
              var lot = lots[i];
              if(locRect.loc == lot.Location){
                  lotList.push(lot);
              }
          }
          for (var j=0,y=seeds.length;j<y;j++) {
            var seed = seeds[j];
            if (locRect.loc == seed.Location) {
              lotList.push(seed);
            }
          }
          if(lotList.length > 1){
          	if(locRect.w > locRect.h){
          		  self.locationDetailsHoriMult(locRect, lotList);
              }else{
              	self.locationDetailsVertMult(locRect, lotList);
              }
          }
          else if(lotList.length == 1){
          	if(locRect.w > locRect.h){
              self.locationDetailsHori(locRect, lotList[0]);
            }else{
              self.locationDetailsVert(locRect, lotList[0]);
            }
          }
        }
    },
    drawLocations: function(){
        self.ctx.lineWidth = 3;
        var locs = self.locations;
        for(var i=0,z=locs.length;i<z;i++){
            var imgLoc = locs[i];
            self.ctx.strokeRect(
                self.globalOffsetX + imgLoc.x * self.zoomLevel, 
                self.globalOffsetY + imgLoc.y * self.zoomLevel, 
                imgLoc.w * self.zoomLevel, 
                imgLoc.h * self.zoomLevel);             
            self.setFont(Math.min(imgLoc.w,imgLoc.h) * self.zoomLevel / 2);
            self.ctx.fillStyle = "#000";
            var locRow = (self.locRows.get(imgLoc.loc) || {Name:"?" + imgLoc.loc});
            var locText = locRow.Name;
            var nameText = "";
            if(locRow.Row > 0){
            	nameText = self.rec.Name + locText;
            }
            self.setFontToFit(nameText,imgLoc.w * self.zoomLevel, Math.min(imgLoc.w,imgLoc.h) * self.zoomLevel / 2);
            self.ctx.fillText(nameText,
            self.globalOffsetX + (imgLoc.x-self.ctx.measureText(nameText).width/2/self.zoomLevel)*self.zoomLevel + (imgLoc.w*self.zoomLevel)/2, 
            self.globalOffsetY+imgLoc.y*self.zoomLevel+((imgLoc.h*self.zoomLevel)/1.5));
        }
    },
	drawStamps: function(canv,ct){
		var ctx = ct || self.ctx;
        var stamps = self.stamps;
        var sX =self.dimensions.scaleX;
		var sY =self.dimensions.scaleY;
        
        for(var i=0,z=stamps.length;i<z;i++){
            var st = stamps[i];
			if(st.img == null){
				st.img = new Image();
				st.img.src = st.path;
			}
			Modes.StampTool.drawImageRotated(ctx,st.img, self.globalOffsetX + (st.x * self.zoomLevel*(1/sX)),self.globalOffsetY + (st.y * self.zoomLevel*(1/sY)), st.w * self.zoomLevel*(1/sX), st.h * self.zoomLevel*(1/sY), st.angle);
        }
    },
    drawTextFields: function(){
    	self.ctx.lineWidth = 1;
      for(var i=0;i<self.textFields.length;i++){
        var textField = self.textFields[i];            
        self.ctx.fillStyle = "#000";
        self.setFont(textField.f * self.zoomLevel, textField.font);
        var text = textField.text;
        var textLines = text.split(/\r?\n/g);
        var id = self.textId;
        //var offx = id==i?0:self.globalOffsetX;
      	//var offy = id==i?0:self.globalOffsetY;
      	//var zoom = id==i?1:self.zoomLevel;
		var offx = self.globalOffsetX;
		var offy = self.globalOffsetY;
		var zoom = self.zoomLevel;
        if(textField.vert){
            self.ctx.save();
            self.ctx.rotate(-Math.PI/2);
            for(var j = 0;j < textLines.length; j++){
              self.ctx.fillText(textLines[j],
              		(offy+(textField.y*zoom))*-1, 
              		offx+(textField.x*zoom)+(textField.f*self.zoomLevel*j));
            }
        	self.ctx.restore();
        }
        else{
        	for(var j = 0;j < textLines.length; j++){
              self.ctx.fillText(textLines[j],
            		offx+(textField.x*zoom), 
            		offy+(textField.y*zoom)+(textField.f*self.zoomLevel*j));
        	}
        }
      }
    },
    drawWalls: function(){
        self.ctx.lineWidth = 3;
        for(var i=0;i<self.walls.length;i++){
            var wall = self.walls[i];
            if(self.mode == 4){
                self.ctx.fillStyle = "#404040";
            }else{
                self.ctx.fillStyle = "#9d00ff";
            }
            self.ctx.fillRect(
                self.globalOffsetX+wall.x*self.zoomLevel, self.globalOffsetY+wall.y*self.zoomLevel, 
                wall.w*self.zoomLevel, 
                wall.h*self.zoomLevel);
            
        }
    },
    drawLoop: function(){
    	self.animationId = requestAnimFrame(self.drawLoop);
    	if(self.ctx){
    		self.drawCanvas();
    	}
    },
    drawWarehouseImg: function(){
        if(self.warehouseImg != null){
        	self.ctx.globalAlpha = self.warehouseAlpha;
            var img = self.warehouseImg;
            self.ctx.drawImage(img,
                                  self.globalOffsetX, 
                                  self.globalOffsetY, 
                                  img.width*self.zoomLevel,
                                  img.height*self.zoomLevel);
        }
        self.ctx.globalAlpha = 1;
    },
    enableButtons: function(enable){
    	ir.enable("whImgSlider", enable);
    	ir.enable("whBtnMove", enable);
    	ir.enable("whBtnLoc", enable);
    	ir.enable("whBtnWalls", enable);
    	ir.enable("whBtnText", enable);
    	ir.enable("whBtnPreview", enable);
    	ir.enable("whBtnEdit", enable);
    },
    errorMessage: function(message, subMessage){
  		self.setFont(26,"bold");
  		var txt = message;
  		self.ctx.fillStyle = self.beanColour;
  		self.ctx.fillRect((self.canvas.width/2 - self.ctx.measureText(txt).width/2)-10, 
  				(self.canvas.height/2)-32, 
  				self.ctx.measureText(txt).width + 20, 
  				46);
  		self.ctx.fillStyle = "rgb(230,230,230)";
  		self.ctx.fillText(txt, self.canvas.width/2 - self.ctx.measureText(txt).width/2, self.canvas.height/2);
  		if(subMessage){
  			self.setFont(26,"bold");
  			txt = subMessage;
  			self.ctx.fillStyle = self.beanColour;
  			self.ctx.fillRect((self.canvas.width/2 - self.ctx.measureText(txt).width/2)-10, 
  					(self.canvas.height/2+10), 
  					self.ctx.measureText(txt).width + 20, 
  					46);
  			self.ctx.fillStyle = "rgb(230,230,230)";
  			self.ctx.fillText(txt, self.canvas.width/2 - self.ctx.measureText(txt).width/2, self.canvas.height/2 + 36);
  		  }
    },
    feetToFootInches: function(feet){
    	var f = parseInt(feet);
    	var i = parseInt((feet-f)*12);
    	return {feet: f, inches: i};
    },
    /** will set font size in context for largest font within range passed for which
     * the passed text fits in the width passed.  Returns font size on success, or 0
     * on failure.
     */ 
    findFontSize:function(width,text,minFontSize,maxFontSize) {
      for (var fontSize=maxFontSize;fontSize>=minFontSize;fontSize--) {
        self.setFont(fontSize);
        var textWidth = self.ctx.measureText(text); 
        if (textWidth.width <= width) {
          return fontSize;
        }
      }
      return 0;
    },
    fitIntoRectRatio: function(w, h, rectW, rectH){
    	var scale = Math.min(rectW/w, rectH/h);
    	return {w:w*scale, h:h*scale};
    },
    generateGrid: function(callback){
    	var dim = self.dimensions;
    	var xfeet = dim.wf;
    	var yfeet = dim.hf;
		var step = dim.stepSize * dim.footPixel;
		var stepX = xfeet/dim.stepSize;
		var stepY = yfeet/dim.stepSize;
    	var canv = document.createElement("canvas");
    	//canv.width = dim.w;
    	//canv.height = dim.h;
    	//By box count
		canv.width = step*xfeet;
    	canv.height = step*yfeet;
		//By foot count
		canv.width = xfeet*dim.footPixel+1;
    	canv.height = yfeet*dim.footPixel+1;
		console.log("Generating grid of size ", canv.width, canv.height, " from stepSize=", dim.stepSize, "and footPixel=", dim.footPixel, " and boxSize is ", step, " and stepX is ", stepX, " and stepY is ", stepY);
		var ctx = canv.getContext("2d");
    	ctx.lineWidth = 2;
    	ctx.strokeStyle = "#000";
		//ctx.fillStyle = "#fff";
    	ctx.beginPath();
		//ctx.fillRect(0,0,canv.width, canv.height);
    
		//Based on w/h vals being how many boxes get built
		/*for(var x=0;x<step*xfeet;x+=step){
			ctx.moveTo(Math.floor(x/dim.scaleX), 0);
    		ctx.lineTo(Math.floor(x/dim.scaleX), canv.height);
		}
		for(var y=0;y<step*yfeet;y+=step){
			ctx.moveTo(0, Math.floor(y/dim.scaleY));
    		ctx.lineTo(canv.width, Math.floor(y/dim.scaleY));
		}*/
		//Based on w/h being the amount of feet you enter
		for(var x=0;x<stepX;x+=1){
			ctx.moveTo(Math.floor(x*step/dim.scaleX), 0);
    		ctx.lineTo(Math.floor(x*step/dim.scaleX), canv.height);
		}
		for(var y=0;y<stepY;y+=1){			
			ctx.moveTo(0, Math.floor(y*step/dim.scaleY));
    		ctx.lineTo(canv.width, Math.floor(y*step/dim.scaleY));
		}
		
    	ctx.stroke();
    	var img = new Image();
    	var dataurl = canv.toDataURL();
    	img.onload = function() {
            img.width = xfeet*dim.footPixel;
            img.height = yfeet*dim.footPixel;
            self.gridImg = img;
			self.gridCanvas.width = img.width;
			self.gridCanvas.height = img.height;
			console.log("gridimg width and height are ", img.width, img.height);
			if(callback && pgWarehouseMap.loadingSave){
				pgWarehouseMap.loadingSave = false;
				callback();
			}
        };
        img.src = dataurl;
    },
    getColor:function(lotList) {
      var color = "4af";
      if (lotList.length>0) {
        var lot = lotList[0];
        if (lot.LotNum) {
          color = lot.Color;
        } else {
          color = lot.getVariety().getCrop().Color || color;
        }
      }
      return "#" + color;
    },
    getTextBounds: function(textField){
    	self.setFont(textField.f * self.zoomLevel);
  		var textLines = textField.text.split(/\r?\n/g);
  		var textSizeArray = [];
  		for (var n=0;n<textLines.length; n++){
  			textSizeArray[n] = self.ctx.measureText(textLines[n]).width;
  		}
  		var newx = 0, newy = 0, neww = 0, newh = 0;
  		if(textField.vert){
  			newx = textField.x - textField.f;
  			newy = textField.y-(Array.max(textSizeArray)/self.zoomLevel);
  			neww = textField.f*textLines.length;//*self.zoomLevel;
  			newh = Array.max(textSizeArray)/self.zoomLevel;
  		}else{
  			newx = textField.x;
  			newy = textField.y - textField.f;
  			neww = Array.max(textSizeArray)/self.zoomLevel;
  			newh = textField.f*textLines.length;//*self.zoomLevel;
  		}
  		return {x:newx.f2(), y:newy.f2(), w:neww.f2(), h:newh.f2()};
    },
    getScaledTextBounds: function(textField){
     	self.setFont(textField.f * self.zoomLevel);
  		var textLines = textField.text.split(/\r?\n/g);
  		var textSizeArray = [];
  		for (var n=0;n<textLines.length; n++){
  			textSizeArray[n] = self.ctx.measureText(textLines[n]).width;
  		}
  		var newx = 0, newy = 0, neww = 0, newh = 0;
  		if(textField.vert){
  			newx = textField.x - textField.f;
  			newy = textField.y-(Array.max(textSizeArray)/self.zoomLevel);
  			neww = textField.f*textLines.length*self.zoomLevel;
  			newh = Array.max(textSizeArray);
  		}else{
  			newx = textField.x;
  			newy = textField.y - textField.f;
  			neww = Array.max(textSizeArray);
  			newh = textField.f*textLines.length*self.zoomLevel;
  		}
  		newx = self.globalOffsetX + newx*self.zoomLevel;
  		newy = self.globalOffsetY + newy*self.zoomLevel;
  		return {x:newx.f2(), y:newy.f2(), w:neww.f2(), h:newh.f2()};
    },
  /** check if two rectangular objects are touching one another */
	hitTest : function(rect1, rect2) {
		if (rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x
				&& rect1.y < rect2.y + rect2.h && rect1.h + rect1.y > rect2.y) {
			return true;
		}
		return false;
	},
	hitTestStamps: function(mrect){
	  var a = self.stamps;
		for(var i=0,z=a.length;i<z;i++){
			var b = a[i]
			//if(self.hitTest(mrect,{x:b.x-b.w/2, y:b.y-b.h/2, w:b.w, h:b.h})){
			if(self.hitTest(mrect,b)){
				return i;
			}
		}
		return null;
	},
	//Passed a rectangle object describing the location of the mouse before it's scaled or moved
	hitTestLocations: function(mrect){
	  var a = self.locations;
		for(var i=0,z=a.length;i<z;i++){
			if(self.hitTest(mrect,a[i])){
				return i;
			}
		}
		return null;
	},
	hitTestText: function(mrect){
	  var a = self.textFields;
		for(var i=0,z=a.length;i<z;i++){
			var rect = self.getTextBounds(a[i]);
			if(self.hitTest(mrect, rect)){
				return i;
			}
		}
		return null;
	},
	hitTestWalls: function(mrect){
        var a = self.walls;
        for(var i=0,z=a.length;i<z;i++){
			if(self.hitTest(mrect, a[i])){
				return i;
			}
		}
		return null;
	},
	imageClick:function(evn) {
		evn = evn || window.event;
		if (evn) {
			var clickX=evn.offsetX, clickY=evn.offsetY, imgH=evn.target.clientHeight, imgW=evn.target.clientWidth;
			var realHeight=evn.target.naturalHeight;
			var realWidth=evn.target.naturalWidth;
			var xRatio=realHeight/imgH, yRatio=realWidth/imgW;
			var xNorm=clickX*xRatio, yNorm=clickY*yRatio;
			var mapIndex = self.hitTestLocations({x:xNorm,y:yNorm,w:1,h:1});
			if(mapIndex != undefined){
				self.popupDetailsBox(mapIndex, true);
			}
		}
	},
  init:function(){
    	if(!self.isRunning){
	        //locations = [{}];
	        self.canvas = document.getElementById("warehouseCanvas");
	        self.ctx = self.canvas.getContext("2d");
			
			self.canvas.width = ir.winWidth()-6 ;
			self.canvas.height = ir.winHeight()-90;
	  		
	  		//self.dimensions.ex = self.canvas.width-20;
	  		//self.dimensions.ey = self.canvas.height-20;
			var xsize = 200;
			var ysize = 100;
			ir.set("dimensionPopupX", xsize);
			ir.set("dimensionPopupY", ysize);
			ir.set("dimensionPopupBoxSize", 50);
			
			self.applyDimensions();
			
			self.zoom(0,true);
			
			xsize = self.dimensions.footPixel * self.dimensions.wf;
			ysize = self.dimensions.footPixel * self.dimensions.hf;
            
            self.hatchCanvas = document.createElement('canvas');
            self.hatchCanvas.width = xsize;//self.canvas.width;
            self.hatchCanvas.height = ysize;//self.canvas.height;
            self.hatchCtx = self.hatchCanvas.getContext('2d');
            self.hatchCtx.fillStyle = "rgba(0,0,0,0)";
            self.hatchCtx.fillRect(0,0,self.hatchCanvas.width,self.hatchCanvas.height);
            self.doodleCanvas = document.createElement('canvas');
            self.doodleCanvas.width = xsize;//self.canvas.width;
            self.doodleCanvas.height = ysize;//self.canvas.height;
            self.doodleCtx = self.doodleCanvas.getContext('2d');
            self.doodleCtx.fillStyle = "rgba(0,0,0,0)";
            self.doodleCtx.fillRect(0,0,self.doodleCanvas.width,self.doodleCanvas.height);
			self.outlineCanvas = document.createElement('canvas');
            self.outlineCanvas.width = xsize;//self.canvas.width;
            self.outlineCanvas.height = ysize;//self.canvas.height;
            self.outlineCtx = self.outlineCanvas.getContext('2d');
            self.outlineCtx.fillStyle = "rgba(0,0,0,0)";
            self.outlineCtx.fillRect(0,0,self.outlineCanvas.width,self.outlineCanvas.height);
			
			self.gridCanvas = document.createElement("canvas");
			self.gridCanvas.width = xsize;
			self.gridCanvas.height = ysize;
			self.gridCtx = self.gridCanvas.getContext("2d");
			self.gridCtx.fillStyle = "rgba(0,0,0,0)";
            self.gridCtx.fillRect(0,0,self.gridCanvas.width,self.gridCanvas.height);
			
			
	        document.getElementById("imageUpload").addEventListener("change", self.readImage, false);
			document.getElementById("stampUpload").addEventListener("change", Modes.StampTool.readAddStamp, false);
	        self.canvas.addEventListener("mousewheel", self.handleMouseScroll);
	        self.canvas.addEventListener("DOMMouseScroll", self.handleMouseScroll);	        
	        self.canvas.addEventListener("mousemove", self.onMouseMove, false);
	        self.canvas.addEventListener("mousedown", self.onMouseDown, false);	  
	        self.canvas.addEventListener("mouseup", self.onMouseUp, false);	 
	        document.addEventListener("keyup", self.onKeyUp, false);	 
			
				        
	        self.canvas.addEventListener("touchmove", self.onMouseMove, false);
	        self.canvas.addEventListener("touchstart", self.onMouseDown, false);	  
	        self.canvas.addEventListener("touchend", self.onMouseUp, false);	
	        var imgSlider = ir.get("whImgSlider");
	        imgSlider.value = 0.4;
	        self.warehouseAlpha = 0.4;
	        imgSlider.oninput = function(){self.warehouseAlpha = this.value;ir.get("whImgLabel").innerHTML="Background Visibility: "+(this.value*100).toFixed()+"%";};
	        //Need this one for IE - won't get realtime opacity changing, but good enough
	        imgSlider.onchange = function(){self.warehouseAlpha = this.value;ir.get("whImgLabel").innerHTML="Background Visibility: "+(this.value*100).toFixed()+"%";};
	        //Disable all the buttons so the user can't mess with things before certain values are set up
	        //self.enableButtons(false);
			self.enableButtons(true);
	        self.deleteLocationsIfRemoved();	        
	        self.isRunning = true;	        
	        if(self.dimensions.wf != null){
	        	self.generateGrid();
	        }
			
			//Things to call once everything is all loaded
			self.clickMode({target:ir.get("modeSnapToGrid")});
			self.updateUndoStack();
			
	        //Set up animation, using requestAnimationFrame is the smoothest option, works a lot better than a setTimeout/setInterval
	        window.requestAnimFrame = function(){
	            return (
	                window.requestAnimationFrame       || 
	                window.webkitRequestAnimationFrame || 
	                window.mozRequestAnimationFrame    || 
	                window.oRequestAnimationFrame      || 
	                window.msRequestAnimationFrame     || 
	                function(/* function */ callback){
	                    window.setTimeout(callback, 1000 / 60);
	                }
	            );
	        }();
	        self.drawLoop();
    	}
    },
    handleMouseScroll: function(e){
        var evn = window.event || e; // old IE support
        evn.preventDefault();
        var delta = Math.max(-1, Math.min(1, (evn.wheelDelta || -evn.detail)));
        self.zoom(delta);
    },
	loadFile: function(data){
		console.log("load file called");
			//JSON parse data into objects
		try{
			var obj = JSON.parse(data);
			pgWarehouseMap.loadingSave = true;
			self.dimensions = obj.dimensions;
			console.log("Save file dimensions are ", self.dimensions);
			ir.set("dimensionPopupX", self.dimensions.wf);
    		ir.set("dimensionPopupY", self.dimensions.hf);
    		ir.set("dimensionPopupStep", self.dimensions.stepSize);
    		ir.set("dimensionPopupBoxSize", self.dimensions.footPixel * self.dimensions.stepSize);
			
			
			self.applyDimensions(function(){
				self.gridImg.src = obj.grid;
				console.log("Drawing data from save file to canvases");
				var hatch = new Image();
				hatch.src = obj.hatchCanvas;
				var out = new Image();
				out.src = obj.outlineCanvas;
				var doodle = new Image();
				doodle.src = obj.doodleCanvas;
				doodle.onload = function(){
					self.doodleCtx.clearRect(0,0,self.doodleCanvas.width, self.doodleCanvas.height);
					self.doodleCtx.drawImage(doodle,0,0,self.doodleCanvas.width, self.doodleCanvas.height);
				}
				out.onload = function(){
					self.outlineCtx.clearRect(0,0,self.outlineCanvas.width, self.outlineCanvas.height);
					self.outlineCtx.drawImage(out,0,0,self.outlineCanvas.width, self.outlineCanvas.height);
				}
				hatch.onload = function(){
					self.hatchCtx.clearRect(0,0,self.hatchCanvas.width, self.hatchCanvas.height);
					self.hatchCtx.drawImage(hatch,0,0,self.hatchCanvas.width, self.hatchCanvas.height);
				}
					
				var hat = new Image();
				hat.src = obj.hatchImg;

				
				
				
				self.hatchImg = hat;
				self.stamps = JSON.parse(obj.stamps);
				self.stamps.forEach((st, i)=>{
					if(st.img == null || st.img.src == null){
						console.log("Setting stamp img to ", st.path);
						st.img = new Image();
						st.img.src = st.path;
						
					}
					st.ratio = st.ratio || 1;
				})
			});
			
		}
		catch(e){
			throw(e);
			return;
		}
	},
    locationDetailsHori: function(locRect, lot){
        self.ctx.strokeStyle = "#000";
        self.ctx.fillStyle = self.getColor([lot]);
        //Background of location
        self.ctx.fillRect(self.globalOffsetX+locRect.x*self.zoomLevel, self.globalOffsetY+locRect.y*self.zoomLevel, locRect.w*self.zoomLevel, locRect.h*self.zoomLevel);
        self.ctx.lineWidth = 1;
        //Black outline for location
        self.ctx.strokeRect(self.globalOffsetX+locRect.x*self.zoomLevel, self.globalOffsetY+locRect.y*self.zoomLevel, locRect.w*self.zoomLevel, locRect.h*self.zoomLevel);
        //self.setFont(locRect.h * self.zoomLevel / 3 - 3);
        self.setFont(Math.min(lot.w,lot.h) * self.zoomLevel / 2);
        self.ctx.fillStyle = "rgb(0, 0, 0)";
        var nameText = self.nameText(lot);
        self.setFontToFit(nameText,(locRect.w - 4) * self.zoomLevel, Math.min(locRect.w,locRect.h) * self.zoomLevel / 2);        	
        var x = self.globalOffsetX + (locRect.x + 5) * self.zoomLevel;
        var y = self.globalOffsetY + locRect.y * self.zoomLevel + ((locRect.h*self.zoomLevel)/2);
        self.ctx.fillText(nameText, x, y);
   },
   locationDetailsHoriMult: function(locRect, lotList){
     self.ctx.strokeStyle = "#000";
     self.ctx.fillStyle = self.getColor(lotList);
     //Background of location
     self.ctx.fillRect(self.globalOffsetX+locRect.x*self.zoomLevel, self.globalOffsetY+locRect.y*self.zoomLevel, locRect.w*self.zoomLevel, locRect.h*self.zoomLevel);
     self.ctx.lineWidth = 1;
     //Black outline for location
     self.ctx.strokeRect(self.globalOffsetX + locRect.x * self.zoomLevel, 
           self.globalOffsetY + locRect.y * self.zoomLevel, 
           locRect.w * self.zoomLevel, locRect.h * self.zoomLevel);
     var isMostlySquare = ((locRect.w/locRect.h) > 0.5 && (locRect.w/locRect.h) < 2);
     var numOfLines = isMostlySquare?6:3;
     self.setFont(locRect.h * self.zoomLevel / numOfLines - 3);
     var width = Math.max(10, locRect.w*self.zoomLevel-10);
     var nameText = self.nameText(lotList);
     //var splitNames = self.splitTextOnWidth(nameText, width, ",");
     var splitNames = self.lotLines(lotList,numOfLines);
     var longest = splitNames[0];
     for (var i=1;i<splitNames.length;i++) {
       if (splitNames[i].length > longest.length) {
         longest = splitNames[i];
       }
     }
     if (0 == self.findFontSize(width,longest,self.minFontPx,locRect.h*self.zoomLevel/numOfLines)) {
       self.setFont(self.minFontPx);
     }
     self.ctx.fillStyle = "rgb(0, 0, 0)";
     var lineHeight = (((locRect.h*self.zoomLevel)/numOfLines)-3);
     for(var i=0;i<splitNames.length;i++){
          self.ctx.fillText(splitNames[i], 
             self.globalOffsetX+(locRect.x+ 5)*self.zoomLevel, 
             self.globalOffsetY+locRect.y*self.zoomLevel+lineHeight*(i+1),width);
     }        
   },
    locationDetailsVert: function(locRect, lot){
        self.ctx.strokeStyle = "#000";
        self.ctx.fillStyle = self.getColor([lot]);
        //Background of location
        self.ctx.fillRect(self.globalOffsetX+locRect.x*self.zoomLevel, self.globalOffsetY+locRect.y*self.zoomLevel, locRect.w*self.zoomLevel, locRect.h*self.zoomLevel);
        self.ctx.lineWidth = 1;
        //Black outline for location
        self.ctx.strokeRect(self.globalOffsetX+locRect.x*self.zoomLevel, self.globalOffsetY+locRect.y*self.zoomLevel, locRect.w*self.zoomLevel, locRect.h*self.zoomLevel);
        //Drawing rotated text is done by rotating the entire canvas, saving the context lets us mess with things, then revert to exactly how it was when we started
        self.ctx.save();
        //Rotate CCW 90 degrees
        self.ctx.rotate(-Math.PI/2);
        self.setFont(locRect.w * self.zoomLevel / 6 - 3);
        self.ctx.fillStyle = "rgb(0, 0, 0)";
        var height = Math.max(10, locRect.h*self.zoomLevel-10);
        var nameText = self.nameText(lot);
        var splitNames = self.splitTextOnWidth(nameText, height, " ");
        self.ctx.fillStyle = "rgb(0, 0, 0)";
        var lineHeight = (((locRect.w*self.zoomLevel)/6)-3);
        for(var i=0;i<splitNames.length;i++){
            self.ctx.fillText(splitNames[i], 
            		(self.globalOffsetY+(locRect.y+locRect.h)*self.zoomLevel - 10)*-1, 
            		self.globalOffsetX+locRect.x*self.zoomLevel+lineHeight*(i+1));
        }
        self.ctx.restore();        
    },
    locationDetailsVertMult: function(locRect, lotList){
        self.ctx.strokeStyle = "#000";
        self.ctx.fillStyle = self.getColor(lotList);
        //Background of location
        self.ctx.fillRect(self.globalOffsetX+locRect.x*self.zoomLevel, self.globalOffsetY+locRect.y*self.zoomLevel, locRect.w*self.zoomLevel, locRect.h*self.zoomLevel);
        self.ctx.lineWidth = 1;
        //Black outline for location
        self.ctx.strokeRect(self.globalOffsetX+locRect.x*self.zoomLevel, self.globalOffsetY+locRect.y*self.zoomLevel, locRect.w*self.zoomLevel, locRect.h*self.zoomLevel);
        //Drawing rotated text is done by rotating the entire canvas, saving the context lets us mess with things, then revert to exactly how it was when we started
        self.ctx.save();
        //Rotate CCW 90 degrees
        self.ctx.rotate(-Math.PI/2);
        self.setFont(locRect.w * self.zoomLevel / 6 - 3);
        var height = Math.max(10, locRect.h*self.zoomLevel-10);
        var nameText = self.nameText(lotList);
        var splitNames = self.splitTextOnWidth(nameText, height, ",");
        self.ctx.fillStyle = "rgb(0, 0, 0)";
        var lineHeight = (((locRect.w*self.zoomLevel)/6)-3);
        for(var i=0;i<splitNames.length;i++){
            self.ctx.fillText(splitNames[i], 
            		(self.globalOffsetY+(locRect.y+locRect.h)*self.zoomLevel - 10)*-1, 
            		self.globalOffsetX+locRect.x*self.zoomLevel+lineHeight*(i+1));
        }
        self.ctx.restore();
    },
    /** pgWarehouseMap.lotLines returns array of strings */
    lotLines: function(lotList,lineCount) {
      var names = [];
      for (var i=0;i<lotList.length;i++) {
        var n = self.nameText(lotList[i]);
        if (ir.indexOf(names,n)==-1) {
          names.push(n);
        }
      }
      var result = [];
      var lotsPerLine = Math.ceil(names.length / lineCount); 
      for (var i=0;i<lineCount;i++) {
        var semiColon = "";
        var start = i * lotsPerLine;
        for (var j = start;j < Math.min(names.length,start + lotsPerLine);j++) {
          result[i] = (result[i] || "") + semiColon + names[j];
          semiColon = "; ";
        } 
      }          
      return result;
    },
    map: function(val, A, B, C, D){
        return (val-A)/(B-A) * (D-C) + C;
    },
    /**
     * pgWarehouseMap.nameText returns the text to show on the image for the passed lot.
     * <br>lotOrLots could be a cleaned-bean lot or array of, or a seed pickup lot or array of.
     */
    nameText:function(lotOrLots){
      var a = lotOrLots.splice ? lotOrLots : [lotOrLots];
      var hash={};
      var result = "";
      var delim = "";
      for (var i=0,z=a.length;i<z;i++) {
        var lot = a[i];
        var code="";
        if (lot.LotNum) {
          code = lot.LotNum + "-" + lot.CropCode;
          if (z == 1) {
            code += " " + lot.GrowerCode + " " + lot.ToteSize;
          }
        } else {
          //it's a seed lot
          var tc = z > 2 ? "" : lot.getTreatmentCodes("");
          code = lot.Shipment + "-" + lot.getVariety().Name + (tc == "" ? "" : "-" + tc);          
        }
        if (hash[code]) {
          continue;
        }
        hash[code] = true;
        result += delim + code;
        delim = "; "; 
      }
      return result;
    },
    onMouseDown: function(evt){
		

		//if(evt.button != 0){
		//	evt.preventDefault();
			//evt.stopPropagation();
		//	return;
		//}
		if(self.touchMouseDown == true && evt.changedTouches){
			self.mouseMode.mouseUp(self.mouseX, self.mouseY, {hatchCtx:self.hatchCtx, doodleCtx:self.doodleCtx, outlineCtx:self.outlineCtx, event:evt});
		}
		self.touchMouseDown = true;
        var mode = self.mode;
        self.mouseIsDown = true;
        var xpos = (self.mouseX-self.globalOffsetX)/self.zoomLevel;
        var ypos = (self.mouseY-self.globalOffsetY)/self.zoomLevel; 
		var isTwoFinger = false;
		if(evt.changedTouches){
			evt.preventDefault();
			console.log("Touch Start")
			
			var touch = evt.changedTouches[0];
			self.mouseX = touch.clientX - self.canvX;
        	self.mouseY = touch.clientY - self.canvY;
			isTwoFinger = evt.changedTouches > 1;
		}
        if(mode == Mode.MOVE || mode == Mode.DISPLAY){
           /* self.canvas.style.cursor = 'grabbing';
            self.mouseMovedWhileDown = false;
            var mrect = {x:xpos,y:ypos,w:1,h:1};
            var hit = self.hitTestLocations(mrect);
            if(hit != null){
            	self.movingId = hit;
            }
            self.offsetX = parseFloat(self.mouseX) - parseFloat(self.globalOffsetX); 
            self.offsetY = parseFloat(self.mouseY) - parseFloat(self.globalOffsetY); */
        }
        else if(mode == Mode.LOCATION){
            self.locationSX = xpos.f2();
            self.locationSY = ypos.f2();
            self.locationEX = xpos.f2();
            self.locationEY = ypos.f2();
        }
        else if(mode == Mode.WALLS){
            self.wallSX = xpos.f2();
            self.wallSY = ypos.f2();
            self.wallEX = xpos.f2();
            self.wallEY = ypos.f2();
        }
        else if(mode == Mode.TEXT){
        	if(self.isPlacingText){
        		self.textFields[self.textId].x = xpos.f2();
        		self.textFields[self.textId].y = ypos.f2();
        		self.isPlacingText = false;
        		self.textId = null;
        		self.setMode(Mode.MOVE);
        	}
        }
        else if(mode == Mode.DIMENSIONS){
        	self.dimensions.sx = xpos.f2();
        	self.dimensions.sy = ypos.f2();
        	self.dimensions.ex = xpos.f2();
        	self.dimensions.ey = ypos.f2();
        }
        else if(mode == Mode.EDIT){
        	self.mouseMovedWhileDown = false;
        	var mrect = {x:xpos,y:ypos,w:1,h:1};
        	//Hittest all the objects
        	var locId = self.hitTestLocations(mrect);
        	var txtId = self.hitTestText(mrect);
        	var wallId = self.hitTestWalls(mrect);        	
        	if(locId == null && txtId == null && wallId == null){
        		self.offsetX = parseFloat(self.mouseX) - parseFloat(self.globalOffsetX); 
            self.offsetY = parseFloat(self.mouseY) - parseFloat(self.globalOffsetY); 
        	}else{
        		self.isMovingObject = true;
        		if(locId != null){
        			self.movingType = "Loc";
        			self.movingId = locId;
        			self.offsetX = parseFloat(xpos) - parseFloat(self.locations[locId].x); 
              		self.offsetY = parseFloat(ypos) - parseFloat(self.locations[locId].y); 
        		}
        		else if(wallId != null){
        			self.movingType = "Wall";
        			self.movingId = wallId;
        			self.offsetX = parseFloat(xpos) - parseFloat(self.walls[wallId].x); 
              		self.offsetY = parseFloat(ypos) - parseFloat(self.walls[wallId].y); 
        		}
        		else if(txtId != null){
        			self.movingType = "Text";
        			self.movingId = txtId;
        			self.offsetX = parseFloat(xpos) - parseFloat(self.textFields[txtId].x); 
              		self.offsetY = parseFloat(ypos) - parseFloat(self.textFields[txtId].y); 
        		}
        	}
        }
        /*else if (mode == Mode.DOODLE){
            self.isDoodling = true;
            self.doodleStartX = xpos;
            self.doodleStartY = ypos;
            self.doodleEndX = xpos;
            self.doodleEndY = ypos;
        }*/
		
		if (evt.ctrlKey || isTwoFinger){
			Modes.Move.mouseDown(xpos, ypos, {hatchCtx:self.hatchCtx, doodleCtx:self.doodleCtx, outlineCtx:self.outlineCtx, event:evt});
		}
		else if(self.mouseMode){
			self.mouseMode.mouseDown(xpos, ypos, {hatchCtx:self.hatchCtx, doodleCtx:self.doodleCtx, outlineCtx:self.outlineCtx, event:evt});
		}
    },
	onKeyUp: function(evt){
		console.log("Clicked key", evt.key);
		if(evt.key=='Delete'){
			if(self.mouseMode.deleteFn){
				self.mouseMode.deleteFn();
			}
		}
	},
    onMouseMove: function(evt){
		/*if(evt.button != 0){
			evt.preventDefault();
			evt.stopPropagation();
			return;
		}*/
        var rect = self.canvas.getBoundingClientRect();
        self.canvX = rect.left;
        self.canvY = rect.top;
        self.mouseX = evt.clientX - self.canvX;
        self.mouseY = evt.clientY - self.canvY;
		var isTwoFinger = false;
		if(evt.changedTouches){
			evt.preventDefault();
			var touch = evt.changedTouches[0];
			self.mouseX = touch.clientX - self.canvX;
        	self.mouseY = touch.clientY - self.canvY;
			isTwoFinger = evt.changedTouches > 1;
			//for(var i=0;i<evt.changedTouches;i++){
			//	var t = evt.changedTouches[i];
			//	self.ctx.drawText(t.identifier, t.clientX - self.canvX,t.clientY - self.canvY)
			//}
		}
        var xpos = (self.mouseX-self.globalOffsetX)/self.zoomLevel;
        var ypos = (self.mouseY-self.globalOffsetY)/self.zoomLevel;        
        var mode = self.mode;
        if(mode == Mode.MOVE || mode == Mode.DISPLAY){
            /*if(self.mouseIsDown){
            	self.mouseMovedWhileDown = true;
                self.globalOffsetX = self.mouseX-self.offsetX;
                self.globalOffsetY = self.mouseY-self.offsetY;
            }*/
        }else if(mode == Mode.LOCATION){
        	if(self.mouseIsDown){
                self.locationEX = xpos.f2();
                self.locationEY = ypos.f2();
            }
        }else if(mode == Mode.WALLS){
            if(self.mouseIsDown){
                self.wallEX = xpos.f2();
                self.wallEY = ypos.f2();
            }
        }
        else if(mode == Mode.TEXT){
        	if(self.isPlacingText){
        		self.textFields[self.textId].x = self.mouseX.f2();
        		self.textFields[self.textId].y = self.mouseY.f2();
        	}
        }
        else if(mode == Mode.DIMENSIONS){
        	if(self.mouseIsDown){
        		self.dimensions.ex = xpos.f2();
        		self.dimensions.ey = ypos.f2();
        	}
        }
        else if(mode == Mode.EDIT){
        	if(self.mouseIsDown){
        		self.mouseMovedWhileDown = true;
        		if(!self.isMovingObject){
                    self.globalOffsetX = (self.mouseX-self.offsetX).f2();
                    self.globalOffsetY = (self.mouseY-self.offsetY).f2();
                }
        		else{
            		if(self.movingType=="Loc"){
            			var loc = self.locations[self.movingId];
            			loc.x = (xpos-self.offsetX).f2();
            			loc.y = (ypos-self.offsetY).f2();
            		}
            		else if(self.movingType=="Wall"){
            			var wall = self.walls[self.movingId];
            			wall.x = (xpos-self.offsetX).f2();
            			wall.y = (ypos-self.offsetY).f2();
            		}
            		else if(self.movingType=="Text"){
            			var text = self.textFields[self.movingId];
            			text.x = (xpos-self.offsetX).f2();
            			text.y = (ypos-self.offsetY).f2();
            		}
            	}
        	}
        }
		
		/*if(!self.touchMouseDown){
			self.touchMouseDown = true;
			self.mouseMode.mouseDown(xpos, ypos, {hatchCtx:self.hatchCtx, doodleCtx:self.doodleCtx, outlineCtx:self.outlineCtx});
		}*/
		
		if (evt.ctrlKey || isTwoFinger){
			Modes.Move.mouseMove(xpos, ypos, {hatchCtx:self.hatchCtx, doodleCtx:self.doodleCtx, outlineCtx:self.outlineCtx, event:evt});
		}
		else if(self.mouseMode){
			self.mouseMode.mouseMove(xpos, ypos, {hatchCtx:self.hatchCtx, doodleCtx:self.doodleCtx, outlineCtx:self.outlineCtx, event:evt});
		}
        
    },
    onMouseUp: function(evt){
		self.touchMouseDown = false;
		/*if(evt.button != 0){
			evt.preventDefault();
			evt.stopPropagation();
			return;
		}*/
		if(evt.changedTouches){
			console.log("Touch End")
		}
		
        var mode = self.mode;
        self.mouseIsDown = false;
        if(mode == Mode.MOVE){
        	self.canvas.style.cursor = 'grab';
        }
        else if(mode == Mode.DISPLAY){
        	self.canvas.style.cursor = 'grab';
        	if(!self.mouseMovedWhileDown){
        		if(self.movingId != null){
        			self.popupDetailsBox(self.movingId, false);
        		}
        		self.movingType = null;
        		self.movingId = null;
        	}else{
        		self.mouseMovedWhileDown = false;
        	}
        }
        else if(mode == Mode.LOCATION){
        	if(self.locationSX != null){
        		self.addLot(self.locationSX, self.locationSY, self.locationEX, self.locationEY);
            	self.locationSX = null;
            	self.locationSY = null;
            	self.locationEX = null;
            	self.locationEY = null;
            	self.popupEditBox("Loc", (self.locations.length-1), true);
        	}
        }else if(mode == Mode.WALLS){
            self.addWall(self.wallSX, self.wallSY, self.wallEX, self.wallEY);
            self.wallSX = null;
            self.wallSY = null;
            self.wallEX = null;
            self.wallEY = null;
        }else if(mode == Mode.DIMENSIONS){
        	//Sometimes the popup appears from the mouse up event from choosing the warehouse image, this just ensures the
        	//bounds at least have a size and it wasn't just a mouse click
        	/*if(self.dimensions.sx!=self.dimensions.ex && self.dimensions.sy != self.dimensions.ey){
        		ir.show("dimensionPopup");
        		self.enableButtons(false);
        	}*/
        }else if(mode == Mode.EDIT){
        	self.isMovingObject = false;
        	if(!self.mouseMovedWhileDown){
        		self.popupEditBox(self.movingType, self.movingId, false);
        	}
        	self.movingType = null;
        	self.movingId = null;
        }
        
		
		if (evt.ctrlKey){
			Modes.Move.mouseUp(self.mouseX, self.mouseY, {hatchCtx:self.hatchCtx, doodleCtx:self.doodleCtx, outlineCtx:self.outlineCtx, event:evt});
			Modes.Move.endMode();
		}
		else if(self.mouseMode){
			self.mouseMode.mouseUp(self.mouseX, self.mouseY, {hatchCtx:self.hatchCtx, doodleCtx:self.doodleCtx, outlineCtx:self.outlineCtx, event:evt});
		}
        
    },
    outlineRectForEdit: function(rect, colour){
    	self.ctx.fillStyle = colour || "#00ffff88"; //"rgb("+(Math.random()*255)+","+(Math.random()*255)+","+(Math.random()*255)+")";
    	self.ctx.strokeStyle = "#000";//"rgb("+(Math.random()*255)+","+(Math.random()*255)+","+(Math.random()*255)+")";
    	self.ctx.fillRect(self.globalOffsetX+rect.x*self.zoomLevel, self.globalOffsetY+rect.y*self.zoomLevel, rect.w*self.zoomLevel, rect.h*self.zoomLevel);
    	self.ctx.strokeRect(self.globalOffsetX+rect.x*self.zoomLevel, self.globalOffsetY+rect.y*self.zoomLevel, rect.w*self.zoomLevel, rect.h*self.zoomLevel);
    },
    popupDetailsBox: function(id, closeImgPop){
    	var found = [];
    	var imgLoc = self.locations[id];
    	var lots = self.lots;
    	var seeds = self.seeds;
    	var loc = self.locRows.get(imgLoc.loc) || {Name:"?" + imgLoc.loc};
    	for(var i=0;i<lots.length; i++){
            var lot = lots[i];
            if(imgLoc.loc == lot.Location){
                found.push(lot);
            }
        }
      for (var j=0,y=seeds.length;j<y;j++) {
        var seed = seeds[j];
        if (imgLoc.loc == seed.Location) {
          found.push(seed);
        }
      }
    	if(found.length > 0){
    		lotInfoPop.show(self.rec.Name + "-" + loc.Name,found, closeImgPop);
    	}
    },
    popupEditBox: function(type, id, isNewItem){
    	self.enableButtons(false);
    	if(type == "Loc"){
    		self.popupLocEdit(id, isNewItem);
    	}
    	else if(type == "Wall"){
    		self.popupWallEdit(id, isNewItem);
    	}
    	else if(type == "Text"){
    		self.popupTextEdit(id, isNewItem);
    	}
    },
    popupLocEdit: function(id, isNewItem){
    	var imgLoc = self.locations[id];
    	var dim = self.dimensions;
    	ir.show("locEditPopup");
    	ir.set("locEditId", id);
    	ir.set("locEditDeleteOnCancel", isNewItem?1:0);
    	ir.set("locEditWidth", (imgLoc.w*dim.scaleX).toFixed(2));
    	ir.set("locEditHeight", (imgLoc.h*dim.scaleY).toFixed(2));
    	if(imgLoc.f){
    		ir.set("locEditFont", imgLoc.f);
    	}
    	var selectbox = "<select id='locEditLocation'>";
    	var a = self.locRows.values;
      for(var i=0,z=a.length;i<z;i++){
          var loc = a[i];
        	var selected = loc.Row == imgLoc.loc ? "selected" : "";
        	var optionText = loc.Name;
        	if (loc.SeedLot && ! loc.CleanedLot) {
        	  optionText += " (Seeds)";
        	}
          selectbox += "<option value='" + loc.Row + "' " + selected +">" + optionText + "</option>";
      }
      selectbox += "</select>";
      ir.set("locEditCell",selectbox);
    },
    popupSaveImage: function(){
    	ir.show("saveImagePopup");
    	self.enableButtons(false);
    },
    popupTextInput: function(xpos, ypos){
    	ir.show("textPopup");
		self.tempTextX = xpos;
		self.tempTextY = ypos;
    	//self.enableButtons(false);
    },
    popupTextEdit: function(id){
    	var text = self.textFields[id];
    	ir.show("textEditPopup");
    	ir.set("textEditId", id);
    	ir.set("textEditVal", text.text);
    	ir.set("textEditVert", text.vert);
    	ir.set("textEditFontSize", text.f);
    },
    popupWallEdit: function(id){
    	var wall = self.walls[id];
    	var dim = self.dimensions;
    	ir.show("wallEditPopup");
    	ir.set("wallEditId", id);
    	ir.set("wallEditWidth", (wall.w*dim.scaleX).toFixed(2));
    	ir.set("wallEditHeight", (wall.h*dim.scaleY).toFixed(2));
    },
    processImage: function(img){
    	self.globalOffsetX = 0;
        self.globalOffsetY = 0;
        
        if(img.width>img.height){
            var ratio = img.width/img.height;
            img.width = self.canvas.width;
            img.height = img.width/ratio;
        }else{
            var ratio = img.height/img.width;
            img.height = self.canvas.height;
            img.width = img.height/ratio;
        }
        self.dimensions.imgW = img.width;
        self.dimensions.imgH = img.height;
        
        self.warehouseImg = img;
        if(!self.dimensions.isSet){
        	self.setMode(Mode.DIMENSIONS);
        }else{
        	self.enableButtons(true);
        	self.setMode(Mode.MOVE);
        }
    },
    readImage: function(){
        if ( this.files && this.files[0] ) {
            var FR= new FileReader();
            FR.onload = function(e) {
                //var img = new Image();
                //Load the image in from the user, scale it to best fit the canvas, reset the offsets
                //img.onload = function() {
                //	self.uploadedNewImage = true;
                //    self.processImage(img);
                //};

                //img.src = e.target.result;
				console.log("Files: ", e.target.result);
				pgWarehouseMap.loadFile(e.target.result);
            };       
            FR.readAsText( this.files[0] );
        }
    },
    redoDimensionPopup: function(){
    	self.dimensions.sx = null;
    	self.dimensions.sy = null;
    	self.dimensions.ex = null;
    	self.dimensions.ey = null;
    	ir.hide("dimensionPopup");
    	self.enableButtons(true);
    },
    renderImage: function(){
    	if(self.locations.length > 0 || self.walls.length > 0 || self.textFields.length > 0){
	    	self.setMode(4);
	    	var canvas = document.createElement("canvas");
	    	var ctx = canvas.getContext("2d");
	    	canvas.width = self.dimensions.imgW*3 || 800; //ir.winWidth()*3;
	    	canvas.height = self.dimensions.imgH*3 || 800; //ir.winHeight()*3;
	    	self.canvas = canvas;
	    	self.ctx = ctx;
	    	self.scaleForImage();
	    	self.drawCanvas(true);
	    	var image = self.canvas.toDataURL("image/png");
	    	//console.log(image);
	    	var w = ir.winWidth() - 20;
  			var h = ir.winHeight() - 40;
  			var div = ir.get("pgWarehouseMap");
  			var img = ir.get("warehouseImagePopImg");
  			var imgWH = self.fitIntoRectRatio(self.dimensions.imgW, self.dimensions.imgH, w-40, h-60);
  			div.style.width = w + "px";
  			div.style.height = h + "px";
  			div.style.left = 0;
  			div.style.top = 0;
  			img.style.width = imgWH.w.f2() + "px";//(w - 40) + "px";
  			img.style.height = imgWH.h.f2() + "px"; //(h - 45) + "px";
  			img.src = image;
	    	self.shutdownEditor(true);
    	}else{
    		alert("No data to display on image");
    	}
    },
    saveAndExit: function(){
    	//If they changed the image, upload the new one to the server
    	if(self.uploadedNewImage){
	    	/*var formdata = new FormData();
	    	formdata.append("image", self.warehouseImg.src);
	    	formdata.append("warehouse", self.rec.Row);
	    	var xhttp = new XMLHttpRequest();
			  xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {					
					self.saveMapJson(true);
				}
			};
			xhttp.open("POST", "saveimage.jsp", true);
			xhttp.send(formdata);*/
    	}else{
	    	//self.saveMapJson(true);
    	}
    },
    saveMapJson: function(doAlert){
    	var mapjson = {
    		walls: self.walls,
    		locations: self.locations,
    		dimensions: self.dimensions,
    		textFields: self.textFields
    	};
    	var formdata = new FormData();
    	formdata.append("MapJson", JSON.stringify(mapjson));
    	formdata.append("row", self.rec.Row);
    	var xhttp = new XMLHttpRequest();
    	xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				if(doAlert){
					alert("Saved map info to server");
				}
				self.shutdownEditor();
				view.showPrevious();
			}
  		};
  		xhttp.open("POST", "ajax.jsp?fn=updateWarehouseMap", true);
  		xhttp.send(formdata);
 
    },
	showFileLoad: function(){
		  ir.get("imageUpload").click();
	},
	saveImage: function(){
		ir.show("imageSavePopup");
		ir.forcus("imageSaveName");
	},
	saveImageConfirm: function(){
		var fileName = ir.v("imageSaveName");
		var background = ir.v("imageSaveColor");
		var color = ir.v("imageSaveColorColor");
		self.isIsometric = ir.bool("imageSaveIsometric");
		if(background=='color'){
			self.backgroundColor = color;
		}else{
			self.backgroundColor = background;
		}
		self.saveToImage(fileName);
		
	},
	saveFile: function(){
		var storageObj = {
			dimensions: pgWarehouseMap.dimensions,
			grid: self.gridImg.src,
			hatchCanvas: self.hatchCanvas.toDataURL("image/png"),
			doodleCanvas: self.doodleCanvas.toDataURL("image/png"),
			outlineCanvas: self.outlineCanvas.toDataURL("image/png"),
			hatchImg: self.hatchImg.src,
			stamps: JSON.stringify(self.stamps)
		}
		
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storageObj));
		var link = document.getElementById('link');
	    link.setAttribute('download', 'DungeonMapDoodle.dmd');
	    link.setAttribute('href', dataStr);
	    link.click();
	},
    saveToImage: function(fileName){
    	//self.setMode(4);
    	self.fontSizes = [];
    	var canvas = document.createElement("canvas");
    	var ctx = canvas.getContext("2d");
    	//ctx.imageSmoothingEnabled = false;
		
		//self.dimensions.scaleX = 0.5;
		//self.dimensions.scaleY = 0.5;
		self.oldZoomLevel = self.zoomLevel;
		self.zoomLevel = 1;
		self.globalOffsetX = 0;
		self.globalOffsetY = 0;
		var sX = (1/self.dimensions.scaleX);
		var sY = (1/self.dimensions.scaleY);
    	canvas.width = self.gridImg.width*sX;//ir.vn("saveImagePopupWidth");
    	canvas.height = self.gridImg.height*sY;//ir.vn("saveImagePopupHeight");    	
    	//self.canvas = canvas;
    	//self.ctx = ctx;    	
		
		var xAxis  = {x : 1, y: 0.5};
    	var yAxis  = {x : -1, y: 0.5};
		var origin = {x : 0, y : 0};
		var area = (xAxis.x * ( xAxis.y + yAxis.y ) + ( xAxis.x + yAxis.x ) * yAxis.y) - (xAxis.y * ( xAxis.x + yAxis.x ) + ( xAxis.y + yAxis.y ) * yAxis.x);
		var scaleBy = 1 / Math.sqrt(area);
		
		if(self.isIsometric){
			canvas.width *= 1.15;
			canvas.height *= 1.15;
			ctx.save();
			xAxis.x *= scaleBy;
			xAxis.y *= scaleBy;
			yAxis.x *= scaleBy;
			yAxis.y *= scaleBy;
			//ctx.setTransform(xAxis.x, xAxis.y, yAxis.x, yAxis.y, origin.x, origin.y);
			ctx.setTransform(xAxis.x, xAxis.y, yAxis.x, yAxis.y, canvas.width/3, origin.y);
		}
		
    	self.scaleForImage();
    	self.drawCanvas(true, canvas, ctx);
    	//ctx.imageSmoothingEnabled = false;
		if(self.isIsometric){
			ctx.restore();
		}
		
		
		ctx.save();
		ctx.globalCompositeOperation = 'destination-over';
		ctx.fillStyle = self.backgroundColor;
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.restore();
		
    	var image = canvas.toDataURL("image/png");
		
		self.backgroundColor = "white";
		
		self.dimensions.scaleX = 1;
		self.dimensions.scaleY = 1;
  		//Open image in new tab
		//window.open(image);
		if(!fileName.endsWith(".png")){
			fileName += ".png";
		}
		
		var link = document.getElementById('link');
	    link.setAttribute('download', fileName);
	    link.setAttribute('href', image.replace("image/png", "image/octet-stream"));
	    link.click();
		
		
  		self.isRunning = true;
		self.zoomLevel = self.oldZoomLevel;
  		//self.shutdownEditor();    	
    },
    scaleForImage:function(){
		
    	var defaultWidth = self.gridImg.width;
    	var defaultHeight = self.gridImg.height;    	
    	var imgSX = 1;//= self.canvas.width / defaultWidth;
    	var imgSY = 1;//= self.canvas.height / defaultHeight;
    	self.imageScaleX = imgSX;
    	self.imageScaleY = imgSY;
    	var locs = self.locations;
    	for(var i=0,z=locs.length;i<z;i++){
    		var whloc = locs[i];
    		whloc.x *= imgSX;
    		whloc.y *= imgSY;
    		whloc.w *= imgSX;
    		whloc.h *= imgSY;
    	}
    	for(var i=0;i<self.walls.length;i++){
    		self.walls[i].x = self.walls[i].x*imgSX;
    		self.walls[i].y = self.walls[i].y*imgSY;
    		self.walls[i].w = self.walls[i].w*imgSX;
    		self.walls[i].h = self.walls[i].h*imgSY;
    	}    	
    	for(var i=0;i<self.textFields.length;i++){
    		self.textFields[i].x = self.textFields[i].x*imgSX;
    		self.textFields[i].y = self.textFields[i].y*imgSY;
    		self.textFields[i].f = self.textFields[i].f*imgSX;
    	}    	
    },
    scaleCoordsFromDefault: function(newX, newY){
    	var defX = 800;
    	var defY = 800;
    	var i;
    	var map = self.map;
    	for(i=0;i<self.locations.length;i++){
    		var loc = self.locations[i];
    		loc.x = map(loc.x, 0, defX, 0, newX);
    		loc.y = map(loc.y, 0, defY, 0, newY);
    		loc.w = map(loc.w, 0, defX, 0, newX);
    		loc.h = map(loc.h, 0, defY, 0, newY);
    	}
    	for(i=0;i<self.walls.length;i++){
    		var wall = self.walls[i];
    		wall.x = map(wall.x, 0, defX, 0, newX);
    		wall.y = map(wall.y, 0, defY, 0, newY);
    		wall.w = map(wall.w, 0, defX, 0, newX);
    		wall.h = map(wall.h, 0, defY, 0, newY);
    	}
    	for(i=0;i<self.textFields.length;i++){
    		var text = self.textFields[i];
    		text.x = map(text.x, 0, defX, 0, newX);
    		text.y = map(text.y, 0, defY, 0, newY);
    	}
    },
    setFont:function(pixelSize,other) {
		self.ctx.font = Math.round(pixelSize) + "px '" + (other||"" + "' 'Arial'");
    	//self.ctx.font = Math.min(40,Math.max(self.minFontPx,Math.round(pixelSize))) + "px Arial " + (other||"");
    },
    setFontToFit: function(text, width, startFont){
    	if(isNaN(startFont)){
    		return;
    	}
    	self.setFont(startFont);
    	var size = self.ctx.measureText(text);
    	var textWidth = size.width;
    	if (startFont < 2 || textWidth <= width) {
    		return;
    	}
    	self.setFontToFit(text, width, startFont-1);
    },
    setLoc: function(locIndex, index){
      /* not sure this is necessary anymore with loc row on locRect
      var a = self.locations;
      for(var i=0,z=a.length;i<z;i++){
        var imgLoc = a[i];
        if(imgLoc.id == index){
          imgLoc.location = self.locations[locIndex].Name;
          break;
      }
      */
    },
    setMode: function(val){
        self.mode = val;
        if(val == Mode.DISPLAY){
            self.zoomLevel = 1;
            self.globalOffsetX = 0;
            self.globalOffsetY = 0;
        }
        if(val == Mode.TEXT){
        	self.popupTextInput();
        }        
        //Cursor changing code
        if(self.canvas){
	        if(val == Mode.MOVE){
	        	self.canvas.style.cursor='grab';
	        }
	        else if(val == Mode.LOCATION || val == Mode.WALLS || val == Mode.DIMENSIONS){
	        	self.canvas.style.cursor='crosshair';
	        }
	        else{
	        	self.canvas.style.cursor='default';
	        }
        }
    },
	showPasswordPromptCallback: function(){
		var passwd = "doodletime";
		var enteredPwd = ir.v("passwordPromptInput")
		if(enteredPwd == passwd){
			self.editMode = true;
			ir.show("warehouseMapEdit",self.editMode);
			ir.show("warehouseMapDisplay",! self.editMode);
			irstore.set("doodlePwd", passwd);
			ir.hide("passwordPrompt");
			self.showCallback({ok:1});
		}else{
			ir.set("passwordError", "The password you entered is incorrect, please try again. If you don't have the latest password, please check out patreon.com/DungeonMapDoodler");
		}
	},
    show:function(){
		var passwd = "doodletime";
		var storedPwd = irstore.get("doodlePwd");
		var enteredPwd = "";
		if(storedPwd != passwd){
			ir.show("passwordPrompt");
			//enteredPwd = prompt("Please enter the password to access Dungeon Map Doodler beta");
		}
		else{
			//allow in
			  self.editMode = true;
			  //self.locRows.clear();
			  //self.locRows.add(Location.getForWarehouse(self.rec.Row));
			  ir.show("warehouseMapEdit",self.editMode);
			  ir.show("warehouseMapDisplay",! self.editMode);
			  self.showCallback({ok:1});
		}
		
		
      
      //view.async({fn:"selectMapJson", row:self.rec.Row},self.showCallback);
    },
    showCallback:function(res){
      if(res.ok){
        if(res.map && res.map.locations != null){
          var json = res.map;
          self.walls = json.walls;
          self.locations = json.locations;
          self.textFields = json.textFields;
          self.dimensions = json.dimensions;
          if (self.editMode) {
            self.generateGrid();
          }
          //one-time cleanup: change from using location name to row#
          var locationNameHash = null;
          var locs = self.locations;
          for (var i=0,z=locs.length;i<z;i++){
            var loc = locs[i];
            if (loc.loc==undefined) {
              if (locationNameHash==null) {
                locationNameHash = ir.toHash(self.locRows.values,function(o){
                  return o.Name;
                  });
              }
              var locObj = (locationNameHash[loc.location] || {Row:0}); 
              loc.loc = locObj.Row;
              if (loc.loc > 0) {
                delete loc.location;
              }
            }
          }
        }
        else{
          self.walls = [];
          self.locations = [];
          self.textFields = [];
          //self.dimensions = {isSet:false};
        }
        self.lots = res.lots;
        self.seeds = [];
       
      }
      if (self.editMode) {
        self.init();
        var image = new Image();
        //image.src = "pics/warehouseImgs/warehouse" + self.rec.Row + ".png";
        //image.onload = function(){self.processImage(image);};
      } else { 
        self.renderImage();
      }
      //view.stopWaiting();    
    },
    showDimensionPopup: function(){
    	/*ir.show("dimensionPopup");
    	self.setMode(Mode.DIMENSIONS);
    	self.dimensionsOld = self.dimensions;
    	self.dimensions = {
        	isSet: false,
        	sx: null,
        	sy: null,
        	ex: null,
        	ey: null,
        	w: null,
        	h: null,
        	wf: null,
        	hf: null,
        	scaleX: null,
        	scaleY: null,
        	stepSize: 4
        },
		self.enableButtons(false);*/
    },
    shutdownEditor: function(suppressHide){
    	//Clear out all listeners on canvas
    	if(self.isRunning){
	    	document.getElementById("imageUpload").removeEventListener("change", self.readImage, false);
			document.getElementById("stampUpload").removeEventListener("change", Modes.StampTool.readAddStamp, false);
	        self.canvas.removeEventListener("mousewheel", self.handleMouseScroll);
	        self.canvas.removeEventListener("DOMMouseScroll", self.handleMouseScroll);
	        self.canvas.removeEventListener("mousemove", self.onMouseMove, false);
	        self.canvas.removeEventListener("mousedown", self.onMouseDown, false);
	        self.canvas.removeEventListener("mouseup", self.onMouseUp, false);
	        document.removeEventListener("keyup", self.onKeyUp, false);	 
	        self.canvas.removeEventListener("touchmove", self.onMouseMove, false);
	        self.canvas.removeEventListener("touchstart", self.onMouseDown, false);
	        self.canvas.removeEventListener("touchend", self.onMouseUp, false);
	    	self.canvas = null;
	    	self.ctx = null;
	    	self.warehouseImg = null;
	    	self.gridImg = null;
	    	self.animationId = null;
	    	self.zoomLevel = 1;
	    	self.fontSizes = [];
	    	//Stop the animation loop
	    	window.cancelAnimationFrame(self.animationId);	
	    	if(suppressHide==undefined || suppressHide==false){
	    		ir.hide("pgWarehouseMap");
	    	}
	    	self.isRunning = false;
    	}
    },
    splitTextOnWidth: function(text, maxWidth, delimiter) {
    	var delim = delimiter || ',';
        var words = text.split(delim),
            lines = [],
            line = "";
        var ctx = self.ctx;
        if (ctx.measureText(text).width < maxWidth) {
            return [text];
        }
        while (words.length > 0) {
            while (ctx.measureText(words[0]).width >= maxWidth) {
                var tmp = words[0];
                words[0] = tmp.slice(0, -1);
                if (words.length > 1) {
                    words[1] = tmp.slice(-1) + words[1];
                } else {
                    words.push(tmp.slice(-1));
                }
            }
            if (ctx.measureText(line + words[0]).width < maxWidth) {
                line += words.shift() + " ";
            } else {
                lines.push(line);
                line = "";
            }
            if (words.length === 0) {
                lines.push(line);
            }
        }
        return lines;
    },
	toggleGridOutside: function(){
		self.drawGridOutside = !self.drawGridOutside;
	},
    /*undo: function(){
        if(self.mode == Mode.LOCATION){
            self.locations.splice(self.locations.length-1,1);
        }else if(self.mode == Mode.WALLS){
            self.walls.splice(self.walls.length-1,1);
        }
    },*/
	updateCurrentImage: function(updateRedo){
		var hImg = new Image();
		var oImg = new Image();
		var dImg = new Image();
		hImg.onload = function(){
			if(updateRedo){
				pgWarehouseMap.redoStack.hatch.push(this);
			}
		}
		oImg.onload = function(){
			if(updateRedo){
				pgWarehouseMap.redoStack.outline.push(this);
			}
		}
		dImg.onload = function(){
			if(updateRedo){
				pgWarehouseMap.redoStack.doodle.push(this);
			}
		}
		hImg.src = self.hatchCanvas.toDataURL("image/png");
		oImg.src = self.outlineCanvas.toDataURL("image/png");
		dImg.src = self.doodleCanvas.toDataURL("image/png");
		self.hTempImg = hImg;
		self.oTempImg = oImg;
		self.dTempImg = dImg;
	},
	updateUndoStack: function(){
		
		//Wipe out redo stack if you draw something
		self.redoStack = { 
			hatch: [],
			outline: [],
			doodle: []
		}
		//two steps, updating current image, pushing current image to stack
		//
		if(self.hTempImg != null){
			self.undoStack.hatch.push(self.hTempImg);
			self.undoStack.outline.push(self.oTempImg);
			self.undoStack.doodle.push(self.dTempImg);
			
			
			
		}else{
			
		}
		
		if(self.undoStack.hatch.length > 10){
			self.undoStack.hatch.shift();
			self.undoStack.outline.shift();
			self.undoStack.doodle.shift();
		}
		
		self.updateCurrentImage(true);
		
	},
	undo: function(){
		//self.hTempImg = null;
		//self.oTempImg = null;
		//self.dTempImg = null;
		
		//Pop the last image off each stack, clear current canvas and draw this image in its place
		if(self.undoStack.hatch.length > 0){
			var lastHatch = self.undoStack.hatch.pop();	
			self.hatchCtx.clearRect(0,0,self.hatchCanvas.width, self.hatchCanvas.height);
			self.hatchCtx.drawImage(lastHatch, 0,0,self.hatchCanvas.width, self.hatchCanvas.height)
			self.redoStack.hatch.push(lastHatch);
		}
		if(self.undoStack.outline.length > 0){
			var lastOutline = self.undoStack.outline.pop();
			self.outlineCtx.clearRect(0,0,self.outlineCanvas.width, self.outlineCanvas.height);
			self.outlineCtx.drawImage(lastOutline, 0,0,self.outlineCanvas.width, self.outlineCanvas.height)
			self.redoStack.outline.push(lastOutline);
		}
		if(self.undoStack.doodle.length > 0){
			var lastDoodle = self.undoStack.doodle.pop();
			self.doodleCtx.clearRect(0,0,self.doodleCanvas.width, self.doodleCanvas.height);
			self.doodleCtx.drawImage(lastDoodle, 0,0,self.doodleCanvas.width, self.doodleCanvas.height)		
			self.redoStack.doodle.push(lastDoodle);
		}
		if(self.undoStack.hatch.length == 0){
			//console.log("clearing out current image")
			//self.hTempImg = null;
			//self.oTempImg = null;
			//self.dTempImg = null;
		}
		self.updateCurrentImage(false);
		//console.log(self.undoStack, self.redoStack);
	},
	redo: function(){
		//console.log("start of redo", self.redoStack);
		//Pop the last image off each stack, clear current canvas and draw this image in its place
		if(self.redoStack.hatch.length > 0){
			var lastHatch = self.redoStack.hatch.pop();	
			self.hatchCtx.clearRect(0,0,self.hatchCanvas.width, self.hatchCanvas.height);
			self.hatchCtx.drawImage(lastHatch, 0,0,self.hatchCanvas.width, self.hatchCanvas.height)
			self.undoStack.hatch.push(lastHatch);
		}else{
			//self.undoStack.hatch.push(self.hTempImg);
		}
		if(self.redoStack.outline.length > 0){
			var lastOutline = self.redoStack.outline.pop();
			self.outlineCtx.clearRect(0,0,self.outlineCanvas.width, self.outlineCanvas.height);
			self.outlineCtx.drawImage(lastOutline, 0,0,self.outlineCanvas.width, self.outlineCanvas.height)
			self.undoStack.outline.push(lastOutline);
		}else{
			//self.undoStack.outline.push(self.oTempImg);
		}
		if(self.redoStack.doodle.length > 0){
			var lastDoodle = self.redoStack.doodle.pop();
			self.doodleCtx.clearRect(0,0,self.doodleCanvas.width, self.doodleCanvas.height);
			self.doodleCtx.drawImage(lastDoodle, 0,0,self.doodleCanvas.width, self.doodleCanvas.height)			
			self.undoStack.doodle.push(lastDoodle);
		}else{
			//self.undoStack.doodle.push(self.dTempImg);
		}
		if(self.undoStack.hatch.length == 0){
			//console.log("clearing out current image")
			//self.hTempImg = null;
			//self.oTempImg = null;
			//self.dTempImg = null;
		}
		//self.updateCurrentImage();
		//console.log("end of redo", self.redoStack);
	},
    zoom: function(zoom, suppressOffset){
    	//if(!self.isPlacingText && self.mode != Mode.DIMENSIONS){
	        var xpos = (self.mouseX-self.globalOffsetX)/self.zoomLevel;
	        var ypos = (self.mouseY-self.globalOffsetY)/self.zoomLevel;
	        self.zoomLevel += zoom/8;
	        
	        if(self.zoomLevel < 0.125){
	            self.zoomLevel = 0.125;
	        }else{
	        	//Some math to adjust the global offsets so that you zoom in directly 
	        	//to where your mouse cursor is, rather than zooming on the origin (top left of image)
	        	var z = self.zoomLevel;
		        
				if(!suppressOffset){
					var mx = self.mouseX;
		        	var my = self.mouseY;
	        		self.globalOffsetX = ((xpos*z)-mx)*-1;
		        	self.globalOffsetY = ((ypos*z)-my)*-1;
				}else{
					//xpos = (self.canvas.width/2-self.globalOffsetX)/self.zoomLevel;
	        		//ypos = (self.canvas.height/2-self.globalOffsetY)/self.zoomLevel;
	        		//self.globalOffsetX = ((xpos*z))*-1;
		        	//self.globalOffsetY = ((ypos*z))*-1;
				}
				
	        }
			ir.set("zoomSizeLabel", Math.round(self.zoomLevel*10000)/100+"%")
    	//}
    },
    zz_warehouseMap: 0};
  return self;
})();