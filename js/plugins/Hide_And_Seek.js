//=============================================================================
// Hide_And_Seek.js
//=============================================================================
/*:
 * @plugindesc Этот плагин позволит персонажу прятаться внутырь объектов
 *
 * @author Klimber і WhitePapper
 *
 * @help
 *
 * По нажатию "Действия" скрывает игрока внутри объектов с командой Hide.
 * После второго нажатия "Действия" показывает игрока внутри объектов с командой 
 * Show.
 * Включает один переключатель, который фиксирует состояние "пряток".
 * 
 * TERMS OF USE
 * Костыль только для МОД_2 :).
 *
 * COMPATIBILITY
 * Пока не обнаружены. Да и по сути взяться им неоткуда.
 */

/* function Dont_Touch_Player(state){    
            console.log(state);
            return state;
        } // Для перевірки стану схованки гравця
var state;
        Dont_Touch_Player(state);

        */

(function(){
    var parameters = PluginManager.parameters('Hide_And_Seek');    
    var Hide_And_Seek_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args){
        Hide_And_Seek_pluginCommand.call(this, command, args);        
        if(command === 'Hide'){
            $gamePlayer._transparent = true;      
           // state = true;  
        }else if(command === 'Show'){
            $gamePlayer._transparent = false;      
           // state = false;  
        }
        return true;        
    };



var player_block_move = false;

Game_Player_moveByInput = Game_Player.prototype.moveByInput;
Game_Player.prototype.moveByInput = function() {
    if (!player_block_move){
        Game_Player_moveByInput.call(this);
    }
};    // Блокування руху гравця

})()  // Сховався
