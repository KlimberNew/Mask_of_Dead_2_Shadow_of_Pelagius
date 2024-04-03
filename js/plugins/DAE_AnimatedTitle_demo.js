//================================================================
// DAE_AnimatedTitle.js
// ---------------------------------------------------------------
// Copyright (c) 2021 DaedraKyne & TwentyFree
// ---------------------------------------------------------------
// Free for non-commercial use.
//================================================================

/*:
 * DAE_AnimatedTitle.js
 * @plugindesc This plugin adds functionality to have a series of images playing in loop as the title image.
 * @author DaedraKyne & TwentyFree
 *
 * @param Title Images
 * @type struct<TitleImage>[]
 * @default ["{\"Image\":\"Book\",\"Time\":\"2.0\"}"]
 *
 * @param Use prefix or list
 * @type boolean
 * @require 1
 * @on Prefix
 * @off List
 * 
 * @param Title name prefix
 * @type text
 * @desc The prefix to give to your title images. 
 * @default TitleImage_
 * 
 * @param Number of frames (for prefix)
 * @type number
 * @desc The number of frames you have for the title image. Works only if title prefix was chosen.
 * @default 10
 * @min 1
 * 
 * @param Frame duration
 * @type number
 * @min 1
 * @default 5
 *
 * @help
 * This plugin animates the title screen image by switching between images.
 *
 */

/*~struct~TitleImage:
*
* @param name
* @text Image name
* @desc Name of the image in img/titles1
* @require 1
* @dir img/titles1/
* @type file
*
* @param duration
* @text Duration of frame in frames/sec
* @type number
* @default 1
* @min 1
*
*/

var Imported = Imported || {};
var DAE = DAE || {};
DAE.AnimatedTitle = DAE.AnimatedTitle || {};
Imported.AnimatedTitle = true;

(function() {

const _0x4e78=['683471pPiQfn','map','479219rNJDPB','DAE_AnimatedTitle_demo','_titleIndex','name','Number\x20of\x20frames\x20(for\x20prefix)','AnimatedTitle','_titleImageCoundown','usePrefix','7KmKghw','parameters','Frame\x20duration','_backSprite1','updateImage','loadSystemImages','titleImages','515777coRnSv','length','22243odmydv','551498KEcziL','create','frames','log','bitmap','Use\x20prefix\x20or\x20list','update','push','parse','prototype','561753jKPwhf','Title\x20Images','call','mapBit','frameDuration','2384414bKGAnz','prefix','duration'];const _0x45e0d2=_0x4dc8;(function(_0x5c1fe6,_0x2ce9e9){const _0x1dbbe5=_0x4dc8;while(!![]){try{const _0x56e0b4=-parseInt(_0x1dbbe5(0x1eb))+-parseInt(_0x1dbbe5(0x1e3))+parseInt(_0x1dbbe5(0x1ed))+parseInt(_0x1dbbe5(0x1f5))*-parseInt(_0x1dbbe5(0x1d8))+-parseInt(_0x1dbbe5(0x1d9))+-parseInt(_0x1dbbe5(0x1fc))+parseInt(_0x1dbbe5(0x1e8));if(_0x56e0b4===_0x2ce9e9)break;else _0x5c1fe6['push'](_0x5c1fe6['shift']());}catch(_0x3a0a76){_0x5c1fe6['push'](_0x5c1fe6['shift']());}}}(_0x4e78,0x608a9));var parameters=PluginManager[_0x45e0d2(0x1f6)](_0x45e0d2(0x1ee));console[_0x45e0d2(0x1dc)](parameters),DAE[_0x45e0d2(0x1f2)]['usePrefix']=parameters[_0x45e0d2(0x1de)]=='true',DAE[_0x45e0d2(0x1f2)][_0x45e0d2(0x1e9)]=parameters['Title\x20name\x20prefix']||'',DAE[_0x45e0d2(0x1f2)][_0x45e0d2(0x1db)]=Number(parameters[_0x45e0d2(0x1f1)]||0x1),DAE[_0x45e0d2(0x1f2)][_0x45e0d2(0x1e7)]=Number(parameters[_0x45e0d2(0x1f7)]||0x1);!DAE[_0x45e0d2(0x1f2)][_0x45e0d2(0x1f4)]&&(DAE[_0x45e0d2(0x1f2)]['titleImages']=parameters[_0x45e0d2(0x1e4)],DAE[_0x45e0d2(0x1f2)][_0x45e0d2(0x1fb)]=JSON[_0x45e0d2(0x1e1)](DAE['AnimatedTitle'][_0x45e0d2(0x1fb)]),DAE[_0x45e0d2(0x1f2)][_0x45e0d2(0x1fb)]=DAE[_0x45e0d2(0x1f2)][_0x45e0d2(0x1fb)][_0x45e0d2(0x1ec)](_0x264b0b=>{const _0x2537cc=_0x45e0d2;return _0x264b0b=JSON[_0x2537cc(0x1e1)](_0x264b0b),_0x264b0b[_0x2537cc(0x1ea)]=Number(_0x264b0b[_0x2537cc(0x1ea)]),_0x264b0b;}),console[_0x45e0d2(0x1dc)](DAE[_0x45e0d2(0x1f2)][_0x45e0d2(0x1fb)]));const usePrefix=DAE[_0x45e0d2(0x1f2)]['usePrefix'];function _0x4dc8(_0x3382e4,_0x436f56){return _0x4dc8=function(_0x4e78bc,_0x4dc8b2){_0x4e78bc=_0x4e78bc-0x1d7;let _0x2fd823=_0x4e78[_0x4e78bc];return _0x2fd823;},_0x4dc8(_0x3382e4,_0x436f56);}DAE[_0x45e0d2(0x1e6)]=new Map();const Scene_Boot_loadSystemImages=Scene_Boot[_0x45e0d2(0x1fa)];Scene_Boot[_0x45e0d2(0x1fa)]=function(){const _0x40c374=_0x45e0d2;Scene_Boot_loadSystemImages[_0x40c374(0x1e5)](this);if(usePrefix){DAE[_0x40c374(0x1f2)][_0x40c374(0x1fb)]=[];const _0x2a18a9=DAE['AnimatedTitle']['prefix'];for(var _0xa166ca=0x1;_0xa166ca<=DAE[_0x40c374(0x1f2)][_0x40c374(0x1db)];_0xa166ca++){var _0x4ccf46={'name':_0x2a18a9+_0xa166ca,'duration':DAE[_0x40c374(0x1f2)]['frameDuration']};DAE['AnimatedTitle'][_0x40c374(0x1fb)][_0x40c374(0x1e0)](_0x4ccf46);}}DAE['AnimatedTitle'][_0x40c374(0x1fb)]['forEach'](function(_0x3f7cdb){const _0x4e8f81=_0x40c374;DAE['mapBit']['set'](_0x3f7cdb[_0x4e8f81(0x1f0)],ImageManager['reserveTitle1'](_0x3f7cdb[_0x4e8f81(0x1f0)]));},this);};const Scene_Title_create=Scene_Title[_0x45e0d2(0x1e2)][_0x45e0d2(0x1da)];Scene_Title[_0x45e0d2(0x1e2)][_0x45e0d2(0x1da)]=function(){const _0x2f26e7=_0x45e0d2;Scene_Title_create[_0x2f26e7(0x1e5)](this),this['_titleIndex']=-0x1,this[_0x2f26e7(0x1f3)]=0x0,this[_0x2f26e7(0x1f9)]();};const Scene_Title_update=Scene_Title[_0x45e0d2(0x1e2)]['update'];Scene_Title[_0x45e0d2(0x1e2)][_0x45e0d2(0x1df)]=function(){const _0x2187e1=_0x45e0d2;Scene_Title_update[_0x2187e1(0x1e5)](this),this[_0x2187e1(0x1f9)]();},Scene_Title['prototype'][_0x45e0d2(0x1f9)]=function(){const _0x207d81=_0x45e0d2;this[_0x207d81(0x1f3)]--;if(this[_0x207d81(0x1f3)]>0x0)return;console[_0x207d81(0x1dc)]('update');var _0x3b4986=DAE[_0x207d81(0x1f2)][_0x207d81(0x1fb)];this['_titleIndex']=(this['_titleIndex']+0x1)%_0x3b4986[_0x207d81(0x1d7)];var _0x391092=_0x3b4986[this[_0x207d81(0x1ef)]];_0x391092&&(this[_0x207d81(0x1f8)][_0x207d81(0x1dd)]=DAE[_0x207d81(0x1e6)]['get'](_0x391092[_0x207d81(0x1f0)]),this[_0x207d81(0x1f3)]=_0x391092[_0x207d81(0x1ea)]);};

})();