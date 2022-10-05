//=============================================================================
// Stealth.js
//=============================================================================

/*:
 * @plugindesc Stealth
 * @author WhitePaper
 *
 * @help 
 * To set an event as enemy when map loads use this plugin command as 
 * first command in event:
 * 
 * Stealth x y z
 * where x - width in tiles, y - height in tiles, z - self switch to set if enemy 
 * spots the player
 * 
 * Also you can call this script to set an event as enemy:
 * drawStealthRect(eventId, width, height, selfSwitch)
 * 
 * Circle 1 A
 * Creates an area of circular vision. 
 * Upon entering the line of sight, activates the local scenario A-D. *
 */


//====User/Test functions====//

function setEnemyVision(eventId, width, height, selfSwitch){
    $gameMap.event(eventId).setIsEnemy(true);
    $gameMap.event(eventId).setEnemySelfSwitch(selfSwitch);
    $gameMap.event(eventId).setVision(width, height);
}

function drawStealthRect(eventId, width, height){
    var sprite = new Sprite_StealthRect(eventId, width, height)
    SceneManager._scene._spriteset.addChild(sprite);
    return sprite;
}

function drawStealthCircle(eventId, radius){
    var sprite = new Sprite_StealthRadius(eventId, radius)
    SceneManager._scene._spriteset.addChild(sprite);
    return sprite;
}

selfSwitchLetters = ["A", "B", "C", "D"]

//====Game_Event edit=====//

Stealth_Game_Event_initMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function() {
    Stealth_Game_Event_initMembers.call(this);
    this._isEnemy = false;
    this._enemySelfSwitch = null;
    this._visionWidth = 0;
    this._visionHeight = 0;
    this._visionSprite = null;
    this._circleVisionRadius = 0;
    this._enemySelfSwitchCircle = null;
};

Stealth_Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
    Stealth_Game_Event_setupPageSettings.call(this);
    if (this.page() == undefined || this.page().list == undefined){
        return;
    }
    var first = this.page().list[0]; 
    if (first == undefined){
        return;
    }
    if (first.code == 356){
        params = first.parameters[0].split(" ");
        if (params[0] == "Stealth"){
            width = parseInt(params[1]);
            if (!width){
                throw new Error("Width has to be an integer! (" + params +")");
            }
            height = parseInt(params[2]);
            if (!height){
                throw new Error("Height has to be an integer! (" + params +")");
            }
            letter = params[3].toUpperCase();
            if (!selfSwitchLetters.contains(letter)){
                throw new Error("Self switch has to be a letter A, B, C, or D! (" + params +")");
            }
            this.setIsEnemy(true);
            this.setEnemySelfSwitch(letter);
            this.setVision(width, height);
        }
        var second = this.page().list[1]; 
        if (second == undefined){
            return;
        }
        if (second.code == 356){
            params = second.parameters[0].split(" ");
            if (params[0] == "Circle"){
                radius = parseInt(params[1]);
                if (!radius){
                    throw new Error("Width has to be an integer! (" + params +")");
                }
                letter = params[2].toUpperCase();
                if (!selfSwitchLetters.contains(letter)){
                    throw new Error("Self switch has to be a letter A, B, C, or D! (" + params +")");
                }
                this.setIsEnemy(true);
                this.setEnemySelfSwitchCircle(letter);
                this.setCircleVision(radius);
            }
        }
    }
};

Game_Event.prototype.setIsEnemy = function(isEnemy){
    this._isEnemy = isEnemy;
}

Game_Event.prototype.setEnemySelfSwitch = function(selfSwitch){
    this._enemySelfSwitch = selfSwitch;
}

Game_Event.prototype.setEnemySelfSwitchCircle = function(selfSwitch){
    this._enemySelfSwitchCircle = selfSwitch;
}


Game_Event.prototype.setVision = function(visionWidth, visionHeight){
    this._visionWidth = visionWidth;
    this._visionHeight = visionHeight;
}

Game_Event.prototype.setCircleVision = function(visionRadius){
    this._circleVisionRadius = visionRadius;
}

Game_Event.prototype.setVisionSprite = function(visionSprite){
    this._visionSprite = visionSprite;
}

Stealth_Game_Event_update = Game_Event.prototype.update;
Game_Event.prototype.update = function() {
    Stealth_Game_Event_update.call(this);
    if (this._isEnemy && this._enemySelfSwitch != null){
        if (isPlayerInRange(this, this._visionWidth, this._visionHeight)){
            this._isEnemy = false;
            var key = [this._mapId, this._eventId, this._enemySelfSwitch];
            $gameSelfSwitches.setValue(key, true);
        } else if (this._enemySelfSwitchCircle != null && isPlayerInCircleRange(this, this._circleVisionRadius)){
            this._isEnemy = false;
            var key = [this._mapId, this._eventId, this._enemySelfSwitchCircle];
            $gameSelfSwitches.setValue(key, true);
        };
    }
};

function isPlayerInCircleRange(event, radiusTiles){
    var tileWidth = $gameMap.tileWidth();
    var tileHeight = $gameMap.tileHeight();
    this.x = (event._realX - radiusTiles) * tileWidth;
    this.y = (event._realY - 1) * tileHeight;
    this.width = tileWidth * (radiusTiles * 2 + 1);
    this.height = tileHeight * (radiusTiles * 2 + 1);
    
    var player = $gamePlayer;
    if ((player._realX + 0.5) * tileWidth > x && player._realX * tileWidth < x + width && 
        (player._realY + 1) * tileHeight > y && player._realY * tileHeight < y + height){
        return true;
    }
    return false;
}

function isPlayerInRange(event, widthTiles, heightTiles){
    var tileWidth = $gameMap.tileWidth();
    var tileHeight = $gameMap.tileHeight();
    x = (event._realX - widthTiles / 2 + 0.5) * tileWidth;
    y = event._realY * tileHeight;
    var direction = event.direction();
    if (direction == 2){
        width = tileWidth * widthTiles;
        height = tileHeight * heightTiles;
        y += tileHeight;    
    }
    if (direction == 4){
        x = event._realX * tileHeight;
        y = (event._realY - widthTiles / 2 + 0.5) * tileWidth;
        height = tileWidth * widthTiles;
        width = tileHeight * heightTiles;
        x -= tileHeight * heightTiles;
    }
    if (direction == 6){
        x = event._realX * tileHeight;
        y = (event._realY - widthTiles / 2 + 0.5) * tileWidth;
        height = tileWidth * widthTiles;
        width = tileHeight * heightTiles;
        x += tileHeight;
    }
    if (direction == 8){
        width = tileWidth * widthTiles;
        height = tileHeight * heightTiles;
        y -= tileHeight * heightTiles;
    }
    
    //TODO: fix player recognition
    var player = $gamePlayer;
    if ((player._realX + 0.5) * tileWidth > x && player._realX * tileWidth < x + width && 
        (player._realY + 1) * tileHeight > y && player._realY * tileHeight < y + height){
        return true;
    }
    return false;
}

//====Create a sprite====//

function Sprite_StealthRect(){
    this.initialize.apply(this, arguments);
}

Sprite_StealthRect.prototype = Object.create(Sprite_Base.prototype);
Sprite_StealthRect.prototype.constructor = Sprite_StealthRect;

Sprite_StealthRect.prototype.initialize = function(eventId, width, height){
	Sprite_Base.prototype.initialize.call(this);
    this.event = $gameMap.event(eventId);
    this.widthTiles = width;
    this.heightTiles = height;
    this.calculateRect();
	this.bitmap = new Bitmap(Math.max(this.width, this.height), Math.max(this.width, this.height));
    this.bitmap.fillRect(0, 0, this.width, this.height);
    this.setColorTone([255, 55, 55, 255])
    this.opacity = 155;
}

Sprite_StealthRect.prototype.update = function(){
    Sprite_Base.prototype.update.call(this);
    this.calculateRect();
    this.bitmap.fillRect(0, 0, this.width, this.height);
}

Sprite_StealthRect.prototype.calculateRect = function(){
    var tileWidth = $gameMap.tileWidth();
    var tileHeight = $gameMap.tileHeight();
    
    this.x = (this.event._realX - this.widthTiles / 2 + 0.5) * tileWidth;
    this.y = this.event._realY * tileHeight;
    var direction = this.event.direction();
    if (direction == 2){
        this.width = tileWidth * this.widthTiles;
        this.height = tileHeight * this.heightTiles;
        this.y += tileHeight;    
    }
    if (direction == 4){
        this.x = this.event._realX * tileHeight;
        this.y = (this.event._realY - this.widthTiles / 2 + 0.5) * tileWidth;
        this.height = tileWidth * this.widthTiles;
        this.width = tileHeight * this.heightTiles;
        this.x -= tileHeight * this.heightTiles;
    }
    if (direction == 6){
        this.x = this.event._realX * tileHeight;
        this.y = (this.event._realY - this.widthTiles / 2 + 0.5) * tileWidth;
        this.height = tileWidth * this.widthTiles;
        this.width = tileHeight * this.heightTiles;
        this.x += tileHeight;
    }
    if (direction == 8){
        this.width = tileWidth * this.widthTiles;
        this.height = tileHeight * this.heightTiles;
        this.y -= tileHeight * this.heightTiles;
    }
}



function Sprite_StealthRadius(){
    this.initialize.apply(this, arguments);
}

Sprite_StealthRadius.prototype = Object.create(Sprite_Base.prototype);
Sprite_StealthRadius.prototype.constructor = Sprite_StealthRadius;

Sprite_StealthRadius.prototype.initialize = function(eventId, radius){
	Sprite_Base.prototype.initialize.call(this);
    this.event = $gameMap.event(eventId);
    this.radiusTiles = radius;
    this.calculateRect();
	this.bitmap = new Bitmap(Math.max(this.width, this.height), Math.max(this.width, this.height));
    this.bitmap.fillRect(0, 0, this.width, this.height);
    this.setColorTone([255, 55, 55, 255])
    this.opacity = 155;
}

Sprite_StealthRadius.prototype.update = function(){
    Sprite_Base.prototype.update.call(this);
    this.calculateRect();
    this.bitmap.fillRect(0, 0, this.width, this.height);
}

Sprite_StealthRadius.prototype.calculateRect = function(){
    var tileWidth = $gameMap.tileWidth();
    var tileHeight = $gameMap.tileHeight();
    
    this.x = (this.event._realX - this.radiusTiles) * tileWidth;
    this.y = (this.event._realY - 1) * tileHeight;
    this.width = tileWidth * (this.radiusTiles * 2 + 1);
    this.height = tileHeight * (this.radiusTiles * 2 + 1);
}