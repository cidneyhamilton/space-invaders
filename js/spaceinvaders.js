(function () {
    'use strict';

    class Drawable {

        init (x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.colliding = false;
        }

        draw () {
        };

        move () {
        };

        clear () {
            this.x = 0;
            this.y = 0;
            this.speed = 0;
            this.speedX = 0;
            this.speedY = 0;
            this.alive = false;
            this.colliding = false;
        };

        remove () {
            this.context.clearRect(this.x - 1, this.y - 1 , this.width + 2, this.height + 2);
        }
    };

    class Player extends Drawable {

        constructor() {
            super();
            this.bullets = new Collection(30);
            this.moveLeft = false;
            this.moveRight = false;
            this.speed = 3;
            this.alive = true;
        }

        spawn () {
            this.init(Game.playerStartX,
                Game.playerStartY,
                Sprites.player.width,
                Sprites.player.height);
            this.alive = true;
            this.bullets.init("bullet");
        }

        draw () {
            this.context.drawImage(Sprites.player, this.x, this.y); 
        };

        move () {
            this.remove();
            if (this.moveLeft == true && this.x > 0) {
                this.x -= this.speed;
            } else if (this.moveRight == true && this.x + this.width < this.canvasWidth) {
                this.x += this.speed;
            }
            if (this.colliding) {
                this.alive = false;
                Game.gameOver();
            } else {
                this.draw();   
            }
        }

        fire () {
            this.bullets.get(this.x + this.width / 2, this.y - 8, 3);
        }
    };

    class Bullet extends Drawable {

        constructor (object) {
            super();
            this.self = object;
            this.alive = false;
        }

        spawn () {

        }
        
        // Draws the bullet each frame
        // Returns true if the bullet is offscreen, false if it's still onscreen
        draw () {
            this.remove();

            // move the bullet each frame
            this.y += this.velocity;
            if (this.colliding) {
                return true;
            }
            if (this.isOffScreen()) {
                return true;
            } else {
                this.context.drawImage(this.sprite, this.x, this.y);
                return false;
            }    
        }

        // Returns true if bullet is out of bounds
        isOffScreen () {
            return false;
        }
    }

    class PlayerBullet extends Bullet {

        constructor () {
            super();
            this.sprite = Sprites.bullet;
            this.init(0, 0, Sprites.bullet.width, Sprites.bullet.height);
        }
        spawn (x, y, speed) {
            this.x = x;
            this.y = y;
            this.velocity = -speed;
            this.alive = true;
        }

        // Returns true if it went through the top of the screen
        isOffScreen () {
            return this.y <= 0 - this.height;
        }
    }

    class EnemyBullet extends Bullet {
        constructor () {
            super();
            this.sprite = Sprites.enemyBullet;
            this.init(0, 0, Sprites.enemyBullet.width, Sprites.enemyBullet.height);
        }

        spawn (x, y, speed) {
            this.x = x;
            this.y = y;
            this.velocity = speed;
            this.alive = true;
        }

        // Returns true if it went through the bottom of the screen
        isOffScreen() {
            return this.y >= this.canvasHeight;
        }
    }

    class Enemy extends Drawable {

        constructor () {
            super();
            this.alive = false;
            this.init(0, 0, Sprites.enemy.width, Sprites.enemy.height);
            this.percentFire = 3;
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
            this.bottomEdge = this.y + 180;
        }

        draw () {
            this.remove();
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.colliding) {
                Game.playerScore += 10;
                return true;
            }
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
            let chance = Math.floor(Math.random() * 500);
            if (chance < this.percentFire) {
                this.fire();
            }
            return false;
        }

        // Fires a bullet
        fire () {
            Game.enemyBullets.get(this.x + this.width/2, this.y + this.height, 2);
        }

    };

    class Collection {

        constructor (maxSize) {
            this.size = maxSize; // Max objects allowed in the Collection
            this.pool = [];
        }
        
        /*
         * Populates the Collection array with objects
         */
        init (type) {
            for (let i = 0; i < this.size; i++) {
                let newObject;
                if (type === "bullet") {
                    newObject = new PlayerBullet("bullet");
                    newObject.init(0,0, Sprites.bullet.width, Sprites.bullet.height);
                } else if (type === "enemy") {
                    newObject = new Enemy();
                    newObject.init(0,0, Sprites.enemy.width, Sprites.enemy.height);
                } else if (type === "enemyBullet") {
                    newObject = new EnemyBullet("enemyBullet");
                    newObject.init(0,0, Sprites.bullet.width, Sprites.bullet.height);
                }
                this.pool[i] = newObject;
            }
        };
        /*
         * Grabs the last item in the list and initializes it and
         * pushes it to the front of the array.
         */
        get (x, y, speed) {
            let item = this.pool[this.size - 1];
            if (item.alive) {
                // Item is alive
            } else {
                item.spawn(x, y, speed);
                this.pool.unshift(this.pool.pop());
            }
        };

        // Get all the items in the collection
        getAll() {
            let result = [];
            for (let i = 0; i < this.size; i++) {
                if (this.pool[i].alive) {
                    result.push(this.pool[i]);
                }
            }
            return result;
        };

        /*
         * Draws any in use Bullets. If a bullet goes off the screen,
         * clears it and pushes it to the front of the array.
         */
        animate () {
            for (let i = 0; i < this.size; i++) {
                // Only draw until we find a bullet that is not alive
                if (this.pool[i].alive) {
                    if (this.pool[i].draw()) {
                        this.pool[i].clear();
                        this.pool.push((this.pool.splice(i, 1))[0]);
                    }
                } else {
                    break;
                }
            }
        };

        isEmpty() {
            return this.getAll().length === 0;
        }
    }

    window.Game = {
        init: function () {
            Game.playerScore = 0;

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

                this.playerStartX = Game.playerCanvas.width / 2;
                this.playerStartY = Game.playerCanvas.height / 5 * 4;
                Game.enemies = new Collection(18);
                this.enemyBullets = new Collection(50);
                this.start();
                return true;
            } else {
                return false;
            }
        },
        start: function() {
            Game.player.spawn();
            Game.enemies.init("enemy");
            Game.spawnEnemies();                
            this.enemyBullets.init("enemyBullet");
        },
        spawnEnemies: function() {
            let height = Sprites.enemy.height;
            let width = Sprites.enemy.width;
            let x = width;
            let y = -height;
            let spacer = y * 1.2;
            for (let i = 1; i <= Game.enemies.size; i++) {
                Game.enemies.get(x, y, 5);
                x += width + 25;
                if (i % 6 == 0) {
                    x = width;
                    y += spacer
                }
            }
        },
        setup: function() {
            Game.player.draw();
            window.animate();
        },
        clearScreen: function() {
            Game.playerContext.clearRect(0, 0, 
                Game.playerCanvas.width,
                Game.playerCanvas.height);
            Game.mainContext.clearRect(0, 0,
                Game.mainCanvas.width,
                Game.mainCanvas.height); 
        },
        gameOver: function () {
            document.getElementById('game-info').textContent = "Game Over";
        },
        restart: function() {
            document.getElementById('game-info').textContent = "";
            Game.clearScreen();
            Game.start();
            Game.setup();
            Game.playerScore = 0;
        }
    };

    window.init = function () {
        if (Game.init()) {
            Game.then = Date.now();

            // Set up restart button
            document.getElementById("restart").addEventListener("click", Game.restart);
        }
    };

    // The main game loop
    window.animate = function () {
        if (Game.player.alive) {
            let now = Date.now();
            let delta = (now - Game.then);
            console.log("Delta: " + delta);
            requestAnimationFrame( window.animate );

            if (delta > 1000/60) {
                Game.player.move();
                Game.player.bullets.animate();
                Game.enemies.animate();
                Game.enemyBullets.animate();
                detectEnemyHits();
                detectPlayerHits(); 

                // spawn a new wave after enemies have been defeated
                if (Game.enemies.isEmpty()) {
                    Game.spawnEnemies(); 
                }

                document.getElementById('score').innerHTML = Game.playerScore;
                Game.then = now; 
            }

                  
        }
         
    }

    const detectCollisons = function(colliders) {
        for (let i = 0; i < colliders.length; i++) {
            let object1 = colliders[i];
            for (let j = i + 1; j < colliders.length; j++) {
                let object2 = colliders[j];
                if (isCollision(object1, object2)) {
                    object1.colliding = true;
                    object2.colliding = true;
                }
            }   
        }
    }

    const detectEnemyHits = function () {
        let objects = [];
        objects = objects.concat(Game.enemies.getAll());
        objects = objects.concat(Game.player.bullets.getAll());
        detectCollisons(objects);
    }

    const detectPlayerHits = function() {
        let objects = [];
        objects = objects.concat(Game.enemyBullets.getAll());
        objects = objects.concat(Game.player);
        detectCollisons(objects);
    }

    const isCollision = function(object1, object2) {
        if (object1.x < object2.x + object2.width 
            && object1.x + object1.width > object2.x 
            && object1.y < object2.y + object2.height
            && object1.y + object1.height > object2.y) {
            return true;
        }
        return false;
    }

}());