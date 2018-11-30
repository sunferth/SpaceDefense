class Ship extends PIXI.Sprite{
    constructor(x=sceneWidth/2,y=sceneHeight/2){
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.2);
        this.x = x;
        this.y = y;
		this.targetType = "close";
		this.health = 100;
		this.maxHealth = 100;
    }
	
	Fire(enemyArray){
		let target;
		if(this.targetType == "close"){
			//Find closest 
			target = enemyArray[0];
		}
		if(target.x < this.x){
			this.rotation = 3*Math.PI/2 + Math.atan((target.y -this.y)/(target.x-this.x));
		}
		else{
			this.rotation = Math.PI/2 + Math.atan((target.y -this.y)/(target.x-this.x));
		}
	}
	
    takeDamage(dmgAmount) {
        this.health -= dmgAmount;
        if(this.health <= 0)
        {
            endGame();
        }
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
        return allToSpawn;
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
		this.health  = health;
    }
    
    setPosition(x, y){
        this.x = x;
        this.y = y;
    }
}
class MeleeEnemy extends Enemy{
	constructor(){
		super();
	}
	attack(){
		if((((this.x - mainShip.x)*(this.x - mainShip.x)) + ((this.y - mainShip.y)*(this.y - mainShip.y))) < 0.5){
			this.alive = false;
            mainShip.takeDamage(2);
	    }
	}
}
class RangeEnemy extends Enemy{
	constructor(){
		super("range");
	}
	attack(){
		
	}
}
class BuffEnemy extends Enemy{
	constructor(){
		super("buff");
	}
	attack(){
		
	}
}
class NerfEnemy extends Enemy{
	constructor(){
		super("nerf");
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
        this.x = x;
        this.y = y;
        this.fwd = {x:0, y:-1};
        this.speed = 400;
		this.rotation = mainShip.rotation;
        this.isAlive = true;
        Object.seal(this);
    }
    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}
