class Ship extends PIXI.Sprite{
    constructor(x=sceneWidth/2,y=sceneHeight/2){
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.2);
        this.x = x;
        this.y = y;
    }
}

class Upgrade extends PIXI.Graphics{
    constructor(color=0xFF0000,texture="null", tier=0,active=false,){
        super();
		this.outline = color;
		this.image = texture;
		this.tier = tier;
		this.active = false;
        
    }
}
class Enemy extends PIXI.Sprite{
	constructor(type = "melee", health = 10){
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.3);
		this.type = type;
		let rand = getRandom(0,1);
		if(rand > 0.75){
			x = sceneWidth+5;
			y = getRandom(0,1)*sceneHeight;
		}
		else if(rand > 0.5){
			x = -5;
			y = getRandom(0,1)*sceneHeight;
		}
		else if(rand > 0.25){
			x = getRandom(0,1)*sceneWidth;
			y = sceneHeight+5;
		}
		else{
			x = getRandom(0,1)*sceneWidth;
			y = -5;
		}
        this.x = x;
        this.y = y;
		
		this.health  = health;
    }
	
	 move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
	
	attack(){
		if(this.type == "melee"){
			
		}
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
