//=============================================================================
// EventFlagSystem.js
//=============================================================================

/*:
 * @plugindesc Система флагів подій.
 * @author WhitePaper
 *
 * @help 
 * isFlag('dead') - перевірка прапору 'dead' цієї події
 * isFlag('dead', 1) - перевірка прапору 'dead' події 1
 * 
 * setFlag('dead') - запис значення true прапору 'dead' цієї події
 * setFlag('dead', 1) - запис значення true прапору 'dead' події 1
 * setFlag('dead', 1, false) - запис значення false прапору 'dead' події 1
 */

function isFlag(flag, id=$gameMap._interpreter._eventId){
    return $gameMap.event(id)._eventFlags[flag] || false;
}

function setFlag(flag, id=$gameMap._interpreter._eventId, value=true){
    $gameMap.event(id)._eventFlags[flag] = value;
}

EventFlagSystem_Game_Event_initMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function() {
    EventFlagSystem_Game_Event_initMembers.call(this);
    this._eventFlags = {};
};