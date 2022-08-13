//-----------------------------------------------------------------------------
// OcRam plugins - OcRam_Core.js        (will be embedded in all of my plugins)
//=============================================================================
/* DO NOT COPY, RESELL OR CLAIM ANY PIECE OF THIS SOFTWARE AS YOUR OWN!     *
 * Copyright(c) 2020, Marko Paakkunainen // mmp_81 (at) hotmail.com         */
"use strict"; var ShaderTilemap = ShaderTilemap || false; var Imported = Imported || {}; var Yanfly = Yanfly || {}; // In case there's no Yanfly plugins in use
if (!Imported.OcRam_Core) { // OcRam_Core has only the functionality which are used widely in all OcRam plugins...
    Game_Interpreter.prototype.event = function () { /* Get Game_Event in event editor like: this.event(); */ return ($gameMap) ? $gameMap.event(this._eventId) : null; };
    Game_Map.prototype.getEventsByName = function (event_name) { /* Get Game_Map events by name */ return this._events.filter(function (ev) { return ev.event().name == event_name; }); };
    Game_Event.prototype.getComments = function () { /* Returns all comments + commandIndex from Game_Event as Array */ if (this._erased || this._pageIndex < 0) return []; var comments = []; var i = 0; this.list().forEach(function (p) { if (p.code == 108) { p.commandIndex = i; comments.push(p); } i++; }); return comments; };
    Game_Event.prototype.getStringComments = function () { /* Returns all comments from Game_Event as String Array */ if (this._erased || this._pageIndex < 0) return []; var comments = []; this.list().filter(function (c) { return c.code == 108; }).forEach(function (p) { p.parameters.forEach(function (s) { comments.push(s); }); }); return comments; };
    ImageManager.loadOcRamBitmap = function (filename, hue) {  /* Load bitmap from ./img/ocram folder */ return this.loadBitmap('img/ocram/', filename, hue, false); };
    Imported.OcRam_Core = true; var OcRam_Core = OcRam_Core || function () { /* OcRam core class */ this.initialize.apply(this, arguments); };
    OcRam_Core.prototype.initialize = function () { /* Initialize OcRam core */ this.name = "OcRam_Core"; this.version = "1.05"; this.twh = [48, 48]; this.twh50 = [24, 24]; this.radian = Math.PI / 180; this._isIndoors = false; this._screenTWidth = Graphics.width / 48; this._screenTHeight = Graphics.height / 48; this.plugins = []; this._menuCalled = false; this.Scene_Map_callMenu = Scene_Map.prototype.callMenu; this.Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded; };
    OcRam_Core.prototype.debug = function () { /* Debug core? console.log("OcRam_Core", arguments); */ };
    OcRam_Core.prototype.getBoolean = function (s) { /* Get 'safe' boolean */ if (!s) return false; s = s.toString().toLowerCase(); return (s == "true" && s != "0") ? true : false; };
    OcRam_Core.prototype.getArray = function (a, b) { /* Get plugin param array */ return a ? eval(a) : b || []; };
    OcRam_Core.prototype.getFloat = function (n) { /* Get float */ return isNaN(n - parseFloat(n)) ? 0 : parseFloat(n); };
    OcRam_Core.prototype.regulateRGBG = function (obj) { /* Regulate RGBG value (used in tints) */ obj.Red = parseInt(obj.Red).clamp(-255, 255); obj.Green = parseInt(obj.Green).clamp(-255, 255); obj.Blue = parseInt(obj.Blue).clamp(-255, 255); obj.Gray = parseInt(obj.Gray).clamp(-255, 255); return obj; };
    OcRam_Core.prototype.regulateHexRGBA = function (p) { /* Regulate HEX RGBA value */ if (p.substr(0, 1) !== "#") p = "#" + p; if (p.length == 7) p = p + "ff"; return /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(p)[0] || "#ffffffff"; }
    OcRam_Core.prototype.getJSON = function (s) { /* Get 'safe' JSON */ try { return JSON.parse(s); } catch (ex) { return null; } };
    OcRam_Core.prototype.getJSONArray = function (a) { /* Get 'safe' JSON Array */ var tmp = []; if (a) { OcRam.getArray(a, []).forEach(function (s) { tmp.push(OcRam.getJSON(s)); }); } return tmp; };
    OcRam_Core.prototype.followers = function () { /* Only a shortcut to $gamePlayer._followers.visibleFollowers(); */ return $gamePlayer ? $gamePlayer._followers.visibleFollowers() : []; };
    OcRam_Core.prototype.setIndoorsFlag = function () { /* Set indoors flag - Each plugin will call this when needed */ if (DataManager.isEventTest()) return; if ($dataMap.meta["indoors"] !== undefined) { this.debug("Indoors meta tag found in MAP note field!", $dataMap.meta); this._isIndoors = true; } else { if ($dataTilesets[$dataMap.tilesetId].meta["indoors"] !== undefined) { this.debug("Indoors meta tag found in TILESET note field!", $dataTilesets[$dataMap.tilesetId].meta); this._isIndoors = true; } else { this.debug("Indoors meta tag was NOT found!", undefined); this._isIndoors = false; } } };
    OcRam_Core.prototype.isIndoors = function () { /* Get indoors flag */ return this._isIndoors; };
    OcRam_Core.prototype.runCE = function (pCE_Id) { /* Run common event */ if ($gameTemp.isCommonEventReserved()) { var tmpId = pCE_Id; var tc = this; setTimeout(function () { tc.runCE(tmpId); }, 17); } else { $gameTemp.reserveCommonEvent(pCE_Id); } };
    OcRam_Core.prototype.extendMethod = function (c, b, cb) { /* Extend/override any method */ c[b] = function () { return cb.apply(this, arguments); }; };
    OcRam_Core.prototype.extendProto = function (c, b, cb) { /* Extend/override any proto */ c.prototype[b] = function () { return cb.apply(this, arguments); }; };
    OcRam_Core.prototype.addPlugin = function (name, version) { /* Initialize new OcRam plugin */ this[name] = {}; var new_plugin = this[name]; Imported["OcRam_" + name] = true; this.plugins.push(name); this[name]._menuCalled = false; new_plugin.name = name; new_plugin.version = version; new_plugin.parameters = PluginManager.parameters("OcRam_" + new_plugin.name); if (this.getBoolean(new_plugin.parameters["Debug mode"])) { new_plugin.debug = function () { var args = [].slice.call(arguments); args.unshift("OcRam_" + new_plugin.name + " (v" + new_plugin.version + ")", ":"); console.log.apply(console, args); }; console.log("OcRam_" + new_plugin.name + " (v" + new_plugin.version + ")", "Debug mode:", "Enabled"); console.log("OcRam_" + new_plugin.name + " (v" + new_plugin.version + ")", "Parameters:", new_plugin.parameters); } else { new_plugin.debug = function () { }; } var oc = this; new_plugin.extend = function (c, b, cb) { var cb_name = c.name + "_" + b; if (c[b]) { this[cb_name] = c[b]; oc.extendMethod(c, b, cb); } else { this[cb_name] = c.prototype[b]; oc.extendProto(c, b, cb); } }; }; var OcRam = new OcRam_Core(); // Create new OcRam_Core! (Below aliases)
    Scene_Map.prototype.callMenu = function () { /* Menu called? */ OcRam.Scene_Map_callMenu.call(this); OcRam.debug("Menu called:", true); OcRam._menuCalled = true; OcRam.plugins.forEach(function (p) { OcRam[p]._menuCalled = true; }); };
    Scene_Map.prototype.onMapLoaded = function () { /* Set and get tile dimensions and indoors flag */ OcRam.Scene_Map_onMapLoaded.call(this); if (!OcRam._menuCalled) { OcRam.twh = [$gameMap.tileWidth(), $gameMap.tileHeight()]; OcRam.twh50 = [OcRam.twh[0] * 0.5, OcRam.twh[1] * 0.5]; OcRam._screenTWidth = Graphics.width / OcRam.twh[0]; OcRam._screenTHeight = Graphics.height / OcRam.twh[1]; OcRam.debug("Tile w/h:", OcRam.twh); OcRam.setIndoorsFlag(); OcRam.menuCalled = false; } };
    CanvasRenderingContext2D.prototype.line = function (x1, y1, x2, y2) { /* Draw line to canvas context */ this.beginPath(); this.moveTo(x1, y1); this.lineTo(x2, y2); this.stroke(); };
    Game_Map.prototype.adjustX_OC = function (x) { /* Optimized core adjustX */ if (this.isLoopHorizontal()) { if (x < this._displayX - (this.width() - this.screenTileX()) * 0.5) { return x - this._displayX + $dataMap.width; } else { return x - this._displayX; } } else { return x - this._displayX; } };
    Game_Map.prototype.adjustY_OC = function (y) { /* Optimized core adjustY */ if (this.isLoopVertical()) { if (y < this._displayY - (this.height() - this.screenTileY()) * 0.5) { return y - this._displayY + $dataMap.height; } else { return y - this._displayY; } } else { return y - this._displayY; } };
    Game_CharacterBase.prototype.screenX_OC = function () { /* Optimized core screenX */ return Math.round($gameMap.adjustX_OC(this._realX) * OcRam.twh[0] + OcRam.twh50[0]); };
    Game_CharacterBase.prototype.screenY_OC = function () { /* Optimized core screenY */ return Math.round($gameMap.adjustY_OC(this._realY) * OcRam.twh[1] + OcRam.twh50[0] - this.shiftY() - this.jumpHeight()); };
} if (parseFloat(OcRam.version) < 1.05) alert("OcRam core v1.05 is required!");

//-----------------------------------------------------------------------------
// OcRam plugins - OcRam_Passages.js
//=============================================================================

"use strict"; if (!Imported || !Imported.OcRam_Core) alert('OcRam_Core.js ' +
    'is required!'); OcRam.addPlugin("Passages", "4.12");

/*:
 * @plugindesc v4.12 Use region IDs to determine a character 'floor level'. Even autotiles can 
 * be drawn ABOVE characters. PLUGIN NAME MUST BE OcRam_Passages.js
 * @author OcRam
 *
 * @param Underpass Region ID
 * @type number
 * @desc Region ID for reducing character 'floor level' lower
 * @default 16
 *
 * @param Overpass Region ID
 * @type number
 * @desc Region ID for raising character 'floor level' higher. Also draws B-E tiles
 * @default 17
 *
 * @param Cover Region ID
 * @type number
 * @desc Region ID for "cover" such as bridges and other B-E tiles
 * @default 18
 *
 * @param Cover Autotile Region ID
 * @type number
 * @desc Region ID for "Autotile cover" such as cliffs, roofs and other A-tiles
 * @default 19
 *
 * @param Block Region ID
 * @type number
 * @desc Region ID to block movement from ALL floor levels
 * @default 20
 *
 * @param Overhead Region ID
 * @type number
 * @desc Region ID to block movement AND show tiles ABOVE character (if low ground)
 * @default 21
 *
 * @param Block High-Low Region ID
 * @type number
 * @desc Use to block movement from high <> low (must be next to underpass)
 * @default 22
 *
 * @param Use automatic floor levels
 * @type boolean
 * @desc 'true' Enable automatic floor level detection else disable function
 * @default true
 * 
 * @param Use tall sprites
 * @type boolean
 * @desc 'true' = player and followers have same floor level. 
 * 'false' = individual floor levels.
 * @default false
 *
 * @param Debug mode
 * @parent Other parameters
 * @type boolean
 * @desc Write some events to console log (F8 or F12).
 * @default false
 *
 * @help
 * ----------------------------------------------------------------------------
 * Introduction                                      (Embedded OcRam_Core v1.5)
 * ============================================================================
 * This plugin uses region ID to determine a character 'floor level'. Even
 * autotiles can be drawn ABOVE characters (events, player, followers etc).
 *
 * Character passage is also allowed based on floor level (collision tests).
 *
 * Events are signed to desired 'floor level' via event comments <lower> or
 * <higher>. Event comments are processed per event PAGE! Or use "floor_level"
 * plugin command. By default: event interaction is allowed only within same
 * floor level. <trigger_always> will change this.
 *
 * NOTE:  Use DEBUG mode ONLY if you need to debug something. It's logging
 *        quite big JS objects and often ...so it might slow things down.
 *
 * ----------------------------------------------------------------------------
 * Usage
 * ============================================================================
 * For example horizontal bridge paint following regions (with default ids)
 *
 * 16 = Underpassage point, 17 = Overpassage point, 18 = Bridge (cover tile)
 *
 *      [16] [16] [16]
 * [17] [18] [18] [18] [17]
 *      [16] [16] [16]
 *
 * Possible event comments: <higher>, <lower>, <trigger_always>
 *
 * ----------------------------------------------------------------------------
 * Plugin commands
 * ============================================================================
 * floor_level [eventId | -1 = player] [high | low | auto] (sets floor level)
 * Example: floor_level -1 low
 * 
 * ----------------------------------------------------------------------------
 * Terms of Use
 * ============================================================================
 * Edits are allowed as long as "Terms of Use" is not changed in any way.
 *
 * NON-COMMERCIAL USE: Free to use with credits to 'OcRam'
 *
 * If you gain money with your game by ANY MEANS (inc. ads, crypto-mining,
 * micro-transactions etc..) it's considered as COMMERCIAL use of this plugin!
 *
 * COMMERCIAL USE: (Standard license: 20 EUR, No-credits license: 60 EUR)
 * Payment via PayPal (https://paypal.me/MarkoPaakkunainen), please mention
 * PLUGIN NAME(S) you are buying / ALL plugins and your PROJECT NAME(S).
 *
 * Licenses are purchased per project and standard license requires credits.
 * If you want to buy several licenses: Every license purhased will give you
 * discount of 2 EUR for the next license purchase until minimum price of
 * 2 EUR / license. License discounts can be used to any of my plugins!
 * ALL of my plugins for 1 project = 40 EUR (standard licenses)
 *
 * https://forums.rpgmakerweb.com/index.php?threads/ocram-passages.88047
 *
 * DO NOT COPY, RESELL OR CLAIM ANY PIECE OF THIS SOFTWARE AS YOUR OWN!
 * Copyright (c) 2020, Marko Paakkunainen // mmp_81 (at) hotmail.com
 *
 * ----------------------------------------------------------------------------
 * Version History
 * ============================================================================
 * 2019/09/27 v4.00 - Initial release for v4.00
 * 2019/11/05 v4.01 - Doesn't render sprites that are off screen (culling)!
 *                    + tiles are FIXED (not sorted by Y cause they are static)
 *                    Thanks to: Espilonarge for reporting performance issue!
 * 2019/11/07 v4.02 - HOTFIX (note to myself: Don't update plugins when tired)
 * 2019/11/18 v4.03 - Cover tiles now works from big maps to small maps!
 * 2019/11/28 v4.04 - SRD_TitleMapBackground now works when exited back to 
 *                    title screen (also clears temporary 'garbage')
 * 2020/02/10 v4.05 - OcRam_Core v1.02 added + Game Over bug fixed
 *                    Fixed fallback from 'WebGL' mode to 'Canvas' mode
 *                    Credits to: Valiumator and NikkiKaji for reports
 *                    Credits to: Espilonarge for $twh50_OC bug report
 * 2020/03/14 v4.06 - OcRam core v1.04 (requirement for all of my plugins)
 *                    Now compatible with OcRam_Layers (v2.01)!
 *                    New plugin parameter "Use tall sprites" - But this alone
 *                    won't guarantee tall sprites to be 'glitchless' you also
 *                    need to design your maps for tall characters.
 * 2020/05/02 v4.07 - Tileset changes are now supported
 *                    (Credits to Msoulwing and Tad_Bolmont)
 *                    Canvas fallback bug fixed (Credits to Valgous)
 * 2020/06/12 v4.08 - Fixed bug where "Test event" crashed game - Requires
 *                    OcRam_Core v1.5 (Credits to jjraymonds)
 *                    
 *                    Fixed issue with YEP_SaveMenuCore (fixed by BurningOrca)
 *                    
 *                    Saves now follower ground level (if player is near cover
 *                    tiles and some followers are behind cover tiles)
 *                    
 *                    Fixed bug: Will now properly clear all cover tiles on
 *                    "Return to title" command and "Game over"
 *                    
 * 2020/06/16 v4.09 - Fixed bug with tileset changes
 * 2020/08/12 v4.10 - Fixed bug if there's less than 4 actors in game
 *                    (Credits to Usaku-chan)
 *                    Now compatible with GALV_Fishing (import before Passages)
 *                    (Credits to clitvin)
 * 2020/11/01 v4.11 - Fixed bug after save where plugin data wasn't cleared
 *                    as supposed to (Credits to Warpholomey)
 * 2021/03/07 v4.12 - character.autoAssign() -method added
 *                    Optimized $gameMap.checkPassage -function
 *                    (Credits to clitvin for both updates)
 */
/*
 * ----------------------------------------------------------------------------
 * RMMV CORE function overrides (destructive) are listed here
 * ============================================================================
 *     Game_Map.prototype.isMapPassable
 *     Game_Map.prototype.isPassable
 *     Game_Map.prototype.checkPassage
 *     Game_Player.prototype.startMapEvent
 *     Game_CharacterBase.prototype.isCollidedWithEvents
 *     Game_Event.prototype.isCollidedWithEvents
 *     Game_Vehicle.prototype.refreshBushDepth
 *     Tilemap.prototype._readMapData
 *     ImageManager.isReady
 */

Game_CharacterBase.prototype.check_event_sensor = function () { }; // Fix for MOG_EventSensor

// New class from Sprite_Character to make some adjustments... To reduce code base A LOT
function Sprite_Character_OC() {
    this.initialize.apply(this, arguments);
}

Sprite_Character_OC.prototype = Object.create(Sprite_Character.prototype);
Sprite_Character_OC.prototype.constructor = Sprite_Character_OC;

Sprite_Character_OC.prototype.initialize = function (character) {
    Sprite_Character.prototype.initialize.call(this, character);
};

var OC_Sprite_Character_OC_update = Sprite_Character_OC.prototype.update;
Sprite_Character_OC.prototype.update = function () {
    if (this._showHigherSprite) {
        this.visible = true; OC_Sprite_Character_OC_update.call(this);
    } else {
        if (this.visible) {
            this.visible = false; OC_Sprite_Character_OC_update.call(this);
        }
    }
};

Sprite_Character_OC.prototype.updatePosition = function () {
    this.x = this._character._realX * OcRam.twh[0] + OcRam.twh50[0];
    this.y = this._character._realY * OcRam.twh[1] + OcRam.twh[1] - this._character.jumpHeight();
    if (!this._character._isObjectCharacter) this.y -= 6;
    if (this._character._altitude) this.y -= this._character._altitude;
    this.z = this._character.screenZ();
};

// Fix for YEP_EventMiniLabels...
Sprite_Character_OC.prototype.updateMiniLabel = function () {};
Sprite_Character_OC.prototype.updateMiniLabelZoom = function () {};

// Used in OcRam_Time_System (preloader)...
ImageManager.loadTileset_OC = function (filename) {
    return this.loadBitmap('img/tilesets/', filename, 0, true);
};

(function () {

    // ------------------------------------------------------------------------------
    // Plugin variables and parameters
    // ==============================================================================

    var _underpassId = Number(this.parameters['Underpass Region ID'] || 16);
    var _overpassId = Number(this.parameters['Overpass Region ID'] || 17);
    var _coverId = Number(this.parameters['Cover Region ID'] || 18);
    var _autoCoverId = Number(this.parameters['Cover Autotile Region ID'] || 19);
    var _blockId = Number(this.parameters['Block Region ID'] || 20);
    var _overheadId = Number(this.parameters['Overhead Region ID'] || 21);
    var _blockHighLowId = Number(this.parameters['Block High-Low Region ID'] || 22);
    var _useAutoassign = OcRam.getBoolean(this.parameters['Use automatic floor levels']);
    var _useTallSprites = OcRam.getBoolean(this.parameters['Use tall sprites']);

    var _isAirshipLanded = true; // AirShip Sprite landed?
    var _flags = null; // Game_Map flags needs to be loaded only once...
    var _savedLayer = null; // Keep layers here for fast access
    var _currentShaderTilemap = null; // Used to get shadertilemap bitmaps
    var _cacheReady = false; // Check that cache is ready
    var _tileSprites = []; // Static tiles here (to avoid Y sorting)
    var _doCulling = false; // No need to cull small maps

    var _this = this; var _preventLayerSave = false;

    // ------------------------------------------------------------------------------
    // Plugin integrations to other plugins
    // ==============================================================================

    var _useTimeSystem = Imported.OcRam_Time_System && parseFloat(OcRam.Time_System.version) > 1.9;
    var _useSRD_CameraCore = false;
    _useSRD_CameraCore = (parseFloat(Imported["SumRndmDde Camera Core"]) > 0.1);

    if (_useSRD_CameraCore) {
        _useSRD_CameraCore = (parseFloat(Imported["SumRndmDde Camera Core"]) > 1.03);
        if (_useSRD_CameraCore) {
            this.debug("SRD_CameraCore:", "Loaded successfully!");
        } else {
            this.debug("SRD_CameraCore must be at least v1.04", "Can't use SRD_Camera_Core!");
        }
    }

    // Preload tilesets
    var OC_Scene_Boot_isReady = Scene_Boot.prototype.isReady;
    Scene_Boot.prototype.isReady = function () {
        var ret = OC_Scene_Boot_isReady.call(this);
        if (ret) preLoadSeasonTilesets(); return ret;
    };

    if (_useTimeSystem) {
        if (PluginManager.parameters('Community_Basic')['cacheLimit'] === undefined) {
            alert("WARNING! Community_Basic -plugin should be imported \nIF using OcRam_Passages and OcRam_Time_System together!");
        }
    } else {
        this.debug("Create fake OcRam.Time_System object (for tileset changes).");
        OcRam.Time_System = {};
        OcRam.Time_System._currentTilesetId = 0;
        OcRam.Time_System._prevTilesetId = 0;
    }

    // Tileset change
    this.extend(Game_Map, "changeTileset", function (tilesetId) {
        OcRam.Time_System._prevTilesetId = this._tilesetId;
        OcRam.Time_System._currentTilesetId = tilesetId;
        _this["Game_Map_changeTileset"].apply(this, arguments);
        if (SceneManager._scene) SceneManager._scene.start();
    });

    // Fix for Yanfly EventMiniLabel
    if (Imported.YEP_EventMiniLabel) {
        this.debug("YEP_EventMiniLabel:", "Loaded successfully!");
        var OC_Window_EventMiniLabel_gatherDisplayData = Window_EventMiniLabel.prototype.gatherDisplayData;
        Window_EventMiniLabel.prototype.gatherDisplayData = function () {
            if (this._character.isEvent_OC()) OC_Window_EventMiniLabel_gatherDisplayData.call(this);
        };
    }

    // Fix for Galv Fishing
    if (Imported.Galv_Fishing) {
        this.extend(Spriteset_Fishing, "createLowerLayer", function () {
            _this["Spriteset_Fishing_createLowerLayer"].apply(this, arguments);
            this._layerContainer_OC = new Sprite(); // Layer wrapper
            this._layerContainer_OC.z = 0; // just a dummy
        });
    }

    // ------------------------------------------------------------------------------
    // Plugin commands
    // ==============================================================================
    this.extend(Game_Interpreter, "pluginCommand", function (command, args) {
        switch (command) {
            case "floor_level": _this.debug("floor_level", args);
                if (SceneManager._scene._spriteset !== undefined) {
                    var obj_id = Number(args[0]); var this_obj = getGameObject(obj_id);
                    setObjFloorLevel(this_obj, String(args[1]).toLowerCase());
                    if (obj_id == -1) { // update followers also...
                        setObjFloorLevel(getGameObject(-2), String(args[1]).toLowerCase());
                        setObjFloorLevel(getGameObject(-3), String(args[1]).toLowerCase());
                        setObjFloorLevel(getGameObject(-4), String(args[1]).toLowerCase());
                    }
                } break;
            default:
                _this["Game_Interpreter_pluginCommand"].apply(this, arguments);
        }
    });

    // ------------------------------------------------------------------------------
    // RMMV core - Aliases
    // ==============================================================================

    // Fix for SRD_TitleMapBackground
    if (Scene_Title.prototype.updateMapFusionScene) this.debug("SRD_TitleMapBackground", "Enabled");

    Scene_Base.prototype.isTitle = function () { return false; }
    Scene_Title.prototype.isTitle = function () { return true; }

    // Update "z" based on Y coordinate... In RMMV engine it is done via sorting...
    this.extend(Tilemap, "updateTransform", function () {
        this._sortChildren_OC(); _this["Tilemap_updateTransform"].apply(this, arguments);
    });

    if (ShaderTilemap) {
        this.extend(ShaderTilemap, "updateTransform", function () {
            this._sortChildren_OC(); _this["ShaderTilemap_updateTransform"].apply(this, arguments);
        });
    }

    Tilemap.prototype._sortChildren_OC = function () {
        SceneManager._scene._spriteset._layerContainer_OC.children.sort(this._compareChildOrder_OC.bind(this));
    };

    Tilemap.prototype._compareChildOrder_OC = function (a, b) {
        if (a.z !== b.z) {
            return a.z - b.z;
        } else if (a.y !== b.y) {
            return a.y - b.y;
        } else {
            return a.spriteId - b.spriteId;
        }
    };

    this.forceTilesetReload = function() {
        _savedLayer = null; _flags = null; _savedLayer = null;
        _currentShaderTilemap = null; _cacheReady = false;
        _tileSprites = []; _doCulling = false; _preventLayerSave = true;
    }

    // When exited to title clear things up...
    this.extend(Scene_GameEnd, "commandToTitle", function () {
        _this.debug("Going to title... (menu)", "Force to re-load whole tileset!");
        _this.forceTilesetReload(); _this["Scene_GameEnd_commandToTitle"].apply(this, arguments); return;
    }); this.extend(Scene_Gameover, "gotoTitle", function () {
        _this.debug("Game over...", "Force to re-load whole tileset!");
        _this.forceTilesetReload(); _this["Scene_Gameover_gotoTitle"].apply(this, arguments); return;
    }); this.extend(Game_Interpreter, "command354", function () {
        _this.debug("Going to title... (command354)", "Force to re-load whole tileset!");
        _this.forceTilesetReload(); _this["Game_Interpreter_command354"].apply(this, arguments);
        return true;
    });

    // Do not face up when behind ladders
    this.extend(Game_CharacterBase, "isOnLadder", function () {
        if (!this._higherLevel && this.regionId() == _coverId) return false;
        return _this["Game_CharacterBase_isOnLadder"].apply(this, arguments);
    });

    // Make sure layers are saved before scene is terminated (except if new map)
    this.extend(Scene_Map, "terminate", function () {
        if (SceneManager.isNextScene(Scene_Map)) {
            if ($gamePlayer.newMapId() != $gameMap.mapId()) {
                _this.forceTilesetReload(); _this.debug("New map is coming...", "Force to re-load whole tileset!");
            } else {
                if (OcRam.Time_System._currentTilesetId != OcRam.Time_System._prevTilesetId) {
                    _this.forceTilesetReload(); _this.debug("Season has been changed!", "Force to re-load whole tileset!");
                } else { saveCurrentLayer(); }
            }
        } else {
            saveCurrentLayer();
        } _preventLayerSave = false; _this["Scene_Map_terminate"].apply(this, arguments);
    });

    // Save passages data
    this.extend(Game_System, "onBeforeSave", function () {
        this.savePassageData(); _this["Game_System_onBeforeSave"].apply(this, arguments);
    });

    this.extend(Game_System, "onAfterLoad", function () {
        this.loadPassageData(); _this["Game_System_onAfterLoad"].apply(this, arguments);
    });

    // YEP_SaveMenuCore fix - fixed by BurningOrca
    this.extend(Scene_File, "onLoadSuccess", function () {
        _this.debug("Loading new save... (onLoadSuccess)", "Force to re-load whole tileset!");
        _this.forceTilesetReload(); _this["Scene_File_onLoadSuccess"].apply(this, arguments); return;
    });

    // Auto-assign floor level to new party members
    this.extend(Game_Party, "addActor", function (actorId) {
        _this["Game_Party_addActor"].apply(this, arguments);
        if (SceneManager._scene.isMap()) {
            var new_index = $gamePlayer._followers.visibleFollowers().length - 1;
            if (new_index < 4 && new_index > -1) {
                $gamePlayer._followers._data[new_index]._higherLevel = autoAssignFloorLevel($gamePlayer._followers._data[new_index]);
            }
        }
    });

    // Create sprites and add them to proper parents
    this.extend(Spriteset_Map, "createLowerLayer", function () {
        _this["Spriteset_Map_createLowerLayer"].apply(this, arguments);
        this._baseSprite.removeChild(this._shadowSprite);
        this.createCoverLayers_OC();
        this._baseSprite.addChild(this._shadowSprite);
    });

    // Refresh tiles on scene changes
    this.extend(Scene_Map, "start", function () {
        _this["Scene_Map_start"].apply(this, arguments);
        if (SceneManager._scene) {
            if (SceneManager._scene._mapFusion) {
                if (!SceneManager._scene._spriteset) {
                    SceneManager._scene._spriteset = SceneManager._scene._mapFusion._spriteset;
                }
            }
        } initSprites();
    });

    // Move sprites when scrolling map
    this.extend(Spriteset_Map, "update", function () {
        _this["Spriteset_Map_update"].apply(this, arguments);
        if (SceneManager._scene._spriteset && SceneManager._scene._spriteset._layerContainer_OC) {
            $gameMap.moveSpritesX_OC(); $gameMap.moveSpritesY_OC();
        }
    });

    // This is the day, events can underpass AND overpass despite of player floor level...
    this.extend(Game_CharacterBase, "refreshBushDepth", function () {
        _this["Game_CharacterBase_refreshBushDepth"].apply(this, arguments);
        var region_id = this.regionId();
        if (region_id == _overpassId) {
            this._higherLevel = true;
            if (SceneManager._scene._spriteset !== undefined) updateEvent(this);
        } else if (region_id == _underpassId) {
            this._higherLevel = this._priorityType == 2;
            if (SceneManager._scene._spriteset !== undefined) updateEvent(this);
        }
    });

    if (_useTallSprites) { // Followers use same floor level as player...

        this.extend(Game_Player, "refreshBushDepth", function () {
            mapCulling(); var old_lvl = this._higherLevel;
            _this["Game_Player_refreshBushDepth"].apply(this, arguments);
            if (old_lvl != this._higherLevel) {
                this._followers.visibleFollowers().forEach(function (f) {
                    f._higherLevel = $gamePlayer._higherLevel;
                    if (SceneManager._scene._spriteset !== undefined) {
                        getCharSprite(f)._showHigherSprite = f._higherLevel;
                    }
                });
            }
        });

        this.extend(Game_Follower, "refreshBushDepth", function () {
            _this["Game_CharacterBase_refreshBushDepth"].apply(this, arguments);
        });

    } else {

        // Culling done when player is moved (once in distance of tile)
        this.extend(Game_Player, "refreshBushDepth", function () {
            mapCulling(); _this["Game_Player_refreshBushDepth"].apply(this, arguments);
        });

    }

    // Update character graphics on event page change
    this.extend(Game_Event, "setupPage", function () {
        _this["Game_Event_setupPage"].apply(this, arguments);
        if (SceneManager._scene._spriteset !== undefined) {
            if (getCharSprite(this)) getCharSprite(this).visible = false;
            updateEvent(this);
        }
    });

    // Check if sprite needs to be drawed
    this.extend(Sprite_Character, "updateVisibility", function () {
        _this["Sprite_Character_updateVisibility"].apply(this, arguments);
        if (this._showHigherSprite === undefined && !this._character._higherLevel) return;
        this.visible = (this._character._higherLevel) ? this._showHigherSprite : false;
    });

    // Update sprite graphics on updateAirshipAltitude
    this.extend(Game_Vehicle, "updateAirshipAltitude", function () {

        var is_hl = this._higherLevel;

        if (!this._driving && this.isHighest()) getCharSprite(this).visible = is_hl;
        if (!this.isLowest() && !this.isHighest()) updateEvent(this);
        
        _this["Game_Vehicle_updateAirshipAltitude"].apply(this, arguments);

        if (!this._driving && this.isLowest()) {
            if (!_isAirshipLanded) {

                _isAirshipLanded = true; $gamePlayer._higherLevel = is_hl;
                getCharSprite($gamePlayer)._showHigherSprite = is_hl;

                $gamePlayer._followers.visibleFollowers().forEach(function (f) {
                    f._higherLevel = $gamePlayer._higherLevel;
                    getCharSprite(f)._showHigherSprite = is_hl;
                });

            }
        }

    });

    this.extend(Game_Vehicle, "isLandOk", function (x, y, d) {
        var tmp_ret = _this["Game_Vehicle_isLandOk"].apply(this, arguments);
        if (tmp_ret) {
            if ($gameMap.regionId(x, y) == _coverId) return false;
            if (this._type == "airship") {
                if (!$gameMap.checkPassage(x, y, (1 << (d / 2 - 1)) & 0x0f, true)) return false;
            }
            return true;
        }
    });

    // "Smart" drop >> check which autotile is drawn to landing point
    this.extend(Game_Vehicle, "getOff", function () {
        _isAirshipLanded = false; $gamePlayer._higherLevel = undefined;

        var is_hl = autoAssignFloorLevel($gamePlayer) ||
            ($gameMap.regionId($gamePlayer._x, $gamePlayer._y) == _overpassId);

        _this.debug("Landed to " + (is_hl ? "higher" : "lower") + " level", $gamePlayer);
        
        this._higherLevel = is_hl; _this["Game_Vehicle_getOff"].apply(this, arguments);

    });

    this.extend(Game_Player, "getOnVehicle", function () {

        var d = this.direction(); var x1 = this.x; var y1 = this.y;
        var x2 = $gameMap.roundXWithDirection(x1, d);
        var y2 = $gameMap.roundYWithDirection(y1, d);

        var vehicle_type = ''; var ret = false;
        if ($gameMap.airship().pos(x1, y1)) {
            vehicle_type = 'airship';
        } else if ($gameMap.ship().pos(x2, y2)) {
            vehicle_type = 'ship';
        } else if ($gameMap.boat().pos(x2, y2)) {
            vehicle_type = 'boat';
        } else {
            return false;
        }

        if (vehicle_type == 'airship' && (this._higherLevel != $gameMap.airship()._higherLevel)) {
            ret = false;
        } else {
            ret = _this["Game_Player_getOnVehicle"].apply(this, arguments);
        }

        return ret;
        
    });

    this.extend(Game_Vehicle, "getOn", function () {
        _this["Game_Vehicle_getOn"].apply(this, arguments); var sprite = null;
        if (this.isAirship()) this._higherLevel = true;
        for (var i = 0; i < $gamePlayer._followers.visibleFollowers().length; i++) {
            $gamePlayer._followers.visibleFollowers()[i]._transparent = true;
            updateEvent($gamePlayer._followers.visibleFollowers()[i]);
        } sprite = getCharSprite($gamePlayer);
        if (sprite != undefined) sprite.visible = false; updateEvent($gamePlayer);
    });
    
    this.extend(Game_Event, "isCollidedWithPlayerCharacters", function (x, y) {
        if ($gamePlayer._followers.isSomeoneCollided_OC(x, y, this._higherLevel)) return true;
        var tmp = _this["Game_Event_isCollidedWithPlayerCharacters"].apply(this, arguments);
        return tmp && ($gamePlayer._higherLevel == this._higherLevel);
    });

    this.extend(Scene_Save, "onSaveSuccess", function () {
        _this["Scene_Save_onSaveSuccess"].apply(this, arguments); $gameSystem.clearPassageData();
    });

    this.extend(Scene_Save, "onSaveFailure", function () {
        _this["Scene_Save_onSaveFailure"].apply(this, arguments); $gameSystem.clearPassageData();
    });

    var OC_Tilemap_readMapData = Tilemap.prototype._readMapData;

    // Passages will draw B-E COVER layers ALWAYS
    Tilemap.prototype._readMapData_OC = function (x, y, z) {
        return OC_Tilemap_readMapData.call(this, x, y, z);
    };

    // Core engine calls this to draw tiles 
    // >> Do not draw B-E COVER layers if they are already drawn on higher layers
    Tilemap.prototype._readMapData = function (x, y, z) {
        if (z == 2 || z == 3) {
            if ($gameMap.regionId(x, y) == _coverId) return 0;
        } return OC_Tilemap_readMapData.call(this, x, y, z);
    };

    // ------------------------------------------------------------------------------
    // RMMV core - New methods (methodName_OC)
    // ==============================================================================

    Game_System.prototype.clearPassageData = function () {
        this._passageHigh = []; this._passageLow = [];
    };

    // Save passage data (high / low)
    Game_System.prototype.savePassageData = function () {

        this._passageHigh = []; this._passageLow = []; var this_ref = this; var fl = OcRam.followers().length;

        if ($gamePlayer._higherLevel) { this._passageHigh.push(-1); } else { this._passageLow.push(-1); }
        if (fl > 0 && getGameObject(-2)._higherLevel) { this._passageHigh.push(-2); } else { this._passageLow.push(-2); }
        if (fl > 1 && getGameObject(-3)._higherLevel) { this._passageHigh.push(-3); } else { this._passageLow.push(-3); }
        if (fl > 2 && getGameObject(-4)._higherLevel) { this._passageHigh.push(-4); } else { this._passageLow.push(-4); }
        if (getGameObject(-100)._higherLevel) { this._passageHigh.push(-100); } else { this._passageLow.push(-100); }
        if (getGameObject(-101)._higherLevel) { this._passageHigh.push(-101); } else { this._passageLow.push(-101); }
        if (getGameObject(-102)._higherLevel) { this._passageHigh.push(-102); } else { this._passageLow.push(-102); }

        $gameMap.events().forEach(function (ev) {
            if (ev._higherLevel) {
                this_ref._passageHigh.push(ev.eventId());
            } else { this_ref._passageLow.push(ev.eventId()); }
        }); _this.debug("Saved _passageHigh:", this._passageHigh);

        _this.debug("Saved _passageHigh:", this._passageLow);

    };

    // Load previously saved passage data (high / low)
    Game_System.prototype.loadPassageData = function () {

        var gobj = null;

        if (this._passageHigh != undefined) {
            if (this._passageHigh.length > 0) {
                _this.debug("Loaded _passageHigh:", this._passageHigh);
                this._passageHigh.forEach(function (i) {
                    gobj = getGameObject(i); if (gobj) gobj._higherLevel = true;
                }); this._passageHigh = [];
            }
        }

        if (this._passageLow != undefined) {
            if (this._passageLow.length > 0) {
                _this.debug("Loaded _passageLow:", this._passageLow);
                this._passageLow.forEach(function (i) {
                    gobj = getGameObject(i); if (gobj) gobj._higherLevel = false;
                }); this._passageLow = [];
            }
        }

    };

    // Simple test is Character a player, follower, event or vehicle
    Game_CharacterBase.prototype.isPlayer_OC = function () { return false; };
    Game_CharacterBase.prototype.isFollower_OC = function () { return false; };
    Game_CharacterBase.prototype.isVehicle_OC = function () { return false; };
    Game_CharacterBase.prototype.isEvent_OC = function () { return false; };
    Game_Player.prototype.isPlayer_OC = function () { return true; };
    Game_Follower.prototype.isFollower_OC = function () { return true; };
    Game_Vehicle.prototype.isVehicle_OC = function () { return true; };
    Game_Event.prototype.isEvent_OC = function () { return true; };
    Scene_Base.prototype.isMap = function () { return false; }

    Game_Map.prototype.moveSpritesX_OC = function () {
        SceneManager._scene._spriteset._layerContainer_OC.x = -Math.floor(this._displayX * OcRam.twh[0]);
    };

    Game_Map.prototype.moveSpritesY_OC = function () {
        SceneManager._scene._spriteset._layerContainer_OC.y = -Math.floor(this._displayY * OcRam.twh[1]);
    };
    
    // Create layers for cover graphics
    Spriteset_Map.prototype.createCoverLayers_OC = function () {

        // Clear layer container, just in case (you never know what other plugins do in this.terminate)
        if (this._layerContainer_OC !== undefined) {
            alert("OMG! Had to clear _layerContainer_OC >> This shouldn't happen!\nPlease report this message to passages thread!");
            this._tilemap.removeChild(this._layerContainer_OC);
        }

        if (_savedLayer != null) { // Load saved saved layers
            _this.debug("LOADED SAVED LAYER CONTAINER!", _savedLayer);
            this._layerContainer_OC = _savedLayer;
        } else { // NEW LAYERS
            _tileSprites = []; // Init tile sprite containers
            this._layerContainer_OC = new Sprite(); // Layer wrapper
            this._layerContainer_OC.z = 8; // draw under weathersprite
            var s = new Sprite(); s.z = 0; _tileSprites.push(s);
            this._layerContainer_OC.addChild(_tileSprites[0]);
            s = new Sprite(); s.z = 4; _tileSprites.push(s);
            this._layerContainer_OC.addChild(_tileSprites[1]);
        } this._tilemap.addChild(this._layerContainer_OC);

    };

    // These methods will force system to draw tiles on bitmap (cover tiles)
    if (OcRam.Layers) {
        if (OcRam.Layers.parallaxOptimization()) {
            this.debug("OcRam.Layers parallax optimization detected", "DISABLE tile drawing totally!");
            Tilemap.prototype.drawTileToBitmap_OC = function () { return; };
        } else {
            this.debug("OcRam.Layers detected", "DISABLE passage tile drawing for <parallax> tilesets/maps!");
            Tilemap.prototype.drawTileToBitmap_OC = function (bitmap, tileId, dx, dy) {
                if (OcRam.Layers._usingParallax) return;
                if (Tilemap.isVisibleTile(tileId)) {
                    if (Tilemap.isAutotile(tileId)) {
                        this.drawAutotile_OC(bitmap, tileId, dx, dy);
                    } else {
                        this.drawNormalTile_OC(bitmap, tileId, dx, dy);
                    }
                }
            };
        }
    } else {
        Tilemap.prototype.drawTileToBitmap_OC = function (bitmap, tileId, dx, dy) {
            if (Tilemap.isVisibleTile(tileId)) {
                if (Tilemap.isAutotile(tileId)) {
                    this.drawAutotile_OC(bitmap, tileId, dx, dy);
                } else {
                    this.drawNormalTile_OC(bitmap, tileId, dx, dy);
                }
            }
        };
    }
    

    Tilemap.prototype.drawAutotile_OC = function (bitmap, tileId, x1, y1) {

        var autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
        var kind = Tilemap.getAutotileKind(tileId);
        var shape = Tilemap.getAutotileShape(tileId);
        var tx = kind % 8;
        var ty = Math.floor(kind / 8);
        var bx = 0;
        var by = 0;
        var setNumber = 0;
        var isTable = false;

        if (Tilemap.isTileA1(tileId)) {
            var waterSurfaceIndex = [0, 1, 2, 1][this.animationFrame % 4];
            setNumber = 0;
            if (kind === 0) {
                bx = waterSurfaceIndex * 2;
                by = 0;
            } else if (kind === 1) {
                bx = waterSurfaceIndex * 2;
                by = 3;
            } else if (kind === 2) {
                bx = 6;
                by = 0;
            } else if (kind === 3) {
                bx = 6;
                by = 3;
            } else {
                bx = Math.floor(tx / 4) * 8;
                by = ty * 6 + Math.floor(tx / 2) % 2 * 3;
                if (kind % 2 === 0) {
                    bx += waterSurfaceIndex * 2;
                }
                else {
                    bx += 6;
                    autotileTable = Tilemap.WATERFALL_AUTOTILE_TABLE;
                    by += this.animationFrame % 3;
                }
            }
        } else if (Tilemap.isTileA2(tileId)) {
            setNumber = 1;
            bx = tx * 2;
            by = (ty - 2) * 3;
            isTable = this._isTableTile(tileId);
        } else if (Tilemap.isTileA3(tileId)) {
            setNumber = 2;
            bx = tx * 2;
            by = (ty - 6) * 2;
            autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
        } else if (Tilemap.isTileA4(tileId)) {
            setNumber = 3;
            bx = tx * 2;
            by = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0));
            if (ty % 2 === 1) {
                autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
            }
        }

        var table = autotileTable[shape];
        var source = this.bitmaps[setNumber];

        if (table && source) {
            var w1 = this._tileWidth / 2;
            var h1 = this._tileHeight / 2;
            for (var i = 0; i < 4; i++) {
                var qsx = table[i][0];
                var qsy = table[i][1];
                var sx1 = (bx * 2 + qsx) * w1;
                var sy1 = (by * 2 + qsy) * h1;
                var dx1 = x1 + (i % 2) * w1;
                var dy1 = y1 + Math.floor(i / 2) * h1;
                if (isTable && (qsy === 1 || qsy === 5)) {
                    var qsx2 = qsx;
                    var qsy2 = 3;
                    if (qsy === 1) {
                        qsx2 = [0, 3, 2, 1][qsx];
                    }
                    var sx2 = (bx * 2 + qsx2) * w1;
                    var sy2 = (by * 2 + qsy2) * h1;
                    bitmap.blt(source, sx2, sy2, w1, h1, dx1, dy1, w1, h1);
                    dy1 += h1 / 2;
                    bitmap.blt(source, sx1, sy1, w1, h1 / 2, dx1, dy1, w1, h1 / 2);
                } else {
                    bitmap.blt(source, sx1, sy1, w1, h1, dx1, dy1, w1, h1);
                }
            }
        }
    };

    Tilemap.prototype.drawNormalTile_OC = function (bitmap, tileId, x1, y1) {
        var setNumber = 0;
        if (Tilemap.isTileA5(tileId)) {
            setNumber = 4;
        } else {
            setNumber = 5 + Math.floor(tileId / 256);
        }
        var w = this._tileWidth;
        var h = this._tileHeight;
        var sx = (Math.floor(tileId / 128) % 2 * 8 + tileId % 8) * w;
        var sy = (Math.floor(tileId % 256 / 8) % 16) * h;
        var source = this.bitmaps[setNumber];
        if (source) {
            bitmap.blt(source, sx, sy, w, h, x1, y1, w, h);
        }
    };

    Tilemap.prototype.drawTableEdge_OC = function (bitmap, tileId, x1, y1) {
        if (Tilemap.isTileA2(tileId)) {
            var autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
            var kind = Tilemap.getAutotileKind(tileId);
            var shape = Tilemap.getAutotileShape(tileId);
            var tx = kind % 8;
            var ty = Math.floor(kind / 8);
            var setNumber = 1;
            var bx = tx * 2;
            var by = (ty - 2) * 3;
            var table = autotileTable[shape];
            if (table) {
                var source = this.bitmaps[setNumber];
                var w1 = this._tileWidth / 2;
                var h1 = this._tileHeight / 2;
                for (var i = 0; i < 2; i++) {
                    var qsx = table[2 + i][0];
                    var qsy = table[2 + i][1];
                    var sx1 = (bx * 2 + qsx) * w1;
                    var sy1 = (by * 2 + qsy) * h1 + h1 / 2;
                    var dx1 = x1 + (i % 2) * w1;
                    var dy1 = y1 + Math.floor(i / 2) * h1;
                    bitmap.blt(source, sx1, sy1, w1, h1 / 2, dx1, dy1, w1, h1 / 2);
                }
            }
        }
    };

    Tilemap.prototype.drawShadow_OC = function (bitmap, shadowBits, dx, dy) {

        if (shadowBits & 0x0f) {

            var w1 = this._tileWidth / 2;
            var h1 = this._tileHeight / 2;
            var color = 'rgba(0,0,0,0.5)';

            for (var i = 0; i < 4; i++) {
                if (shadowBits & (1 << i)) {
                    var dx1 = dx + (i % 2) * w1;
                    var dy1 = dy + Math.floor(i / 2) * h1;
                    bitmap.fillRect(dx1, dy1, w1, h1, color);
                }
            }

        }

    };

    Tilemap.prototype.paintTilesOnBitmap_OC = function (bm_lo, bm_hi, x, y, at) {

        var tableEdgeVirtualId = 10000;

        var x1 = 0; var y1 = 0;
        var tileId0 = this._readMapData_OC(x, y, 0); // Autotile (ground)
        var tileId1 = this._readMapData_OC(x, y, 1); // Autotile (bush)
        var tileId2 = this._readMapData_OC(x, y, 2, true); // B-E tile (x/o)
        var tileId3 = this._readMapData_OC(x, y, 3, true); // B-E tile (*)
        var upperTileId1 = this._readMapData_OC(x, y - 1, 1);
        var tilesHigh = []; var tilesLow = [];
        var shadowBits = this._readMapData_OC(x, y, 4);

        if (at) {

            // Autotiles will be drawn "flat" (1 bitmap)

            if (this._isHigherTile(tileId0)) { tilesHigh.push(tileId0); }
            else { tilesLow.push(tileId0); }

            if (this._isHigherTile(tileId1)) { tilesHigh.push(tileId1); }
            else { tilesLow.push(tileId1); }

            bm_lo.clearRect(x1, y1, this._tileWidth, this._tileHeight);
            
            for (var i = 0; i < tilesLow.length; i++) {
                var lowerTileId = tilesLow[i];
                if (lowerTileId < 0) {
                } else if (lowerTileId >= tableEdgeVirtualId) {
                    this.drawTableEdge_OC(bm_lo, upperTileId1, x1, y1);
                } else {
                    this.drawTileToBitmap_OC(bm_lo, lowerTileId, x1, y1);
                } if (at) this.drawShadow_OC(bm_lo, shadowBits, x1, y1);
            }

            for (i = 0; i < tilesHigh.length; i++) {
                this.drawTileToBitmap_OC(bm_lo, tilesHigh[i], x1, y1);
            }

        } else {

            // B-E layers are drawn to low and high (2 bitmaps)

            if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
                if (!Tilemap.isShadowingTile(tileId0)) { tilesLow.push(tableEdgeVirtualId + upperTileId1); }
            }

            if (this._isHigherTile(tileId2)) { tilesHigh.push(tileId2); }
            else { tilesLow.push(tileId2); }

            if (this._isHigherTile(tileId3)) { tilesHigh.push(tileId3); }
            else { tilesLow.push(tileId3); }

            bm_lo.clearRect(x1, y1, this._tileWidth, this._tileHeight);
            bm_hi.clearRect(x1, y1, this._tileWidth, this._tileHeight);

            for (var i = 0; i < tilesLow.length; i++) {
                var lowerTileId = tilesLow[i];
                if (lowerTileId < 0) {
                } else if (lowerTileId >= tableEdgeVirtualId) {
                    this.drawTableEdge_OC(bm_lo, upperTileId1, x1, y1);
                } else {
                    this.drawTileToBitmap_OC(bm_lo, lowerTileId, x1, y1);
                } if (at) this.drawShadow_OC(bm_lo, shadowBits, x1, y1);
            }

            for (i = 0; i < tilesHigh.length; i++) {
                this.drawTileToBitmap_OC(bm_hi, tilesHigh[i], x1, y1);
            }

        }

    };

    // Create shadow sprite to top layer
    Spriteset_Map.prototype.createShadow_OC = function () {
        this._shadowSprite = new Sprite();
        this._shadowSprite.bitmap = ImageManager.loadSystem('Shadow1');
        this._shadowSprite.anchor.x = 0.5;
        this._shadowSprite.anchor.y = 1;
        this._shadowSprite.z = 6;
        this._layerContainer_OC.addChild(this._shadowSprite);
    };

    // Local_Coop compatibility
    Game_Followers.prototype.isSomeoneCollided_OC = function (x, y, hl) {
        return this.visibleFollowers().some(function (follower) {
            return follower.pos(x, y) && (follower._higherLevel == hl);
        }, this);
    };

    // ------------------------------------------------------------------------------
    // RMMV core - Overrides
    // ==============================================================================

    ImageManager.isReady = function () {
        return this._imageCache.isReady();
    }; // Fix for Yanfly GridFreeDoodads

    Game_CharacterBase.prototype.isMapPassable = function (x, y, d) {

        var x2 = $gameMap.roundXWithDirection(x, d);
        var y2 = $gameMap.roundYWithDirection(y, d);
        var d2 = this.reverseDir(d); var block_passage = false;

        var next_region_id = $gameMap.regionId(x2, y2); var this_region_id = $gameMap.regionId(x, y);
        var t_hl = this._higherLevel; var is_this_cover = (this_region_id == _coverId || this_region_id == _autoCoverId);

        if (next_region_id == _blockId) {
            block_passage = true;
        } else {
            if (t_hl) { // This char is in higher ground
                if (is_this_cover) {
                    if (next_region_id == _underpassId) block_passage = true;
                } if (this_region_id == _blockHighLowId && next_region_id == _underpassId) block_passage = true;
            } else { // This char is in lower ground
                if (is_this_cover && (next_region_id == _overpassId || next_region_id == 0)) block_passage = true;
                if (next_region_id == _overheadId) block_passage = true;
            }
        }

        if (block_passage) {
            return false;
        } else {
            block_passage = true;
            if (!t_hl) {
                if ((this_region_id == _underpassId || is_this_cover) && (next_region_id == _underpassId ||
                    next_region_id == _coverId || next_region_id == _autoCoverId)) block_passage = false;
            }
            return (block_passage) ? ($gameMap.isPassable(x, y, d, this._higherLevel) && $gameMap.isPassable(x2, y2, d2, this._higherLevel)) : true;
        }

    };

    Game_Map.prototype.isPassable = function (x, y, d, hl) {
        return this.checkPassage(x, y, (1 << (d / 2 - 1)) & 0x0f, hl);
    };

    Game_Map.prototype.checkPassage = function (x, y, bit, hl) {

        var tiles = this.allTiles(x, y);
        var this_region_id = $gameMap.regionId(x, y); var this_isCover = false;
        //if (this_region_id == _allowId) return true;
        if (this_region_id == _blockId) return false;
        if (!hl) { // Event which called this method, is on lower floor level
            this_isCover = (this_region_id == _coverId || this_region_id == _autoCoverId) ? true : false;
            if (this_region_id == _overheadId) return false;
            if (this_region_id == _blockHighLowId) return false;
        }
        // Passages allowed depending on player 'floor' level
        for (var i = 0; i < tiles.length; i++) {
            var flag = _flags[tiles[i]];
            if (((flag & 0x10) !== 0) || (this_isCover)) // [*] No effect on passage
                continue;
            if ((flag & bit) === 0) // [o] Passable
                return true;
            if ((flag & bit) === bit) // [x] Impassable
                return false;
        } return true;

    };

    Game_CharacterBase.prototype.isCollidedWithEvents = function (x, y) {
        var events = $gameMap.eventsXyNt(x, y); var is_hl = this._higherLevel;
        return events.some(function (event) {
            return (event.isNormalPriority() && (event._higherLevel == is_hl));
        });
    };

    Game_Event.prototype.isCollidedWithEvents = function (x, y) {
        var events = $gameMap.eventsXyNt(x, y); var is_hl = this._higherLevel;
        return events.some(function (event) {
            return (event.isNormalPriority() && (event._higherLevel == is_hl));
        });
    };

    // Change event interaction by floor level
    Game_Player.prototype.startMapEvent = function (x, y, triggers, normal) {
        // Start events ONLY if they are on same 'floor'
        if (!$gameMap.isEventRunning()) {
            var this_hl = (this !== undefined) ? this._higherLevel : false;
            $gameMap.eventsXy(x, y).forEach(function (event) {
                if (event.isTriggerIn(triggers)) {
                    var ev_cmts = []; var trigger_always = false;
                    ev_cmts = event.getStringComments(); trigger_always = false;
                    for (var i = 0; i < ev_cmts.length; i++) {
                        if (ev_cmts[i] == "<trigger_always>") trigger_always = true;
                    } if (event._higherLevel == this_hl || trigger_always) {
                        event.start(); updateEvent(event);
                    }
                }
            });
        }
    };

    // Do not "refreshBushDepth" if vehicle (prevents undesired under-/over passages)
    Game_Vehicle.prototype.refreshBushDepth = function () { /* do nothing */ };

    // ------------------------------------------------------------------------------
    // Utility functions
    // ==============================================================================
    function autoAssignFloorLevel(ev) {

        if (ev._higherLevel != undefined) return ev._higherLevel;
        if (!_useAutoassign) { return ev._higherLevel || false; }

        var tiles = $gameMap.allTiles(ev._x, ev._y); var tile_id = 0;
        for (var i = 0; i < tiles.length; i++) {
            if (Tilemap.isAutotile(tiles[i])) tile_id = tiles[i];
        }

        var ret = false;
        switch (ev.regionId()) {
            case _coverId: case _autoCoverId: case _overpassId: case _overheadId:
                ret = true;
                break;
            default: 
                ret = (Tilemap.isRoofTile(tile_id) || Tilemap.isWallTopTile(tile_id));
                break
        } _this.debug("autoAssignFloorLevel (_higherLevel=" + ret + ")", ev); return ret;

    }

    function getGameObject(eid) {
        if (eid < -1 && eid > -100) {
            return $gamePlayer._followers._data[-(eid + 2)];
        } else {
            switch (eid) {
                case -102: return $gameMap.airship();
                case -101: return $gameMap.ship();
                case -100: return $gameMap.boat();
                case -1: return $gamePlayer;
                default: return getEventById(eid);
            }
        }
    }

    function getEventById(eid) {

        if (eid == 0 || eid == null) return null;
        var oc_eid = eid; var tmp_event = null;

        while (oc_eid > -1) {
            tmp_event = $gameMap.events()[oc_eid];
            if (tmp_event !== null && tmp_event !== undefined) {
                if (tmp_event._eventId == eid) return tmp_event;
            } oc_eid--;
        } return null;

    }

    function setObjFloorLevel(obj, level) {
        if (obj !== undefined && obj != null) {
            if (level == "low") obj._higherLevel = false;
            if (level == "high") obj._higherLevel = true;
            if (level == "auto") obj._higherLevel = autoAssignFloorLevel(obj);
            updateEvent(obj);
        }
    }

    function preLoadSeasonTilesets() {

        var tmp = [];

        $dataTilesets.forEach(function (ts) {
            if (ts != null) {
                tmp = [];
                ts.tilesetNames.forEach(function (s) {
                    tmp.push(ImageManager.loadTileset_OC(s));
                });
            } 
        }); isCacheReady();

    }

    function isCacheReady() {
        window.setTimeout(function () {
            _cacheReady = ImageManager.isReady();
            if (!_cacheReady) {
                _this.debug("preLoadSeasonTilesets()", "...Loading...");
                isCacheReady();
            } else {
                _this.debug("preLoadSeasonTilesets()", "...Done!");
            }
        }, 1000);
    }

    function callSeasonChange() {

        if (SceneManager._scene.isTitle() || DataManager.isEventTest()) return;

        // Do not change tileset if not required to...
        _this.debug("Tileset check:", OcRam.Time_System._prevTilesetId + " -VS- " + OcRam.Time_System._currentTilesetId);
        if (OcRam.Time_System._prevTilesetId == OcRam.Time_System._currentTilesetId) return;

        _currentShaderTilemap = SceneManager._scene._spriteset._tilemap; // Current ShaderTilemap

        var tileset_names = $dataTilesets[OcRam.Time_System._currentTilesetId].tilesetNames;
        _this.debug("LOADED NEW TILESET!", tileset_names); // Force new tileset bitmaps...

        OcRam.Time_System._currentTilesetId = OcRam.Time_System._prevTilesetId;

        for (var i = 0; i < tileset_names.length - 1; i++) {
            _currentShaderTilemap.bitmaps[i] = ImageManager.loadTileset_OC(tileset_names[i]);
        }

    }

    function saveCurrentLayer() {
        if (_preventLayerSave) return;
        var tmp = SceneManager._scene._spriteset._layerContainer_OC;
        _this.debug("SAVED CURRENT LAYER CONTAINER!", tmp); _savedLayer = tmp;
    }

    function initSprites() {

        OcRam.twh = [$gameMap.tileWidth(), $gameMap.tileHeight()];

        _doCulling = true; if ($gameMap.width() < OcRam._screenTWidth * 1.5 && $gameMap.height() < OcRam._screenTHeight * 1.5) _doCulling = false;
        _this.debug("Do culling?", _doCulling);

        // Initialize bitmap arrays on autotile covers...
        _flags = $gameMap.tilesetFlags();

        if (_savedLayer != null) { // Sprites already loaded!
            _this.debug("Sprites already loaded!", "Do NOT re-create everything!");
            $gameMap.moveSpritesY_OC(); $gameMap.moveSpritesX_OC(); updateEvent($gamePlayer);
            $gamePlayer._followers.visibleFollowers().forEach(function (f) {
                updateEvent(f);
            }); return;
        } var ev_cmts = [];

        $gameSystem.loadPassageData(); callSeasonChange();

        var is_auto_or_overhead = false; var region_id = 0; 
        for (var x = 0; x < $gameMap.width(); x++) {
            for (var y = 0; y < $gameMap.height(); y++) {
                region_id = $gameMap.regionId(x, y); is_auto_or_overhead = (region_id == _autoCoverId || region_id == _overheadId);
                if (is_auto_or_overhead) {
                    drawLowerLayers(x, y); // Autotiles covers WHOLE tile
                } if (region_id == _coverId || is_auto_or_overhead || region_id == _overpassId) {
                    drawBELayers(x, y); // Characters and B-E tiles may have transparent backgrounds
                }
            }
        }

        $gameMap.events().forEach(function (ev) {
            if (ev._higherLevel === undefined) {
                ev._higherLevel = autoAssignFloorLevel(ev);
                ev_cmts = ev.getStringComments();
                for (var j = 0; j < ev_cmts.length; j++) {
                    if (ev_cmts[j] == "<higher>") {
                        ev._higherLevel = true; j = ev_cmts.length;
                    } else if (ev_cmts[j] == "<lower>") {
                        ev._higherLevel = false; j = ev_cmts.length;
                    }
                }
            } if (ev._higherLevel) addCharBitmap(ev);
        });
        
        var aship_obj = $gameMap.airship(); aship_obj._higherLevel = autoAssignFloorLevel(aship_obj);

        if (aship_obj._mapId == $gameMap.mapId()) {
            addCharBitmap(aship_obj); updateEvent(aship_obj);
        } drawActors();

        _this.debug("Graphics renderer:", Graphics._renderer);

        mapCulling(); $gameMap.moveSpritesY_OC(); $gameMap.moveSpritesX_OC();

    }

    function drawLowerLayers(px, py) {
        var low_bm = new Bitmap(OcRam.twh[0], OcRam.twh[1]);
        var ctm = SceneManager._scene._spriteset._tilemap;
        ctm.paintTilesOnBitmap_OC(low_bm, null, px, py, true);
        addTileBitmap(low_bm, px * OcRam.twh[0], py * OcRam.twh[1], 0);
    }

    function drawActors() {

        // Force to pre-draw 'higher' level characters to avoid minor lag when triggered 'higher' level...

        var ev = null; var old_hl = false;

        for (var i = $gamePlayer._followers.visibleFollowers().length - 1; i > -1; i--) {
            ev = $gamePlayer._followers.visibleFollowers()[i];
            old_hl = ev._higherLevel; ev._higherLevel = true; addCharBitmap(ev);
            ev._higherLevel = old_hl; ev._higherLevel = autoAssignFloorLevel(ev); updateEvent(ev);
        }

        ev = $gamePlayer; old_hl = ev._higherLevel; ev._higherLevel = true; addCharBitmap(ev);
        ev._higherLevel = old_hl; ev._higherLevel = autoAssignFloorLevel(ev); updateEvent(ev);
       
    }

    // Set visibilities to avoid sprite rendering/sorting for sprites that are off screen!
    function mapCulling() {

        if (!_doCulling) return;

        var mx = $gameMap._displayX - 4; var my = $gameMap._displayY - 4;
        var ex = mx + OcRam._screenTWidth + 8; var ey = my + OcRam._screenTHeight + 8;

        if (_tileSprites[0]) {
            _tileSprites[0].children.forEach(function (s) {
                if (s._x < mx) { s.visible = false; }
                else if (s._x > ex) { s.visible = false; }
                else if (s._y < my) { s.visible = false; }
                else if (s._y > ey) { s.visible = false; }
                else { s.visible = true; }
            });
        }

        if (_tileSprites[1]) {
            _tileSprites[1].children.forEach(function (s) {
                if (s._x < mx) { s.visible = false; }
                else if (s._x > ex) { s.visible = false; }
                else if (s._y < my) { s.visible = false; }
                else if (s._y > ey) { s.visible = false; }
                else { s.visible = true; }
            });
        }

        if (SceneManager._scene._spriteset) {
            if (SceneManager._scene._spriteset._layerContainer_OC) {
                SceneManager._scene._spriteset._layerContainer_OC.children.forEach(function (s) {
                    if (s._x < mx) { s.visible = false; }
                    else if (s._x > ex) { s.visible = false; }
                    else if (s._y < my) { s.visible = false; }
                    else if (s._y > ey) { s.visible = false; }
                    else { s.visible = true; }
                });
            }
        }

    }

    // Draw tile to desired layer
    function addTileBitmap(p_bitmap, x, y, z) {
        var sprite = new Sprite(); sprite.bitmap = p_bitmap; sprite.x = x; sprite.y = y;
        sprite._x = x / OcRam.twh[0]; sprite._y = y / OcRam.twh[1];
        sprite.visible = !_doCulling; sprite.z = z;
        if (z == 0) {
            _tileSprites[0].addChild(sprite); // Lower tiles
        } else {
            _tileSprites[1].addChild(sprite); // Upper tiles
        }
    }

    // Add char to _layerContainer_OC
    function addCharBitmap(ev) {
        if (ev._eventId !== undefined) {
            if (ev._characterName == "" && ev._tileId == 0) { _this.debug("Event with no graphics...", ev); return; }
            var sprite = new Sprite_Character_OC(ev); sprite.z = ev._priorityType; sprite.visible = !_doCulling;
            SceneManager._scene._spriteset._layerContainer_OC.addChild(sprite); updateEvent(ev);
        }
    }

    // Update event sprite
    function updateEvent(ev) {
        if (ev._eventId == undefined) {
            if (ev.isPlayer_OC()) ev._eventId = -1;
            if (ev.isFollower_OC()) ev._eventId = -(ev._memberIndex + 1);
            if (ev.isVehicle_OC()) {
                if (ev._type == "boat") ev._eventId = -100;
                if (ev._type == "ship") ev._eventId = -101;
                if (ev._type == "airship") { ev._eventId = -102; ev._higherLevel = true; }
            }
        } var sprite = getCharSprite(ev);
        if (sprite) {
            sprite._showHigherSprite = ev._higherLevel && !ev._transparent;
        } else { // Event not created yet?
            addCharBitmap(ev);
        }
    }

    function getCharSprite(ev) {
        if (!ev) return null; var ret = null;
        SceneManager._scene._spriteset._layerContainer_OC.children.forEach(function (sprite) {
            if (sprite._character) {
                if (sprite._character._eventId == ev._eventId) { ret = sprite; return; }
            }
        }); return ret;
    }

    function drawBELayers(px, py) { // Draw B-E tiles - Returns: Bitmap
        var tmp_x = px * OcRam.twh[0]; var tmp_y = py * OcRam.twh[1];
        var low_bm = new Bitmap(OcRam.twh[0], OcRam.twh[1]);
        var high_bm = new Bitmap(OcRam.twh[0], OcRam.twh[1]);
        var ctm = SceneManager._scene._spriteset._tilemap;
        ctm.paintTilesOnBitmap_OC(low_bm, high_bm, px, py, false);
        addTileBitmap(low_bm, tmp_x, tmp_y, 0, px, py); // Add below chars
        addTileBitmap(high_bm, tmp_x, tmp_y, 4, px, py); // Add above chars
    }

    Game_CharacterBase.prototype.autoAssign = function () {
        this._higherLevel = autoAssignFloorLevel(this); updateEvent(this);
    };

}.bind(OcRam.Passages)());