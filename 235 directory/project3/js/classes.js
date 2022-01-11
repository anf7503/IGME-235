class Ship extends PIXI.Sprite {
    constructor(x = 0) {
        super(app.loader.resources["images/spaceship.png"].texture);
        this.anchor.set(0.5, 0.5); // position, scaling, rotating, etc. are now from the center of the sprite
        this.scale.set(0.4);
        this.x = x;
        this.y = sceneHeight - 50;
    }
}

class Enemy extends PIXI.Sprite {
    constructor(speed, x=0, y=0) {
        super(app.loader.resources["images/enemy.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.2);
        this.x = x;
        this.y = y;
        //variables
        this.direction = 1;
        this.speed = speed;
        this.isAlive = true;
    }

    move(dt=1/60) {
        this.x += this.direction * this.speed * dt * 2;
    }

    reflectX() {
        this.direction *= -1;
    }
}

class Blockade extends PIXI.Sprite {
    constructor(x = 0, y = 0) {
        super(app.loader.resources["images/blockade.png"].texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.7);
        this.x = x;
        this.y = y;
        this.alpha = 1;
        // variables
        this.health = 3;
        this.isAlive = true;
    }
    decreaseHealth() {
        this.health--;
        this.alpha = 0.3 * this.health;
    }
}

class Bullet extends PIXI.Graphics {
    constructor(color=0xFF0000, x=0, y=0, enemy = false, speed = 400) {
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,4,6);
        this.endFill();
        this.x = x;
        this.y = y;
        //variables
        if (enemy) this.fwd = {x:0,y:1};
        else this.fwd = {x:0,y:-1};
        this.speed = speed;
        this.isAlive = true;
        Object.seal(this);
    }

    move(dt=1/60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}   
