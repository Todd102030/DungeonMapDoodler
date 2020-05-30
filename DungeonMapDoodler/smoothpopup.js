var smoothPopup = {
    popups: null,
    headerHeight: 40,
    init: function(paramObj){
        smoothPopup.popups = document.getElementsByClassName("popup");
        var i;
        for (i = 0; i < smoothPopup.popups.length; i++) {
            //smoothPopup.popups[i].addEventListener("mousedown", smoothPopup.onMouseDown, false);
            //smoothPopup.popups[i].addEventListener("dragstart", function(e){e.preventDefault()}, false);            
            var dragDiv = document.createElement("DIV");
            var moveImageSrc = "images/move.svg";
            if (paramObj) {
            	if (paramObj.moveImageSrc>"") {
            		moveImageSrc = paramObj.moveImageSrc;
            	}
            }
			//dragDiv.innerHTML = "<img src='" + moveImageSrc + "' draggable='false' style='width:36px;height:36px;user-select:none;-moz-user-select: none;' id='smoothpopimg'>";
			dragDiv.innerHTML = "<div draggable='false' style='width:100%;height:28px;background-color:gray;margin-bottom:6px;user-select:none;-moz-user-select: none;' id='smoothpopimg'></div>";
			dragDiv.style.cursor="move";
			dragDiv.setAttribute("draggable", "false");
			dragDiv.addEventListener("mousedown", smoothPopup.onMouseDown, false);
            dragDiv.addEventListener("dragstart", function(e){e.preventDefault();}, false);
			smoothPopup.popups[i].insertBefore(dragDiv,smoothPopup.popups[i].children[0]);
        }
    },
    onMouseDown: function(e){
        var self = this.parentElement;
        var xdiff = parseFloat(e.pageX) - parseFloat(self.offsetLeft); 
        var ydiff = parseFloat(e.pageY) - parseFloat(self.offsetTop); 
		if(e.changedTouches){
			e.preventDefault();
			var touch = e.changedTouches[0];
			xdiff = touch.pageX - self.offsetLeft;
        	ydiff = touch.pageY - self.offsetTop;
		}
		
        document.onmousemove = function(e){
            e = e || event;
            self.style.left = (e.pageX-xdiff) +"px";
            self.style.top = (e.pageY-ydiff)+"px";
            smoothPopup.constrainToPage(e, self);
        };
        self.onmouseup = function() {
        	document.onmousemove = null;
        };
    },
    constrainToPage:function(e, popup){
        if((popup.offsetLeft + popup.offsetWidth) > window.innerWidth-5){
            popup.style.left = (window.innerWidth-popup.offsetWidth-5)+"px";
        }
        if(popup.offsetTop + smoothPopup.headerHeight > window.innerHeight-5+window.pageYOffset){
            popup.style.top = (window.innerHeight-smoothPopup.headerHeight-5+window.pageYOffset)+"px";
        }
        if(popup.offsetLeft < 5){
            popup.style.left = 5+"px";
        }
        if(popup.offsetTop  < 5+window.pageYOffset){
            popup.style.top = (5+window.pageYOffset)+"px";
        }
    }
};
smoothPopup.init();