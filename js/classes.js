class Ship extends PIXI.Sprite{
    constructor(x=sceneWidth/2,y=sceneHeight){
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.1);
        this.x = x;
        this.y = y;
    }
}

class Upgrade extends PIXI.Graphics{
    constructor(color=0xFF0000,texture="null", tier=0,active=false,){
        super();
        
    }
}

class Bullet extends PIXI.Graphics{
    constructor(color=0xFF0000, x=0, y=0){
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,4,6);
        this.endFill();
        this.active = false;
        this.x= x;
        this.y = y;
        this.fwd = {x:0, y:-1};
        this.speed = 400;
        this.isAlive = true;
        Object.seal(this);
    }
    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}
