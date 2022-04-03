//=============================================================================
// LocalMap.js
//=============================================================================
/*:
 * @plugindesc Local map
 * @author WhitePaper
 *
 * @param Command name
 * @desc Name of the command for local map
 * @default Карта
 * 
 * @param Square size
 * @type number
 * @desc Size of a square in local map
 * @default 144
 * 
 * @param Default player icon
 * @type file
 * @dir img/Local_map
 * @desc Defaul player icon in local map
 * @require 1
 * 
 * @param Local maps
 * @type struct<LocalMap>[]
 * 
 * @help
 * Plugin commands:
 * - LocalMapChangePlayerIcon filename - change player icon in local map to filename
 * - LocalMapResetPlayerIcon - reset player icon in local map to default
 * 
 * To mark that map belongs to local map use notetag:
 * <zone:world,1>
 * where:
 *  - world - name of the local map
 *  - 1 - number of the square
 * 
 * Files in folder img/Local_map
 * Format of local map squares: LM_<name of map>_<part number>
 * 
 * Example of numeration:
 * 1 2 3
 * 4 5 6
 * 
 * Other needed files:
 * - LM_Button East_blocked
 * - LM_Button East_opened
 * - LM_Button North_blocked
 * - LM_Button North_opened
 * - LM_Button South_blocked
 * - LM_Button South_opened
 * - LM_Button West_blocked
 * - LM_Button West_opened
 * - LM_Compas East
 * - LM_Compas North
 * - LM_Compas South
 * - LM_Compas West
 * - LM_Dark_flat
 * 
 */

/*~struct~LocalMap:
 * @param Name
 * @desc Name of the local map. Will be used for file names
 * 
 * @param Width
 * @type number
 * @desc Width of the local map in squares
 * @min 1
 * 
 * @param Height
 * @type number
 * @desc Height of the local map in squares
 * @min 1
 */

LocalMap = {}
 
LocalMap.Parameters = PluginManager.parameters('LocalMap');
LocalMap.Param = {};
LocalMap.Param.CommandName = LocalMap.Parameters['Command name'];
LocalMap.Param.SquareSize = Number(LocalMap.Parameters['Square size']);
LocalMap.Param.LocalMaps = JSON.parse(LocalMap.Parameters['Local maps']);
LocalMap.Param.LocalMaps.forEach((element, index, array) => {
    array[index] = JSON.parse(element);
});
LocalMap.Param.DefaultPlayerIcon = LocalMap.Parameters['Default player icon'];

LocalMap.PlayerIcon = LocalMap.Param.DefaultPlayerIcon;

LocalMap.reserveLocalMap = function(filename, hue, reservationId) {
    return ImageManager.reserveBitmap('img/Local_map/', filename, hue, true, reservationId);
};

LocalMap.loadLocalMap = function(filename, hue) {
    return ImageManager.loadBitmap('img/Local_map/', filename, hue, true);
};

LocalMap_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    LocalMap_Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'LocalMapChangePlayerIcon') {
        LocalMap.PlayerIcon = args[0];
    }
    if (command === 'LocalMapResetPlayerIcon'){
        LocalMap.PlayerIcon = LocalMap.Param.DefaultPlayerIcon;
    }
};


LocalMap_Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    LocalMap_Game_System_initialize.call(this);
    this._visitedMaps = {};
};

Game_System.prototype.localMapIsVisited = function(map, part){
    if (this._visitedMaps == undefined){
        this._visitedMaps = {};
        var zone = $dataMap.meta.zone;
        if (zone != undefined){
            var zone = zone.split(",");
            $gameSystem.localMapCheckAsVisited(zone[0], zone[1]);
            return true;
        }
        return false;
    }
    var zone = this._visitedMaps[map];
    if (zone == undefined){
        return false;
    }
    return zone.contains(Number(part));
}

Game_System.prototype.localMapCheckAsVisited = function(map, part){
    if (this._visitedMaps == undefined){
        this._visitedMaps = {};
    }
    if (this._visitedMaps[map] == undefined){
        this._visitedMaps[map] = [];
    }
    if (!this._visitedMaps[map].contains(Number(part)))
    this._visitedMaps[map].push(Number(part));
}

LocalMap_Game_Map_prototype_initialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
    LocalMap_Game_Map_prototype_initialize.apply(this);
    this._localMap = null;
    this._localMapPart = 0;
    this._localMapWidth = 0;
    this._localMapHeight = 0;
};

LocalMap_Game_Map_prototype_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
    LocalMap_Game_Map_prototype_setup.apply(this, arguments);
    var zone = $dataMap.meta.zone;
    if (zone != undefined){
        var zone = zone.split(",");
        var local_map = LocalMap.Param.LocalMaps.find(element => element["Name"] == zone[0]);
        if (local_map != undefined){
            this._localMap = zone[0];
            this._localMapPart = Number(zone[1]);
            this._localMapWidth = local_map["Width"];
            this._localMapHeight = local_map["Height"];
        }
        $gameSystem.localMapCheckAsVisited(zone[0], zone[1]);
    } else {
        this._localMap = null;
        this._localMapPart = 0;
        this._localMapWidth = 0;
        this._localMapHeight = 0;
    }
};

LocalMap_Scene_Menu_prototype_createCommandWindow = Scene_Menu.prototype.createCommandWindow;

Scene_Menu.prototype.createCommandWindow = function() {
    LocalMap_Scene_Menu_prototype_createCommandWindow.apply(this);
    this._commandWindow.setHandler('localMap',    this.commandLocalMap.bind(this));
};

LocalMap_Scene_Menu_prototype_create = Scene_Menu.prototype.create;

Scene_Menu.prototype.create = function() {
    LocalMap_Scene_Menu_prototype_create.apply(this);
    if ($gameMap._localMap != null){
        for (let i = 1; i <= $gameMap._localMapWidth * $gameMap._localMapHeight; i++){
            if ($gameSystem.localMapIsVisited($gameMap._localMap, i)){
                LocalMap.reserveLocalMap("LM_" + $gameMap._localMap + "_" + i);
            }
        }
    }
    LocalMap.reserveLocalMap("LM_Dark_flat");
    LocalMap.reserveLocalMap("LM_Button East_opened");
    LocalMap.reserveLocalMap("LM_Button West_opened");
    LocalMap.reserveLocalMap("LM_Button North_opened");
    LocalMap.reserveLocalMap("LM_Button South_opened");
    LocalMap.reserveLocalMap("LM_Button East_blocked");
    LocalMap.reserveLocalMap("LM_Button West_blocked");
    LocalMap.reserveLocalMap("LM_Button North_blocked");
    LocalMap.reserveLocalMap("LM_Button South_blocked");
    LocalMap.reserveLocalMap("LM_Compas East");
    LocalMap.reserveLocalMap("LM_Compas West");
    LocalMap.reserveLocalMap("LM_Compas North");
    LocalMap.reserveLocalMap("LM_Compas South");
    LocalMap.reserveLocalMap(LocalMap.PlayerIcon);
};

Scene_Menu.prototype.commandLocalMap = function(){
    SceneManager.push(Scene_LocalMap);
}

LocalMap_Window_MenuCommand_prototype_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;

Window_MenuCommand.prototype.addOriginalCommands = function() {
    LocalMap_Window_MenuCommand_prototype_addOriginalCommands.apply(this);
    this.addCommand(LocalMap.Param.CommandName, 'localMap', true);
};



function Scene_LocalMap() {
    this.initialize.apply(this, arguments);
}

Scene_LocalMap.prototype = Object.create(Scene_MenuBase.prototype);
Scene_LocalMap.prototype.constructor = Scene_LocalMap;

Scene_LocalMap.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_LocalMap.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this._localMapWindow = new Window_LocalMap();
    this._localMapWindow.setHandler('cancel',   this.popScene.bind(this));
    this.addWindow(this._localMapWindow);
};

function Window_LocalMap() {
    this.initialize.apply(this, arguments);
}

Window_LocalMap.prototype = Object.create(Window_Selectable.prototype);
Window_LocalMap.prototype.constructor = Window_LocalMap;

Window_LocalMap.prototype.initialize = function() {
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    this._mapBitmap = []
    if ($gameMap._localMap != null){
        for (let i = 1; i <= $gameMap._localMapWidth * $gameMap._localMapHeight; i++){
            if ($gameSystem.localMapIsVisited($gameMap._localMap, i)){
                this._mapBitmap.push(LocalMap.loadLocalMap("LM_" + $gameMap._localMap + "_" + i))
            } else {
                this._mapBitmap.push(LocalMap.loadLocalMap("LM_Dark_flat"))}
        }
    }
    this._mapWidth = LocalMap.Param.SquareSize * $gameMap._localMapWidth;
    this._mapHeight = LocalMap.Param.SquareSize * $gameMap._localMapHeight;
    Window_Selectable.prototype.initialize.call(this, 0, 0, width, height);
    this._mapX = (this._mapWidth - this.contentsWidth()) / 2;
    this._mapY = (this._mapHeight - this.contentsHeight()) / 2;
    this.refresh();
    this.activate();
};

Window_LocalMap.prototype.refresh = function() {
    this.contents.clear();
    if ($gameMap._localMap != null){
        this.drawMap();
        this.drawPlayer();
        this.drawEast();
        this.drawNorth();
        this.drawSouth();
        this.drawWest();
    }
};

Window_LocalMap.prototype.drawMap = function() {
    for (let i = 0; i < $gameMap._localMapWidth * $gameMap._localMapHeight; i++){
        this.contents.blt(
            this._mapBitmap[i], //bitmap
            0, //sx
            0, //sy
            LocalMap.Param.SquareSize, //width
            LocalMap.Param.SquareSize, //height
            (i % $gameMap._localMapWidth) * LocalMap.Param.SquareSize - this._mapX, //x
            Math.floor(i / $gameMap._localMapWidth) * LocalMap.Param.SquareSize - this._mapY //y
        );
    }
};

Window_LocalMap.prototype.drawPlayer = function(){
    var bitmap = LocalMap.loadLocalMap(LocalMap.PlayerIcon);
    var square = $gameMap._localMapPart - 1;
    var size = LocalMap.Param.SquareSize;
    this.contents.blt(
        bitmap, 
        0, 
        0, 
        bitmap.width, 
        bitmap.height, 
        (size - bitmap.width) / 2 + (square % $gameMap._localMapWidth) * size - this._mapX, 
        (size - bitmap.height) / 2 + Math.floor(square / $gameMap._localMapWidth) * size - this._mapY
    );
}

Window_LocalMap.prototype.drawEast = function(){
    if (this._mapX < this._mapWidth - this.contentsWidth()){
        var bitmap = LocalMap.loadLocalMap("LM_Button East_opened");
    } else {
        var bitmap = LocalMap.loadLocalMap("LM_Button East_blocked");
    }
    var x1 = this.contentsWidth() - bitmap.width;
    var y1 = (this.contentsHeight() - bitmap.height) / 2
    this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, x1, y1);
    var bitmapText = LocalMap.loadLocalMap("LM_Compas East");
    var x2 = x1 - bitmapText.width;
    var y2 = (this.contentsHeight() - bitmapText.height) / 2;
    this.contents.blt(bitmapText, 0, 0, bitmapText.width, bitmapText.height, x2, y2);
}

Window_LocalMap.prototype.drawNorth = function(){
    if (this._mapY > 0){
        var bitmap = LocalMap.loadLocalMap("LM_Button North_opened");
    } else {
        var bitmap = LocalMap.loadLocalMap("LM_Button North_blocked");
    }
    var x1 = (this.contentsWidth() - bitmap.width) / 2;
    var y1 = 0;
    this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, x1, y1);
    var bitmapText = LocalMap.loadLocalMap("LM_Compas North");
    var x2 = (this.contentsWidth() - bitmapText.width) / 2;
    var y2 = bitmap.height;
    this.contents.blt(bitmapText, 0, 0, bitmapText.width, bitmapText.height, x2, y2);
}

Window_LocalMap.prototype.drawSouth = function(){
    if (this._mapY < this._mapHeight - this.contentsHeight()){
        var bitmap = LocalMap.loadLocalMap("LM_Button South_opened");
    } else {
        var bitmap = LocalMap.loadLocalMap("LM_Button South_blocked");
    }
    var x1 = (this.contentsWidth() - bitmap.width) / 2;
    var y1 = this.contentsHeight() - bitmap.height;
    this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, x1, y1);
    var bitmapText = LocalMap.loadLocalMap("LM_Compas South");
    var x2 = (this.contentsWidth() - bitmapText.width) / 2;
    var y2 = y1 - bitmapText.height;
    this.contents.blt(bitmapText, 0, 0, bitmapText.width, bitmapText.height, x2, y2);
}

Window_LocalMap.prototype.drawWest = function(){
    if (this._mapX > 0){
        var bitmap = LocalMap.loadLocalMap("LM_Button West_opened");
    } else {
        var bitmap = LocalMap.loadLocalMap("LM_Button West_blocked");
    }
    var x1 = 0;
    var y1 = (this.contentsHeight() - bitmap.height) / 2;
    this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, x1, y1);
    var bitmapText = LocalMap.loadLocalMap("LM_Compas West");
    var x2 = bitmap.width;
    var y2 = (this.contentsHeight() - bitmapText.height) / 2;
    this.contents.blt(bitmapText, 0, 0, bitmapText.width, bitmapText.height, x2, y2);
}

LocalMap_Window_LocalMap_prototype_processHandling = Window_LocalMap.prototype.processHandling;
Window_LocalMap.prototype.processHandling = function() {
    LocalMap_Window_LocalMap_prototype_processHandling.apply(this);
    if (this.isOpenAndActive()){
        if ($gameMap._localMap != null){
            if (Input.isPressed('right')){
                if (this._mapX < this._mapWidth - this.contentsWidth()){
                    this._mapX++;
                    this.refresh();
                }
            }
            else if (Input.isPressed('left')){
                if (this._mapX > 0){
                    this._mapX--;
                    this.refresh();
                }
            }
            if (Input.isPressed('down')){
                if (this._mapY < this._mapHeight - this.contentsHeight()){
                    this._mapY++;
                    this.refresh();
                }
            }
            else if (Input.isPressed('up')){
                if (this._mapY > 0){
                    this._mapY--;
                    this.refresh();
                }
            }
        }
    }
};