var player_block_move = false;

Game_Player_moveByInput = Game_Player.prototype.moveByInput;
Game_Player.prototype.moveByInput = function() {
    if (!player_block_move){
        Game_Player_moveByInput.call(this);
    }
};