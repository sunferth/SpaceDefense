// Class used for the main ship at the center of the screen
class Ship extends PIXI.Sprite{
    // Spawn a ship at the center of the screen
    constructor(x=sceneWidth/2,y=sceneHeight/2){
        super(PIXI.loader.resources["images/Spaceship.png"].texture);
        this.anchor.set(0.5,0.5);
        this.x = x;
        this.y = y;
		this.targetType = "close";
		this.health = 1000;
		this.maxHealth = 1000;
		this.rotationDivider = 256;
		this.shotsPerSec = 1;
		this.shotsToFire = 1;
		this.currentTime = 0;
		this.bulletDamage = 1;
		this.defense = 0;
        this.shotCooldown = 1.0;
        this.timeMultiplier = 1.0;
        this.enemyBullets = [];
    }
	
    // Fire bullets in the surrounding area based off delta time and upgrades
	fire(enemyArray, dt=0){
        // Only fire bullets if the game is not paused
        if(paused)
            return;
        
        // Every second, the nerf effect multiplier will fall by 5%, to a minimum of 100%
        if(this.timeMultiplier <= 1.0)
            this.timeMultiplier = 1.0;
        else
            this.timeMultiplier -= dt * 0.05;
        this.shotCooldown += dt;
        
        // Constantly rotate at a fixed rate
		this.rotation = this.rotation + Math.PI/this.rotationDivider/this.timeMultiplier;
		this.currentTime += dt;
		
        // Shoot a shot if the ship hasn't shot within timeMultiplier/shotsPerSec seconds
		if(this.currentTime>(1/this.shotsPerSec)*this.timeMultiplier){
			if(this.shotsToFire % 2 == 0){
				let startRotation = this.shotsToFire/2 - 0.5;
                startRotation = -Math.PI/32*startRotation + mainShip.rotation;
				for(let i = 0; i<this.shotsToFire;i++){
					this.currentTime = 0;
					let b = new Bullet(0xFF0000,this.x,this.y,startRotation, this.bulletDamage);
					bullets.push(b);
					gameScene.addChild(b);
					startRotation+= Math.PI/32;
				}
			}
			else{
				let startRotation = (this.shotsToFire - 1)/2;
				startRotation = -Math.PI/32*startRotation + mainShip.rotation;
				for(let i = 0; i<this.shotsToFire;i++){
					this.currentTime = 0;
					let b = new Bullet(0xFF0000,this.x,this.y,startRotation, this.bulletDamage);
					bullets.push(b);
					gameScene.addChild(b);
					startRotation+= Math.PI/32;
				}
			}
		}
	}
	
    // Take damage, optionally adding a status effect
    takeDamage(dmgAmount, statusEffect="none") {
		// Reduce incoming damage by the defense value
        dmgAmount /= Math.floor((3+this.defense)/3);
        
		if(dmgAmount < 0){
			return;
		}
        
        // Update the displayed health
        this.health -= dmgAmount;
		lifeLabel.text = "Health: "+this.health;
        
        // Play a sound if actual damage was taken
        if(dmgAmount > 0)
        {
            shootSound.play();
        }
        
        if(this.health <= 0)
        {
            endGame();
        }
        
        // If the damage is tagged with a "nerf" effect, halve the effective turn/fire rate temporarily
        switch(statusEffect)
        {
            case "none":
                break;
            case "nerf":
                this.timeMultiplier = 2;
            default:
                break;
        }
    }
}

// Bullets shot by the main ship at enemies
class Bullet extends PIXI.Graphics{
    // Construct a red rectangle and apply position/velocity properties
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
    // Move based on delta time
    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

// Helper class used to read lines of waves.txt and spawn in mobs
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

// Base enemy class with movement, rotation and positioning properties
class Enemy extends PIXI.Sprite{
    // Spawn in an enemy with health scaling relative to the levelNum
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
    
    // Called by startWave(); sets the position of each ship on screen with all ships moving towards the center
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
	
    // Take damage either from being clicked or shot
	takeDamage(damage){
		this.health -= damage;
		if(this.health <= 0){
			this.isAlive = false;
			money+=5*moneyMulti;
			moneyLabel.text = "Money: "+money;
		}
	}
    
    // Move based off delta time
    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
}

// An enemy that outputs a one-time use proximity attack if colliding, then dies
class MeleeEnemy extends Enemy{
	constructor(){
		super("melee",Math.floor(10*Math.pow(1.1,levelNum)),250,PIXI.loader.resources["images/AlienMelee.png"].texture);
	}
    // Damage the main ship if it is within ~70 pixels
	attack(dt){
		if((((this.x - mainShip.x)*(this.x - mainShip.x)) + ((this.y - mainShip.y)*(this.y - mainShip.y))) < 5000){
			this.isAlive = false;
            mainShip.takeDamage(20+levelNum);
	    }
	}
}

// An enemy that slows to a stop close to the main ship and shoots projectiles until shot
class RangeEnemy extends Enemy{
    // Spawn in an enemy with health scaling relative to the levelNum
	constructor(){
		super("range",Math.floor(10*Math.pow(1.1,levelNum)),250,PIXI.loader.resources["images/AlienRange.png"].texture);
        this.cooldown = 2.5;
        this.currentCooldown = 0.0;
	}
    // Slow down at ~270 pixels away, stop and fire upon the ship once within range
	attack(dt){
		if((((this.x - mainShip.x)*(this.x - mainShip.x)) + ((this.y - mainShip.y)*(this.y - mainShip.y))) < 75000){
			this.speed /= 1.05;
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

// Bullets fired by the RangeEnemy class; unstoppable and will damage the ship unless the level ends beforehand
class EnemyBullet extends PIXI.Graphics{
    // Spawn in a bullet at the RangeEnemy's current location
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
    // Move closer to the ship; if it is within ~44 pixels, collide with the ship and damage it
    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
        if((((this.x - mainShip.x)*(this.x - mainShip.x)) + ((this.y - mainShip.y)*(this.y - mainShip.y))) < 2000){
            this.isAlive = false;
            mainShip.takeDamage(10 + levelNum);
        }
    }
}

// NOTE: BuffEnemy not used in current build
/* class BuffEnemy extends Enemy{
	constructor(){
		super("buff");
	}
	attack(dt){
		
	}
} */

// A melee attack enemy that temporarily slows down the ship's fire rate and rotation rate upon collision
class NerfEnemy extends Enemy{
    // Spawn in an enemy with health scaling relative to the levelNum
	constructor(){
		super("nerf",Math.floor(10*Math.pow(1.1,levelNum)),250,PIXI.loader.resources["images/AlienNerf.png"].texture);
	}
    // If the ship is within ~70 pixels, collide and cause damage
	attack(dt){
        if((((this.x - mainShip.x)*(this.x - mainShip.x)) + ((this.y - mainShip.y)*(this.y - mainShip.y))) < 5000){
            this.isAlive = false;
            mainShip.takeDamage(20+levelNum, "nerf");
        }
	}
}