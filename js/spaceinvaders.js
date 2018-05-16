(function () {
    'use strict';

    var Sprites = new function () {
        this.player = new Image();
        this.player.src = "img/tank.png";

        this.bullet = new Image();
        this.bullet.src = "img/bullet.png";

        this.enemy = new Image();
        this.enemy.src = "img/alien.png";

        var numImages = 3;
        var numLoaded = 0;
        var imageLoaded = function() {
            numLoaded++;
            if (numLoaded === numImages) {
                init();
            }
        }
        this.player.onload = function() {
            imageLoaded();
        }

        this.bullet.onload = function() {
            imageLoaded();
        }

        this.enemy.onload = function()  {
            imageLoaded();
        }
    };

    var Drawable = function () {
        this.init = function (x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        };

        this.speed = 0;

        this.canvasWidth = 0;
        this.canvasHeight = 0;

        this.draw = function () {
        };
    };

    var Player = function () {
        this.bulletPool = new Pool(30);
        this.bulletPool.init("bullet");
        this.moveLeft = false;
        this.moveRight = false;
        this.speed = 3;
        this.draw = function () {
            this.context.drawImage(Sprites.player, this.x, this.y);
        };

        this.move = function() {
            this.context.clearRect(this.x, this.y, this.width, this.height);
            if (this.moveLeft == true && this.x > 0) {
                this.x -= this.speed;
            } else if (this.moveRight == true && this.x + this.width < this.canvasWidth) {
                console.log("Canvas width: " + this.canvasWidth);
                this.x += this.speed;
            }
            this.draw();
        }

        this.fire = function() {
            console.log("Firing!");
            this.bulletPool.get(this.x + this.width/2, this.y - 8, 3);
        }
    };

    Player.prototype = new Drawable();

    var Bullet = function (object) {
        this.alive = false;
        this.self = object;
        this.spawn = function(x, y, speed) {
            this.x = x;
            this.y = y;
            this.speed = speed;
            this.alive = true;
        };

        this.draw = function() {
            this.context.clearRect(this.x, this.y, this.width, this.height);
            this.y -= this.speed;
            if (this.y <= 0 - this.height) {
                return true;
            } else {
                this.context.drawImage(Sprites.bullet, this.x, this.y);
            }    
        };

        this.clear = function() {
            this.x = 0;
            this.y = 0;
            this.speed = 0;
            this.alive = false;
        }
    };

    Bullet.prototype = new Drawable();

    var Pool = function(maxSize) {
        var size = maxSize; // Max objects allowed in the pool
        var pool = [];

        /*
         * Populates the pool array with Bullet objects
         */
        this.init = function (object) {
            if (object === "bullet") {
                for (var i = 0; i < size; i++) {
                    // Initalize the bullet object
                    var bullet = new Bullet("bullet");
                    bullet.init(0,0, Sprites.bullet.width,
                                Sprites.bullet.height);
                    pool[i] = bullet;
                } 
            } else if (object === "enemy") {
                for (var i = 0; i < size; i++) {
                    var enemy = new Enemy();
                    enemy.init(0,0, Sprites.enemy.width, 
                        Sprites.enemy.height);
                    pool[i] = enemy;
                }
            }
            
        };
        /*
         * Grabs the last item in the list and initializes it and
         * pushes it to the front of the array.
         */
        this.get = function(x, y, speed) {
            if (!pool[size - 1].alive) {
                pool[size - 1].spawn(x, y, speed);
                pool.unshift(pool.pop());
            }
        };

        /*
         * Draws any in use Bullets. If a bullet goes off the screen,
         * clears it and pushes it to the front of the array.
         */
        this.animate = function() {
            for (var i = 0; i < size; i++) {
                // Only draw until we find a bullet that is not alive
                if (pool[i].alive) {
                    if (pool[i].draw()) {
                        pool[i].clear();
                        pool.push((pool.splice(i,1))[0]);
                    }
                }
                else
                    break;
            }
        };
    }

    var Enemy = function() {
        this.alive = false;

        this.spawn = function(x, y, speed) {
            this.x = x;
            this.y = y;
            this.speed = speed;
            this.speedX = 0;
            this.speedY = speed;
            this.alive = true;
            this.leftEdge = this.x - 90;
            this.rightEdge = this.x + 90;
            this.bottomEdge = this.y + 140;
        }

        this.draw = function() {
            console.log("Draw enemy");
            this.context.clearRect(this.x - 1, this.y, this.width + 1, this.height);
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x <= this.leftEdge) {
                this.speedX = this.speed;
            } else if (this.x >= this.rightEdge + this.width) {
                this.speedX = -this.speed;
            } else if (this.y >= this.bottomEdge) {
                this.speed = 1.5;
                this.speedY = 0;
                this.y -= 5;
                this.speedX = -this.speed;
            }

            this.context.drawImage(Sprites.enemy, this.x, this.y);

            // TODO: fire bullets
        }
    };

    Enemy.prototype = new Drawable();

    var Game = {
        init: function () {
            console.log("Initializing game.");
            // Get the canvases
            Game.playerCanvas = document.getElementById("player");
            Game.playerContext = Game.playerCanvas.getContext("2d");

            Game.mainCanvas = document.getElementById("main");
            Game.mainContext = Game.playerCanvas.getContext("2d");
            if (Game.playerContext) {
                Player.prototype.context = Game.playerContext;
                Player.prototype.canvasHeight = Game.playerCanvas.height;
                Player.prototype.canvasWidth = Game.playerCanvas.width;

                Bullet.prototype.context = Game.mainContext;
                Bullet.prototype.canvasHeight = Game.mainCanvas.height;
                Bullet.prototype.canvasWidth = Game.mainCanvas.width;

                Enemy.prototype.context = Game.mainContext;
                Enemy.prototype.canvasHeight = Game.mainCanvas.height;
                Enemy.prototype.canvasWidth = Game.mainCanvas.width;

                Game.player = new Player();

                var playerStartX = Game.playerCanvas.width / 2;
                var playerStartY = Game.playerCanvas.height / 4 * 3;
                Game.player.init(playerStartX, 
                    playerStartY, 
                    Sprites.player.width, 
                    Sprites.player.height);

                Game.enemies = new Pool(30);
                Game.enemies.init("enemy");

                var height = Sprites.enemy.height;
                var width = Sprites.enemy.width;
                var x = 100;
                var y = -height;
                var spacer = y * 1.5;
                for (var i = 1; i <= 18; i++) {
                    Game.enemies.get(x, y, 2);
                    x += width + 25;
                    if (i % 6 == 0) {
                        x = 100;
                        y += spacer
                    }
                }

                return true;
            } else {
                console.log("Canvas not supported!");
                return false;
            }
            
        },
        setup: function() {
            Game.player.draw();
            animate();
            
        }
    };

    var init = function () {
        if (Game.init()) {
            Game.setup();
        }
    };

    var animate = function() {
        requestAnimationFrame( animate );
        Game.player.move();
        Game.player.bulletPool.animate();
        Game.enemies.animate();
    }

    document.onkeydown = function(e) {
        var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
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
        var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
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