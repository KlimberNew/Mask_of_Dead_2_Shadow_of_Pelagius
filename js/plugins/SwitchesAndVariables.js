 /*:
 * @plugindesc Упрощение работы с переключателями, локальными переключателями и переменными.
 * @author VarVarKa
*/

function gS (sw){
	return $gameSwitches.value(sw);
}

function gSs (num,value=1){
	if (value==1) {sw=true}
	if (value!=1) {sw=false}
	$gameSwitches.setValue(num, sw);
}

function gV (num){
	return $gameVariables.value(num);
}

function gVs (num,value){
	$gameVariables.setValue(num, value);
}

function sS (ev,letter=0,map=0){
	if (map==0) {map=$gameMap.mapId()}
	if (letter==0) {sw='A'}
	if (letter==1) {sw='B'}
	if (letter==2) {sw='C'}
	if (letter==3) {sw='D'}
	return $gameSelfSwitches.value([map,ev,sw]);
}

function sSs (ev,letter=0,value=1,map=0){
	if (map==0) {map=$gameMap.mapId()}
	if (letter==0) {sw='A'}
	if (letter==1) {sw='B'}
	if (letter==2) {sw='C'}
	if (letter==3) {sw='D'}
	if (value==1) {v=true}
	if (value!=1) {v=false}
	$gameSelfSwitches.setValue([map,ev,sw],v);
}

function mix(arr) {
  for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
  return arr;
}