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
 * @default 1000
 *
 * @param divider
 * @type number
 * @decimals 5
 * @desc divider in formula (base - agi / divider)
 * @default 30
 *
 * @param atb_x
 * @type eval
 * @desc x of atb gauge (default Graphics.boxWidth - this.width)
 * @default Graphics.boxWidth - this.width
 *
 * @param hud_x
 * @type eval
 * @desc x of hud (default 0)
 * @default 0
 *
 * @param hud_y
 * @type eval
 * @desc y of hud (default Graphics.boxHeight - this.height)
 * @default Graphics.boxHeight - this.height
 */
 ATB = {}
 
ATB.Parameters = PluginManager.parameters('ATB_WIP');
ATB.Param = {};
 
ATB.Param.Base = Number(ATB.Parameters['base']);
ATB.Param.Divider = Number(ATB.Parameters['divider']);

 
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
	this.selectNextCommand();
}

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
};
BattleManager.startTurn = function() {
	if (this._subject != null && this._subject.isEnemy()){
		this._actionEnemies.push(this._subject);
	}
	this._subject = $gameParty.members()[0];
    this._phase = 'turn';
    this.clearActor();
    $gameTroop.increaseTurn();
    this.makeActionOrders();
    $gameParty.requestMotionRefresh();
    this._logWindow.startTurn();
	this._playerTurn = false;
	//this._battlersTurns[0][2] = false;

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
    }}
}

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
	/*spriteset.deleteInfo(this._atbEnemyId, spriteset._hudEnemies, 1)
	spriteset.deleteInfo(this._atbEnemyId, spriteset._hudEnemiesNames, 1)*/
    Game_Enemy_performCollapse.apply(this)
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
		console.log(this._phase);
        //this.startTurn();
    }
    return success;
};

BattleManager.updateEscape = function(){
	if (!$gameMessage.isBusy()){
		this.startTurn();
	}
}

BattleManager.makeActionOrders = function() {
    this._actionBattlers = [$gameParty.members()[0]];
};

BattleManager_startBattle = BattleManager.startBattle;
BattleManager.startBattle = function() {
    BattleManager_startBattle.apply(this);
	this._battlersTurns = [];
	battlers = [];
	battlers = battlers.concat($gameParty.members());
	battlers = battlers.concat($gameTroop.members());
	for (i = 0; i < battlers.length; i++){
		this._battlersTurns.push([battlers[i], ATB.Param.Base, false]);
	}
	$gameTroop.makeActions();
	$gameTroop.increaseTurn();
};

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
		if (!(this._playerTurn && i == 0) && this._phase != 'action' && this._phase != "hitzone" && this._phase != "battleEnd" && this._phase != "start" && this._phase != "escape"){
			this._battlersTurns[i][1] = this._battlersTurns[i][1] - this._battlersTurns[i][0].agi / ATB.Param.Divider;
			if (this._battlersTurns[i][1] <= 0){
				this._battlersTurns[i][1] = ATB.Param.Base;
				if (i == 0){
					this._playerTurn = true;
					this._subject = $gameParty.members()[0]
				} 
				if (i != 0) {
					if (!this._battlersTurns[i][0].isDead()){
						this._actionEnemies.push(this._battlersTurns[i][0]);
					}
				}
				this._battlersTurns[i][2] = true;
			}
		}
	}
	if (this._phase != "action" && !this._playerTurn && this._phase != "hitzone" && (!this._subject || this._subject == null) && this._actionEnemies.length > 0){
		//console.log("OK")
		this._subject = this._actionEnemies[0];
		this._battlersTurns[this._subject.index() + 1][2] = true;
		this._actionEnemies.splice(0, 1);
		$gameTroop.increaseTurn();
	}
};

BattleManager.startB = function() {
    this._phase = "turn";
	//this.startTurn();
};

BattleManager.processTurn = function() {
    var subject = this._subject;
	/*if (subject){
		console.log("subject")
	}*/
	if (subject.isEnemy() && this._battlersTurns[subject.index() + 1][2] || subject.isActor() && this._battlersTurns[subject.index()][2]){
		var action = subject.currentAction();
		if (action) {
			//console.log("action")
			action.prepare();
			if (action.isValid()) {
				this.startAction();
			}
			subject.removeCurrentAction();
			this._battlersTurns[subject.index() + 1][2] = false;
			$gameTroop.makeActions();
		} else {
			subject.onAllActionsEnd();
			this.refreshStatus();
			this._logWindow.displayAutoAffectedStatus(subject);
			this._logWindow.displayCurrentState(subject);
			this._logWindow.displayRegeneration(subject);
			
			this._subject = this.getNextSubject();
		}
	}

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
        return true;
    } else if (!(this._phase === 'battleEnd')){
        return this.updateEventMain();
    }
    return this.checkAbort();
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
            this.startPartyCommandSelection();
        }
    } else {
        this.endCommandSelection();
    }
};

///===ATB_Gauge===///

Spriteset_Battle_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
Spriteset_Battle.prototype.createLowerLayer = function() {
    Spriteset_Battle_createLowerLayer.call(this);
	
	this.createHUDEnemies();
	this.createHPBar();
	this.createMPBar();
	this.createTPBar();
	this.createHUDFace();
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
	id = $gameParty._actors[0]
	const fs = require('fs');
	if (fs.existsSync("img/system/Actor" + id + ".png")){
		filename = "Actor" + id;
	} else{		
		filename = "ActorN"
	}
	this._atbActor = new Sprite_ATBActor(filename, this._atbBase);
	this._battleField.addChild(this._atbActor);
}

Spriteset_Battle.prototype.createATBEnemies = function(){
	this._atbEnemies = [];
		for (i = 0; i < $gameTroop._enemies.length; i++){
			id = $gameTroop._enemies[i]._enemyId;
			const fs = require('fs');
			if (fs.existsSync("img/system/Enemy" + id + ".png")){
				filename = "Enemy" + id;
			} else{
				filename = "EnemyN"
			}
			this._atbEnemies.push(new Sprite_ATBEnemy(filename, this._atbBase, i + 1));
			this._battleField.addChild(this._atbEnemies[i]);
			$gameTroop._enemies[i].setAtbEnemy(i+1)
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

Spriteset_Battle.prototype.changeHpFrame = function(id, elem, dec){
	found = false
	toChange = null
	this._hudEnemiesAnim.forEach(function(i){
		if (i._id == id - dec){
			found = true;
			toChange = i
		}
	})
	if (found){
			//this._battleField.Child(toDel);
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
}

Sprite_ATBBarBase.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	this.x = eval(ATB.Parameters['atb_x']);
}


function Sprite_ATBActor(){
	this.initialize.apply(this, arguments)
}

Sprite_ATBActor.prototype = Object.create(Sprite_Base.prototype);
Sprite_ATBActor.prototype.constructor = Sprite_ATBActor;

Sprite_ATBActor.prototype.initialize = function(picture, atbBase){
	Sprite_Base.prototype.initialize.call(this);
	this.bitmap = ImageManager.loadSystem(picture);
	this._atbBase = atbBase;
}

Sprite_ATBActor.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	if (this._atbBase != undefined && BattleManager._battlersTurns != undefined){
		this.x = this._atbBase.x;
		if (BattleManager._playerTurn){
			this.y = 0
		} else {
			this.y = this._atbBase.height / ATB.Param.Base * (BattleManager._battlersTurns[0][1])
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
		this.y = this._atbBase.height / ATB.Param.Base * (BattleManager._battlersTurns[this._id][1])
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
	this.bitmap = this._magicBitmap
	this._enemyBase = enemyBase;
	this.opacity = 0;
}

Sprite_ATBMagic.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	this.y = this._enemyBase.y + (this._enemyBase.height - this.height)/2;
	this.x = this._enemyBase.x - this.width;
	if (BattleManager._battlersTurns != undefined && BattleManager._battlersTurns[1][0]._actions[0] != undefined) {
		skill = BattleManager._battlersTurns[1][0]._actions[0]._item
		if (skill._dataClass == "skill" && skill._itemId != 1) {
			if ($dataSkills[skill._itemId].hitType != 0){
				if ($dataSkills[skill._itemId].hitType == 1){
					this.bitmap = this._physBitmap;
				} else if ($dataSkills[skill._itemId].hitType == 2){
					this.bitmap = this._magicBitmap;
				}
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


Spriteset_Battle.prototype.createHPBar = function(){
    this._hpBase = new Sprite_HPBarBase("WIP_HP_Actor_Bar");
	this._hpBase.setup();
    this._battleField.addChild(this._hpBase);
	this._hpGauge = new Sprite_HPBar("WIP_HP_Actor_Bar_Anim", this._hpBase);
    this._battleField.addChild(this._hpGauge);
}

Spriteset_Battle.prototype.createMPBar = function(){
	this._mpGauge = new Sprite_MPBar("WIP_MP_Actor_Bar_Anim", this._hpBase);
    this._battleField.addChild(this._mpGauge);
}

Spriteset_Battle.prototype.createTPBar = function(){
	this._tpGauge = new Sprite_TPBar("WIP_TP_Actor_Bar_Anim", this._hpBase);
    this._battleField.addChild(this._tpGauge);
}

Spriteset_Battle.prototype.createHUDFace = function(){
	this._hudFace = new Sprite_HUDFace($gameParty.members()[0]._faceName, this._hpBase);
	this._battleField.addChild(this._hudFace);
}

function Sprite_HPBarBase(){
	this.initialize.apply(this, arguments)
}

Sprite_HPBarBase.prototype = Object.create(Sprite_Base.prototype);
Sprite_HPBarBase.prototype.constructor = Sprite_HPBarBase;

Sprite_HPBarBase.prototype.initialize = function(picture){
	Sprite_Base.prototype.initialize.call(this);
	this.bitmap = ImageManager.loadSystem(picture);
}

Sprite_HPBarBase.prototype.setup = function(){
	this.x = eval(ATB.Parameters['hud_x']);
	this.y = eval(ATB.Parameters['hud_y']);

}

function Sprite_HPBar(){
	this.initialize.apply(this, arguments)
}

Sprite_HPBar.prototype = Object.create(Sprite_Base.prototype);
Sprite_HPBar.prototype.constructor = Sprite_HPBar;

Sprite_HPBar.prototype.initialize = function(picture, base){
	Sprite_Base.prototype.initialize.call(this);
	this.base = base;
	this.bitmap = ImageManager.loadSystem(picture);
	this.x = this.base.x;
	this.y = this.base.y;

}
Sprite_HPBar.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	this._leftPad = 83
	this._rightPad = 6
	var pw = Math.floor(this._leftPad + (this._bitmap.width - this._leftPad - this._rightPad) * $gameParty.members()[0].hpRate())
	this.setFrame(0, 0, pw, this._bitmap.height)
}

function Sprite_MPBar(){
	this.initialize.apply(this, arguments)
}

Sprite_MPBar.prototype = Object.create(Sprite_Base.prototype);
Sprite_MPBar.prototype.constructor = Sprite_MPBar;

Sprite_MPBar.prototype.initialize = function(picture, base){
	Sprite_Base.prototype.initialize.call(this);
	this.base = base;
	this.bitmap = ImageManager.loadSystem(picture);
	this.x = 0 + this.base.x;
	this.y = 73 + this.base.y;
}
Sprite_MPBar.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	this._leftPad = 40
	this._rightPad = 21
	var pw = Math.floor(this._leftPad + (this._bitmap.width - this._leftPad - this._rightPad) * $gameParty.members()[0].mpRate())
	this.setFrame(0, 0, pw, this._bitmap.height)
}

function Sprite_TPBar(){
	this.initialize.apply(this, arguments)
}

Sprite_TPBar.prototype = Object.create(Sprite_Base.prototype);
Sprite_TPBar.prototype.constructor = Sprite_TPBar;

Sprite_TPBar.prototype.initialize = function(picture, base){
	Sprite_Base.prototype.initialize.call(this);
	this.base = base;
	this.bitmap = ImageManager.loadSystem(picture);
	this.x = this.base.x;
	this.y = this.base.y;

}
Sprite_TPBar.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	this._leftPad = 10
	this._rightPad = 47
	var pw = Math.floor(this._leftPad + (this._bitmap.width - this._leftPad - this._rightPad) * $gameParty.members()[0].tpRate())
	this.setFrame(0, 0, pw, this._bitmap.height)

}

function Sprite_HUDFace(){
	this.initialize.apply(this, arguments)
}

Sprite_HUDFace.prototype = Object.create(Sprite_Base.prototype);
Sprite_HUDFace.prototype.constructor = Sprite_HUDFace;

Sprite_HUDFace.prototype.initialize = function(){
	Sprite_Base.prototype.initialize.call(this);
}

Sprite_HUDFace.prototype.initialize = function(picture, base){
	Sprite_Base.prototype.initialize.call(this);
	this.base = base;
	this.bitmap = ImageManager.loadFace(picture);
	this._maskSprite = new Sprite()
	this.addChild(this._maskSprite);
	
	this.setFrame(0, 0 , this._bitmap.width, this._bitmap.height);
	this.scale.x = 78 / 144;
	this.scale.y = 73 / 144;
	this.x = 5;
	this.y = 5;
	this.x += this.base.x;
	this.y += this.base.y;
	this._maskSprite.bitmap = ImageManager.loadSystem("Mask1")
	this.mask = this._maskSprite;
}

Sprite_HUDFace.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	this.setFrame(0, 0 , this._bitmap.width, this._bitmap.height);
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
		this._hudEnemiesNames[i] = new Sprite_HUDEnemyName(i);
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
	this._sprite = this._spriteset._enemySprites[this._id];
	if (!this.isBoss()){
			this.x = this._sprite.x;
			this.y = Math.max(0, this._sprite.y + 48);
		} else {
			this.y = (this._spriteset._bossesCount - 1) * this._bitmap.height;
		}
}

Sprite_HUDEnemy.prototype.isBoss = function(){
	return $gameTroop._enemies[this._id].enemy().meta.Boss
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
	this._sprite = this._spriteset._enemySprites[this._id];
	if (this.isBoss()){
		this._leftPad = 126
		this.x = 0
		this.y = this._base.y//(this._spriteset._bossesCount - 1) * this._bitmap.height;
	} else {
		this._leftPad = 0
		this.x = this._sprite.x;
		this.y = this._base.y//Math.max(0, this._sprite.y + 48);
	}
}

Sprite_HUDEnemyAnim.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	this.setFrame(0, 0, this._leftPad + this.frameWidth(), this._bitmap.height)	
}

Sprite_HUDEnemyAnim.prototype.isBoss = function(){
	return $gameTroop._enemies[this._id].enemy().meta.Boss
}

Sprite_HUDEnemyAnim.prototype.updateFrameWidth = function(){
		this.setFrame(0, 0, this._leftPad + this.frameWidth(), this._bitmap.height)
}

Sprite_HUDEnemyAnim.prototype.frameWidth = function(){
	return Math.floor((this._bitmap.width - this._leftPad) * this._sprite._enemy.hp / this._sprite._enemy.mhp)
}


function Sprite_HUDEnemyName(){
	this.initialize.apply(this, arguments);
}

Sprite_HUDEnemyName.prototype = Object.create(Sprite.prototype);
Sprite_HUDEnemyName.prototype.constructor = Sprite_HUDEnemyName;

Sprite_HUDEnemyName.prototype.initialize = function(id){
	Sprite.prototype.initialize.call(this, new Bitmap(Graphics.width, Graphics.height));
	this._id = id;
	name = $gameTroop._enemies[this._id].enemy().name
	if ($gameTroop._enemies[this._id]._plural){
		name += $gameTroop._enemies[this._id]._letter
	}
	this.bitmap.drawText(name, this.x, this.y, Graphics.boxWidth / 8, 30, 'center');
}

Sprite_HUDEnemyName.prototype.update = function(){
	Sprite.prototype.update.call(this);
	if (BattleManager._spriteset != undefined && BattleManager._spriteset._enemySprites[this._id] != undefined){
		sprite = BattleManager._spriteset._hudEnemies[this._id]
		if (!this.isBoss()){
			this.x = sprite.x
			this.y = sprite.y - 30
		} else {
			this.x = sprite.x + 128
			this.y = sprite.y
		}
	}
}
Sprite_HUDEnemyName.prototype.isBoss = function(){
	return $gameTroop._enemies[this._id].enemy().meta.Boss
}


function Sprite_HUDEnemyFace(){
	this.initialize.apply(this, arguments);
}

Sprite_HUDEnemyFace.prototype = Object.create(Sprite_Base.prototype);
Sprite_HUDEnemyFace.prototype.constructor = Sprite_HUDEnemyFace;

Sprite_HUDEnemyFace.prototype.initialize = function(id){
	Sprite_Base.prototype.initialize.call(this);
	this._id = id
	const fs = require('fs');
	if (fs.existsSync("img/BFace/Boss" + this._id + ".png")){
		filename = "Boss" + this._id;
	} else{
		filename = "BossN"
	}
	this.bitmap = ImageManager.loadBitmap("img/BFace/", filename, 0, true);
	
	//this.setFrame(0, 0 , this._bitmap.width, this._bitmap.height);
	//sprite = BattleManager._spriteset._hudEnemies[this._id]
	this._maskSprite = new Sprite()
	//this.scale.x = 115 / 144;
	//this.scale.y = 115 / 144;
	//this.x = sprite.x + 128
	//this.y = sprite.y
	this._maskSprite.bitmap = ImageManager.loadSystem("Mask2")
}

Sprite_HUDEnemyFace.prototype.update = function(){
	if (BattleManager._spriteset != undefined){
		sprite = BattleManager._spriteset._hudEnemies[this._id]
		if (sprite != undefined){
			this.x = sprite.x// + 128
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

BattleManager.refreshStatus = function() {};

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

Game_Party.prototype.maxBattleMembers = function() {
    return 1;
};



Scene_Battle.prototype.createActorCommandWindow = function() {
    this._actorCommandWindow = new Window_ActorCommand();
    this._actorCommandWindow.setHandler('attack', this.commandAttack.bind(this));
    this._actorCommandWindow.setHandler('skill',  this.commandSkill.bind(this));
    this._actorCommandWindow.setHandler('guard',  this.commandGuard.bind(this));
    this._actorCommandWindow.setHandler('item',   this.commandItem.bind(this));
    this._actorCommandWindow.setHandler('cancel', this.selectPreviousCommand.bind(this));
    this.addWindow(this._actorCommandWindow);
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
    } //else 
	if (this._playerTurn) {
        this.endTurn();
		this.startInput();
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