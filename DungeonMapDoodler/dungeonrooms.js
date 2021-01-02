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
                    for (var y=chestRoom.cY-chestRoom.h;y<chestRoom.cY+chestRoom.h;y++){
                        for (var x=chestRoom.cX-chestRoom.w;x<chestRoom.cX+chestRoom.w;x++){
                            if(doodler.isRoomCorner(grid, chestRoom, x, chestRoom.cY-chestRoom.h, "Chest") && Math.random()>0.5){
                                grid[chestRoom.cY-chestRoom.h][x] = "Chest";
                            }
                            if(showMonsters && x==chestRoom.cX && y==chestRoom.cY){
                                grid[chestRoom.cY][chestRoom.cX] = "Skeleton_Captain";                            
                            }
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
                            if(showMonsters && x==cellarRoom.cX && y==cellarRoom.cY){
                                grid[cellarRoom.cY][cellarRoom.cX] = "Goblin_Sapper";                            
                            }
                        }
                    }
                }
			},
		}; return self;
	})(),
   Monsters : (function(){
		var self={
			name: "Cellar",
			fillRoom: function(grid, room, amountOfStuff, showMonsters){
                
                
                if(room.w>=2 && room.h>=2){
                    switch(Math.floor(Math.random()*8)){
                        case 0:
                            grid[room.cY][room.cX] = "Goblin_Sapper"; 
                            grid[room.cY-2][room.cX-2] = "Goblin_Grunt"; 
                            grid[room.cY+1][room.cX-2] = "Goblin_Grunt"; 
                            grid[room.cY+1][room.cX+1] = "Goblin_Grunt"; 
                            grid[room.cY-2][room.cX+1] = "Goblin_Grunt"; 
                        break;
                        case 1:
                            grid[room.cY][room.cX] = "Mon_Draconid"; 
                            grid[room.cY+1][room.cX-2] = "Goblin_Grunt"; 
                            grid[room.cY+1][room.cX+1] = "Goblin_Grunt"; 
                        break;
                        case 2:
                            grid[room.cY][room.cX] = "Orc";
                        break;
                        case 3:
                            grid[room.cY][room.cX] = "Giant";
                        break;
                        case 4:
                            grid[room.cY][room.cX] = "Ogre";
                        break;
                        case 5:
                            grid[room.cY][room.cX] = "Elf";
                        break;
                        case 6:
                            grid[room.cY][room.cX] = "Skeleton";
                        break;
                        case 7:
                            grid[room.cY][room.cX] = "Halfling_Gnome";
                        break;
                    }
                    
                   
                }
			},
		}; return self;
	})(),
}