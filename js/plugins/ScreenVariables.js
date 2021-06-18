/*=============================================================================
 * Screen Variables
 *=============================================================================*/

 /*:
 * @plugindesc v1.04 Выводит заданный текст на экран.
 * <ScreenVariables>
 * @author Dirge
 *
 * @param Variable Number
 * @desc Номер переменной для хранения данных, указать и забыть.
 * @default 0
 *
 * @param Auto-Refresh
 * @desc Включить(true)\выключить(false) авто обновление текста.
 * @default false
 *
 * @help
 * С помощью плагина на экран игры можно выводить любой текст.
 *
 * Доступные вызовы скрипта:
 * 'Ключ' - это индификатор текста, чтобы иметь доступ к каждому тексту отдельно
 * this.addVarHudText('Ключ','Текст',Х,Y,Видимость) - добавить текст на экран
 * Пример: this.addVarHudText('test','Проверка',66,66,true)
 * 
 * this.textVarTurnOn('Ключ') - изменить видимость текста по ключу на true
 * this.textVarTurnOff('Ключ') - изменить видимость текста по ключу на false
 * this.textVarSetXY('Ключ',Х,Y) - изменить Х и Y для текста по ключу 
 * this.textVarGetX('Ключ') - получить текущий Х текста по ключу 
 * this.textVarGetY('Ключ') - получить текущий Y текста по ключу 
 * this.changeVarText('Ключ', 'Текст') - изменить текст по ключу
 * this.showAllVarText() - изменить видимость текста всем ключам на true
 * this.hideAllVarText() - изменить видимость текста всем ключам на false
 * this.showVarWindow() - показать весь текст 
 * this.hideVarWindow() - скрыть весь текст 
 * this.deleteVar() - удалить текст полностью по ключу.
 * this.varHudRefresh() - Ручное обновление текста на экране
 * 
 * allHudKeys_Debug() - Выводит все текущие ключи в консоль(F8 при тестовой игре)
 * Служит в отладочных целях, так же можно вызывать прямо из консоли.
 * 
 * =============================================================================
 * Так же к тексту применимы спец команды из диалогового окна, такие как:
 * \\V[n] - Заменяется значением указаной переменной.
 * \\N[n] - Заменяется именем указаного героя.
 * \\P[n] - Заменяется именем героя под указанным номером в группе.
 * \\G - Заменяется названием валюты.
 * \\C[n] - Рисует текст другим цветом.
 * \\I[n] - Рисует указанную иконку из иконсета.
 * \\{ - Увеличиваем размер текста.
 * \\} - Уменьшает размер текста.
 * Вызывать их обьязательно с двойным слешем 
 * =============================================================================
 * 
 */
 

(function() {
	var parameters = $plugins.filter(function(p) {return p.description.contains('<ScreenVariables>');})[0].parameters;
	var dVariableNumber = Number(parameters['Variable Number'] || 0);
	var dAtoRefresh = eval(String(parameters['Auto-Refresh']));
	
	/*=============== Window_Variable ===============*/
	function Window_Variable() {
		this.initialize.apply(this, arguments);
	}

	Window_Variable.prototype = Object.create(Window_Base.prototype);
	Window_Variable.prototype.constructor = Window_Variable;

	Window_Variable.prototype.initialize = function(x, y) {
		var width = Graphics.width + this.standardPadding() * 2
		var height = Graphics.height + this.standardPadding() * 2;
		Window_Base.prototype.initialize.call(this, x, y, width, height);
		this.refresh();
	};

	Window_Variable.prototype.standardPadding = function() {
		return 0;
	};
	
	Window_Variable.prototype.refresh = function() {
		this.contents.clear();
		for(var key in $gameVariables._data[dVariableNumber]){
			var hudObj = $gameVariables._data[dVariableNumber][key];
			if (hudObj.visible === true){
				this.drawTextEx(hudObj.hudText, hudObj.x, hudObj.y);
			}
		}
	};	
	/*=============== Window_Variable end ===============*/
	
	/*=============== Game_Interpreter ===============*/
	Game_Interpreter.prototype.isRefreshAvailable = function() {
		return ((typeof SceneManager._scene._variableWindow != "undefined") && (SceneManager._scene._varWindowAutoRefresh === false))
	};
	
	Game_Interpreter.prototype.isHudCreated = function() {
		return ((typeof SceneManager._scene._variableWindow != "undefined") && (typeof $gameVariables._data[dVariableNumber] === 'object'))
	};

	Game_Interpreter.prototype.addVarHudText = function() {
		if (!this.isHudCreated()){
			$gameVariables._data[dVariableNumber] = {};
		}
		var args = arguments;
		$gameVariables._data[dVariableNumber][args[0]] = {hudText:args[1], x:args[2], y:args[3], visible:args[4]};
		if (this.isRefreshAvailable()){
			this.varHudRefresh()
		}
	};

	Game_Interpreter.prototype.textVarTurnOn = function(key) {
		if (!this.isHudCreated()){
			$gameVariables._data[dVariableNumber] = {};
		}
		var args = arguments;
		$gameVariables._data[dVariableNumber][String(key)].visible = true;
		if (this.isRefreshAvailable()){
			this.varHudRefresh()
		}
	};

	Game_Interpreter.prototype.textVarTurnOff = function(key) {
		if (!this.isHudCreated()){
			$gameVariables._data[dVariableNumber] = {};
		}
		var args = arguments;
		$gameVariables._data[dVariableNumber][String(key)].visible = false;
		if (this.isRefreshAvailable()){
			this.varHudRefresh()
		}
	};

	Game_Interpreter.prototype.textVarSetXY = function(key, valueX, valueY) {
		if (!this.isHudCreated()){
			$gameVariables._data[dVariableNumber] = {};
		}
		var valueX = Number(valueX) || 0;
		var valueY = Number(valueY) || 0;
		$gameVariables._data[dVariableNumber][String(key)].x = valueX;
		$gameVariables._data[dVariableNumber][String(key)].y = valueY;
		if (this.isRefreshAvailable()){
			this.varHudRefresh()
		}
	};

	Game_Interpreter.prototype.textVarGetX = function(key) {
		if (!this.isHudCreated()){
			$gameVariables._data[dVariableNumber] = {};
		}
		return $gameVariables._data[dVariableNumber][String(key)].x;
	};

	Game_Interpreter.prototype.textVarGetY = function(key) {
		if (!this.isHudCreated()){
			$gameVariables._data[dVariableNumber] = {};
		}
		return $gameVariables._data[dVariableNumber][String(key)].y;
	};
	
	Game_Interpreter.prototype.changeVarText = function(key, textValue) {
		if (!this.isHudCreated()){
			$gameVariables._data[dVariableNumber] = {};
		}
		$gameVariables._data[dVariableNumber][String(key)].hudText = textValue;
		if (this.isRefreshAvailable()){
			this.varHudRefresh()
		}
	};

	Game_Interpreter.prototype.showAllVarText = function() {
		if (!this.isHudCreated()){
			$gameVariables._data[dVariableNumber] = {};
		}
		for(var key in $gameVariables._data[dVariableNumber]){
			var hudObj = $gameVariables._data[dVariableNumber][key];
			hudObj.visible = true;
		}
		if (this.isRefreshAvailable()){
			this.varHudRefresh()
		}
	};

	Game_Interpreter.prototype.hideAllVarText = function() {
		if (!this.isHudCreated()){
			$gameVariables._data[dVariableNumber] = {};
		}
		for(var key in $gameVariables._data[dVariableNumber]){
			var hudObj = $gameVariables._data[dVariableNumber][key];
			hudObj.visible = false;
		}
		if (this.isRefreshAvailable()){
			this.varHudRefresh()
		}
	};
	
	Game_Interpreter.prototype.hideVarWindow = function() {
		if (!this.isHudCreated()){
			$gameVariables._data[dVariableNumber] = {};
		}
		if (typeof SceneManager._scene._variableWindow != "undefined"){
			SceneManager._scene._variableWindow.hide();
		}
	};
	
	Game_Interpreter.prototype.showVarWindow = function() {
		if (!this.isHudCreated()){
			$gameVariables._data[dVariableNumber] = {};
		}
		if (typeof SceneManager._scene._variableWindow != "undefined"){
			SceneManager._scene._variableWindow.show();
		}
	};
	
	Game_Interpreter.prototype.deleteVar = function(key) {
		if (!this.isHudCreated()){
			$gameVariables._data[dVariableNumber] = {};
		}
		delete $gameVariables._data[dVariableNumber][String(key)]
	};
	
	Game_Interpreter.prototype.varHudRefresh = function() {
		if (!this.isHudCreated()){
			$gameVariables._data[dVariableNumber] = {};
		}
		SceneManager._scene.refreshVarWindow()
	};	
	/*=============== Game_Interpreter end ===============*/
	
	Scene_Base.prototype.createVarLayer = function() {
		var width = Graphics.boxWidth;
		var height = Graphics.boxHeight;
		var x = (Graphics.width - width) / 2;
		var y = (Graphics.height - height) / 2;
		this._varLayer = new WindowLayer();
		this._varLayer.move(x, y, width, height);
		this.addChild(this._varLayer);
	};
	
	/*=============== Scene_Map ===============*/
	DVarHud_Scene_Map_initialize = Scene_Map.prototype.initialize;
	Scene_Map.prototype.initialize = function() {
		DVarHud_Scene_Map_initialize.call(this);
		this._varWindowAutoRefresh = dAtoRefresh;
	};

	
	Scene_Map.prototype.createDisplayObjects = function() {
		this.createSpriteset();
		this.createMapNameWindow();
		this.createVarLayer();
		this.createWindowLayer();
		this.createAllWindows();
	};
	
	DVarHud_Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
	Scene_Map.prototype.createAllWindows = function() {
		this.createVariableWindow();
		DVarHud_Scene_Map_createAllWindows.call(this);
	};

	Scene_Map.prototype.createVariableWindow = function() {
		this._variableWindow = new Window_Variable();
		this._variableWindow.setBackgroundType(2)
		this._varLayer.addChild(this._variableWindow);
	};

	Scene_Map.prototype.refreshVarWindow = function() {
		if (typeof this._variableWindow != "undefined"){
			this._variableWindow.refresh();
		}	
	};

	DVarHud_Scene_Map_update = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function() {
		DVarHud_Scene_Map_update.call(this);
		if (this._varWindowAutoRefresh == true){
			this._variableWindow.refresh();
		}
	};
	
	DVarHud_Scene_Map_terminate = Scene_Map.prototype.terminate;
	Scene_Map.prototype.terminate = function() {
    DVarHud_Scene_Map_terminate.call(this);
    this.removeChild(this._varLayer);
	};
	/*=============== Scene_Map end ===============*/
	
	DVarHud_DataManager_setupNewGame = DataManager.setupNewGame
	DataManager.setupNewGame = function() {
		DVarHud_DataManager_setupNewGame.call(this);
		$gameVariables._data[dVariableNumber] = {};
	};
	
	allHudKeys_Debug = function() {
		if (typeof $gameVariables._data[dVariableNumber] !== "object"){
			return 'Худ еще не создан'
		}
		var allKeys = []
		for(var key in $gameVariables._data[dVariableNumber]){
			allKeys.push(key);
		}
		console.log(allKeys)
	};
})();