//=============================================================================
// EventFlagSystem.js
//=============================================================================

/*:
 * @plugindesc Система флагів подій.
 * @author WhitePaper
 *
 * @help 
 * isFlag('dead', this) - перевірка прапору 'dead' цієї події
 * isFlag('dead', 1) - перевірка прапору 'dead' події 1
 * 
 * setFlag('dead', this) - запис значення true прапору 'dead' цієї події
 * setFlag('dead', 1) - запис значення true прапору 'dead' події 1
 * setFlag('dead', 1, false) - запис значення false прапору 'dead' події 1
 * 
 * $gameSystem._eventFlags[2][1]['dead'] - прапор 'dead' події 1 карти 2
 */



function isFlag(flag, id){
    if (!Number(id)){
        id = id._eventId;
    }
    if (!$gameSystem._eventFlags[$gameMap._mapId]){
        return false;
    }
    if (!$gameSystem._eventFlags[$gameMap._mapId][id]){
        return false;
    }
    return $gameSystem._eventFlags[$gameMap._mapId][id][flag] || false;
}

function setFlag(flag, id, value=true){
    if (!Number(id)){
        id = id._eventId;
    }
    if (!$gameSystem._eventFlags[$gameMap._mapId]){
        $gameSystem._eventFlags[$gameMap._mapId] = {};
    }
    if (!$gameSystem._eventFlags[$gameMap._mapId][id]){
        $gameSystem._eventFlags[$gameMap._mapId][id] = {};
    }
    $gameSystem._eventFlags[$gameMap._mapId][id][flag] = value;
}

EventFlagSystem_Game_System_prototype_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    EventFlagSystem_Game_System_prototype_initialize.apply(this);
    this._eventFlags = {};
}