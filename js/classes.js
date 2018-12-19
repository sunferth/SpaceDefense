class Ship extends PIXI.Sprite{
    constructor(x=sceneWidth/2,y=sceneHeight/2){
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(0.5,0.5);
        this.x = x;
        this.y = y;
		this.targetType = "close";
		this.health = 1000;
		this.maxHealth = 1000;
		this.rotationDivider = 256;
		this.ShotsPerSec = 1;
		this.ShotsToFire = 1;
		this.currentTime = 0;
		this.bulletDamage = 1;
		this.defense = 0;
		this.fireTime = 2;
        this.shotCooldown = 1.0;
        this.timeMultiplier = 1.0;
        this.enemyBullets = [];
    }
	
	Fire(enemyArray, dt=0){
        
        // Only fire bullets if the game is not paused
        if(paused)
            return;
        
        // Every second, the nerf effect multiplier will fall by 5%, to a minimum of 100%
        if(this.timeMultiplier <= 1.0)
            this.timeMultiplier = 1.0;
        else
            this.timeMultiplier -= dt * 0.05;
        this.shotCooldown += dt;
        
        
		// let target;
		// if(this.targetType == "close"){
		//  Find closest 
		//  target = enemyArray[0];
		//}
        
        // Make sure the enemy is within range; if not, don't shoot
		//if(gameScene.visible == true && Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2) > 422500)
        //{
        //    return;
        //}
        
        // Set ship rotation to face the enemy
        //if(gameScene.visible == true && target.x < this.x){
		//	this.rotation = 3*Math.PI/2 + Math.atan((target.y -this.y)/(target.x-this.x));
		//}
		//else if(gameScene.visible == true){
		//	this.rotation = Math.PI/2 + Math.atan((target.y -this.y)/(target.x-this.x));
		//}
		this.rotation = this.rotation + Math.PI/this.rotationDivider;
		this.currentTime += 1/60;
		
		if(this.currentTime>(1/this.ShotsPerSec)*this.timeMultiplier){
			if(this.ShotsToFire % 2 == 0){
				let startRotation = this.ShotsToFire/2 - 0.5;
                startRotation = -Math.PI/32*startRotation + mainShip.rotation;
				for(let i = 0; i<this.ShotsToFire;i++){
					this.currentTime = 0;
					let b = new Bullet(0xFF0000,this.x,this.y,startRotation, this.bulletDamage);
					bullets.push(b);
					gameScene.addChild(b);
					startRotation+= Math.PI/32;
				}
			}
			else{
				let startRotation = (this.ShotsToFire - 1)/2;
				startRotation = -Math.PI/32*startRotation + mainShip.rotation;
				for(let i = 0; i<this.ShotsToFire;i++){
					this.currentTime = 0;
					let b = new Bullet(0xFF0000,this.x,this.y,startRotation, this.bulletDamage);
					bullets.push(b);
					gameScene.addChild(b);
					startRotation+= Math.PI/32;
				}
			}
		}
	}
	
    takeDamage(dmgAmount, statusEffect="none") {
		dmgAmount /= (3+this.defense)/3;
		if(dmgAmount < 0){
			return;
		}
        this.health -= dmgAmount;
		lifeLabel.text = "Health: "+this.health;

        if(this.health <= 0)
        {
            endGame();
        }
        switch(statusEffect)
        {
            case "none":
                break;
            case "nerf":
                this.timeMultiplier = 2; // Increase the nerf effect timer by 100% (at base speed, reduce fire rate by 50%)
            default:
                break;
        }
    }
}


class Bullet extends PIXI.Graphics{
    constructor(color=0xFF0000, x=0, y=0, rotation = mainShip.rotation, damage = 10){
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,4,6);
        this.endFill();
        this.active = false;
        this.x = x;
        this.y = y;
        this.speed = 400;
		this.rotation = rotation;
		this.damage = damage;
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
    constructor(color=0xFF0000, type = 0, tier=0, visible=false,purchased = false){
        super();
		this.outline = color;
		this.image = texture;
		this.tier = tier;
		this.visible = visible;
		this.purchased = purchased;
        
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
	constructor(type = "melee", health = 100, speed = 250, texture){
        super(texture);
        this.anchor.set(0.5,0.5);
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
            fireballSound.play();
			money+=5*moneyMulti;
			moneyLabel.text = "Money: "+money;
		}
	}
    
    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

class MeleeEnemy extends Enemy{
	constructor(){
		super("melee",Math.floor(10*Math.pow(1.1,levelNum)),250,PIXI.loader.resources["images/AlienMelee.png"].texture);
	}
	attack(dt){
		if((((this.x - mainShip.x)*(this.x - mainShip.x)) + ((this.y - mainShip.y)*(this.y - mainShip.y))) < 5000){
			this.isAlive = false;
            mainShip.takeDamage(20+levelNum);
            console.log(mainShip.health);
	    }
	}
}

class RangeEnemy extends Enemy{
	constructor(){
		super("range",Math.floor(10*Math.pow(1.1,levelNum)),250,PIXI.loader.resources["images/AlienRange.png"].texture);
        this.cooldown = 2.5;
        this.currentCooldown = 0.0;
	}
	attack(dt){
		if((((this.x - mainShip.x)*(this.x - mainShip.x)) + ((this.y - mainShip.y)*(this.y - mainShip.y))) < 75000){
			this.speed /= 1.02;
            // Shoot a shot every (this.cooldown) seconds 
            this.currentCooldown += dt;
            if(this.currentCooldown >= this.cooldown)
            {
                this.currentCooldown = 0;
                mainShip.enemyBullets.push(new EnemyBullet(this.x, this.y, this.fwd, this.rotation));
            }
	    }
	}
}

class EnemyBullet extends PIXI.Graphics{
    constructor(x,y,dir,rotation,color=0xFF0000){
        super();
        this.beginFill(color);
        this.drawRect(-2,-3,4,6);
        this.endFill();
        this.active = false;
        this.x = x;
        this.y = y;
        this.speed = 250;
		this.rotation = rotation;
		this.fwd = dir;
        this.isAlive = true;
        Object.seal(this);
        gameScene.addChild(this);
    }
    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
        if((((this.x - mainShip.x)*(this.x - mainShip.x)) + ((this.y - mainShip.y)*(this.y - mainShip.y))) < 2000){
            this.isAlive = false;
            mainShip.takeDamage(10 + levelNum);
            console.log(mainShip.health);
        }
    }
}

// NOTE: BuffEnemy not used
/* class BuffEnemy extends Enemy{
	constructor(){
		super("buff");
	}
	attack(dt){
		
	}
} */

class NerfEnemy extends Enemy{
	constructor(){
		super("nerf",Math.floor(10*Math.pow(1.1,levelNum)),250,PIXI.loader.resources["images/AlienNerf.png"].texture);
	}
	attack(dt){
        if((((this.x - mainShip.x)*(this.x - mainShip.x)) + ((this.y - mainShip.y)*(this.y - mainShip.y))) < 5000){
            this.isAlive = false;
            mainShip.takeDamage(20+levelNum, "nerf");
            console.log(mainShip.health);
        }
	}
}