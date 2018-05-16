(function () {
    'use strict';

    window.Sprites = new function () {
        this.player = new Image();
        this.player.src = "img/tank.png";

        this.bullet = new Image();
        this.bullet.src = "img/bullet.png";

        this.enemy = new Image();
        this.enemy.src = "img/alien.png";

        var numImages = 3;
        var numLoaded = 0;
        var imageLoaded = function () {
            numLoaded++;
            if (numLoaded === numImages) {
                window.init();
            }
        };

        this.player.onload = function () {
            imageLoaded();
        };

        this.bullet.onload = function () {
            imageLoaded();
        };

        this.enemy.onload = function () {
            imageLoaded();
        };
    };
}(window, undefined));