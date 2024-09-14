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
 * @desc x of atb gauge (default Graphics.boxWidth - 160)
 * @default Graphics.boxWidth - 160
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
 * @param charge_animation
 * @text Charge Animation
 * @type animation
 * @desc default animation when battler is preparing an attack
 * @default 122
 * 
 * @param shake_if_enemy_is_hit
 * @text Shake if enemy is hit?
 * @type boolean
 * @desc If true, screen shakes if enemy is hit.
 * @default true
 * 
 * @param shake_power
 * @text Shake power
 * @type number
 * @desc Screen shaking power if enemy is hit.
 * @min 1
 * @max 9
 * @default 5
 * 
 * @param shake_speed
 * @text Shake speed
 * @type number
 * @desc Screen shaking speed if enemy is hit.
 * @min 1
 * @max 9
 * @default 5
 * 
 * @param shake_duration
 * @text Shake duraion
 * @type number
 * @desc Screen shaking duration if enemy is hit.
 * @min 1
 * @default 10
 * 
 * @param speed_up_animation
 * @text Speed up animation?
 * @type boolean
 * @desc If true, skill/item animation will be sped up by default
 * @default true
 * 
 * @param speed_up_value_default
 * @text Default speed up value
 * @type number
 * @desc 1 - 8x slower, 2 - 4x slower, 3 - 2x slower, 4 - normal, 5 - 2x slower, 6 - 4x slower
 * @min 1
 * @max 6
 * @default 5
 * 
 * @help
 * Після YEP_CoreEngine
 * Після MOG_CollapseEffects
 * 
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
 * <DamageFace: 'Назва файлу'> - динамічні обличчя при різних HP% (ActorDamageFaces)
 * 
 * Слава Україні! :3
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

ATB.Param.ChargeAnimation = ATB.Parameters['charge_animation'] || 122

ATB.Param.ShakeIfEnemyIsHit = eval(ATB.Parameters['shake_if_enemy_is_hit']);
ATB.Param.ShakePower = Number(ATB.Parameters['shake_power']) || 5;
ATB.Param.ShakeSpeed = Number(ATB.Parameters['shake_speed']) || 5;
ATB.Param.ShakeDuration = Number(ATB.Parameters['shake_duration']) || 10;

ATB.Param.SpeedUpAnimation = eval(ATB.Parameters['speed_up_animation']);
ATB.Param.SpeedUpValueDefault = Number(ATB.Parameters['speed_up_value_default']) || 5;

 
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
	this.addCommand('{Голова}', 'head');
	this.addCommand('{Торс}', 'torso');	
	this.addCommand('{Руки}', 'arms');
	this.addCommand('{Ноги}', 'legs');
}

//Hit zone in scene

Scene_Battle.prototype.createHitZoneWindow = function(){
	this._hitZoneWindow = new Window_HitZone();
	this._hitZoneWindow.setHandler('head', this.onZoneOk.bind(this, 3));
	this._hitZoneWindow.setHandler('torso', this.onZoneOk.bind(this, 4));
	this._hitZoneWindow.setHandler('arms', this.onZoneOk.bind(this, 6));
	this._hitZoneWindow.setHandler('legs', this.onZoneOk.bind(this, 5));	
	this._hitZoneWindow.setHandler('cancel', this.onZoneCancel.bind(this));
	this._hitZoneWindow.deselect();
	this._hitZoneWindow.width = 180;
	let enemyIndex = BattleManager.inputtingAction()._targetIndex;
	this._hitZoneWindow.x = Math.max(0, $gameTroop.members()[enemyIndex]._screenX - this._hitZoneWindow.width / 2);
	this.addWindow(this._hitZoneWindow);
}

Scene_Battle.prototype.onZoneCancel = function(){
	this._hitZoneWindow.hide();
	delete this._hitZoneWindow;
	this._enemyWindow.show();
	this._enemyWindow.activate();
	//actor continues input
	BattleManager._phase = "input"
}

Scene_Battle.prototype.onZoneOk = function(skillId){
	if (BattleManager.inputtingAction() != null){
		BattleManager.inputtingAction().setSkill(skillId);
	}
	this._hitZoneWindow.hide();
	delete this._hitZoneWindow;
	//turn starts
	this.selectNextCommand();
}

Scene_Battle.prototype.commandGuard = function(skillId){
    BattleManager.inputtingAction().setGuard();
	this.selectNextCommand();
}

Scene_Battle.prototype.onActorOk = function() {
    var action = BattleManager.inputtingAction();
    action.setTarget(this._actorWindow.index());
    this._actorWindow.hide();
    this._skillWindow.hide();
	this._itemWindow.hide();
    this.selectNextCommand();
};

Scene_Battle.prototype.onEnemyOk = function() {
    var action = BattleManager.inputtingAction();
	action.setTarget(this._enemyWindow.enemyIndex());
    this._enemyWindow.hide();
    this._skillWindow.hide();
    this._itemWindow.hide();
	if (action.isAttack()){
		//when phase hitzone, no actor action selection for some reason
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
		this._actorCommandWindow.setup(BattleManager.actor());
		//this._actorCommandWindow.x = this._spriteset._actorSprites[BattleManager.actor()._atbActorId] - this._actorCommandWindow.width / 2;
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

ATB.BattleManager_setup = BattleManager.setup;
BattleManager.setup = function(troopId, canEscape, canLose) {
	ATB.BattleManager_setup.call(this, troopId, canEscape, canLose);
	this._actionEnemies = []; //enemies which will act?
	this._playerTurn = false;
	this._isAction = false;
};

BattleManager.startTurn = function() {
	if (this._subject != null && this._subject.isEnemy()){
		this._actionEnemies.push(this._subject); //add current active enemy to order
	}
	this._subject = $gameParty.battleMembers()[this._activeActor];
    this._phase = 'turn';
    this.makeActionOrders();
    $gameParty.requestMotionRefresh();
    this._logWindow.startTurn();
	this._playerTurn = false;

};

Game_Battler.prototype.forceAction = function(skillId, targetIndex) {
	if (this._actions[0] == undefined || this._actions[0]._item._dataClass == ""){ // if no actions clear actions
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
};

ATB.Game_Battler_initMembers = Game_Battler.prototype.initMembers;
Game_Battler.prototype.initMembers = function() {
    ATB.Game_Battler_initMembers.apply(this);
	this._turnCount = 0;
	this._chargeAnimations = [];
	this._chargeAnimationsStop = false;
};

Game_Enemy.prototype.meetsTurnCondition = function(param1, param2) {
    var n = this._turnCount; //enemy's turn count instead of general turn count
    if (param2 === 0) {
        return n === param1;
    } else {
        return n > 0 && n >= param1 && n % param2 === param1 % param2;
    }
};

Game_Battler.prototype.makeActions = function() {
	//same, but no check if can move
    this.clearActions();
	var actionTimes = this.makeActionTimes();
	this._actions = [];
	for (var i = 0; i < actionTimes; i++) {
		this._actions.push(new Game_Action(this));
	}
};

Game_Enemy.prototype.makeActions = function() {
	//same, but check if no actions and no waiting state
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

//Щоб не ламалося, коли хтось покидає партію під час бою
ATB.Game_Party_prototype_removeActor = Game_Party.prototype.removeActor;
Game_Party.prototype.removeActor = function(actorId) {
    if (this._actors.contains(actorId)) {
        if (this.inBattle()){
			let spriteset = BattleManager._spriteset
			let index = this._actors.indexOf(actorId)
			BattleManager._battlersTurns.splice(index, 1);

			spriteset.deleteInfo(index, spriteset._hpBases, 0);
			spriteset.deleteInfo(index, spriteset._atbActors, 0);			
			BattleManager._spriteset._hpBases.splice(index, 1);
			BattleManager._spriteset._atbActors.splice(index, 1);
		}
    }
	ATB.Game_Party_prototype_removeActor.call(this, actorId);
};

//Щоб не ламалося, коли хтось приєднується
ATB.Game_Party_prototype_addActor = Game_Party.prototype.addActor;
Game_Party.prototype.addActor = function(actorId) {
	if (!this._actors.contains(actorId)) {
		ATB.Game_Party_prototype_addActor.call(this, actorId);
        if (this.inBattle()){
			let spriteset = BattleManager._spriteset
			let index = this._actors.indexOf(actorId)
			BattleManager._battlersTurns.splice(index, 0, [$gameActors.actor(actorId), ATB.Param.Base, false]);
			let id = $gameParty.battleMembers().length - 1;
			spriteset.createActorHUD(id);
			spriteset.createATBActor(id);
		}
    }
};

BattleManager.selectNextCommand = function() {
	this._playerTurn = false;
	this._phase = 'turn'
	this._isAction = true;
    do {
        if (!this.actor() || !this.actor().selectNextCommand()) {
			if (this._actorIndex < 0){
				this.changeActor(this._activeActor, 'waiting');
			} else {
				this.subject = $gameParty.battleMembers()[this._actorIndex]
				this.changeActor(this._actorIndex + $gameParty.battleMembers().length, 'waiting');
			}
            if (this._actorIndex >= $gameParty.size()) {//same as original
                this.startTurn();
                break;
            }
        }
    } while (!this.actor().canInput());
};

ATB.Game_Enemy_setup = Game_Enemy.prototype.setup
Game_Enemy.prototype.setup = function(enemyId, x, y) {
    ATB.Game_Enemy_setup.apply(this, arguments)
	this._atbEnemyId = '';
};

Game_Enemy.prototype.setAtbEnemy = function(atbEnemyId){
	this._atbEnemyId = atbEnemyId;
}

ATB.Game_Enemy_performCollapse = Game_Enemy.prototype.performCollapse
Game_Enemy.prototype.performCollapse = function() {
	spriteset = BattleManager._spriteset
	//spriteset.deleteInfo(this._atbEnemyId, spriteset._atbEnemies, 0)
	spriteset._atbEnemies[this._atbEnemyId].opacity = 0;
	this.hideHUD();
	BattleManager._battlersTurns[this._atbEnemyId + $gameParty.battleMembers().length][3] = false;
    ATB.Game_Enemy_performCollapse.apply(this)
};

ATB.Game_Enemy_onRestrict = Game_Enemy.prototype.onRestrict;
Game_Enemy.prototype.onRestrict = function() {
    ATB.Game_Enemy_onRestrict.call(this);
	BattleManager._battlersTurns[this._atbEnemyId + $gameParty.battleMembers().length][3] = false;
};

ATB.Game_Actor_onRestrict = Game_Actor.prototype.onRestrict;
Game_Actor.prototype.onRestrict = function() {
    ATB.Game_Actor_onRestrict.call(this);
	if (SceneManager._scene == Scene_Battle){
		BattleManager._battlersTurns[this._atbActorId][3] = false;
	}
};

Game_Enemy.prototype.revive = function() {
    Game_BattlerBase.prototype.revive.apply(this);
	console.log('revive')
	BattleManager._spriteset._atbEnemies[this._atbEnemyId].opacity = 255;
	if (Imported.MOG_CollapseEffects){
		let sprite = BattleManager._spriteset._enemySprites.find(e => e._battler._atbEnemyId == this._atbEnemyId)
		if (sprite._collData){
			sprite.removeCollapseEffects(); //щоб не було дивного після трансформації і отримання шкоди після неї
		}
	}
	//BattleManager._spriteset._battleField.addChild(BattleManager._spriteset._atbEnemies[this._atbEnemyId]);
	this.showHUD();
};

ATB.Game_Enemy_recoverAll = Game_Enemy.prototype.recoverAll;
Game_Enemy.prototype.recoverAll = function() {
	ATB.Game_Enemy_recoverAll.apply(this);
	if (BattleManager._spriteset){
		BattleManager._spriteset._atbEnemies[this._atbEnemyId].opacity = 255;
		this.showHUD();
	}
};


Game_Enemy.prototype.hide = function() {
	Game_BattlerBase.prototype.hide.apply(this);
	spriteset = BattleManager._spriteset
	if (spriteset){
		spriteset._atbEnemies[this._atbEnemyId].opacity = 0;
		this.hideHUD();
	}
};

Game_Actor.prototype.hide = function() {
	Game_BattlerBase.prototype.hide.apply(this);
	spriteset = BattleManager._spriteset
	if (spriteset){
		spriteset._atbActors[this._atbActorId].opacity = 0;
		this.hideHUD();
	}
};

Game_Enemy.prototype.appear = function() {
    Game_BattlerBase.prototype.appear.apply(this);
	BattleManager._spriteset._battleField.addChild(BattleManager._spriteset._atbEnemies[this._atbEnemyId]);
	BattleManager._spriteset._atbEnemies[this._atbEnemyId].opacity = 255;
	this.showHUD();
};

Game_Enemy.prototype.showHUD = function(){
	BattleManager._spriteset._hudEnemies[this._atbEnemyId].opacity = 255;
	BattleManager._spriteset._hudEnemiesAnim[this._atbEnemyId].opacity = 255;
	BattleManager._spriteset._hudEnemiesNames[this._atbEnemyId].opacity = 255;
	if (BattleManager._spriteset._enemyFaces[this._atbEnemyId] != undefined){
		BattleManager._spriteset._enemyFaces[this._atbEnemyId].opacity = 255;
	}
};

Game_Enemy.prototype.hideHUD = function(){
	BattleManager._spriteset._hudEnemies[this._atbEnemyId].opacity = 0;
	BattleManager._spriteset._hudEnemiesAnim[this._atbEnemyId].opacity = 0;
	BattleManager._spriteset._hudEnemiesNames[this._atbEnemyId].opacity = 0;
	if (BattleManager._spriteset._enemyFaces[this._atbEnemyId] != undefined){
		BattleManager._spriteset._enemyFaces[this._atbEnemyId].opacity = 0;
	}
}

//Update enemy's HUD name and ATB image after transformation
ATB.Game_Enemy_prototype_transform = Game_Enemy.prototype.transform
Game_Enemy.prototype.transform = function(enemyId) {
	if (doPathExist("img/system/Enemy_" + enemyId + ".png")){
		filename = "Enemy_" + enemyId;
	} else{
		filename = "Enemy_N"
	}
	BattleManager._spriteset._atbEnemies[this._atbEnemyId].changePicture(filename);
	ATB.Game_Enemy_prototype_transform.call(this, enemyId);
	//BattleManager._spriteset._hudEnemiesNames[this._atbEnemyId].refresh();

};

//Shake screen if enemy is hit
ATB.Game_Enemy_prototype_performDamage = Game_Enemy.prototype.performDamage;
Game_Enemy.prototype.performDamage = function() {
    ATB.Game_Enemy_prototype_performDamage.call(this);
	if (ATB.Param.ShakeIfEnemyIsHit){
    	$gameScreen.startShake(ATB.Param.ShakePower, ATB.Param.ShakeSpeed, ATB.Param.ShakeDuration);
	}
};

ATB.Game_Troop_prototype_makeUniqueNames = Game_Troop.prototype.makeUniqueNames;
Game_Troop.prototype.makeUniqueNames = function() {
	ATB.Game_Troop_prototype_makeUniqueNames.call(this);
	if (BattleManager._spriteset){
		BattleManager._spriteset._hudEnemiesNames.forEach(enemyName => enemyName.refresh())
	}
};


ATB.Sprite_Enemy_prototype_initMembers = Sprite_Enemy.prototype.initMembers
Sprite_Enemy.prototype.initMembers = function() {
    ATB.Sprite_Enemy_prototype_initMembers.call(this);
    this._waitToAppear = false;
};

ATB.Sprite_Enemy_prototype_updateBitmap = Sprite_Enemy.prototype.updateBitmap;
Sprite_Enemy.prototype.updateBitmap = function() {
    var name = this._enemy.battlerName();
    var hue = this._enemy.battlerHue();
	let isChanged = (this._battlerName !== name || this._battlerHue !== hue)
    ATB.Sprite_Enemy_prototype_updateBitmap.call(this);
	if (isChanged){
		this._waitToAppear = true;
		//this.startEffect('appear');
	}
};

Sprite_Enemy.prototype.setupEffect = function() {
    if (this._appeared && this._enemy.isEffectRequested()) {
        this.startEffect(this._enemy.effectType());
        this._enemy.clearEffect();
    }
    if ((this._waitToAppear || (!this._appeared && this._enemy.isAlive())) && this._effectDuration === 0) { //effectDuration === 0 to make sure collapse has ended
		//console.log('APPEAR')
		this.startEffect('appear');
		this._waitToAppear = false;
    } else if (this._appeared && this._enemy.isHidden()) {
        this.startEffect('disappear');
    }
};

// ATB.Sprite_Enemy_prototype_updateEffect = Sprite_Enemy.prototype.updateEffect;
// Sprite_Enemy.prototype.updateEffect = function() {
// 	ATB.Sprite_Enemy_prototype_updateEffect.call(this);
// 	if (this._effectType == 'collapse'){
// 	console.log("Enemy" + this._enemy._atbEnemyId + ":" + this._effectDuration)
// 	}
// };

ATB.Game_Actor_setup = Game_Actor.prototype.setup
Game_Actor.prototype.setup = function(actorId) {
    ATB.Game_Actor_setup.apply(this, arguments)
	this._atbActorId = '';
};

Game_Actor.prototype.setAtbActor = function(atbActorId){
	this._atbActorId = atbActorId;
}

ATB.Game_Actor_performCollapse = Game_Actor.prototype.performCollapse
Game_Actor.prototype.performCollapse = function() {
	if (SceneManager._scene == Scene_Battle){
		spriteset = BattleManager._spriteset;
		spriteset.deleteInfo(this._atbActorId, spriteset._atbActors, 0);
		BattleManager._battlersTurns[this._atbActorId][3] = false;
	}
    ATB.Game_Actor_performCollapse.apply(this)
};

Game_Actor.prototype.revive = function() {
    Game_BattlerBase.prototype.revive.apply(this);
	if (SceneManager._scene == Scene_Battle){
		BattleManager._spriteset._battleField.addChild(BattleManager._spriteset._atbActors[this._atbActorId]);
	}
};

ATB.Scene_Battle_terminate = Scene_Battle.prototype.terminate;
Scene_Battle.prototype.terminate = function() {
    ATB.Scene_Battle_terminate.call(this);
	BattleManager._battlersTurns = undefined;
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
		this._battlersTurns[this._activeActor][3] = false;
    }
    return success;
};

BattleManager.updateEscape = function(){
	if (!$gameMessage.isBusy()){
		this.startTurn();
	}
}

BattleManager.makeActionOrders = function() {
    this._actionBattlers = $gameParty.battleMembers();
};

ATB.BattleManager_startBattle = BattleManager.startBattle;
BattleManager.startBattle = function() {
    ATB.BattleManager_startBattle.apply(this);
	this._battlersTurns = [];
	battlers = [];
	battlers = battlers.concat($gameParty.battleMembers());
	battlers = battlers.concat($gameTroop.members());
	this._slowestBattler = battlers[0];
	for (i = 0; i < battlers.length; i++){
		this._battlersTurns.push([battlers[i], ATB.Param.Base, false]);
		if (battlers[i].agi < this._slowestBattler.agi){
			this._slowestBattler = battlers[i];
		}
	}
	//$gameParty.battleMembers().length = $gameParty.battleMembers().length
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

//Чому анімація у Window_BattleLog???
//Тут читається нотатка використаної навички/речі та визначається прискорення
Window_BattleLog.prototype.startAction = function(subject, action, targets) {
    var item = action.item();
	var rate = item.meta['Speed Up Value'];
	var isDefaultSpeedUp = (item.meta['Speed ​​Up Animation'] && item.meta['Speed ​​Up Animation'].match('true'))
	isDefaultSpeedUp = isDefaultSpeedUp || ATB.Param.SpeedUpAnimation
	isDefaultSpeedUp = isDefaultSpeedUp && !(item.meta['Speed ​​Up Animation'] && item.meta['Speed ​​Up Animation'].match('false'))

	if (rate) {
		rate = rate.replace(/ /g, '')
	} else if (isDefaultSpeedUp){
		rate = ATB.Param.SpeedUpValueDefault;
	} else {
		rate = 4;
	}
    this.push('performActionStart', subject, action);
    this.push('waitForMovement');
    this.push('performAction', subject, action);
    this.push('showAnimation', subject, targets.clone(), item.animationId, rate);
    this.displayAction(subject, item);
};

//Просто перенос rate
Window_BattleLog.prototype.showAnimation = function(subject, targets, animationId, rate) {
    if (animationId < 0) {
        this.showAttackAnimation(subject, targets, rate);
    } else {
        this.showNormalAnimation(targets, animationId, false, rate);
    }
};

//Просто перенос rate
Window_BattleLog.prototype.showAttackAnimation = function(subject, targets, rate) {
    if (subject.isActor()) {
        this.showActorAttackAnimation(subject, targets, rate);
    } else {
        this.showEnemyAttackAnimation(subject, targets);
    }
};

//Просто перенос rate
Window_BattleLog.prototype.showActorAttackAnimation = function(subject, targets, rate) {
    this.showNormalAnimation(targets, subject.attackAnimationId1(), false, rate);
    this.showNormalAnimation(targets, subject.attackAnimationId2(), true, rate);
};

//Просто перенос rate
Window_BattleLog.prototype.showNormalAnimation = function(targets, animationId, mirror, rate) {
	if (Yanfly && Yanfly.Core){
		var animation = $dataAnimations[animationId];
		if (animation) {
		  if (animation.position === 3) {
			targets.forEach(function(target) {
				target.startAnimation(animationId, mirror, 0, rate);
			});
		  } else {
			  var delay = this.animationBaseDelay();
			  var nextDelay = this.animationNextDelay();
			  targets.forEach(function(target) {
				  target.startAnimation(animationId, mirror, delay, rate);
				  delay += nextDelay;
			  });
		  }
		}
	}
    var animation = $dataAnimations[animationId];
    if (animation) {
        var delay = this.animationBaseDelay();
        var nextDelay = this.animationNextDelay();
        targets.forEach(function(target) {
            target.startAnimation(animationId, mirror, delay, rate);
            delay += nextDelay;
        });
    }
};

//ATB.BattleManager_update = BattleManager.update;
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
		if (!(this._playerTurn && i < $gameParty.battleMembers().length) && this._phase == 'turn' && !this._isAction && !this._isEnemySubject){
			if (!this._battlersTurns[i][3]){
				this._battlersTurns[i][1] = this._battlersTurns[i][1] - this._battlersTurns[i][0].agi / ATB.Param.Divider;
			} else {
				this._battlersTurns[i][1] = this._battlersTurns[i][1] - ATB.Param.Base / this._battlersTurns[i][0].currentAction().item().speed / ATB.Param.Divider;
				if (!(i < $gameParty.battleMembers().length && this.isActorAnimationPlaying(i)) && !(i >= $gameParty.battleMembers().length && this.isEnemyAnimationPlaying(i - $gameParty.battleMembers().length)) && !this._spriteset.isBusy()){
					this._battlersTurns[i][0].clearAnimations();
					if (this._battlersTurns[i][0].currentAction().item().meta["Charge Animation"]){
						let animationId = this._battlersTurns[i][0].currentAction().item().meta["Charge Animation"].replace(/ /g, '');
						this._battlersTurns[i][0].startChargeAnimation(animationId, false, 0);
					} else {
						this._battlersTurns[i][0].startChargeAnimation(ATB.Param.ChargeAnimation, false, 0);
					}
				}
			}
			if (this._battlersTurns[i][1] <= 0){
				for (j in this._battlersTurns){
					this._battlersTurns[j][0].stopChargeAnimation();
				}
				this._battlersTurns[i][2] = true;
				this._battlersTurns[i][1] = ATB.Param.Base;
				if (i < $gameParty.battleMembers().length){
					this._playerTurn = true;
					this._subject = $gameParty.battleMembers()[i];
					this._activeActor = i;
					this._isAction = true;
				} else {
					if ($gameTroop.members()[i - $gameParty.battleMembers().length].isAlive()){
						if (!this._isEnemySubject){
							this._subject = $gameTroop.members()[i - $gameParty.battleMembers().length];
							this._isEnemySubject = true;
						} else {
							this._actionEnemies.push($gameTroop.members()[i - $gameParty.battleMembers().length]);
						}
					}
				}
				this._battlersTurns[i][2] = true;
				if (this._battlersTurns[i][0] == this._slowestBattler){
					$gameTroop.increaseTurn();
				}
			}
		}
	}
	if (this._phase == 'turn' && 
	(!this._subject || this._subject == null || (this._subject.isEnemy() && !this._isEnemySubject)) && this._actionEnemies.length > 0){
		this._subject = this._actionEnemies[0];
		this._isEnemySubject = true;
		this._actionEnemies.splice(0, 1);
		this._subject._states.forEach(function(state){
			this._logWindow.displayCurrentState(this._subject);
			if (this._subject._stateTurns[state] <= 0 && $dataStates[state].autoRemovalTiming != 0){
				this._subject.removeState(state);
				this._logWindow.displayRemovedStates(this._subject);
			}
		}, this)
		for (buff = 0; buff < this._subject.buffLength(); buff++){
			this._subject._buffTurns[buff]--;
			if (this._subject._buffTurns[buff] <= 0){
				this._subject.removeBuff(buff);
				this._logWindow.displayBuffs(this._subject, this._subject.result().removedBuffs, TextManager.buffRemove);
			}

		}
		this._battlersTurns[this._subject.index() + $gameParty.battleMembers().length][2] = true;
	}
};

BattleManager.isActorAnimationPlaying = function(actor){
	return this._spriteset._actorSprites[actor].isAnimationPlaying() || $gameParty.battleMembers()[actor].isAnimationRequested();
}

BattleManager.isEnemyAnimationPlaying = function(enemy){
	return this._spriteset._enemySprites[enemy].isAnimationPlaying() || $gameTroop.members()[enemy].isAnimationRequested();
}


Game_Battler.prototype.onTurnEndOverwrite = function() {
    this.clearResult();
    this.regenerateAll();
	this.removeStatesAuto(2);
};

BattleManager.endTurn = function() {
    this._phase = 'turnEnd';
    this._preemptive = false;
    this._surprise = false;
    this.allBattleMembers().forEach(function(battler) {
        battler.onTurnEndOverwrite();
        this.refreshStatus();
        this._logWindow.displayAutoAffectedStatus(battler);
        this._logWindow.displayRegeneration(battler);
    }, this);
    if (this.isForcedTurn()) {
        this._turnForced = false;
    }
};


BattleManager.startB = function() {
    this._phase = "turn";
};

BattleManager.processTurn = function() {
	var subject = this._subject;
	//subject.index() > -1 - щоб впевнитися, що не покинули партію
	if (subject.index() > -1 && subject.isEnemy() && this._battlersTurns[subject.index() + $gameParty.battleMembers().length][2] || 
	subject.index() > -1 && subject.isActor() && this._battlersTurns[subject.index()][2]){
		var action = subject.currentAction();
		if (action) {
			if (action.isValid()) {
				if ((subject.isActor() && this._battlersTurns[subject.index()][3]) ||
				(subject.isEnemy() && this._battlersTurns[subject.index() + $gameParty.battleMembers().length][3])){
					if (subject.isEnemy() && this._battlersTurns[subject.index() + $gameParty.battleMembers().length][3]){
						
						this.startAction();
						subject._turnCount++;
						subject.removeCurrentAction();
						this._battlersTurns[subject.index() + $gameParty.battleMembers().length][2] = false;
						this._battlersTurns[subject.index() + $gameParty.battleMembers().length][3] = false;
						this._battlersTurns[subject.index() + $gameParty.battleMembers().length][1] = ATB.Param.Base;
					}
				} else {
					var speed = action.item().speed;
					if (speed <= 0){
						this.startAction();
						subject._turnCount++;
						subject.removeCurrentAction();
					} else {
						if (subject.isActor()){
							this._battlersTurns[subject.index()][3] = true;
							this._battlersTurns[subject.index()][2] = false;
						} else {
							this._battlersTurns[subject.index() + $gameParty.battleMembers().length][3] = true;
							this._battlersTurns[subject.index() + $gameParty.battleMembers().length][2] = false;
						}
						this._phase = 'turn';
						this._subject = null;
						this._isAction = null;
					}
				}
			} else {
				subject.updateStateTurns();
				subject.updateBuffTurns();
				subject.removeBuffsAuto();
				subject.removeStatesAuto(1);
				subject.removeStatesAuto(2);
				subject.removeCurrentAction();
			}
			if (subject.isEnemy()){
				this._battlersTurns[subject.index() + $gameParty.battleMembers().length][2] = false;
				this._isEnemySubject = false;
			}
			$gameTroop.makeActions();
		this.subject = null
		} else {
			this._isAction = false;
			subject.onAllActionsEnd();
			this.refreshStatus();
			this._logWindow.displayAutoAffectedStatus(subject);
			this._logWindow.displayCurrentState(subject);
			this._logWindow.displayRegeneration(subject);
			this._subject = this.getNextSubject();
			this._isEnemySubject = false;
		}
	}

};
BattleManager.endAction = function() {
	this._logWindow.endAction(this._subject);
	this._isAction = false;
	if (this._playerTurn){
		BattleManager.startInput();
	} else {
    	this._phase = 'turn';
	}
	this._subject.updateStateTurns();
	this._subject.updateBuffTurns();
	this._subject.removeBuffsAuto();
	this._subject.removeStatesAuto(1);
	this._subject.removeStatesAuto(2);
};

ATB.BattleManager_startAction = BattleManager.startAction;
BattleManager.startAction = function() {
	subject = this._subject;
    ATB.BattleManager_startAction.apply(this);
};

BattleManager.updateTurnEnd = function() {
    if (!this._subject) {
        this._subject = this.getNextSubject();
		if (!this._subject){
			this.startInput();
			return;
		}
    }
	if (!this._battlersTurns[this._subject.index()][3]){
		this.startInput();
	} else {
		this.startAction();
		this._subject._turnCount++;
        this._subject.removeCurrentAction();
		this._battlersTurns[this._subject.index()][2] = false;
		this._battlersTurns[this._subject.index()][3] = false;
		this._battlersTurns[this._subject.index()][1] = ATB.Param.Base;
		this._playerTurn = false;
	}
};

BattleManager.startInput = function() {
    this._phase = 'input';
	this._subject = $gameParty.battleMembers()[this._activeActor];
	if (this._subject){ //на випадок, якщо покине партію
	this._subject.makeActions();
	}
    $gameTroop.makeActions();
    this.clearActor();
    if (this._surprise || !$gameParty.canInput()) {
        this.startTurn();
    }
};

BattleManager.updateEvent = function() {
    if (this.isActionForced() && !(this._phase === 'battleEnd')) {
        this.processForcedAction();
    } else if (!(this._phase === 'battleEnd')){
        return this.updateEventMain();
    }
    return this.checkAbort();
};

BattleManager.processForcedAction = function() {
    if (this._actionForcedBattler) {
        this._turnForced = true;
        this._subject = this._actionForcedBattler;
        if (this._subject._actions.length <= 1 || (this._subject.isEnemy() && this._battlersTurns[$gameParty.battleMembers().length + this._subject.index()][1] > 0)){
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
			this.changeCommandPosition();
            this.startActorCommandSelection();
        } else {
			if (!$gameParty.battleMembers()[BattleManager._activeActor]){ // на випадок, якщо покине команду
				BattleManager._activeActor = null;
				BattleManager._playerTurn = false;
				BattleManager._isAction = false;
				BattleManager.startTurn();
			} else if ($gameParty.battleMembers()[BattleManager._activeActor].canInput()){
				BattleManager.changeActor(BattleManager._activeActor, 'undecided');
				this.changeCommandPosition();
				this.startActorCommandSelection();
			} else {
				BattleManager.startTurn();
			}
        }
    } else {
        this.endCommandSelection();
    }
};

///===ATB_Gauge===///

// ATB.Spriteset_Battle_prototype_update = Spriteset_Battle.prototype.update
// Spriteset_Battle.prototype.update = function(){
// 	ATB.Spriteset_Battle_prototype_update.call(this);
// 	for (i in $gameTroop.members()){
// 		if (this._enemyStateIconBases[i].y == $gameTroop.members()[i].screenY()){
// 			console.log(i + ": " + $gameTroop.members()[i].screenY() + ", " + ($gameTroop.members()[i].screenY() - this._enemySprites[i].height))
// 			this._enemyStateIconBases[i].y = $gameTroop.members()[i].screenY() - this._enemySprites[i].height
// 		}
// 		//console.log(this._enemySprites[i].height)
// 	}
// }
ATB.Spriteset_Battle_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer;
Spriteset_Battle.prototype.createLowerLayer = function() {
    ATB.Spriteset_Battle_createLowerLayer.call(this);
	this._hpBases = [];
	this._atbActors = [];
	this.createHUDEnemies();
	for (i in $gameParty.battleMembers()){
		this.createActorHUD(i);
	}
	this.createATBBar();
	for (i in $gameParty.battleMembers()){
		this.createATBActor(i);
	}
	this.createATBEnemies();
	this.createATBMagic();
};
Spriteset_Battle.prototype.createATBBar = function(){
    this._atbBase = new Sprite_ATBBarBase("WIP_Line");
    this._battleField.addChild(this._atbBase);
}

Spriteset_Battle.prototype.createATBActor = function(id){
	actorId = $gameParty._actors[id]
	if (doPathExist("img/system/Actor_" + actorId + ".png")){
		filename = "Actor_" + actorId;
	} else{		
		filename = "Actor_N"
	}
	this._atbActors.push(new Sprite_ATBActor(filename, this._atbBase, id));
	this._battleField.addChild(this._atbActors[id]);
	$gameParty.battleMembers()[id].setAtbActor(id)
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
			if ($gameTroop._enemies[i].isAppeared()){
				this._battleField.addChild(this._atbEnemies[i]);
			}
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
		this.x = this._atbBase.x - 36;
		if (BattleManager._battlersTurns[this._id][1] == ATB.Param.Base){
			this.y = 0;
			this.x = this._atbBase.x + 4;
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
	&& BattleManager._battlersTurns.length == $gameParty.battleMembers().length + $gameTroop.members().length){
		this.x = this._atbBase.x + 50;
		if (BattleManager._battlersTurns[this._id + $gameParty.battleMembers().length][1] == ATB.Param.Base){
			this.y = 0;
			this.x = this._atbBase.x + 4;
		} else {
			this.y = this._atbBase.height / ATB.Param.Base * (BattleManager._battlersTurns[this._id + $gameParty.battleMembers().length][1])
		}
		
	}
}

Sprite_ATBEnemy.prototype.changePicture = function(picture){
	//this.bitmap.clear();
	this.bitmap = ImageManager.loadSystem(picture);
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
	this.scale.x *= -1;
}

Sprite_ATBMagic.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	this.y = this._enemyBase.y + (this._enemyBase.height - this.height)/2;
	this.x = this._enemyBase.x + this._enemyBase.width + this.width;
	if (BattleManager._battlersTurns != undefined
		&& BattleManager._battlersTurns[this._id + $gameParty.battleMembers().length] != undefined &&
		BattleManager._battlersTurns[this._id + $gameParty.battleMembers().length][0]._actions[0] != undefined) {

		skill = BattleManager._battlersTurns[this._id + $gameParty.battleMembers().length][0]._actions[0]._item
		if (skill._dataClass == "skill" && $gameTroop.members()[this._id].meetsSkillConditions($dataSkills[skill._itemId])) {
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

Spriteset_Battle.prototype.createActorHUD = function(id){
	this.createHPBase(id); //this.createHPBase(x + (Graphics.boxWidth - x) / 4 * i, y, i);
	this.createHPBar(id);
	this.createMPBar(id);
	this.createTPBar(id);
	this.createHUDFace(id);
	this.createHUDName(id);
	this.createHUDText(id);
	for (j = 0; j < 4; j++){
		this.createActorStateIcon(id, j);
	}
}
Spriteset_Battle.prototype.createHPBase = function(id){
    this._hpBases.push(new Sprite_HPBarBase("WIP_HP_Actor_Bar", id));
    this._battleField.addChild(this._hpBases[id]);
}

Spriteset_Battle.prototype.createHPBar = function(id){
	hpGauge = new Sprite_HPBar(this._hpBases[id])
	this._hpBases[id].addChild(hpGauge)
}

textcolor = function(n){
	var px = 96 + (n % 8) * 12 + 6;
	var py = 144 + Math.floor(n / 8) * 12 + 6;
	windowskin = ImageManager.loadSystem('Window');
	return windowskin.getPixel(px, py);
}
Spriteset_Battle.prototype.createMPBar = function(id){
	mpGauge = new Sprite_MPBar(this._hpBases[id]);
    this._hpBases[id].addChild(mpGauge);
}

Spriteset_Battle.prototype.createTPBar = function(id){
	tpGauge = new Sprite_TPBar(this._hpBases[id]);
    this._hpBases[id].addChild(tpGauge);
}

Spriteset_Battle.prototype.createHUDFace = function(id){
	hudFace = new Sprite_HUDFace($gameParty.battleMembers()[id], id, this._hpBases[id]);
	this._hpBases[id].addChild(hudFace);
}

Spriteset_Battle.prototype.createHUDName = function(id){
	hudName = new Sprite_HUDName(id, this._hpBases[id]);
	this._hpBases[id].addChild(hudName);
}

Spriteset_Battle.prototype.createHUDText = function(id){
	hudText = new Sprite_TextOnBars(this._hpBases[id]);
	this._hpBases[id].addChild(hudText);
	hudTextNum = new Sprite_TextOnBarsNum(this._hpBases[id]);
	this._hpBases[id].addChild(hudTextNum);
}

Spriteset_Battle.prototype.createActorStateIcon = function(id, prior){
	actorStateIcon = new Sprite_ActorStateIcon(id, this._hpBases[id], prior);
	this._hpBases[id].addChild(actorStateIcon);
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

Sprite_HPBarBase.prototype.refresh = function(){
	this.children.forEach(i => i.refresh());
}

function Sprite_EnemyStateIconsBase(){
	this.initialize.apply(this, arguments)
}

Sprite_EnemyStateIconsBase.prototype = Object.create(Sprite_Base.prototype);
Sprite_EnemyStateIconsBase.prototype.constructor = Sprite_EnemyStateIconsBase;

Sprite_EnemyStateIconsBase.prototype.initialize = function(){
	Sprite_Base.prototype.initialize.call(this);
	this._battler = null;
	this.bitmap = ImageManager.loadSystem("Enemy_Icons_Base");
	
    this.anchor.x = 0.5;
    // this.anchor.y = 0.5;
}


Sprite_EnemyStateIconsBase.prototype.setup = function(battler){
	this._battler = battler;
}

Sprite_Enemy.prototype.updateStateSprite = function() {
    this._stateIconSprite.y = 20-Math.round((this.bitmap.height + 40) * 0.9);
    if (this._stateIconSprite.y < 20 - this.y) {
        this._stateIconSprite.y = 20 - this.y;
    }
	for (let i = 0; i < 4; i++){
		this._stateIcons[i].refresh()
	}
};

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
	this.x = 100;
	this.y = -8;
	this._id = this.base._id;
	this.refresh();
}
Sprite_HPBar.prototype.refresh = function(){
	var pw = Math.floor(this._bitmap.width * $gameParty.battleMembers()[this._id].hpRate())
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
	this.x = 100;
	this.y = 23;
	this._id = this.base._id
	this.refresh();
}
Sprite_MPBar.prototype.refresh = function(){
	var pw = Math.floor(this._bitmap.width * $gameParty.battleMembers()[this._id].mpRate())
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
	this.x = 100;
	this.y = 56;
	this._id = this.base._id
	this.refresh();
}
Sprite_TPBar.prototype.refresh = function(){
	var pw = Math.floor(this._bitmap.width * $gameParty.battleMembers()[this._id].tpRate())
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
	this.x = 100;
	this.y = -8;
	this.bitmap.textColor = textcolor(16);
	this.drawText();
}

Sprite_TextOnBars.prototype.drawText = function(){
	this.bitmap.drawText(TextManager.hpA, 0, 4, this.bitmap.width, 36);
	this.bitmap.drawText(TextManager.mpA, 0, 35, this.bitmap.width, 36);
	this.bitmap.drawText(TextManager.tpA, 0, 68, this.bitmap.width, 36);
}

Sprite_TextOnBars.prototype.refresh = function(){}

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
	this.x = 100;
	this.y = -8;
	this.drawText();
}
Sprite_TextOnBarsNum.prototype.refresh = function(){
	this.bitmap.clear();
	this.drawText();
}

Sprite_TextOnBarsNum.prototype.drawText = function(){
	hptext = $gameParty.battleMembers()[this._id].hp + "/" + $gameParty.battleMembers()[this._id].mhp
	mptext = $gameParty.battleMembers()[this._id].mp + "/" + $gameParty.battleMembers()[this._id].mmp
	tptext = $gameParty.battleMembers()[this._id].tp
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

Sprite_HUDFace.prototype.initialize = function(actor, id, base){
	Sprite_Base.prototype.initialize.call(this);
	this.base = base;
	this._actor = actor;
	this._id = id;
	//console.log(this._id)
	this._isDynamic = this._actor.actor().meta['DamageFace'];
	if (this._isDynamic){
		this.redrawDynamicFace();
	} else {
		this.redrawFace();
	}
	this._maskSprite = new Sprite()
	this.addChild(this._maskSprite);
	this.scale.x = 98 / 144;
	this.scale.y = 96 / 144;
	//this.x += this.base.x;
	//this.y += this.base.y;
	this._maskSprite.bitmap = ImageManager.loadSystem("Mask1")
	this.mask = this._maskSprite;
}

Sprite_HUDFace.prototype.update = function(){
	Sprite_Base.prototype.update.call(this);
	if (!this._isDynamic && (this._faceName != this._actor._faceName || this._faceIndex != this._actor._faceIndex)){
		this.redrawFace();
	}
	if (this._isDynamic){
		this.redrawDynamicFace();
	}
}

Sprite_HUDFace.prototype.refresh = function(){}

Sprite_HUDFace.prototype.redrawFace = function(){
	this._faceName = this._actor._faceName;
	this._faceIndex = this._actor._faceIndex;
	this.bitmap = ImageManager.loadFace(this._faceName);
	this.setFrame(this._faceIndex % 4 * 144, Math.floor(this._faceIndex / 4) * 144, 144, 144);
}

Sprite_HUDFace.prototype.redrawDynamicFace = function(){
	this._faceName = this._actor.actor().meta['DamageFace'].match(/ *'(.*)'/)[1];
	this._faceIndex = 4 - Math.ceil(this._actor.hpRate() / 0.25)
	this.bitmap = ImageManager.loadBitmap('img/ActorDamageFaces/', this._faceName, 0, true);
	this.setFrame(this._faceIndex % 5 * 144, 0, 144, 144);
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
	this._name = $gameParty.battleMembers()[id]._name;
	this.x = 0
	this.y = 96
	this.bitmap.drawText(this._name, 0, 0, this.bitmap.width, this.bitmap.height, 'center');
}

Sprite_HUDName.prototype.update = function(){
	if ($gameParty.battleMembers()[this._id] && this._name != $gameParty.battleMembers()[this._id]._name){
		this._name = $gameParty.battleMembers()[this._id]._name;
		this.refresh();
	}
} 

Sprite_HUDName.prototype.refresh = function(){
	this.bitmap.clear();
	this.bitmap.drawText(this._name, 0, 0, this.bitmap.width, this.bitmap.height, 'center');
} 

function Sprite_ATBStateIcon(){
	this.initialize.apply(this, arguments);
}

Sprite_ATBStateIcon.prototype = Object.create(Sprite.prototype);
Sprite_ATBStateIcon.prototype.constructor = Sprite_ATBStateIcon;

Sprite_ATBStateIcon.prototype.initialize = function(prior){
	Sprite.prototype.initialize.call(this, new Bitmap(Graphics.width, Graphics.height));
	// this._id = id;
	// this._base = base;
	this._prior = prior;
	// this.x = base.x + 98 + 31 * prior;
	// this.y = base.y + 93
	this.bitmap = ImageManager.loadSystem('IconSet');
	this.refresh();
}

Sprite_ATBStateIcon.prototype.refresh = function(){
	// var actor = $gameParty.battleMembers()[this._id]
	// var iconIndex = actor.allIcons()[this._prior];
    // var pw = Window_Base._iconWidth;
    // var ph = Window_Base._iconHeight;
	// var sx = iconIndex % 16 * pw;
	// var sy = Math.floor(iconIndex / 16) * ph;
	// this.setFrame(sx, sy, pw, ph);
}

function Sprite_ActorStateIcon(){
	this.initialize.apply(this, arguments);
}

Sprite_ActorStateIcon.prototype = Object.create(Sprite_ATBStateIcon.prototype);
Sprite_ActorStateIcon.prototype.constructor = Sprite_ActorStateIcon;

Sprite_ActorStateIcon.prototype.initialize = function(id, base, prior){
	this._id = id;
	Sprite_ATBStateIcon.prototype.initialize.call(this, prior);
	this._base = base;
	this.x = 98 + 31 * prior;
	this.y = 93
}

Sprite_ActorStateIcon.prototype.refresh = function(){
	var actor = $gameParty.battleMembers()[this._id]
	var iconIndex = actor.allIcons()[this._prior];
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
	var sx = iconIndex % 16 * pw;
	var sy = Math.floor(iconIndex / 16) * ph;
	this.setFrame(sx, sy, pw, ph);
}

function Sprite_EnemyStateIcon(){
	this.initialize.apply(this, arguments);
}

Sprite_EnemyStateIcon.prototype = Object.create(Sprite_ATBStateIcon.prototype);
Sprite_EnemyStateIcon.prototype.constructor = Sprite_EnemyStateIcon;

Sprite_EnemyStateIcon.prototype.initialize = function(base, prior){
	this._base = base;
	Sprite_ATBStateIcon.prototype.initialize.call(this, prior);
	//this._enemy = enemy;
	// this._prior = prior;
	// this.x = base.x + 31 * prior;
	// this.y = base.y
	// this.bitmap = ImageManager.loadSystem('IconSet');
	// this.refresh();
}


Sprite_EnemyStateIcon.prototype.setup = function(enemy){
	this._enemy = enemy;
	this.refresh();
}


Sprite_EnemyStateIcon.prototype.refresh = function(){
	//var enemy = $gameTroop.members()[this._id]
	this.x = this._base.x - 31 * 2 + 31 * this._prior;
	this.y = this._base.y;
	if (this._enemy){
	var iconIndex = this._enemy.allIcons()[this._prior];
	} else {
		var iconIndex = 0;
	}
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
	this._bossCount = 0;
	for (i = 0; i < $gameTroop._enemies.length; i++){
		if ($gameTroop.members()[i].enemy().meta.Boss){
			this._bossCount++;
			this._hudEnemies[i] = new Sprite_HUDEnemy(i, this._bossCount);
		} else {
			this._hudEnemies[i] = new Sprite_HUDEnemy(i);
		}
		this._hudEnemies[i].opacity = $gameTroop._enemies[i].isAppeared() ? 255 : 0;
		this._hudEnemies[i].setup(this);
		
		this._battleField.addChild(this._hudEnemies[i]);
		this._hudEnemiesAnim[i] = new Sprite_HUDEnemyAnim(i, this._hudEnemies[i]);
		this._hudEnemiesAnim[i].opacity = $gameTroop._enemies[i].isAppeared() ? 255 : 0;
		this._hudEnemiesAnim[i].setup(this);
		
		this._battleField.addChild(this._hudEnemiesAnim[i]);
		this._hudEnemiesNames[i] = new Sprite_HUDEnemyName(i, this._hudEnemies[i]);
		this._hudEnemiesNames[i].opacity = $gameTroop._enemies[i].isAppeared() ? 255 : 0;
		this._battleField.addChild(this._hudEnemiesNames[i])
		
		if ($gameTroop._enemies[i].enemy().meta.Boss){
			this._enemyFaces[i] = new Sprite_HUDEnemyFace($gameTroop._enemies[i]._enemyId, this._hudEnemies[i]);
			this._battleField.addChild(this._enemyFaces[i]);
		}

	}
}


Sprite_Enemy.prototype.createStateIconSprite = function(){
	//console.log(this);
	this._stateIconSprite = new Sprite_EnemyStateIconsBase();
	//this._stateIconSprite.opacity = this._appeared ? 255 : 0;
	this._stateIcons = [];
	this.addChild(this._stateIconSprite);
	for (let i = 0; i < 4; i++){
		this._stateIcons.push(new Sprite_EnemyStateIcon(this._stateIconSprite, i));
		this.addChild(this._stateIcons[i]);
	}
}

ATB.Sprite_Enemy_prototype_setBattler = Sprite_Enemy.prototype.setBattler;
Sprite_Enemy.prototype.setBattler = function(battler) {
    ATB.Sprite_Enemy_prototype_setBattler.call(this, battler);
	for (let i = 0; i < 4; i++){
    	this._stateIcons[i].setup(battler);
	}
};

function Sprite_HUDEnemy(){
	this.initialize.apply(this, arguments);
}

Sprite_HUDEnemy.prototype = Object.create(Sprite_Base.prototype);
Sprite_HUDEnemy.prototype.constructor = Sprite_HUDEnemy;

Sprite_HUDEnemy.prototype.initialize = function(id, bossNum){
	Sprite_Base.prototype.initialize.call(this);
	this._id = id;
	this._bossNum = bossNum || 0;
	if (this.isBoss()){
		var name = "WIP_HP_Boss_Bar"
	} else {
		var name = "WIP_HP_Enemy_Bar"
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
			this.y = (this._bossNum - 1) * 54;
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
		var name = "WIP_HP_Boss_Bar_Animation"
	} else {
		var name = "WIP_HP_Enemy_Bar_Anim"
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
		this.y = this._base.y;
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
	if (!this.isBoss()){
		this.x = this._base.x
		this.y = this._base.y + 15
		this.width = 126;
	} else {
		this.x = this._base.x + 96
		this.y = this._base.y
		this.width = 316;
	}
	this.bitmap.drawText(this._name, 0, 0, this.width, 30, 'center'); //Graphics.boxWidth / 8
}

Sprite_HUDEnemyName.prototype.isBoss = function(){
	return $gameTroop.members()[this._id].enemy().meta.Boss
}

Sprite_HUDEnemyName.prototype.refresh = function(){
	this._name = this._enemy.name();
	this.bitmap.clear();
	this.bitmap.drawText(this._name, 0, 0, this.width, 30, 'center');
}

function Sprite_HUDEnemyFace(){
	this.initialize.apply(this, arguments);
}

Sprite_HUDEnemyFace.prototype = Object.create(Sprite_Base.prototype);
Sprite_HUDEnemyFace.prototype.constructor = Sprite_HUDEnemyFace;

Sprite_HUDEnemyFace.prototype.initialize = function(id, base){
	Sprite_Base.prototype.initialize.call(this);
	this._id = id
	this._base = base;
	if (doPathExist("img/BFace/Boss" + this._id + ".png")){
		filename = "Boss" + this._id;
	} else{
		filename = "BossN"
	}
	this.x = this._base.x
	this.y = this._base.y
	this.bitmap = ImageManager.loadBitmap("img/BFace/", filename, 0, true);
	
	this._maskSprite = new Sprite()
	this._maskSprite.bitmap = ImageManager.loadSystem("Mask2")
}

// Sprite_HUDEnemyFace.prototype.update = function(){
// 	if (BattleManager._spriteset != undefined){
// 		sprite = BattleManager._spriteset._hudEnemies[this._id]
// 		if (sprite != undefined){
// 			this.x = sprite.x
// 			this.y = sprite.y
// 		}
// 	}
// }
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

Scene_Battle.prototype.changeCommandPosition = function(){
	let actorX = this._spriteset._actorSprites[BattleManager.actor()._atbActorId].x;
	let actorY = this._spriteset._actorSprites[BattleManager.actor()._atbActorId].y;
	let actorWidth = this._spriteset._actorSprites[BattleManager.actor()._atbActorId].children[2].width;
	let actorHeight = this._spriteset._actorSprites[BattleManager.actor()._atbActorId].children[2].height;
	this._actorCommandWindow.x = actorX - actorWidth - this._actorCommandWindow.width;
	this._actorCommandWindow.y = actorY - actorHeight - this._actorCommandWindow.height;
	this._partyCommandWindow.x = this._actorCommandWindow.x;
	this._partyCommandWindow.y = this._actorCommandWindow.y;
}

Scene_Battle.prototype.endCommandSelection = function() {
    this._partyCommandWindow.close();
    this._actorCommandWindow.close();
};

BattleManager.setStatusWindow = function(statusWindow) {};

BattleManager.refreshStatus = function() {
	// this.refreshHpBars();
	// this.refreshMpBars();
	// this.refreshTpBars();
	// this.refreshIcons();
	// this.refreshTextOnBars();
	this._spriteset._hpBases.forEach(hud => hud.refresh());
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

ATB.Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
Scene_Battle.prototype.createDisplayObjects = function() {
    ATB.Scene_Battle_createDisplayObjects.call(this);
	this._actorCommandWindow.x = Graphics.boxWidth - this._actorCommandWindow.width;
	this._actorCommandWindow.y = 280 - 64 - this._actorCommandWindow.height;
	this._partyCommandWindow.x = Graphics.boxWidth - this._partyCommandWindow.width;
	this._partyCommandWindow.y = 280 - 64 - this._partyCommandWindow.height;
};

BattleManager.updateTurn = function() {
	$gameParty.requestMotionRefresh();
    if (!this._subject || this._subject.index() == -1) { //this._subject.index() == -1 - на випадок, якщо покине партію
        this._subject = this.getNextSubject();
    }
    if (this._subject) {
        this.processTurn();
    }
	if (this._playerTurn) {
		this.endTurn();
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

// Sprite_Animation but charging

Game_Battler.prototype.startChargeAnimation = function(animationId, mirror, delay) {
    var data = { animationId: animationId, mirror: mirror, delay: delay };
	if (this._chargeAnimations){
		this._chargeAnimations.push(data);
	} else {
		this._chargeAnimations = [data];
	}
};

Game_Battler.prototype.stopChargeAnimation = function() {
    this._chargeAnimationsStop = true;
};

Game_Battler.prototype.isChargeAnimationRequested = function() {
    return this._chargeAnimations ? this._chargeAnimations.length > 0 : false;
};

Game_Battler.prototype.isChargeAnimationStopped = function() {
    return this._chargeAnimationsStop;
};

ATB.Sprite_Battler_prototype_updateAnimation = Sprite_Battler.prototype.updateAnimation;
Sprite_Battler.prototype.updateAnimation = function() {
    ATB.Sprite_Battler_prototype_updateAnimation.apply(this);
	this.setupChargeAnimation();
	if (this._battler.isChargeAnimationStopped()){
		this.stopChargeAnimation();
	}
};

Sprite_Battler.prototype.setupChargeAnimation = function() {
    while (this._battler.isChargeAnimationRequested()) {
        var data = this._battler._chargeAnimations.shift();
        var animation = $dataAnimations[data.animationId];
        var mirror = data.mirror;
        var delay = animation.position === 3 ? 0 : data.delay;
        this.startChargeAnimation(animation, mirror, delay);
        for (var i = 0; i < this._animationSprites.length; i++) {
            var sprite = this._animationSprites[i];
            sprite.visible = this._battler.isSpriteVisible();
        }
    }
};

Sprite_Battler.prototype.startChargeAnimation = function(animation, mirror, delay) {
    var sprite = new Sprite_ChargeAnimation();
    sprite.setup(this._effectTarget, animation, mirror, delay);
    this.parent.addChild(sprite);
    this._animationSprites.push(sprite);
};

Sprite_Battler.prototype.stopChargeAnimation = function() {
	this._battler._chargeAnimationsStop = false;
    var sprites = this._animationSprites.clone();
    this._animationSprites = [];
	for (var i = 0; i < sprites.length; i++) {
		sprites[i].remove();
	}
};

//Просто перенос rate
Sprite_Battler.prototype.setupAnimation = function() {
    while (this._battler.isAnimationRequested()) {
        var data = this._battler.shiftAnimation();
        var animation = $dataAnimations[data.animationId];
        var mirror = data.mirror;
        var delay = animation.position === 3 ? 0 : data.delay;
        this.startAnimation(animation, mirror, delay, data.rate);
        for (var i = 0; i < this._animationSprites.length; i++) {
            var sprite = this._animationSprites[i];
            sprite.visible = this._battler.isSpriteVisible();
        }
    }
};

//Просто перенос rate
Game_Battler.prototype.startAnimation = function(animationId, mirror, delay, rate) {
    var data = { animationId: animationId, mirror: mirror, delay: delay, rate: rate };
    this._animations.push(data);
};

//Просто перенос rate
Sprite_Base.prototype.startAnimation = function(animation, mirror, delay, rate) {
    var sprite = new Sprite_Animation();
    sprite.setup(this._effectTarget, animation, mirror, delay, rate);
    this.parent.addChild(sprite);
    this._animationSprites.push(sprite);
};

//Просто перенос rate
Game_Actor.prototype.startAnimation = function(animationId, mirror, delay, rate) {
    mirror = !mirror;
    Game_Battler.prototype.startAnimation.call(this, animationId, mirror, delay, rate);
};

//Просто перенос rate
Sprite_Animation.prototype.setup = function(target, animation, mirror, delay, rate) {
    this._target = target;
    this._animation = animation;
    this._mirror = mirror;
    this._delay = delay;
    if (this._animation) {
        this.remove();
        this.setupRate(rate);
        this.setupDuration();
        this.loadBitmaps();
        this.createSprites();
    }
};

//Ось тут уже механіка rate
Sprite_Animation.prototype.setupRate = function(rate) {
	if (rate){
		this._rate = 32 / 2 ** (rate - 1)
	} else {
    	this._rate = 4;
	}
};

function Sprite_ChargeAnimation() {
    this.initialize.apply(this, arguments);
}

Sprite_ChargeAnimation.prototype = Object.create(Sprite_Animation.prototype);
Sprite_ChargeAnimation.prototype.constructor = Sprite_Animation;

Sprite_ChargeAnimation.prototype.updateFrame = function() {
	Sprite_Animation.prototype.updateFrame.apply(this);
    if (this._duration == 0) {
		this.setupDuration();
    }
};
