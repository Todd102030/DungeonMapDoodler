var dungeonRooms = {
    Bedroom : (function(){
		var self={
			name: "Bedroom",
			fillRoom: function(grid, bedRoom, amountOfStuff, showMonsters){
                if(bedRoom.w>2 && bedRoom.h>=2){
                    console.log("Creating bed room");
                    for (var x=bedRoom.cX-bedRoom.w;x<bedRoom.cX+bedRoom.w;x++){
                        if(doodler.isRoomCorner(grid, bedRoom, x, bedRoom.cY-bedRoom.h, "Bed") && Math.random()>0.5){
                            grid[bedRoom.cY-bedRoom.h][x] = "Bed";
                        }
                    }

                }
			},
		}; return self;
	})(),
    Treasure : (function(){
		var self={
			name: "Treasure",
			fillRoom: function(grid, chestRoom, amountOfStuff, showMonsters){
                if(chestRoom.w>=1 && chestRoom.h>=2){
                    console.log("Creating chest room");
                    for (var x=chestRoom.cX-chestRoom.w;x<chestRoom.cX+chestRoom.w;x++){
                        if(doodler.isRoomCorner(grid, chestRoom, x, chestRoom.cY-chestRoom.h, "Chest") && Math.random()>0.5){
                            grid[chestRoom.cY-chestRoom.h][x] = "Chest";
                        }
                    }

                }
			},
		}; return self;
	})(),
    Cellar : (function(){
		var self={
			name: "Cellar",
			fillRoom: function(grid, cellarRoom, amountOfStuff, showMonsters){
                if(cellarRoom.w>=2 && cellarRoom.h>=2){
                    for (var y=cellarRoom.cY-cellarRoom.h;y<cellarRoom.cY+cellarRoom.h;y++){
                        for (var x=cellarRoom.cX-cellarRoom.w;x<cellarRoom.cX+cellarRoom.w;x++){
                            if(doodler.isRoomCorner(grid, cellarRoom, x, y, "Barrel") && Math.random()>0.4){
                                grid[y][x] = "Barrel";
                            }
                        }
                    }
                }
			},
		}; return self;
	})(),
   
}