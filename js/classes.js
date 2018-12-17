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
		this.FireTime = 1;
		this.currentTime = 0;
    }
	
	Fire(enemyArray){
        
        // Only fire bullets if the game is not paused
        if(paused)
            return;
        
		let target;
		if(this.targetType == "close"){
			//Find closest 
			target = enemyArray[0];
		}
        
        // Make sure the enemy is within range; if not, don't shoot
		if(Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2) > 422500)
        {
            return;
        }
        
        // Set ship rotation to face the enemy
        if(target.x < this.x){
			this.rotation = 3*Math.PI/2 + Math.atan((target.y -this.y)/(target.x-this.x));
		}
		else{
			this.rotation = Math.PI/2 + Math.atan((target.y -this.y)/(target.x-this.x));
		}
		this.currentTime += 1/60;
		
		if(this.currentTime>this.FireTime){
			this.currentTime = 0;
			let b = new Bullet(0xFF0000,this.x,this.y);
			bullets.push(b);
			gameScene.addChild(b);
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


class Bullet extends PIXI.Graphics{
    constructor(color=0xFF0000, x=0, y=0){
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,4,6);
        this.endFill();
        this.active = false;
        this.x = x;
        this.y = y;
        this.speed = 400;
		this.rotation = mainShip.rotation;
		this.fwd = {x:Math.cos(this.rotation-Math.PI/2), y:Math.sin(this.rotation-Math.PI/2)};
        this.isAlive = true;
        Object.seal(this);
    }
    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
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
	constructor(type = "melee", health = 10, speed = 200){
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.3);
		this.type = type;
		this.health = health;
        this.speed = speed;
        this.isAlive = true;
		this.x = 0;
		this.y = 0;
        this.fwd = {x:0, y:0};
    }
    
    setPosition(x, y, shipX = sceneWidth/2, shipY = sceneHeight/2){
        this.x = x;
        this.y = y;
        this.fwd.x = shipX - this.x;
        this.fwd.y = shipY - this.y;
        let magnitude = Math.sqrt(Math.pow(this.fwd.x, 2) + Math.pow(this.fwd.y, 2));
        this.fwd.x /= magnitude;
        this.fwd.y /= magnitude;
        
        if(sceneWidth/2 < this.x){
			this.rotation = 3*Math.PI/2 + Math.atan((sceneHeight/2 -this.y)/(sceneWidth/2 -this.x));
		}
		else{
			this.rotation = Math.PI/2 + Math.atan((sceneHeight/2 -this.y)/(sceneWidth/2 - this.x));
		}
    }
	
	takeDamage(damage){
		this.health -= damage;
		if(this.health <= 0){
			this.isAlive = false;
		}
	}
    
    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

class MeleeEnemy extends Enemy{
	constructor(){
		super("melee");
	}
	attack(){
		if((((this.x - mainShip.x)*(this.x - mainShip.x)) + ((this.y - mainShip.y)*(this.y - mainShip.y))) < 5000){
			this.isAlive = false;
            mainShip.takeDamage(2);
            console.log(mainShip.health);
	    }
	}
}

class RangeEnemy extends Enemy{
	constructor(){
		super("range", 10, 200);
	}
	attack(){
		if((((this.x - mainShip.x)*(this.x - mainShip.x)) + ((this.y - mainShip.y)*(this.y - mainShip.y))) < 10000){
			this.isAlive = false;
            mainShip.takeDamage(2);
            console.log(mainShip.health);
	    }
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