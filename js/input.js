(function () {
    'use strict';

    document.onkeydown = function(e) {
        let keyCode = (e.keyCode) ? e.keyCode : e.charCode;
        // SPACE
        if (keyCode === 32) {
            e.preventDefault();
            Game.player.fire();
        }
        if (keyCode === 37) {
            e.preventDefault();
            Game.player.moveLeft = true;
        }
        if (keyCode == 39) {
            e.preventDefault();
            Game.player.moveRight = true;
        }
    }

    document.onkeyup = function(e) {
        let keyCode = (e.keyCode) ? e.keyCode : e.charCode;
        if (keyCode === 37) {
            e.preventDefault();
            Game.player.moveLeft = false;
        }
        if (keyCode == 39) {
            e.preventDefault();
            Game.player.moveRight = false;
        }
    }

}());