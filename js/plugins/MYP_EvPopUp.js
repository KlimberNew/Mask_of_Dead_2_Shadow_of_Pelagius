/*:
 * @plugindesc Всплывающие цифры над событиями [MZ]
 * @author Pheonix KageDesu
 * @target MZ
 *
 * @help
 *
 * См. команды плагина
 * 
 * Вызов скрипта: (альтернативный вариант)
 * AddEvPop(EV_ID, VAR_ID) - создать всплывающее сообщение над событием
 *      EV_ID = номер события
 *      VAR_ID = номер переменной - значение
 * 
 * Пример: AddEvPop(1, 100);
 * 
 * AddEvPop(EV_ID, VAR_ID, COLOR) - сообщение с заданным текстом
 *      COLOR - цвет в hex (16) формате в кавычках
 * 
 * Пример: AddEvPop(1, 100, "FF0000");
 * 
 * Для работы с массивом
 * AddEvPopA(EV_ID, VAR_ID, INDEX, COLOR) - Всё тоже самое, только
 *  добавляется индекс массива INDEX
 * 
 * Пример: AddEvPopA(1, 100, 0, "FF0000")
 * 
 * 
 * @param PopUpStyle:struct
 * @type struct<PopUpStyleStruct>
 * @text Стиль
 * @desc Настройки стиля
 * 
@param stayTime:int
@text Время перед исчезновением
@type number
@min 1
@max 1000
@default 16
@desc Чем больше значение, тем дольше на экране остаётся



@command AddEvPop
@text Add Event PopUp 
@desc Показать всплывающее сообщение над событием

@arg evId
@text Номер события
@type number
@min 1
@default 1

@arg varId
@text Переменная
@type variable
@default 1

@arg colorHex
@text Цвет текста
@default #FFFFFF
@desc В HEX формате #000000

@arg index
@text [Индекс]
@desc Если переменная массив, то индекс, иначе -1 (просто переменная)
@default -1
@type number
@min -1

 */

/*~struct~PopUpStyleStruct:
@param fontName
@text Шрифт
@default Arial

@param startZoom:int
@text Начальный размер шрифта
@type number
@min 1
@max 100
@default 28

@param fontSize:int
@text Конечный размер шрифта
@type number
@min 1
@max 100
@default 24
@desc

@param italy:b
@text Курсив?
@type boolen
@default false

@param fontOutline:int
@text Ширина обводки
@type number
@min 1
@max 10
@default 3

@param outlineColor
@text Цвет обводки
@default #000000
@desc В HEX формате #000000

 */

(function(){

var MYP_EPU = {};

// * ЭТИ ЗНАЧЕНИЯ МОЖНО ПОМЕНЯТЬ
// * ==========================================================

MYP_EPU.STYLE = { // * СТИЛЬ ТЕКСТА
    fontName: "Arial",
    fontSize: 24,
    italy: false,
    fontOutline: 3,
    outlineColor: "#000000",
    startZoom: 28
};

MYP_EPU.STAY_TIME = 3; // * ВРЕМЯ ПЕРЕД ИСЧЕЗНОВЕНИЕМ (больше - дольше)

window.MYP_EPU = MYP_EPU;

// * ==========================================================
// * КОНЕЦ



(function(){
    
    if(Utils.RPGMAKER_NAME.contains("MV"))  return;

    PluginManager.registerCommand("MYP_EvPopUp", 'AddEvPop', args => {
            try {
                let evId = parseInt(args.evId);
                let varId = parseInt(args.varId);
                let colorHex = args.colorHex;
                let index = parseInt(args.index);
                if(index < 0)
                    window.AddEvPop(evId, varId, colorHex);
                else {
                    window.AddEvPopA(evId, varId, index, colorHex);
                }
            } catch (e) {
                console.warn(e);
            }
        });

})();

    


// * ================= MAIN MODULE =========================

(function(){
    MYP_EPU.printError = function (error, message) {
        if (message)
            console.warn('MYP_EvPopUp.js: ' + message);
        console.error(error);
    };

    MYP_EPU.getScene = function () {
        return SceneManager._scene;
    };

    MYP_EPU.getLayer = function () {
        return MYP_EPU.getScene()._spriteset._mypPopUpLayer;
    };

    MYP_EPU.init = function () {
        this._machines = [];
    };

    MYP_EPU.push = function (id, value, colorHex) {
        try {
            if (this._machines[id] == null) {
                MYP_EPU.addMachine(id);
            }
            var item = new MYP_EPU.Sprite_PopText();
            var tColor = KDCore.Color.WHITE;
            if (colorHex)
                tColor = KDCore.Color.FromHex(colorHex);
            var style = MYP_EPU.STYLE;
            item.setFontSettings(style);
            item.setEffectSettings(style);
            item.setText(value.toString(), tColor);
            item.create();
            this._machines[id].push(item);
			if (id==0) {var ev = $gamePlayer}
            else {var ev = $gameMap.event(id)}
            this._machines[id].move(ev.x * 48, (ev.y - 1) * 48);
        } catch (error) {
            MYP_EPU.printError(error, ' while add damage');
        }
    };

    MYP_EPU.addMachine = function (id) {
        if (this._machines[id] != null)
            MYP_EPU.clear(id);
        this._machines[id] = new MYP_EPU.Sprite_PopMachine();
        MYP_EPU.getLayer().addChild(this._machines[id]);
    };

    MYP_EPU.clearAll = function () {
        if (this._machines) {
            this._machines.forEach(function (item, index) {
                MYP_EPU.clear(index);
            });
        }
        MYP_EPU.init();
    };

    MYP_EPU.clear = function (id) {
        if (this._machines[id] == null)
            return;
        var machine = this._machines[id];
        if (machine.parent != null)
            machine.parent.removeChild(machine);
        this._machines[id] = null;
    };

})();

//@[ALIAS]
var _alias_Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function () {
    _alias_Scene_Map_onMapLoaded.call(this);
    MYP_EPU.clearAll();
};

// * ================= SPRITESET_MAP ========================

(function(){
    
    //@[ALIAS]
    var _alias_Spriteset_Map_createPictures = Spriteset_Map.prototype.createPictures;
    Spriteset_Map.prototype.createPictures = function () {
        _alias_Spriteset_Map_createPictures.call(this);
        this._mypPopUpLayer = new Sprite();
        this.___tw = $gameMap.tileWidth();
        this.___tw2 = this.___tw / 2;
        this.___th = $gameMap.tileHeight();
        this.addChild(this._mypPopUpLayer);
    };

    //@[ALIAS]
    var _alias_Spriteset_Map_updateTilemap = Spriteset_Map.prototype.updateTilemap;
    Spriteset_Map.prototype.updateTilemap = function () {
        _alias_Spriteset_Map_updateTilemap.call(this);
        var screenX = Math.round($gameMap.adjustX(0) * this.___tw + this.___tw2);
        var screenY = Math.round($gameMap.adjustY(-0.4) * this.___th + this.___th);
        this._mypPopUpLayer.move(screenX, screenY);
    };

})();

// * =================== POP UP SYSTEM ======================

(function(){
    (function () {
        // Generated by CoffeeScript 2.3.1
        var PopMachineModeEnum, Sprite_PopMachine;

        PopMachineModeEnum = {
            NONE: 0,
            TOP: 1,
            DOWN: 2,
            LEFT: 3,
            RIGHT: 4,
            CIRCLE: 5
        };

        Object.freeze(PopMachineModeEnum);

        MYP_EPU.PopMachineModeEnum = PopMachineModeEnum;

        Sprite_PopMachine = class Sprite_PopMachine extends Sprite {
            constructor() {
                super();
                this._items = [];
                this._mode = PopMachineModeEnum.TOP;
            }

            setMode(mode) {
                return this._mode = mode;
            }

            push(item) {
                this._items.push(item);
                this.addChild(item);
                return this.refresh();
            }

            refresh() {
                if (this._mode === PopMachineModeEnum.NONE) {
                    this._refreshNoneMode();
                    return;
                }
                if (this._mode === PopMachineModeEnum.CIRCLE) {
                    this._refreshCircleMode();
                    return;
                }
                this._refreshMode();
            }

            _refreshNoneMode() {
                if (this._items.length > 1) {
                    this._clearItem(this._items[0]);
                    return this._clearDisposed();
                }
            }

            _clearItem(item) {
                if (item == null) {
                    return;
                }
                return item.dispose();
            }

            _clearDisposed() {
                var i, j, ref;
                for (i = j = 0, ref = this._items.length;
                    (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
                    if (this._items[i].isDisposed()) {
                        this._items[i] = null;
                    }
                }
                return this._items.delete(null);
            }

            _refreshCircleMode() {}

            _refreshMode() {
                var _position, i, j, lastIndex, ref, results;
                if (this._items.length <= 1) {
                    return;
                }
                lastIndex = this._items.length - 1;
                results = [];
                for (i = j = ref = lastIndex;
                    (ref <= 0 ? j <= 0 : j >= 0); i = ref <= 0 ? ++j : --j) {
                    if (i === lastIndex) {
                        _position = {
                            x: 0,
                            y: 0
                        };
                    } else {
                        _position = this._calculatePosition(i);
                    }
                    results.push(this._items[i].move(_position.x, _position.y));
                }
                return results;
            }

            _calculatePosition(i) {
                var x, y;
                x = 0;
                y = 0;
                if (this._mode === PopMachineModeEnum.TOP) {
                    y = this._items[i + 1].y - this._items[i + 1].heightLine();
                }
                if (this._mode === PopMachineModeEnum.DOWN) {
                    y = this._items[i + 1].y + this._items[i + 1].heightLine();
                }
                if (this._mode === PopMachineModeEnum.LEFT) {
                    x = this._items[i + 1].x - this._items[i + 1].width * 2;
                }
                if (this._mode === PopMachineModeEnum.RIGHT) {
                    x = this._items[i + 1].x + this._items[i + 1].width * 2;
                }
                return {
                    x,
                    y
                };
            }

            clearAll() {
                var i, j, ref;
                for (i = j = 0, ref = this._items.length;
                    (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
                    this._clearItem(this._items[i]);
                }
                return this._items = [];
            }

        };

        MYP_EPU.Sprite_PopMachine = Sprite_PopMachine;

        // Generated by CoffeeScript 2.3.1
        var DEFAULT_EFFECT, DEFAULT_FONT, MAX_TICK, Sprite_PopText;

        DEFAULT_FONT = function () {
            return {
                fontName: "Arial",
                fontSize: 30,
                italy: false,
                fontOutline: 3,
                outlineColor: "#FFFFFF"
            };
        };

        DEFAULT_EFFECT = function () {
            return {
                startZoom: 1,
                zoomSpeed: 0,
                random: false
            };
        };

        MAX_TICK = MYP_EPU.STAY_TIME;

        Sprite_PopText = class Sprite_PopText extends Sprite {
            constructor() {
                super();
                this._fontSettings = DEFAULT_FONT();
                this._effectSettings = DEFAULT_EFFECT();
                this._disposed = false;
                this._init();
                this._tick = 0;
                this._zoomSpeed = null;
                this._zoomTimer = 0;
            }

            _init() {
                return this.bitmap = new Bitmap(50, 50);
            }

            setFontSettings(fontSettings) {
                if (fontSettings == null) {
                    return;
                }
                if (fontSettings.fontName != null) {
                    this._fontSettings.fontName = fontSettings.fontName;
                }
                if (fontSettings.fontSize != null) {
                    this._fontSettings.fontSize = fontSettings.fontSize;
                }
                if (fontSettings.italy != null) {
                    this._fontSettings.italy = fontSettings.italy;
                }
                if (fontSettings.fontOutline != null) {
                    this._fontSettings.fontOutline = fontSettings.fontOutline;
                }
                if (fontSettings.outlineColor != null) {
                    this._fontSettings.outlineColor = KDCore.Color.FromHex(fontSettings.outlineColor);
                }
            }

            setEffectSettings(effectSettings) {
                if (effectSettings == null) {
                    return;
                }
                if (effectSettings.startZoom != null) {
                    this._effectSettings.startZoom = effectSettings.startZoom;
                }
                if (effectSettings.random != null) {
                    this._effectSettings.random = effectSettings.random;
                }
                this._effectSettings.zoomSpeed = 1;
            }

            setText(text, color) {
                this.text = text;
                if (color != null) {
                    return this.tColor = color;
                }
            }

            //setIcon: (iconIndex) ->
            create() {
                var w;
                this.bitmap.fontSize = this._fontSettings.fontSize;
                w = this.bitmap.measureTextWidth(this.text);
                this.textSprite = new Sprite(new Bitmap(w * 2, this._fontSettings.fontSize + 8));
                this.textSprite.bitmap.addLoadListener(this._drawText.bind(this));
                this.textSprite.anchor.x = 0.5;
                this.textSprite.anchor.y = 0.5;
                this.addChild(this.textSprite);
                return this._startTimer();
            }

            heightLine() {
                if (this.textSprite)
                    return this.textSprite.height;
                return this.height;
            }

            _drawText() {
                this._applySettings(this.textSprite.bitmap);
                this._applyEffect();
                if (this.tColor != null) {
                    //@textSprite.bitmap.fillAll(KDCore.Color.WHITE)
                    this.textSprite.bitmap.textColor = this.tColor.CSS;
                }
                this._drawTextLine();
            }

            _drawTextLine() {
                this.textSprite.bitmap.clear();
                var text = this.text;
                if (this._effectSettings.random == true && this._numberLength > 0) {
                    text = (1 + Math.randomInt(Math.pow(10, this._numberLength)));
                }
                this.textSprite.bitmap.drawText(text, 0, this.textSprite.bitmap.height / 2, this.textSprite.bitmap.width, 1, 'center');
            }

            _applySettings(bitmap) {
                bitmap.fontFace = this._fontSettings.fontName;
                bitmap.fontSize = this._fontSettings.fontSize;
                bitmap.fontItalic = this._fontSettings.italy;
                bitmap.outlineColor = this._fontSettings.outlineColor.CSS;
                bitmap.outlineWidth = this._fontSettings.fontOutline;
            }

            _applyEffect() {
                this._zoomSpeed = 1;
                if (this._effectSettings.random == true) {
                    this._numberLength = this.text.length;
                    this._numberTimer = 20;
                    this._numberFlag = 0;
                } else {
                    this._numberLength = null;
                }
            }

            _startTimer() {
                var timer = function () {
                    this._updateTimer();
                    if (this._disposed === false) {
                        return setTimeout(timer.bind(this), 60);
                    }
                }
                return setTimeout(timer.bind(this), 60);
            }

            _updateTimer() {
                if (this.textSprite == null) {
                    return;
                }
                if (this.parent == null) {
                    return;
                }
                //"TIMER".p();
                return this._updateOpacity();
            }

            _updateOpacity() {
                if (this._zoomSpeed != null) {
                    return;
                }
                if (this._tick <= MAX_TICK) {
                    return this._tick++;
                } else {
                    this.opacity -= 25;
                    this.move(this.x, this.y - 1);
                    if (this.opacity <= 0) {
                        return this.dispose();
                    }
                }
            }

            dispose() {
                var ref;
                //"DISPOSED".p();
                this._disposed = true;
                this.textSprite = null;
                return (ref = this.parent) != null ? ref.removeChild(this) : void 0;
            }

            update() {
                super.update();
                return this._updateZoom();
            }

            _updateZoom() {
                if (this._zoomSpeed != null) {
                    this._zoomTimer += 1;
                    if (this._zoomTimer == this._zoomSpeed) {
                        if (this.textSprite.bitmap.fontSize < this._effectSettings.startZoom) {
                            this.textSprite.bitmap.fontSize = this.textSprite.bitmap.fontSize + 1;
                            this._zoomTimer = 0;
                            this._drawTextLine();
                        } else
                        if (this.textSprite.bitmap.fontSize > this._effectSettings.startZoom) {
                            this.textSprite.bitmap.fontSize = this.textSprite.bitmap.fontSize - 1;
                            this._zoomTimer = 0;
                            this._drawTextLine();
                        }
                        if (this.textSprite.bitmap.fontSize == this._effectSettings.startZoom) {
                            this._zoomSpeed = null;
                        }
                    }
                }
                if (this._effectSettings.random == false)
                    return;
                if (this._numberLength > 0) {
                    this._numberTimer--;
                    this._numberFlag++;
                    if (this._numberFlag == 3) {
                        this._drawTextLine();
                        this._numberFlag = 0;
                    }
                    if (this._numberTimer <= 0) {
                        this._numberLength = null;
                        this._drawTextLine();
                    }
                }
            }

            isDisposed() {
                return this._disposed === true;
            }

        };

        MYP_EPU.Sprite_PopText = Sprite_PopText;

    })();
})();
// Generated by CoffeeScript 2.5.1
//$[EN1CODE]
var KDCore;

window.AddEvPop = function(evId, varId, colorHex) {
  var value;
  if (!(SceneManager._scene instanceof Scene_Map)) {
    return;
  }
  value = $gameVariables.value(varId);
  return MYP_EPU.push(evId, value, colorHex);
};

window.AddEvPopA = function(evId, varId, index, colorHex) {
  var value;
  if (!(SceneManager._scene instanceof Scene_Map)) {
    return;
  }
  value = $gameVariables.value(varId)[index];
  return MYP_EPU.push(evId, value, colorHex);
};

// * KDCORE ===========================================

//╒═════════════════════════════════════════════════════════════════════════╛
// ■ KDCore.coffee
//╒═════════════════════════════════════════════════════════════════════════╛
//---------------------------------------------------------------------------
//! MINI
KDCore = KDCore || {};

KDCore.Version = '1.2.2B MINI';

KDCore.LIBS = {};

KDCore.register = function(library) {
  return this.LIBS[library.name] = library;
};

(function() {
  var Color, SDK, __alias_Bitmap_fillAll;
  //Array Extension
  //------------------------------------------------------------------------------
  Array.prototype.delete = function() {
    var L, a, ax, what;
    what = void 0;
    a = arguments;
    L = a.length;
    ax = void 0;
    while (L && this.length) {
      what = a[--L];
      while ((ax = this.indexOf(what)) !== -1) {
        this.splice(ax, 1);
      }
    }
    return this;
  };
  Array.prototype.include = function(value) {
    return this.indexOf(value) !== -1;
  };
  //?[FOR 1.5.1]
  Array.prototype.includes = function(value) {
    return this.include(value);
  };
  Array.prototype.max = function() {
    return Math.max.apply(null, this);
  };
  Array.prototype.min = function() {
    return Math.min.apply(null, this);
  };
  Array.prototype.sample = function() {
    if (this.length === 0) {
      return [];
    }
    return this[SDK.rand(0, this.length - 1)];
  };
  Array.prototype.first = function() {
    return this[0];
  };
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
  Array.prototype.shuffle = function() {
    var k, n, v;
    n = this.length;
    while (n > 1) {
      n--;
      k = SDK.rand(0, n + 1);
      v = this[k];
      this[k] = this[n];
      this[n] = v;
    }
  };
  Array.prototype.count = function() {
    return this.length;
  };
  //Number Extension
  //------------------------------------------------------------------------------
  Number.prototype.do = function(method) {
    return SDK.times(this, method);
  };
  Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
  };
  //Sprite Extension
  //------------------------------------------------------------------------------
  Sprite.prototype.moveToCenter = function(dx, dy) {
    dx = SDK.check(dx, 0);
    dy = SDK.check(dy, 0);
    return this.move(-this.bitmap.width / 2 + dx, -this.bitmap.height / 2 + dy);
  };
  Sprite.prototype.setStaticAnchor = function(floatX, floatY) {
    this.x -= Math.round(this.width * floatX);
    this.y -= Math.round(this.height * floatY);
  };
  Sprite.prototype.moveToParentCenter = function() {
    if (!this.parent) {
      return;
    }
    return this.move(this.parent.width / 2, this.parent.height / 2);
  };
  //Bitmap Extension
  //------------------------------------------------------------------------------
  __alias_Bitmap_fillAll = Bitmap.prototype.fillAll;
  Bitmap.prototype.fillAll = function(color) {
    if (color instanceof KDCore.Color) {
      return this.fillRect(0, 0, this.width, this.height, color.CSS);
    } else {
      return __alias_Bitmap_fillAll.call(this, color);
    }
  };
  Bitmap.prototype.drawIcon = function(x, y, icon, size) {
    var bitmap;
    size = SDK.check(size, 32);
    bitmap = null;
    if (icon instanceof Bitmap) {
      bitmap = icon;
    } else {
      bitmap = BitmapSrc.LoadFromIconIndex(icon).bitmap;
    }
    return this.drawOnMe(bitmap, x, y, size, size);
  };
  Bitmap.prototype.drawOnMe = function(bitmap, x, y, sw, sh) {
    x = SDK.check(x, 0);
    y = SDK.check(y, 0);
    sw = SDK.check(sw, 0);
    sh = SDK.check(sh, 0);
    if (sw <= 0) {
      sw = bitmap.width;
    }
    if (sh <= 0) {
      sh = bitmap.height;
    }
    this.blt(bitmap, 0, 0, bitmap.width, bitmap.height, x, y, sw, sh);
  };
  Bitmap.prototype.drawTextFull = function(text, position) {
    position = SDK.check(position, 'center');
    return this.drawText(text, 0, 0, this.width, this.height, position);
  };
  //String Extenstion
  //------------------------------------------------------------------------------
  String.prototype.replaceAll = function(search, replacement) {
    var target;
    target = this;
    return target.split(search).join(replacement);
  };
  // * ParametersManager
  //------------------------------------------------------------------------------
  PluginManager.getPluginParametersByRoot = function(rootName) {
    var pluginParameters, property;
    for (property in this._parameters) {
      if (this._parameters.hasOwnProperty(property)) {
        pluginParameters = this._parameters[property];
        if (PluginManager.isPluginParametersContentKey(pluginParameters, rootName)) {
          return pluginParameters;
        }
      }
    }
    return PluginManager.parameters(rootName);
  };
  PluginManager.isPluginParametersContentKey = function(pluginParameters, key) {
    return pluginParameters[key] != null;
  };
  //SDK
  //------------------------------------------------------------------------------
  SDK = function() {
    throw new Error('This is a static class');
  };
  SDK.rand = function(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
  };
  SDK.setConstantToObject = function(object, constantName, constantValue) {
    object[constantName] = constantValue;
    if (typeof object[constantName] === 'object') {
      Object.freeze(object[constantName]);
    }
    Object.defineProperty(object, constantName, {
      writable: false
    });
  };
  SDK.convertBitmapToBase64Data = function(bitmap) {
    return bitmap._canvas.toDataURL('image/png');
  };
  SDK.times = function(times, method) {
    var i, results;
    i = 0;
    results = [];
    while (i < times) {
      method(i);
      results.push(i++);
    }
    return results;
  };
  SDK.toGlobalCoord = function(layer, coordSymbol) {
    var node, t;
    coordSymbol = SDK.check(coordSymbol, 'x');
    t = layer[coordSymbol];
    node = layer;
    while (node) {
      t -= node[coordSymbol];
      node = node.parent;
    }
    return (t * -1) + layer[coordSymbol];
  };
  SDK.isInt = function(n) {
    return Number(n) === n && n % 1 === 0;
  };
  SDK.isFloat = function(n) {
    return Number(n) === n && n % 1 !== 0;
  };
  SDK.check = function(value, defaultValue) {
    if (defaultValue === void 0 || defaultValue === null) {
      defaultValue = true;
    }
    if (value === void 0 || value === null) {
      return defaultValue;
    } else {
      return value;
    }
  };
  SDK.checkSwitch = function(switchValue) {
    if (switchValue === 'A' || switchValue === 'B' || switchValue === 'C' || switchValue === 'D') {
      return true;
    }
    return false;
  };
  SDK.toNumber = function(string, none = 0) {
    var number;
    if (string == null) {
      return none;
    }
    number = Number(string);
    if (isNaN(number)) {
      return none;
    }
    return number;
  };
  //For compability with PLATFORM
  SDK.setConstant = function(object, name, value) {
    return SDK.setConstantToObject(object, name, value);
  };
  //Color
  //------------------------------------------------------------------------------
  Color = class Color {
    constructor(r1, g1, b1, a1) {
      this.r = r1;
      this.g = g1;
      this.b = b1;
      this.a = a1;
      this.r = SDK.check(this.r, 255);
      this.g = SDK.check(this.g, 255);
      this.b = SDK.check(this.b, 255);
      this.a = SDK.check(this.a, 255);
    }

    getLightestColor(lightLevel) {
      var bf, newColor, p;
      bf = 0.3 * this.R + 0.59 * this.G + 0.11 * this.B;
      p = 0;
      newColor = [0, 0, 0, 0];
      if (bf - lightLevel >= 0) {
        if (bf >= 0) {
          p = Math.abs(bf - lightLevel) / lightLevel;
        }
        newColor = this.ARR.map(function(c) {
          return c - (p * c);
        });
      } else {
        if (bf >= 0) {
          p = (lightLevel - bf) / (255 - bf);
        }
        newColor = this.ARR.map(function(c) {
          return [(255 - c) * p + c, 255].min();
        });
      }
      return new Color(newColor[0], newColor[1], newColor[2], newColor[3]);
    }

    clone() {
      return this.reAlpha(this.a);
    }

    reAlpha(newAlpha) {
      return new Color(this.r, this.g, this.b, newAlpha || 255);
    }

    static AddConstantColor(name, color) {
      color.toHex();
      color.toArray();
      color.toCSS();
      SDK.setConstantToObject(Color, name, color);
    }

    toHex() {
      var b, g, r;
      if (this._colorHex != null) {
        return this._colorHex;
      }
      r = Math.floor(this.r).toString(16).padZero(2);
      g = Math.floor(this.g).toString(16).padZero(2);
      b = Math.floor(this.b).toString(16).padZero(2);
      return this._colorHex = '#' + r + g + b;
    }

    toArray() {
      if (this._colorArray != null) {
        return this._colorArray;
      }
      return this._colorArray = [this.r, this.g, this.b, this.a];
    }

    toCSS() {
      var na, nb, ng, nr;
      if (this._colorCss != null) {
        return this._colorCss;
      }
      nr = Math.round(this.r);
      ng = Math.round(this.g);
      nb = Math.round(this.b);
      na = this.a / 255;
      return this._colorCss = `rgba(${nr},${ng},${nb},${na})`;
    }

    toNumber() {
      return Number(this.toHex().replace("#", "0x"));
    }

    static Random() {
      var a, b, c;
      a = SDK.rand(1, 254);
      b = SDK.rand(1, 254);
      c = SDK.rand(1, 254);
      return new Color(a, b, c, 255);
    }

    static FromHex(hexString) {
      var color, result;
      result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexString);
      color = null;
      if (result != null) {
        color = {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        };
      }
      if (color != null) {
        return new Color(color.r, color.g, color.b, 255);
      } else {
        return Color.NONE;
      }
    }

  };
  Object.defineProperties(Color.prototype, {
    R: {
      get: function() {
        return this.r;
      },
      configurable: true
    },
    G: {
      get: function() {
        return this.g;
      },
      configurable: true
    },
    B: {
      get: function() {
        return this.b;
      },
      configurable: true
    },
    A: {
      get: function() {
        return this.a;
      },
      configurable: true
    },
    ARR: {
      get: function() {
        return this.toArray();
      },
      configurable: true
    },
    CSS: {
      get: function() {
        return this.toCSS();
      },
      configurable: true
    },
    HEX: {
      get: function() {
        return this.toHex();
      },
      configurable: true
    },
    OX: {
      get: function() {
        return this.toNumber();
      },
      configurable: true
    }
  });
  Color.AddConstantColor('NONE', new Color(0, 0, 0, 0));
  Color.AddConstantColor('BLACK', new Color(0, 0, 0, 255));
  Color.AddConstantColor('WHITE', new Color(255, 255, 255, 255));
  Color.AddConstantColor('RED', new Color(255, 0, 0, 255));
  Color.AddConstantColor('GREEN', new Color(0, 255, 0, 255));
  Color.AddConstantColor('BLUE', new Color(0, 0, 255, 255));
  Color.AddConstantColor('AQUA', new Color(128, 255, 255, 255));
  Color.AddConstantColor('MAGENTA', new Color(128, 0, 128, 255));
  Color.AddConstantColor('YELLOW', new Color(255, 255, 0, 255));
  Color.AddConstantColor('ORANGE', new Color(255, 128, 0, 255));
  //EXTENSION TO GLOBAL
  //------------------------------------------------------------------------------
  KDCore.SDK = SDK;
  KDCore.Color = Color;
  //@[AUTO EXTEND]
  return KDCore.ParamLoader = class ParamLoader {
    constructor(pluginName) {
      this.pluginName = pluginName;
      this.paramsRaw = PluginManager.getPluginParametersByRoot(this.pluginName);
      this.params = this.parseParameters(this.paramsRaw);
    }

    parseParameters(paramSet) {
      var clearKey, key, params, typeKey, value;
      params = {};
      for (key in paramSet) {
        value = paramSet[key];
        clearKey = this.parseKey(key);
        typeKey = this.parseKeyType(key);
        params[clearKey] = this.parseParamItem(typeKey, value);
      }
      return params;
    }

    parseKey(keyRaw) {
      return keyRaw.split(":")[0];
    }

    parseKeyType(keyRaw) {
      return keyRaw.split(":")[1];
    }

    // * Проверка, загружены ли параметры плагина
    isLoaded() {
      return (this.paramsRaw != null) && this.paramsRaw.hasOwnProperty(this.pluginName);
    }

    // * Имя параметра без ключа
    isHasParameter(paramName) {
      return this.params[paramName] != null;
    }

    
      // * Возвращает значение параметра (def - по умолчанию, если не найден)
    getParam(paramName, def) {
      if (this.isHasParameter(paramName)) {
        return this.params[paramName];
      } else {
        return def;
      }
    }

    // * Данные ключи должны идти после названия параметра через :
    // * Пример: @param ShowDelay:int, @param TestBool:bool
    // * Текстовые параметры, которые надо вернуть как есть, можно без типа (text, file, combo, ...)
    parseParamItem(type, item) {
      var e;
      if (type == null) {
        return item;
      }
      try {
        switch (type) {
          case "int":
          case "i":
            return parseInt(item);
          case "intA": // * массив чисел
            if (String.any(item)) {
              return JsonEx.parse(item).map((e) => {
                return this.parseParamItem("int", e);
              });
            } else {
              return [];
            }
            break;
          case "bool":
          case "b":
          case "e":
            return eval(item);
          case "struct":
          case "s":
            if (String.any(item)) {
              return this.parseParameters(JsonEx.parse(item));
            } else {
              return null;
            }
            break;
          case "structA": // * массив структур
            return JsonEx.parse(item).map((e) => {
              return this.parseParameters(JsonEx.parse(e));
            });
          case "str":
            return item;
          case "strA":
            if (String.any(item)) {
              return JsonEx.parse(item).map((e) => {
                return this.parseParamItem("str", e);
              });
            } else {
              return [];
            }
            break;
          case "note": // * если несколько строк в тексте
            return JsonEx.parse(item);
          case "css":
            return item.toCss();
          case "color":
            return KDCore.Color.FromHex(item);
          default:
            return item;
        }
      } catch (error) {
        e = error;
        console.warn(e);
        return item;
      }
    }

  };
})();

// ■ END KDCore.coffee
//---------------------------------------------------------------------------
String.prototype.isEmpty = function() {
  return this.length === 0 || !this.trim();
};

String.isNullOrEmpty = function(str) {
  return (str == null) || str.isEmpty();
};

String.any = function(str) {
  return !String.isNullOrEmpty(str);
};

MYP_EPU.PARAMS = new KDCore.ParamLoader("PopUpStyle:struct");

MYP_EPU.STYLE = MYP_EPU.PARAMS.getParam("PopUpStyle", MYP_EPU.STYLE);

MYP_EPU.STAY_TIME = MYP_EPU.PARAMS.getParam("stayTime", MYP_EPU.STAY_TIME);

})();
