class Ship extends PIXI.Sprite{
    constructor(x=sceneWidth/2,y=sceneHeight/2){
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.2);
        this.x = x;
        this.y = y;
		this.targetType = "first";
		this.health = 100;
		this.maxHealth = 100;
    }
	
	Fire(enemyArray){
		let target;
		if(this.targetType == "first"){
			target = enemyArray[0];
		}
		this.rotation = -45/57.2958;
		this.rotation = 5*Math.atan((target.y -this.y)/(target.x-this.x));
		console.log(this.rotation);
					
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
class Wave{
    constructor(mel,ran,buf,ner){
	   this.melee = mel;
	   this.range = ran;
	   this.buff = buf;
	   this.nerf = ner;
    }
    spawn(){
	   let allToSpawn = [];
		for(let i = 0; i<this.melee; i++){
			allToSpawn.push(new MeleeEnemy());
		}
		for(let i = 0; i<this.range; i++){
			allToSpawn.push(new RangeEnemy());
		}
		for(let i = 0; i<this.buff; i++){
			allToSpawn.push(new BuffEnemy());
		}
		for(let i = 0; i<this.nerf; i++){
			allToSpawn.push(new NerfEnemy());
		}
		gameScene.addChild(allToSpawn);
	   
    }
}
class Enemy extends PIXI.Sprite{
	constructor(type = "melee", health = 10){
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.3);
		this.type = type;
		this.x = 0;
		this.y = 0;
		let x;
		let y;
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
}
class MeleeEnemy extends Enemy{
	constructor(){
		super();
	}
	attack(){
		if((((this.x - mainShip.x)*(this.x - mainShip.x)) + ((this.y - mainShip.y)*(this.y - mainShip.y))) < 0.5){
			this.alive = false;
			mainShip.health -= 2;
	    }
	}
}
class RangeEnemy extends Enemy{
	constructor(){
		super();
	}
	attack(){
		
	}
}
class BuffEnemy extends Enemy{
	constructor(){
		super();
	}
	attack(){
		
	}
}
class NerfEnemy extends Enemy{
	constructor(){
		super();
	}
	attack(){
		
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
