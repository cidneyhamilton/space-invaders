(function () {
    'use strict';

    class SpriteManager {

        constructor() {
            this.assets = [];
            this.numLoaded = 0;
            this.cache = {};
            this.successCount = 0;
        }

        getAsset(path) {
            return this.cache[path];
        }

        queueAsset(path) {
            this.assets.push(path);
        }

        queueAll(callback) {
            for (let i = 0; i < this.assets.length; i++) {
                let path = this.assets[i];
                let img = new Image();
                let that = this;
                img.addEventListener("load", function() {
                    that.successCount++;
                    if (that.isDone()) {
                        callback();
                    }
                }, false);
                img.src = path;
                this.cache[path] = img;
            }
        }

        isDone() {
            return (this.assets.length === this.successCount);
        }

    };

    window.Sprites = new SpriteManager();
    Sprites.queueAsset("img/alien.png");
    Sprites.queueAsset("img/bullet.png");
    Sprites.queueAsset("img/bullet2.png");
    Sprites.queueAsset("img/tank.png");

    Sprites.queueAll(function() {
        Sprites.player = Sprites.getAsset("img/tank.png");
        Sprites.bullet = Sprites.getAsset("img/bullet.png");
        Sprites.enemyBullet = Sprites.getAsset("img/bullet2.png");
        Sprites.enemy = Sprites.getAsset("img/alien.png");
        window.init();
    });

}());