(function () {
    'use strict';

    window.Sprites = new function () {
        this.player = new Image();
        this.player.src = "img/tank.png";

        this.bullet = new Image();
        this.bullet.src = "img/bullet.png";

        this.enemy = new Image();
        this.enemy.src = "img/alien.png";

        const numImages = 3;
        let numLoaded = 0;
        const imageLoaded = function () {
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