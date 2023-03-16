//=============================================================================
// ATB_WIP.js
//=============================================================================

/*:
 * @plugindesc ATB.
 * @author 
 *
 * @help This plugin does not provide plugin commands.
 *
 * @param base
 * @type number
 * @decimals 5
 * @desc base in formula (base - agi / divider)
 * @default 100
 *
 * @param divider
 * @type number
 * @decimals 5
 * @desc divider in formula (base - agi / divider)
 * @default 30
 *
 * @param atb_x
 * @type eval
 * @desc x of atb gauge (default Graphics.boxWidth - 64)
 * @default Graphics.boxWidth - 64
 *
 * @param hud_x
 * @type eval
 * @desc x of hud (default Graphics.width - (2 - id % 2 ) * 250)
 * @default Graphics.width - (2 - id % 2 ) * 250
 *
 * @param hud_y
 * @type eval
 * @desc y of hud (default Graphics.height - (2 - Math.floor(id / 2)) * 125 - 20)
 * @default Graphics.height - (2 - Math.floor(id / 2)) * 125 - 20
 * 
 * @help
 * Skill 3 - Head
 * Skill 4 - Torso
 * Skill 5 - Legs
 * Skill 6 - Arms
 * 
 * Layout 1 (прямоугольник 2 на 2):
 * hud_x: Graphics.width - (2 - id % 2 ) * 250
 * hud_y: Graphics.height - (2 - Math.floor(id / 2)) * 125 - 20
 * 
 * Layout 2 (слева направо):
 * hud_x: id * 230
 * hud_y: Graphics.height - 145
 * 
 */
 ATB = {}
 
ATB.Parameters = PluginManager.parameters('ATB_WIP');
ATB.Param = {};
 
ATB.Param.Base = Number(ATB.Parameters['base']);
ATB.Param.Divider = Number(ATB.Parameters['divider']);

ATB.Param.AtbX = ATB.Parameters['atb_x'] || Graphics.boxWidth - 64

ATB.Param.HudX = ATB.Parameters['hud_x'] || "Graphics.width - (2 - id % 2 ) * 250" 
ATB.Param.HudY = ATB.Parameters['hud_y'] || "Graphics.height - (2 - Math.floor(id / 2)) * 125 - 20"

 
function doPathExist(path_to_file){
	const fs = require('fs');
	var path = require('path');
	return fs.existsSync(path.join(path.dirname(process.mainModule.filename), path_to_file));
}

///===HitZone===///
 
//Window_HitZone 
function Window_HitZone(){
	this.initialize.apply(this, arguments);
}

Window_HitZone.prototype = Object.create(Window_Command.prototype);
Window_HitZone.prototype.constructor = Window_HitZone;

Window_HitZone.prototype.initialize = function(){
	Window_Command.prototype.initialize.call(this);
	this.hide();
}

Window_HitZone.prototype.makeCommandList = function(){
	this.addCommand('Голова', 'head');
	this.addCommand('Торс', 'torso');
	this.addCommand('Ноги', 'legs');
	this.addCommand('Руки', 'arms');
}

//Hit zone in scene
Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
Scene_Battle.prototype.createAllWindows = function() {
	Scene_Battle_createAllWindows.apply(this);
};

Scene_Battle.prototype.createHitZoneWindow = function(){
	this._hitZoneWindow = new Window_HitZone();
	this._hitZoneWindow.setHandler('head', this.onZoneOk.bind(this, 3));
	this._hitZoneWindow.setHandler('torso', this.onZoneOk.bind(this, 4));
	this._hitZoneWindow.setHandler('legs', this.onZoneOk.bind(this, 5));
	this._hitZoneWindow.setHandler('arms', this.onZoneOk.bind(this, 6));
	this._hitZoneWindow.setHandler('cancel', this.onZoneCancel.bind(this));
	this._hitZoneWindow.deselect();
	this._hitZoneWindow.width = 180;
	enemyIndex = BattleManager.inputtingAction()._targetIndex;
	enemySprites = BattleManager._spriteset._enemySprites;
	enemySprite = enemySprites[enemySprites.length - enemyIndex - 1];
	this._hitZoneWindow.x = Math.max(0, enemySprite.x - this._hitZoneWindow.width / 2);
	this.addWindow(this._hitZoneWindow);
}

Scene_Battle.prototype.onZoneCancel = function(){
	this._hitZoneWindow.hide();
	delete this._hitZoneWindow;
	this._enemyWindow.show();
	this._enemyWindow.activate();
	BattleManager._phase = "input"
}

Scene_Battle.prototype.onZoneOk = function(skillId){
	if (BattleManager.inputtingAction() != null){
		BattleManager.inputtingAction().setSkill(skillId);
	}
	this._hitZoneWindow.hide();
	delete this._hitZoneWindow;
	BattleManager._playerTurn = false;
	BattleManager._phase = 'turn'
	BattleManager._isAction = true;
	this.selectNextCommand();
}

Scene_Battle.prototype.onActorOk = function() {
    var action = BattleManager.inputtingAction();
    action.setTarget(this._actorWindow.index());
    this._actorWindow.hide();
    this._skillWindow.hide();
	this._itemWindow.hide();
	BattleManager._playerTurn = false;
	BattleManager._phase = 'turn'
	BattleManager._isAction = true;
    this.selectNextCommand();
};

Scene_Battle.prototype.onEnemyOk = function() {
    var action = BattleManager.inputtingAction();
	action.setTarget(this._enemyWindow.enemyIndex());
    this._enemyWindow.hide();
    this._skillWindow.hide();
    this._itemWindow.hide();
	if (action.isAttack()){
		BattleManager._phase = "hitzone"
		this.createHitZoneWindow();
		this._hitZoneWindow.show();
		this._hitZoneWindow.select(0);
	} else{
		BattleManager._playerTurn = false;
		BattleManager._phase = 'turn'
		BattleManager._isAction = true;
		this.selectNextCommand();
	}
};

Scene_Battle.prototype.onEnemyCancel = function() {
    this._enemyWindow.hide();
    switch (this._actorCommandWindow.currentSymbol()) {
    case 'attack':
		this._actorCommandWindow.setup(BattleManager.actor())
		this._actorCommandWindow.show();
        this._actorCommandWindow.activate();
        break;
    case 'skill':
        this._skillWindow.show();
        this._skillWindow.activate();
        break;
    case 'item':
        this._itemWindow.show();
        this._itemWindow.activate();
        break;
    }
};

///===ATB_Logic===///

//atb_dur = 100 / agi

BattleManager.setup = function(troopId, canEscape, canLose) {
    this.initMembers();
    this._canEscape = canEscape;
    this._canLose = canLose;
    $gameTroop.setup(troopId);
    $gameScreen.onBattleStart();
    this.makeEscapeRatio();
	this._actionEnemies = [];
	this._playerTurn = false;
	this._isAction = false;
};
BattleManager.startTurn = function() {
	if (this._subject != null && this._subject.isEnemy()){
		this._actionEnemies.push(this._subject);
	}
	this._subject = $gameParty.members()[this._activeActor];
    this._phase = 'turn';
    //this.clearActor();
	/*if (this._activeActor == 0){
    	$gameTroop.increaseTurn();
	}*/
    this.makeActionOrders();
    $gameParty.requestMotionRefresh();
    this._logWindow.startTurn();
	this._playerTurn = false;

};

Game_Battler.prototype.forceAction = function(skillId, targetIndex) {
    //console.log(this._actions);
	if (this._actions[0] == undefined || this._actions[0]._item._dataClass == ""){
		this.clearActions();
	}
    var action = new Game_Action(this, true);
    action.setSkill(skillId);
    if (targetIndex === -2) {
        action.setTarget(this._lastTargetIndex);
    } else if (targetIndex === -1) {
        action.decideRandomTarget();
    } else {
        action.setTarget(targetIndex);
    }
    this._actions.unshift(action);
	console.log(this._actions);
};

Game_Battler_initMembers = Game_Battler.prototype.initMembers;
Game_Battler.prototype.initMembers = function() {
    Game_Battler_initMembers.apply(this);
	this._turnCount = 0;
};

Game_Enemy.prototype.meetsTurnCondition = function(param1, param2) {
    var n = this._turnCount;
    if (param2 === 0) {
        return n === param1;
    } else {
        return n > 0 && n >= param1 && n % param2 === param1 % param2;
    }
};

Game_Battler.prototype.makeActions = function() {
    this.clearActions();
        var actionTimes = this.makeActionTimes();
        this._actions = [];
        for (var i = 0; i < actionTimes; i++) {
            this._actions.push(new Game_Action(this));
        }
};

Game_Enemy.prototype.makeActions = function() {
	if (this._actions.length == 0){
		Game_Battler.prototype.makeActions.call(this);
		if (this.numActions() > 0) {
			var actionList = this.enemy().actions.filter(function(a) {
				return this.isActionValid(a);
			}, this);
			if (actionList.length > 0) {
				this.selectAllActions(actionList);
			}
		}
	}
}

Scene_Battle.prototype.onSelectAction = function() {
    var action = BattleManager.inputtingAction();
    this._skillWindow.hide();
    this._itemWindow.hide();
    if (!action.needsSelection()) {
		BattleManager._playerTurn = false;
		BattleManager._phase = 'turn'
		BattleManager._isAction = true;
		this.selectNextCommand();
    } else if (action.isForOpponent()) {
        this.selectEnemySelection();
    } else {
        this.selectActorSelection();
    }
};

BattleManager.selectNextCommand = function() {
    do {
        if (!this.actor() || !this.actor().selectNextCommand()) {
			if (this._actorIndex < 0){
				this.changeActor(this._activeActor, 'waiting');
			} else {
				this.subject = $gameParty.members()[this._actorIndex]
				this.changeActor(this._actorIndex + this._actorsLength, 'waiting');
			}
            if (this._actorIndex >= $gameParty.size()) {
                this.startTurn();
                break;
            }
        }
    } while (!this.actor().canInput());
};

Game_Enemy_setup = Game_Enemy.prototype.setup
Game_Enemy.prototype.setup = function(enemyId, x, y) {
    Game_Enemy_setup.apply(this, arguments)
	this._atbEnemyId = '';
};

Game_Enemy.prototype.setAtbEnemy = function(atbEnemyId){
	this._atbEnemyId = atbEnemyId;
}

Game_Enemy.prototype.gainHp = function(value){
	Game_Battler.prototype.gainHp.call(this, value);
}
Game_Enemy_performCollapse = Game_Enemy.prototype.performCollapse
Game_Enemy.prototype.performCollapse = function() {
	spriteset = BattleManager._spriteset
	spriteset.deleteInfo(this._atbEnemyId, spriteset._atbEnemies, 0)
    Game_Enemy_performCollapse.apply(this)
};

Game_Enemy.prototype.revive = function() {
    Game_BattlerBase.prototype.revive.apply(this);
	BattleManager._spriteset._battleField.addChild(BattleManager._spriteset._atbEnemies[this._atbEnemyId]);
};

Game_Actor_setup = Game_Actor.prototype.setup
Game_Actor.prototype.setup = function(actorId) {
    Game_Actor_setup.apply(this, arguments)
	this._atbActorId = '';
};

Game_Actor.prototype.setAtbActor = function(atbActorId){
	this._atbActorId = atbActorId;
}

Game_Actor_performCollapse = Game_Actor.prototype.performCollapse
Game_Actor.prototype.performCollapse = function() {
	spriteset = BattleManager._spriteset
	spriteset.deleteInfo(this._atbActorId, spriteset._atbActors, 0)
    Game_Actor_performCollapse.apply(this)
};

Game_Actor.prototype.revive = function() {
    Game_BattlerBase.prototype.revive.apply(this);
	BattleManager._spriteset._battleField.addChild(BattleManager._spriteset._atbActors[this._atbActorId]);
};

Scene_Battle_terminate = Scene_Battle.prototype.terminate;
Scene_Battle.prototype.terminate = function() {
    Scene_Battle_terminate.call(this);
	BattleManager._battlersTurns = undefined;
};

BattleManager_processVictory = BattleManager.processVictory;
BattleManager.processVictory = function() {
    BattleManager_processVictory.apply(this)
};

BattleManager.processAbort = function() {
    $gameParty.removeBattleStates();
    this.replayBgmAndBgs();
    this.endBattle(1);
};

BattleManager.processEscape = function() {
	this._phase = "escape";
    $gameParty.performEscape();
    SoundManager.playEscape();
    var success = this._preemptive ? true : (Math.random() < this._escapeRatio);
    if (success) {
        this.displayEscapeSuccessMessage();
        this._escaped = true;
        this.processAbort();
    } else {
		//this._phase = "escape";
        this.displayEscapeFailureMessage();
        this._escapeRatio += 0.1;
		$gameParty.clearActions();
		this._battlersTurns[this._activeActor][1] = ATB.Param.Base;
		this._battlersTurns[this._activeActor][2] = false;
    }
    return success;
};

BattleManager.updateEscape = function(){
	if (!$gameMessage.isBusy()){
		this.startTurn();
	}
}

BattleManager.makeActionOrders = function() {
    this._actionBattlers = $gameParty.members(); //this._actionBattlers = [$gameParty.members()[0]]
};

BattleManager_startBattle = BattleManager.startBattle;
BattleManager.startBattle = function() {
    BattleManager_startBattle.apply(this);
	this._battlersTurns = [];
	battlers = [];
	battlers = battlers.concat($gameParty.members());
	battlers = battlers.concat($gameTroop.members());
	this._slowestBattler = battlers[0];
	for (i = 0; i < battlers.length; i++){
		this._battlersTurns.push([battlers[i], ATB.Param.Base, false]);
		if (battlers[i].agi < this._slowestBattler.agi){
			this._slowestBattler = battlers[i];
		}
	}
	this._actorsLength = $gameParty.members().length
	$gameTroop.makeActions();
	this.refreshStatus();
	this._activeActor = null;
	this._isEnemySubject = false;
};

//REMOVED MESSAGES
BattleManager.displayStartMessages = function() {
};

BattleManager.displayVictoryMessage = function() {
};

BattleManager.displayDefeatMessage = function() {
};

BattleManager.displayEscapeSuccessMessage = function() {
};

BattleManager.displayEscapeFailureMessage = function() {
};

Window_BattleLog.prototype.addText = function(text) {
};



//

BattleManager_update = BattleManager.update;
BattleManager.update = function() {
    if (!this.isBusy() && !this.updateEvent()) {
        switch (this._phase) {
        case 'start':
            this.startB();
            break;
        case 'turn':
            this.updateTurn();
            break;
        case 'action':
            this.updateAction();
            break;
        case 'turnEnd':
            this.updateTurnEnd();
            break;
        case 'battleEnd':
            this.updateBattleEnd();
            break;
        case 'escape':
			this.updateEscape();
			break;
		}
    }
	for (i = 0; i < this._battlersTurns.length; i++){
		if (!(this._playerTurn && i < this._actorsLength) && this._phase == 'turn' && !this._isAction){
			this._battlersTurns[i][1] = this._battlersTurns[i][1] - this._battlersTurns[i][0].agi / ATB.Param.Divider;
			if (this._battlersTurns[i][1] <= 0){
				this._battlersTurns[i][2] = true;
				this._battlersTurns[i][1] = ATB.Param.Base;
				if (this._battlersTurns[i][0] == this._slowestBattler){
					$gameTroop.increaseTurn();
				}
				if (i < this._actorsLength){
					this._playerTurn = true;
					this._subject = $gameParty.members()[i];
					this._activeActor = i;
					this._isAction = true;
				} else {
					if ($gameTroop.members()[i - this._actorsLength].isAlive()){
						if (!this._isEnemySubject){
							this._subject = $gameTroop.members()[i - this._actorsLength];
							this._isEnemySubject = true;
						} else {
							this._actionEnemies.push($gameTroop.members()[i - this._actorsLength]);
						}
					}
				}
				this._battlersTurns[i][2] = true;
			}
		}
	}
	if (this._phase == 'turn' && 
	(!this._subject || this._subject == null || (this._subject.isEnemy() && !this._isEnemySubject)) && this._actionEnemies.length > 0){
		this._subject = this._actionEnemies[0];
		this._isEnemySubject = true;
		this._actionEnemies.splice(0, 1);
		this._subject._states.forEach(function(state){
			this._subject._stateTurns[state]--;
			this._logWindow.displayCurrentState(this._subject);
			if (this._subject._stateTurns[state] <= 0){
				this._subject.removeState(state);
				this._logWindow.displayRemovedStates(this._subject);
			}
		}, this)
		this._battlersTurns[this._subject.index() + this._actorsLength][2] = true;
	}
};

Game_Battler.prototype.onTurnEnd = function() {
    this.clearResult();
    this.regenerateAll();
	this.removeStatesAuto(2);
};

BattleManager.startB = function() {
    this._phase = "turn";
	//this.startTurn();
};

BattleManager.invokeAction = function(subject, target) {
    this._logWindow.push('pushBaseLine');
    if (Math.random() < this._action.itemCnt(target)) {
        this.invokeCounterAttack(subject, target);
    } else if (Math.random() < this._action.itemMrf(target)) {
        this.invokeMagicReflection(subject, target);
    } else {
        this.invokeNormalAction(subject, target);
    }
    subject.setLastTarget(target);
    this._logWindow.push('popBaseLine');
	this.refreshStatus();
};

BattleManager.processTurn = function() {
	var subject = this._subject;
	if (subject.isEnemy() && this._battlersTurns[subject.index() + this._actorsLength][2] || 
	subject.isActor() && this._battlersTurns[subject.index()][2]){
		var action = subject.currentAction();
		if (action) {
			action.prepare();
			if (action.isValid()) {
				this.startAction();
				subject._turnCount++;
			}
			subject.removeCurrentAction();
			if (subject.isEnemy()){
				this._battlersTurns[subject.index() + this._actorsLength][2] = false;
				this._isEnemySubject = false;
			}
			//$gameParty.makeActions();
			$gameTroop.makeActions();
		this.subject = null
		} else {
			this._isAction = false;
			subject.onAllActionsEnd();
			subject.updateStateTurns();
			this.refreshStatus();
			this._logWindow.displayAutoAffectedStatus(subject);
			this._logWindow.displayCurrentState(subject);
			this._logWindow.displayRegeneration(subject);
			this._subject = this.getNextSubject();
		}
	}

};
BattleManager.refreshHpBars = function(){
	this._spriteset._hpGauges.forEach(i => i.refresh());
}
BattleManager.refreshMpBars = function(){
	this._spriteset._mpGauges.forEach(i => i.refresh());
}
BattleManager.refreshTpBars = function(){
	this._spriteset._tpGauges.forEach(i => i.refresh());
}
BattleManager.refreshTextOnBars = function(){
	this._spriteset._hudTextsNum.forEach(i => i.refresh());
}
BattleManager.refreshIcons = function(){
	this._spriteset._actorStateIcons.forEach(i => i.forEach(j => j.refresh()));
}
BattleManager.endAction = function() {
	this._logWindow.endAction(this._subject);
	this._isAction = false;
    this._phase = 'turn';
};

BattleManager_startAction = BattleManager.startAction;
BattleManager.startAction = function() {
	subject = this._subject;
    BattleManager_startAction.apply(this);
};

BattleManager.updateTurnEnd = function() {
    this.startInput();
};

BattleManager.updateEvent = function() {

    if (this.isActionForced() && !(this._phase === 'battleEnd') ) {
        this.processForcedAction();
        //return true;
    } else if (!(this._phase === 'battleEnd')){
        return this.updateEventMain();
    }
    return this.checkAbort();
};

BattleManager.processForcedAction = function() {
    if (this._actionForcedBattler) {
        this._turnForced = true;
        this._subject = this._actionForcedBattler;
        if (this._subject._actions.length <= 1 || (this._subject.isEnemy() && this._battlersTurns[$gameParty.members().length + this._subject.index()][1] > 0)){
			this._actionForcedBattler = null;
		}
        this.startAction();
        this._subject.removeCurrentAction();
    }
};

Scene_Battle.prototype.changeInputWindow = function() {
	turn = false;
	for (i = 0; i < BattleManager._battlersTurns.length; i++){
		if (BattleManager._battlersTurns[i][1] <= 0){
			turn = true;
			break;
		}
	}
    if (BattleManager.isInputting()) {
        if (this._hitZoneWindow != undefined || !BattleManager._playerTurn){
			//do nothing
		} else if(BattleManager.actor()) {
            this.startActorCommandSelection();
        } else {
			if ($gameParty.members()[BattleManager._activeActor].canInput()){
				BattleManager.changeActor(BattleManager._activeActor, 'undecided');
				this.startActorCommandSelection();
				//this.startPartyCommandSelection();
			} else {
				BattleManager.startTurn();
			}
        }
    } else {
        this.endCommandSelection();
    }
};

///===ATB_Gauge===///

Spriteset_Battle_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
Spriteset_Battle.prototype.createLowerLayer = function() {
    Spriteset_Battle_createLowerLayer.call(this);
	this._hpBases = [];
	this._hpGauges = [];
	this._mpGauges = [];
	this._tpGauges = [];
	this._hudFaces = [];
	this._hudNames = [];
	this._hudTexts = [];
	this._hudTextsNum = [];
	this._actorStateIcons = [[], [], [], []];
	this.createHUDEnemies();
	for (i in $gameParty.members()){
		this.createHPBase(i); //this.createHPBase(x + (Graphics.boxWidth - x) / 4 * i, y, i);
		this.createHPBar(i);
		this.createMPBar(i);
		this.createTPBar(i);
		this.createHUDFace(i);
		this.createHUDName(i);
		this.createHUDText(i);
		for (j = 0; j < 4; j++){
			this.createActorStateIcon(i, j);
		}
	}
	this.createATBBar();
	this.createATBActor();
	this.createATBEnemies();
	this.createATBMagic();
};

Spriteset_Battle.prototype.createATBBar = function(){
    this._atbBase = new Sprite_ATBBarBase("WIP_Line");
    this._battleField.addChild(this._atbBase);
}

Spriteset_Battle.prototype.createATBActor = function(){
	this._atbActors = [];
	for (i in $gameParty.battleMembers()){
		id = $gameParty._actors[i]
		if (doPathExist("img/system/Actor_" + id + ".png")){
			filename = "Actor_" + id;
		} else{		
			filename = "Actor_N"
		}
		this._atbActors.push(new Sprite_ATBActor(filename, this._atbBase, i));
		this._battleField.addChild(this._atbActors[i]);
		$gameParty.members()[i].setAtbActor(i)
	}
}

Spriteset_Battle.prototype.createATBEnemies = function(){
	this._atbEnemies = [];
		for (i = 0; i < $gameTroop._enemies.length; i++){
			id = $gameTroop._enemies[i]._enemyId;
			if (doPathExist("img/system/Enemy_" + id + ".png")){
				filename = "Enemy_" + id;
			} else{
				filename = "Enemy_N"
			}
			this._atbEnemies.push(new Sprite_ATBEnemy(filename, this._atbBase, i));
			this._battleField.addChild(this._atbEnemies[i]);
			$gameTroop._enemies[i].setAtbEnemy(i)
		}
}

Spriteset_Battle.prototype.createATBMagic = function(){
	this._atbMagic = [];
	for (i = 0; i < this._atbEnemies.length; i++){
		this._atbMagic.push(new Sprite_ATBMagic(this._atbEnemies[i]));
		this._battleField.addChild(this._atbMagic[i]);
	}
}

Spriteset_Battle.prototype.deleteInfo = function(id, elem, dec){
	found = false
	toDel = null
	elem.forEach(function(i){
		if (i._id == id - dec){
			found = true;
			toDel = i
		}
	})
	if (found){
			this._battleField.removeChild(toDel);
	}
}

function Sprite_ATBBarBase(){
	this.initialize.apply(this, arguments)
}

Sprite_ATBBarBase.prototype = Object.create(Sprite_Base.prototype);
Sprite_ATBBarBase.prototype.constructor = Sprite_ATBBarBase;

Sprite_ATBBarBase.prototype.initialize = function(picture){
	Sprite_Base.prototype.initialize.call(this);
	this.bitmap = ImageManager.loadSystem(picture);
	this.x = eval(ATB.Param.AtbX);
}

function Sprite_ATBActor(){
	this.initialize.apply(this, arguments)
}

Sprite_ATBActor.prototype = Object.create(Sprite_Base.prototype);
Sprite_ATBActor.prototype.constructor = Sprite_ATBActor;

Sprite_ATBActor.prototype.initialize = function(picture, atbBase, id){
	Sprite_Base.prototype.initialize.call(this);
	this.bitmap = ImageManager.loadSystem(picture);
	this._atbBase = atbBase;
	this._id = id
}

Sprite_ATBActor.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	if (this._atbBase != undefined && BattleManager._battlersTurns != undefined){
		this.x = this._atbBase.x;
		if (BattleManager._battlersTurns[this._id][1] == ATB.Param.Base){
			this.y = 0
		} else {
			this.y = this._atbBase.height / ATB.Param.Base * (BattleManager._battlersTurns[this._id][1])
		}
	}
}

function Sprite_ATBEnemy(){
	this.initialize.apply(this, arguments)
}

Sprite_ATBEnemy.prototype = Object.create(Sprite_ATBActor.prototype);
Sprite_ATBEnemy.prototype.constructor = Sprite_ATBEnemy;

Sprite_ATBEnemy.prototype.initialize = function(picture, atbBase, id){
	Sprite_ATBActor.prototype.initialize.call(this, picture, atbBase);
	this._id = id;
}

Sprite_ATBEnemy.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	if (this._atbBase != undefined && BattleManager._battlersTurns != undefined 
	&& BattleManager._battlersTurns.length == $gameParty.members().length + $gameTroop.members().length){
		this.x = this._atbBase.x;
		this.y = this._atbBase.height / ATB.Param.Base * (BattleManager._battlersTurns[this._id + BattleManager._actorsLength][1])
	}
}

function Sprite_ATBMagic(){
	this.initialize.apply(this, arguments)
}

Sprite_ATBMagic.prototype = Object.create(Sprite_Base.prototype);
Sprite_ATBMagic.prototype.constructor = Sprite_ATBMagic;

Sprite_ATBMagic.prototype.initialize = function(enemyBase){
	Sprite_Base.prototype.initialize.call(this);
	this._magicBitmap = ImageManager.loadSystem("WIP_Magic_Skill_Detector");
	this._physBitmap = ImageManager.loadSystem("WIP_Phys_Skill_Detector");
	this._netBitmap = ImageManager.loadSystem("WIP_Neitral_Skill_Detector");
	this.bitmap = this._magicBitmap
	this._enemyBase = enemyBase;
	this._id = enemyBase._id
	this.opacity = 0;
}

Sprite_ATBMagic.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	this.y = this._enemyBase.y + (this._enemyBase.height - this.height)/2;
	this.x = this._enemyBase.x - this.width;
	if (BattleManager._battlersTurns != undefined
		&& BattleManager._battlersTurns[this._id + $gameParty.members().length] != undefined &&
		BattleManager._battlersTurns[this._id + $gameParty.members().length][0]._actions[0] != undefined) {

		skill = BattleManager._battlersTurns[this._id + $gameParty.members().length][0]._actions[0]._item
		if (skill._dataClass == "skill") {
			if ($dataSkills[skill._itemId].hitType != 0){
				if ($dataSkills[skill._itemId].hitType == 1){
					this.bitmap = this._physBitmap;
				} else if ($dataSkills[skill._itemId].hitType == 2){
					this.bitmap = this._magicBitmap;
				}
				this.opacity = 255;
			} else{
				this.bitmap = this._netBitmap;
				this.opacity = 255;
			}
		}
		else{
			this.opacity = 0;
		}
	} else {
		this.opacity = 0;
	}
}

///HUD

Spriteset_Battle.prototype.createHPBase = function(id){
    this._hpBases.push(new Sprite_HPBarBase("WIP_HP_Actor_Bar", id));
    this._battleField.addChild(this._hpBases[id]);
}

Spriteset_Battle.prototype.createHPBar = function(id){
	this._hpGauges.push(new Sprite_HPBar(this._hpBases[id]))
	this._battleField.addChild(this._hpGauges[id])
}

textcolor = function(n){
	var px = 96 + (n % 8) * 12 + 6;
	var py = 144 + Math.floor(n / 8) * 12 + 6;
	windowskin = ImageManager.loadSystem('Window');
	return windowskin.getPixel(px, py);
}
Spriteset_Battle.prototype.createMPBar = function(id){
	this._mpGauges.push(new Sprite_MPBar(this._hpBases[id]));
    this._battleField.addChild(this._mpGauges[id]);
}

Spriteset_Battle.prototype.createTPBar = function(id){
	this._tpGauges.push(new Sprite_TPBar(this._hpBases[id]));
    this._battleField.addChild(this._tpGauges[id]);
}

Spriteset_Battle.prototype.createHUDFace = function(id){
	this._hudFaces.push(new Sprite_HUDFace($gameParty.members()[id]._faceName, $gameParty.members()[id]._faceIndex, this._hpBases[id]));
	this._battleField.addChild(this._hudFaces[id]);
}

Spriteset_Battle.prototype.createHUDName = function(id){
	this._hudNames.push(new Sprite_HUDName(id, this._hpBases[id]));
	this._battleField.addChild(this._hudNames[id]);
}

Spriteset_Battle.prototype.createHUDText = function(id){
	this._hudTexts.push(new Sprite_TextOnBars(this._hpBases[id]));
	this._battleField.addChild(this._hudTexts[id]);
	this._hudTextsNum.push(new Sprite_TextOnBarsNum(this._hpBases[id]));
	this._battleField.addChild(this._hudTextsNum[id]);
}

Spriteset_Battle.prototype.createActorStateIcon = function(id, prior){
	this._actorStateIcons[prior].push(new Sprite_ActorStateIcon(id, this._hpBases[id], prior));
	this._battleField.addChild(this._actorStateIcons[prior][id]);
}

function Sprite_HPBarBase(){
	this.initialize.apply(this, arguments)
}

Sprite_HPBarBase.prototype = Object.create(Sprite_Base.prototype);
Sprite_HPBarBase.prototype.constructor = Sprite_HPBarBase;

Sprite_HPBarBase.prototype.initialize = function(picture, id){
	Sprite_Base.prototype.initialize.call(this);
	this.bitmap = ImageManager.loadSystem(picture);
	this.x = eval(ATB.Param.HudX);
	this.y = eval(ATB.Param.HudY);
	this._id = id;
}

function Sprite_HPBar(){
	this.initialize.apply(this, arguments)
}

Sprite_HPBar.prototype = Object.create(Sprite_Base.prototype);
Sprite_HPBar.prototype.constructor = Sprite_HPBar;

Sprite_HPBar.prototype.initialize = function(base){
	Sprite_Base.prototype.initialize.call(this);
	this.base = base;
	this.bitmap = new Bitmap(125,36);
	this.bitmap.gradientFillRect(0,18,this.bitmap.width,18,textcolor(20), textcolor(21));
	this.x = this.base.x + 100;
	this.y = this.base.y + 10 - 18;
	this._id = this.base._id;
	this.refresh();
}
Sprite_HPBar.prototype.refresh = function(){
	var pw = Math.floor(this._bitmap.width * $gameParty.members()[this._id].hpRate())
	this.setFrame(0, 0, pw, this._bitmap.height)
}

function Sprite_MPBar(){
	this.initialize.apply(this, arguments)
}

Sprite_MPBar.prototype = Object.create(Sprite_Base.prototype);
Sprite_MPBar.prototype.constructor = Sprite_MPBar;

Sprite_MPBar.prototype.initialize = function(base){
	Sprite_Base.prototype.initialize.call(this);
	this.base = base;
	this.bitmap = new Bitmap(125,36);
	this.bitmap.gradientFillRect(0,18,this.bitmap.width,18,textcolor(22), textcolor(23));
	this.x = this.base.x + 100;
	this.y = this.base.y + 41 - 18;
	this._id = this.base._id
	this.refresh();
}
Sprite_MPBar.prototype.refresh = function(){
	var pw = Math.floor(this._bitmap.width * $gameParty.members()[this._id].mpRate())
	this.setFrame(0, 0, pw, this._bitmap.height)
}

function Sprite_TPBar(){
	this.initialize.apply(this, arguments)
}

Sprite_TPBar.prototype = Object.create(Sprite_Base.prototype);
Sprite_TPBar.prototype.constructor = Sprite_TPBar;

Sprite_TPBar.prototype.initialize = function(base){
	Sprite_Base.prototype.initialize.call(this);
	this.base = base;
	this.bitmap = new Bitmap(123,36);
	this.bitmap.gradientFillRect(0,18,this.bitmap.width,18,textcolor(28), textcolor(29));
	this.x = this.base.x + 100;
	this.y = this.base.y + 74 - 18;
	this._id = this.base._id
	this.refresh();
}
Sprite_TPBar.prototype.refresh = function(){
	var pw = Math.floor(this._bitmap.width * $gameParty.members()[this._id].tpRate())
	this.setFrame(0, 0, pw, this._bitmap.height)
}

function Sprite_TextOnBars(){
	this.initialize.apply(this, arguments);
}

Sprite_TextOnBars.prototype = Object.create(Sprite_Base.prototype);
Sprite_TextOnBars.prototype.constructor = Sprite_TextOnBars;
Sprite_TextOnBars.prototype.initialize = function(base){
	Sprite_Base.prototype.initialize.call(this);
	this.base = base;
	this._id = base._id;
	this.bitmap = new Bitmap(123,108);
	this._bitmap.fontSize = 26;
	this.x = this.base.x + 100;
	this.y = this.base.y + 10 - 18;
	this.bitmap.textColor = textcolor(16);
	this.drawText();
}

Sprite_TextOnBars.prototype.drawText = function(){
	this.bitmap.drawText(TextManager.hpA, 0, 4, this.bitmap.width, 36);
	this.bitmap.drawText(TextManager.mpA, 0, 35, this.bitmap.width, 36);
	this.bitmap.drawText(TextManager.tpA, 0, 68, this.bitmap.width, 36);
}

function Sprite_TextOnBarsNum(){
	this.initialize.apply(this, arguments);
}

Sprite_TextOnBarsNum.prototype = Object.create(Sprite_Base.prototype);
Sprite_TextOnBarsNum.prototype.constructor = Sprite_TextOnBarsNum;
Sprite_TextOnBarsNum.prototype.initialize = function(base){
	Sprite_Base.prototype.initialize.call(this);
	this.base = base;
	this._id = base._id;
	this.bitmap = new Bitmap(140,108);
	this._bitmap.fontSize = 26;
	this.x = this.base.x + 100;
	this.y = this.base.y + 10 - 18;
	this.drawText();
}
Sprite_TextOnBarsNum.prototype.refresh = function(){
	this.bitmap.clear();
	this.drawText();
}

Sprite_TextOnBarsNum.prototype.drawText = function(){
	hptext = $gameParty.members()[this._id].hp + "/" + $gameParty.members()[this._id].mhp
	mptext = $gameParty.members()[this._id].mp + "/" + $gameParty.members()[this._id].mmp
	tptext = $gameParty.members()[this._id].tp
	this.bitmap.drawText(hptext, 123-this.bitmap.measureTextWidth(hptext), 4, 123, 36);
	this.bitmap.drawText(mptext, 123-this.bitmap.measureTextWidth(mptext), 35, 123, 36);
	this.bitmap.drawText(tptext, 123-this.bitmap.measureTextWidth(tptext), 68, 123, 36);
}


function Sprite_HUDFace(){
	this.initialize.apply(this, arguments)
}

Sprite_HUDFace.prototype = Object.create(Sprite_Base.prototype);
Sprite_HUDFace.prototype.constructor = Sprite_HUDFace;

Sprite_HUDFace.prototype.initialize = function(){
	Sprite_Base.prototype.initialize.call(this);
}

Sprite_HUDFace.prototype.initialize = function(picture, id, base){
	Sprite_Base.prototype.initialize.call(this);
	this.base = base;
	this._id = id
	this.bitmap = ImageManager.loadFace(picture);
	this._maskSprite = new Sprite()
	this.addChild(this._maskSprite);
	this.setFrame(id % 4 * 144, Math.floor(id / 4) * 144, 144, 144);
	this.scale.x = 98 / 144;
	this.scale.y = 96 / 144;
	this.x += this.base.x;
	this.y += this.base.y;
	this._maskSprite.bitmap = ImageManager.loadSystem("Mask1")
	this.mask = this._maskSprite;
}

function Sprite_HUDName(){
	this.initialize.apply(this, arguments);
}

Sprite_HUDName.prototype = Object.create(Sprite.prototype);
Sprite_HUDName.prototype.constructor = Sprite_HUDName;

Sprite_HUDName.prototype.initialize = function(id, base){
	Sprite_Base.prototype.initialize.call(this);
	this.bitmap = new Bitmap(98, 29)
	this._id = id;
	this._name = $gameParty.members()[id]._name;
	this.x = base.x + 0
	this.y = base.y + 96
	this.bitmap.drawText(this._name, 0, 0, this.bitmap.width, this.bitmap.height, 'center');
}

function Sprite_ActorStateIcon(){
	this.initialize.apply(this, arguments);
}

Sprite_ActorStateIcon.prototype = Object.create(Sprite.prototype);
Sprite_ActorStateIcon.prototype.constructor = Sprite_ActorStateIcon;

Sprite_ActorStateIcon.prototype.initialize = function(id, base, prior){
	Sprite.prototype.initialize.call(this, new Bitmap(Graphics.width, Graphics.height));
	this._id = id;
	this._base = base;
	this._prior = prior;
	this.x = base.x + 98 + 31 * prior;
	this.y = base.y + 93
	this.bitmap = ImageManager.loadSystem('IconSet');
	this.refresh();
}

Sprite_ActorStateIcon.prototype.refresh = function(){
	iconIndex = $gameParty.members()[this._id].stateIcons()[this._prior];
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
	var sx = iconIndex % 16 * pw;
	var sy = Math.floor(iconIndex / 16) * ph;
	this.setFrame(sx, sy, pw, ph);
}

Spriteset_Battle.prototype.createHUDEnemies = function(){
	this._hudEnemies = []
	this._hudEnemiesAnim = []
	this._hudEnemiesNames = []
	this._enemyFaces = []
	this._bossesCount = 0
	for (i = 0; i < $gameTroop._enemies.length; i++){
		if ($gameTroop._enemies[i].enemy().meta.Boss){
			this._bossesCount++;
		}
		this._hudEnemies[i] = new Sprite_HUDEnemy(i);
		this._hudEnemies[i].setup(this);
		
		this._battleField.addChild(this._hudEnemies[i]);
		this._hudEnemiesAnim[i] = new Sprite_HUDEnemyAnim(i, this._hudEnemies[i]);
		this._hudEnemiesAnim[i].setup(this);
		
		this._battleField.addChild(this._hudEnemiesAnim[i]);
		this._hudEnemiesNames[i] = new Sprite_HUDEnemyName(i, this._hudEnemies[i]);
		this._battleField.addChild(this._hudEnemiesNames[i])
		
		if ($gameTroop._enemies[i].enemy().meta.Boss){
			this._enemyFaces[i] = new Sprite_HUDEnemyFace($gameTroop._enemies[i]._enemyId);
			this._battleField.addChild(this._enemyFaces[i]);
		}

	}
}

function Sprite_HUDEnemy(){
	this.initialize.apply(this, arguments);
}

Sprite_HUDEnemy.prototype = Object.create(Sprite_Base.prototype);
Sprite_HUDEnemy.prototype.constructor = Sprite_HUDEnemy;

Sprite_HUDEnemy.prototype.initialize = function(id){
	Sprite_Base.prototype.initialize.call(this);
	this._id = id;
	if (this.isBoss()){
		name = "WIP_HP_Boss_Bar"
	} else {
		name = "WIP_HP_Enemy_Bar"
	}
	this.bitmap = ImageManager.loadSystem(name)
}

Sprite_HUDEnemy.prototype.setup = function(spriteset){
	this._spriteset = spriteset;
	//this._sprite = this._spriteset._enemySprites[this._id];
	if (!this.isBoss()){
			this.x = $gameTroop.members()[this._id]._screenX;
			this.y = Math.max(0, $gameTroop.members()[this._id]._screenY + 48);
		} else {
			this.y = (this._spriteset._bossesCount - 1) * this._bitmap.height;
		}
}

Sprite_HUDEnemy.prototype.isBoss = function(){
	return $gameTroop.members()[this._id].enemy().meta.Boss
}

function Sprite_HUDEnemyAnim(){
	this.initialize.apply(this, arguments);
}

Sprite_HUDEnemyAnim.prototype = Object.create(Sprite_Base.prototype);
Sprite_HUDEnemyAnim.prototype.constructor = Sprite_HUDEnemyAnim;

Sprite_HUDEnemyAnim.prototype.initialize = function(id, base){
	Sprite_Base.prototype.initialize.call(this);
	this._base = base
	this._id = id;
	if (this.isBoss()){
		name = "WIP_HP_Boss_Bar_Animation"
	} else {
		name = "WIP_HP_Enemy_Bar_Anim"
	}
	this.bitmap = ImageManager.loadSystem(name)
	this._sprite = null
}

Sprite_HUDEnemyAnim.prototype.setup = function(spriteset){
	this._spriteset = spriteset;
	this._enemy = $gameTroop.members()[this._id];
	if (this.isBoss()){
		this._leftPad = 126
		this.x = this._base.x
		this.y = this._base.y
	} else {
		this._leftPad = 0
		this.x = this._base.x;
		this.y = this._base.y
	}
}

Sprite_HUDEnemyAnim.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	this.setFrame(0, 0, this._leftPad + this.frameWidth(), this._bitmap.height)	
}

Sprite_HUDEnemyAnim.prototype.isBoss = function(){
	return $gameTroop.members()[this._id].enemy().meta.Boss
}

Sprite_HUDEnemyAnim.prototype.updateFrameWidth = function(){
		this.setFrame(0, 0, this._leftPad + this.frameWidth(), this._bitmap.height)
}

Sprite_HUDEnemyAnim.prototype.frameWidth = function(){
	return Math.floor((this._bitmap.width - this._leftPad) * this._enemy.hp / this._enemy.mhp)
}


function Sprite_HUDEnemyName(){
	this.initialize.apply(this, arguments);
}

Sprite_HUDEnemyName.prototype = Object.create(Sprite.prototype);
Sprite_HUDEnemyName.prototype.constructor = Sprite_HUDEnemyName;

Sprite_HUDEnemyName.prototype.initialize = function(id, base){
	Sprite.prototype.initialize.call(this, new Bitmap(Graphics.width, Graphics.height));
	this._id = id;
	this._base = base;
	this._enemy = $gameTroop.members()[this._id]
	this._name = this._enemy.name()
	this.bitmap.drawText(this._name, this.x, this.y, Graphics.boxWidth / 8, 30, 'center');
	if (!this.isBoss()){
		this.x = this._base.x
		this.y = this._base.y + 15
	} else {
		this.x = this._base.x + 96
		this.y = this._base.y
	}
}

Sprite_HUDEnemyName.prototype.isBoss = function(){
	return $gameTroop.members()[this._id].enemy().meta.Boss
}


function Sprite_HUDEnemyFace(){
	this.initialize.apply(this, arguments);
}

Sprite_HUDEnemyFace.prototype = Object.create(Sprite_Base.prototype);
Sprite_HUDEnemyFace.prototype.constructor = Sprite_HUDEnemyFace;

Sprite_HUDEnemyFace.prototype.initialize = function(id){
	Sprite_Base.prototype.initialize.call(this);
	this._id = id
	if (doPathExist("img/BFace/Boss" + this._id + ".png")){
		filename = "Boss" + this._id;
	} else{
		filename = "BossN"
	}
	this.bitmap = ImageManager.loadBitmap("img/BFace/", filename, 0, true);
	
	this._maskSprite = new Sprite()
	this._maskSprite.bitmap = ImageManager.loadSystem("Mask2")
}

Sprite_HUDEnemyFace.prototype.update = function(){
	if (BattleManager._spriteset != undefined){
		sprite = BattleManager._spriteset._hudEnemies[this._id]
		if (sprite != undefined){
			this.x = sprite.x
			this.y = sprite.y
		}
	}
}
///Windows reposition

Scene_Battle.prototype.updateStatusWindow = function() {};

Scene_Battle.prototype.updateWindowPositions = function() {};

Scene_Battle.prototype.createStatusWindow = function() {};

Scene_Battle.prototype.createSkillWindow = function() {
    var wy = this._helpWindow.y + this._helpWindow.height;
    var wh = Graphics.boxHeight - wy;
    this._skillWindow = new Window_BattleSkill(0, wy, Graphics.boxWidth, wh);
    this._skillWindow.setHelpWindow(this._helpWindow);
    this._skillWindow.setHandler('ok',     this.onSkillOk.bind(this));
    this._skillWindow.setHandler('cancel', this.onSkillCancel.bind(this));
    this.addWindow(this._skillWindow);
};

Scene_Battle.prototype.createItemWindow = function() {
    var wy = this._helpWindow.y + this._helpWindow.height;
    var wh = Graphics.boxHeight - wy;
    this._itemWindow = new Window_BattleItem(0, wy, Graphics.boxWidth, wh);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this.addWindow(this._itemWindow);
};

Scene_Battle.prototype.createActorWindow = function() {
    this._actorWindow = new Window_BattleActor(0);
    this._actorWindow.setHandler('ok',     this.onActorOk.bind(this));
    this._actorWindow.setHandler('cancel', this.onActorCancel.bind(this));
    this.addWindow(this._actorWindow);
};

Window_BattleActor.prototype.initialize = function(x) {
    Window_BattleStatus.prototype.initialize.call(this);
    this.x = x;
    this.openness = 255;
    this.hide();
};

Scene_Battle.prototype.createEnemyWindow = function() {
    this._enemyWindow = new Window_BattleEnemy(0);
    this._enemyWindow.x = Graphics.boxWidth - this._enemyWindow.width;
    this._enemyWindow.setHandler('ok',     this.onEnemyOk.bind(this));
    this._enemyWindow.setHandler('cancel', this.onEnemyCancel.bind(this));
    this.addWindow(this._enemyWindow);
};

Window_BattleEnemy.prototype.initialize = function(x) {
    this._enemies = [];
    var width = this.windowWidth();
    var height = this.windowHeight();
    Window_Selectable.prototype.initialize.call(this, x, Graphics.boxHeight - height, width, height);
    this.refresh();
    this.hide();
};

Scene_Battle.prototype.startPartyCommandSelection = function() {
    this._actorCommandWindow.close();
    this._partyCommandWindow.setup();
};

Scene_Battle.prototype.startActorCommandSelection = function() {
    this._partyCommandWindow.close();
    this._actorCommandWindow.setup(BattleManager.actor());
};

Scene_Battle.prototype.endCommandSelection = function() {
    this._partyCommandWindow.close();
    this._actorCommandWindow.close();
};

BattleManager.setStatusWindow = function(statusWindow) {};

BattleManager.refreshStatus = function() {
	this.refreshHpBars();
	this.refreshMpBars();
	this.refreshTpBars();
	this.refreshIcons();
	this.refreshTextOnBars();
};

Scene_Battle.prototype.stop = function() {
    Scene_Base.prototype.stop.call(this);
    if (this.needsSlowFadeOut()) {
        this.startFadeOut(this.slowFadeSpeed(), false);
    } else {
        this.startFadeOut(this.fadeSpeed(), false);
    }
    this._partyCommandWindow.close();
    this._actorCommandWindow.close();
};


Scene_Battle.prototype.createActorCommandWindow = function() {
    this._actorCommandWindow = new Window_ActorCommand();
    this._actorCommandWindow.setHandler('attack', this.commandAttack.bind(this));
    this._actorCommandWindow.setHandler('skill',  this.commandSkill.bind(this));
    this._actorCommandWindow.setHandler('guard',  this.commandGuard.bind(this));
    this._actorCommandWindow.setHandler('item',   this.commandItem.bind(this));
    this._actorCommandWindow.setHandler('cancel', this.startPartyCommandSelection.bind(this));
    this.addWindow(this._actorCommandWindow);
};

Scene_Battle.prototype.commandFight = function() {
    this.startActorCommandSelection();
};

BattleManager.selectPreviousCommand = function() {
	do {
        if (!this.actor() || !this.actor().selectPreviousCommand()) {
            this.changeActor(this._actorIndex - 1, 'undecided');
            if (this._actorIndex < 0) {
                return;
            }
        }
    } while (true);
};

Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
Scene_Battle.prototype.createDisplayObjects = function() {
    Scene_Battle_createDisplayObjects.call(this);
	this._actorCommandWindow.x = 600 - this._actorCommandWindow.width / 2;
	this._actorCommandWindow.y = 280 - 64 - this._actorCommandWindow.height;
	this._partyCommandWindow.x = 600 - this._partyCommandWindow.width / 2;
	this._partyCommandWindow.y = 280 - 64 - this._partyCommandWindow.height;
};

BattleManager.updateTurn = function() {
	$gameParty.requestMotionRefresh();
    if (!this._subject) {
        this._subject = this.getNextSubject();
    }
    if (this._subject) {
        this.processTurn();
    }
	if (this._playerTurn) {
		this.endTurn();
		if (!BattleManager.checkBattleEnd){
			this.startInput();
		}
    }
};

BattleManager.getNextSubject = function() {
	
	this._battlersTurns.forEach(function(i){
		if (i[2]){
			return i[0]
		}
	})
	return null;
};