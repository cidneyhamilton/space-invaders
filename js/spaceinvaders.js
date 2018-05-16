(function () {
    'use strict';

    class Drawable {
        init (x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        draw () {
        };
    };

    class Player extends Drawable {

        constructor() {
            super();
            this.bulletPool = new Pool(30);
            this.bulletPool.init("bullet");
            this.moveLeft = false;
            this.moveRight = false;
            this.speed = 3;
        }

        draw () {
            this.context.drawImage(Sprites.player, this.x, this.y);
        };

        move () {
            this.context.clearRect(this.x, this.y, this.width, this.height);
            if (this.moveLeft == true && this.x > 0) {
                console.log("Old x: " + this.x);
                console.log("Speed: " + this.speed);
                this.x -= this.speed;
                console.log("New x: " + this.x);
            } else if (this.moveRight == true && this.x + this.width < this.canvasWidth) {
                this.x += this.speed;
            }
            this.draw();
        }

        fire () {
            console.log("Firing!");
            this.bulletPool.get(this.x + this.width / 2, this.y - 8, 3);
        }
    };

    class Bullet extends Drawable {

        constructor (object) {
            super();
            this.alive = false;
            this.self = object;
        }

        spawn (x, y, speed) {
            this.x = x;
            this.y = y;
            this.speed = speed;
            this.alive = true;
        }
        
        draw () {
            console.log("X: " + this.x);
            console.log("Y: " + this.y);
            console.log("Width: " + this.width);
            console.log("Height: " + this.height);
            this.context.clearRect(this.x, this.y, this.width, this.height);
            this.y -= this.speed;
            if (this.y <= 0 - this.height) {
                return true;
            } else {
                this.context.drawImage(Sprites.bullet, this.x, this.y);
            }    
        }

        clear () {
            this.x = 0;
            this.y = 0;
            this.speed = 0;
            this.alive = false;
        }
    }

    class Pool {

        constructor (maxSize) {
            this.size = maxSize; // Max objects allowed in the pool
            this.pool = [];
        }
        
        /*
         * Populates the pool array with Bullet objects
         */
        init (object) {
            if (object === "bullet") {
                for (var i = 0; i < this.size; i++) {
                    // Initalize the bullet object
                    var bullet = new Bullet("bullet");
                    bullet.init(0, 0, Sprites.bullet.width,
                                Sprites.bullet.height);
                    this.pool[i] = bullet;
                } 
            } else if (object === "enemy") {
                for (var i = 0; i < this.size; i++) {
                    var enemy = new Enemy();
                    enemy.init(0, 0, Sprites.enemy.width, 
                        Sprites.enemy.height);
                    this.pool[i] = enemy;
                }
            }
        };
        /*
         * Grabs the last item in the list and initializes it and
         * pushes it to the front of the array.
         */
        get (x, y, speed) {
            if (!this.pool[this.size - 1].alive) {
                this.pool[this.size - 1].spawn(x, y, speed);
                this.pool.unshift(this.pool.pop());
            }
        };

        /*
         * Draws any in use Bullets. If a bullet goes off the screen,
         * clears it and pushes it to the front of the array.
         */
        animate () {
            for (var i = 0; i < this.size; i++) {
                // Only draw until we find a bullet that is not alive
                if (this.pool[i].alive) {
                    if (this.pool[i].draw()) {
                        this.pool[i].clear();
                        this.pool.push((this.pool.splice(i,1))[0]);
                    }
                } else {
                    break;
                }
            }
        };
    }

    class Enemy extends Drawable {

        constructor () {
            super();
            this.alive = false;
        }
        

        spawn (x, y, speed) {
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

        draw () {
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
            console.log("Setting up the game...");
            Game.player.draw();
            window.animate();
        }
    };

    window.init = function () {
        if (Game.init()) {
            Game.setup();
        }
    };

    window.animate = function() {
        requestAnimationFrame( window.animate );
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
            console.log("Moving left");
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