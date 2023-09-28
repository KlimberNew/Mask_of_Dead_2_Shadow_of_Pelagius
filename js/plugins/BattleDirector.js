//=============================================================================
// BattleDirector.js
//=============================================================================

/*:
 * @plugindesc Боєвий режисер.
 * @author WhitePaper
 *
 * @help 
 * Команди плагіну
 * 
 * StartBattle - активувати битви
 * 
 * StopBattle - зупинити битви
 * 
 * BattleDirector ally 450 50 40 A - подія-союзни_ця зі:
 * * здоров'ям 450 
 * * атакою 50 
 * * захистом 40 
 * * локальним перемикачем A після поразки
 * 
 * 
 * BattleDirector enemy 450 50 40 A - подія-противни_ця зі:
 * * здоров'ям 450 
 * * атакою 50 
 * * захистом 40 
 * * локальним перемикачем A після поразки
 * 
 * Скрипти
 * 
 * AllEnemiesDead() - чи усі події-противни_ці мертві
 * AllReapersDead() - чи усі події-союзниці мертві
 * 
 * battleDirectorEventHP(1) - здоров'я (HP) події 1
 * battleDirectorEventMHP(1) - максимальне здоров'я (MHP) події 1
 * battleDirectorEventHPRate(1) - співвідношення HP і MHP події 1
 * 
 * battleDirectorEventHP(0) - здоров'я (HP) цієї події
 * battleDirectorEventMHP(0) - максимальне здоров'я (MHP) цієї події
 * battleDirectorEventHPRate(0) - співвідношення HP і MHP цієї події
 */

///TODO: test with old saves


//===== Plugin command =====
selfSwitchLetters = ["A", "B", "C", "D"]

BattleDirector_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

Game_Interpreter.prototype.pluginCommand = function(command, args) {
    BattleDirector_Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'StartBattle') {
        $gameSystem.bdStartBattle();
    }
    if (command === 'StopBattle') {
        $gameSystem.bdStopBattle();
    }
};

function checkIfBattleDirector(event, params){
    if (params[0] == "BattleDirector"){
        BattleDirector_setAllyOrEnemy(event, params);
    }
}

function BattleDirector_setAllyOrEnemy(event, params){
    type = params[1];
    if (!type || (type != "ally" && type != "enemy")){
        throw new Error("Type of battler has to be either ally or enemy (" + params +")");
    }
    hp = parseInt(params[2]);
    if (!hp){
        throw new Error("HP has to be an integer! (" + params +")");
    }
    atk = parseInt(params[3]);
    if (!atk){
        throw new Error("Attack has to be an integer! (" + params +")");
    }
    def = parseInt(params[4]);
    if (!def){
        throw new Error("Defense has to be an integer! (" + params +")");
    }
    letter = params[5].toUpperCase();
    if (!selfSwitchLetters.contains(letter)){
        throw new Error("Self switch has to be a letter A, B, C, or D! (" + params +")");
    }
    event._battleDirectorType = type;
    event._battleDirectorMHP = hp;
    event._battleDirectorHP = hp;
    event._battleDirectorATK = atk;
    event._battleDirectorDEF = def;
    event._battleDirectorSelfSwitch = letter;
    event._battleDirectorDefeated = false;
}

//Перевірка, чи є бойовий директор 0 чи 2 у списку команд подій (2, бо стелс прямокутник + стелс круг )
BattleDirector_Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
    BattleDirector_Game_Event_setupPageSettings.call(this);
    if (this.page() == undefined || this.page().list == undefined){
        return;
    }
    var first = this.page().list[0]; 
    if (first == undefined){
        return;
    }
    if (first.code == 356){
        params = first.parameters[0].split(" ");
        checkIfBattleDirector(this, params)
    }
    first = this.page().list[2]; 
    if (first == undefined){
        return;
    }
    if (first.code == 356){
        params = first.parameters[0].split(" ");
        checkIfBattleDirector(this, params)
    }
};

//===== Check if battle is started =====
BattleDirector_Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    BattleDirector_Game_System_initialize.call(this);
    this._bd_battle_started = false;
};

Game_System.prototype.isBattleStarted = function(){
    if (this._bd_battle_started == undefined){
        this._bd_battle_started = false;
    }
    return this._bd_battle_started;
}

Game_System.prototype.bdStartBattle = function(){
    this._bd_battle_started = true;
}

Game_System.prototype.bdStopBattle = function(){
    this._bd_battle_started = false;
}

//===== Check collision =====

BattleDirector_Game_Event_prototype_update = Game_Event.prototype.update;
Game_Event.prototype.update = function() {
    BattleDirector_Game_Event_prototype_update.call(this);
    this.checkEventTriggerAuto();
    this.updateParallel();
    if ($gameSystem.isBattleStarted() && this._battleDirectorType != undefined && !this._battleDirectorDefeated && !this.isMoving()){
        this.battleManagerCheckBattlerFront(this._direction);
    }
};

//Перевірка, чи є хтось попереду
Game_Event.prototype.battleManagerCheckBattlerFront = function(d) {
    var x2 = $gameMap.roundXWithDirection(this._x, d);
    var y2 = $gameMap.roundYWithDirection(this._y, d);
    this.battleManagerCheckBattler(x2, y2);
};

//Чи переможені
Game_Event.prototype.battleDirectorIsDefeated = function(){
    return this._battleDirectorDefeated || $gameSelfSwitches.value([this._mapId, this._eventId, this._battleDirectorSelfSwitch]);
}

//Чи різняться типи (щоб билися лише з протилежною стороною)
Game_Event.prototype.battleDirectorIsDifferentType = function(event){
    return event._battleDirectorType != undefined && event._battleDirectorType != this._battleDirectorType
}

//Перевірка, чи є хтось попереду + обробка атаки (ім'я щось не дуже, бо здається, наче тільки перевіряє)
Game_Event.prototype.battleManagerCheckBattler = function(x, y) {
    $gameMap.eventsXy(x, y).forEach(function(event) {
        if (this.battleDirectorIsDifferentType(event) && !event.battleDirectorIsDefeated() && !this.battleDirectorIsDefeated() && !this.isAnimationPlaying()) {
            this._battleDirectorHP -= event._battleDirectorATK / this._battleDirectorDEF;
            this.requestAnimation(1);
            if (this._battleDirectorHP <= 0){
                this._battleDirectorDefeated = true;
                var key = [this._mapId, this._eventId, this._battleDirectorSelfSwitch];
                $gameSelfSwitches.setValue(key, true);
            }
        }
    }, this);
};

//===== Functions to check if all (from side) is dead =====
function AllEnemiesDead(){
    let result = true;
    $gameMap.events().forEach(function(event){
        if (event._battleDirectorType == "enemy"){
            if (!event.battleDirectorIsDefeated()){
                result = false;
                return;
            }
        }
    })
    return result; 
}

function AllReapersDead(){
    let result = true;
    $gameMap.events().forEach(function(event){
        if (event._battleDirectorType == "ally"){
            if (!event.battleDirectorIsDefeated()){
                result = false;
                return;
            }
        }
    })
    return result; 
}

//===== Bonus user functions (плагін може обійтися без них, але корисно кінцевим користувачам) =====

function battleDirectorEventHP(eventId){
    if (eventId == 0){
        eventId = $gameMap._interpreter._eventId;
    }
    return $gameMap.event(eventId)._battleDirectorHP;
}

function battleDirectorEventMHP(eventId){
    if (eventId == 0){
        eventId = $gameMap._interpreter._eventId;
    }
    return $gameMap.event(eventId)._battleDirectorMHP;
}

function battleDirectorEventHPRate(eventId){
    if (eventId == 0){
        eventId = $gameMap._interpreter._eventId;
    }
    return $gameMap.event(eventId)._battleDirectorMHP / $gameMap.event(eventId)._battleDirectorMHP;
}