// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application(1024,768);
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	


// pre-load the images
PIXI.loader.
add(["images/Spaceship.png","images/explosions.png","images/SpaceBackground.png","UpgradeImages/AOE.png","UpgradeImages/Box.png","UpgradeImages/Bullets.png","UpgradeImages/ClickDam.png","UpgradeImages/Damage.png","UpgradeImages/Defense.png","UpgradeImages/FireRate.png","UpgradeImages/SpinUpgrade.png","UpgradeImages/Money.png","images/AlienMelee.png","images/AlienRange.png"]).
on("progress",e=>{console.log(`progress=${e.progress}`)}).
load(setup);

// aliases
let stage;

// game variables
let startScene;
let gameScene,ship,moneyLabel,lifeLabel,shootSound,hitSound,fireballSound;
let transitionLabel;
let transitionScene;
let MouseButtonAOE;
let MouseButtonDam;
let ShipSpin;
let FireButt;
let ShipDamButt;
let ShipDefButt;
let BulletButt;
let MoneyButt;
let shopScene;
let mainShip;
let mouseDam = 5;
let moneyMulti = 1;
let mouseAOE = 1;
let bullets = [];
let aliens = [];
let upgrades = [];
let explosionTextures;
let score = 0;
let money = 1000;
let life = 100;
let waveArray = [];
let levelNum = 1;
let paused = true;
let distMod = 400; // Used for determining how far apart enemies will spawn (25 + Math.random(0, distMod));

function setup() {
	mainShip = new Ship();
    $.get('waves.txt', function(data) {
    SetUpWaves(data)
	}, 'text');
	
    stage = app.stage;
	
    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
	startScene.visible = true;
    stage.addChild(startScene);
	
    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
	
    // #3 - Create the main `game` scene and make it invisible
    shopScene = new PIXI.Container();
	SetUpShop();
    shopScene.visible = false;
    stage.addChild(shopScene);
	
	transitionScene = new PIXI.Container();
    transitionScene.visible = false;
	let transitionButton = new PIXI.Text("Protect your ship!");
    transitionButton.style = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 36,
        fontFamily: "Impact"});
    transitionButton.x = 300;
    transitionButton.y = sceneHeight - 100;
    transitionButton.interactive = true;
    transitionButton.buttonMode = true;
    transitionButton.on("pointerup",startGame);
    transitionButton.on('pointerover',e=> e.target.alpha = 0.7);
    transitionButton.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    transitionScene.addChild(transitionButton);
    stage.addChild(transitionScene);
	
    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();
    // #5 - Create ship
    
    gameScene.addChild(mainShip);
    // #6 - Load Sounds
    {
    shootSound = new Howl({
        src: ['sounds/shoot.wav']
    });

    hitSound = new Howl({
        src: ['sounds/hit.mp3']
    });

    fireballSound = new Howl({
        src: ['sounds/fireball.mp3']
    });
    }
    // #7 - Load sprite sheet
    explosionTextures = loadSpriteSheet("images/explosions.png");
    // #8 - Start update loop
    app.ticker.add(gameLoop);
    // #9 - Start listening for click events on the canvas
    app.view.onclick = clickEvent;
    // Now our `startScene` is visible
    // Clicking the button calls startGame()
}

// Uses waves.txt and stores all wave-related data in waveArray[...]
function SetUpWaves(data){
	 let wavesString = [];
	 wavesString = data.split("\n");
     // Starts at i = 1 to account for the first line being documentation
	 for(let i = 1; i<wavesString.length;i++){
		  let waveString = wavesString[i].split(",");
		  waveArray[i] = new Wave(parseInt(waveString[0].trim()),parseInt(waveString[1].trim()),parseInt(waveString[2].trim()),parseInt(waveString[3].trim()));
	 }
    // Remove empty first element
    waveArray.shift();
    console.log(waveArray);
}

function SetUpShop(){
	let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 36,
        fontFamily: "Impact"
    });
	
	upgrades = [0,0,0,0,0,0,0,0];
	//Draw Title
	let shopTitle = new PIXI.Text("SHOP");
    shopTitle.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 110,
        fontFamily: "Impact",
        stroke:0xFF0000,
        stokeThickness: 6
    });
    shopTitle.x = 320;
    shopTitle.y = 10;
    shopScene.addChild(shopTitle);
	//Draw Money Label
	
	//Draw ShipSubCat
	let shipLabel = new PIXI.Text("Ship Upgrades");
    shipLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 70,
        fontFamily: "Impact",
        stroke:0xFF0000,
        stokeThickness: 6
    });
    shipLabel.x = 35;
    shipLabel.y = 150;
    shopScene.addChild(shipLabel);
	//Draw 6 Upgrade Icons
	let ShipSpinIcon = new PIXI.Sprite.fromImage("UpgradeImages/SpinUpgrade.png");
	ShipSpinIcon.width = 100;
	ShipSpinIcon.height = 140;
	ShipSpinIcon.x = 35;
	ShipSpinIcon.y = 220;
	shopScene.addChild(ShipSpinIcon);
	let FireRateIcon = new PIXI.Sprite.fromImage("UpgradeImages/FireRate.png");
	FireRateIcon.width = 200;
	FireRateIcon.height = 140;
	FireRateIcon.x = 75;
	FireRateIcon.y = 220;
	shopScene.addChild(FireRateIcon);
	let ShipDamIcon = new PIXI.Sprite.fromImage("UpgradeImages/Damage.png");
	ShipDamIcon.width = 100;
	ShipDamIcon.height = 140;
	ShipDamIcon.x = 330;
	ShipDamIcon.y = 220;
	shopScene.addChild(ShipDamIcon);
	let DefIcon = new PIXI.Sprite.fromImage("UpgradeImages/Defense.png");
	DefIcon.width = 100;
	DefIcon.height = 140;
	DefIcon.x = 485;
	DefIcon.y = 220;
	shopScene.addChild(DefIcon);
	let BullFiredIcon = new PIXI.Sprite.fromImage("UpgradeImages/Bullets.png");
	BullFiredIcon.width = 100;
	BullFiredIcon.height = 140;
	BullFiredIcon.x = 635;
	BullFiredIcon.y = 220;
	shopScene.addChild(BullFiredIcon);
	let MoneyMultiIcon = new PIXI.Sprite.fromImage("UpgradeImages/Money.png");
	MoneyMultiIcon.width = 100;
	MoneyMultiIcon.height = 140;
	MoneyMultiIcon.x = 785;
	MoneyMultiIcon.y = 220;
	shopScene.addChild(MoneyMultiIcon);
	//Draw Buttons
	ShipSpin = new PIXI.Text("Cost: " + Math.pow(10,upgrades[0]));
    ShipSpin.style = buttonStyle;
    ShipSpin.x = 35;
    ShipSpin.y = 375;
    ShipSpin.interactive = true;
    ShipSpin.buttonMode = true;
    ShipSpin.on("pointerup",spinUpgrade);
    ShipSpin.on('pointerover',e=> e.target.alpha = 0.7);
    ShipSpin.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(ShipSpin);
	
	FireButt = new PIXI.Text("Cost: " + Math.pow(10,upgrades[0]));
    FireButt.style = buttonStyle;
    FireButt.x = 185;
    FireButt.y = 375;
    FireButt.interactive = true;
    FireButt.buttonMode = true;
    FireButt.on("pointerup",fireUpgrade);
    FireButt.on('pointerover',e=> e.target.alpha = 0.7);
    FireButt.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(FireButt);
	
	ShipDamButt = new PIXI.Text("Cost: " + Math.pow(10,upgrades[0]));
    ShipDamButt.style = buttonStyle;
    ShipDamButt.x = 335;
    ShipDamButt.y = 375;
    ShipDamButt.interactive = true;
    ShipDamButt.buttonMode = true;
    ShipDamButt.on("pointerup",shipDamUpgrade);
    ShipDamButt.on('pointerover',e=> e.target.alpha = 0.7);
    ShipDamButt.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(ShipDamButt);
	
	ShipDefButt = new PIXI.Text("Cost: " + Math.pow(10,upgrades[0]));
    ShipDefButt.style = buttonStyle;
    ShipDefButt.x = 485;
    ShipDefButt.y = 375;
    ShipDefButt.interactive = true;
    ShipDefButt.buttonMode = true;
    ShipDefButt.on("pointerup",shipDefUpgrade);
    ShipDefButt.on('pointerover',e=> e.target.alpha = 0.7);
    ShipDefButt.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(ShipDefButt);
	
	BulletButt = new PIXI.Text("Cost: " + Math.pow(10,upgrades[0]));
    BulletButt.style = buttonStyle;
    BulletButt.x = 635;
    BulletButt.y = 375;
    BulletButt.interactive = true;
    BulletButt.buttonMode = true;
    BulletButt.on("pointerup",bulletUpgrade);
    BulletButt.on('pointerover',e=> e.target.alpha = 0.7);
    BulletButt.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(BulletButt);
	
	MoneyButt = new PIXI.Text("Cost: " + Math.pow(10,upgrades[0]));
    MoneyButt.style = buttonStyle;
    MoneyButt.x = 785;
    MoneyButt.y = 375;
    MoneyButt.interactive = true;
    MoneyButt.buttonMode = true;
    MoneyButt.on("pointerup",moneyUpgrade);
    MoneyButt.on('pointerover',e=> e.target.alpha = 0.7);
    MoneyButt.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(MoneyButt);
	
	//Draw MouseSubCat
	let mouseLabel = new PIXI.Text("Mouse Upgrades");
    mouseLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 70,
        fontFamily: "Impact",
        stroke:0xFF0000,
        stokeThickness: 6
    });
    mouseLabel.x = 35;
    mouseLabel.y = 450;
    shopScene.addChild(mouseLabel);
	//Draw 2 Upgrade Icon
	let MouseDamIcon = new PIXI.Sprite.fromImage("UpgradeImages/ClickDam.png");
	MouseDamIcon.width = 100;
	MouseDamIcon.height = 140;
	MouseDamIcon.x = 35;
	MouseDamIcon.y = 550;
	shopScene.addChild(MouseDamIcon);
	
	let MouseAOEIcon = new PIXI.Sprite.fromImage("UpgradeImages/AOE.png");
	MouseAOEIcon.width = 100;
	MouseAOEIcon.height = 140;
	MouseAOEIcon.x = 435;
	MouseAOEIcon.y = 550;
	shopScene.addChild(MouseAOEIcon);
	
	//Draw 2 Button
	MouseButtonDam = new PIXI.Text("Upgrade Cost: " + Math.pow(10,upgrades[6]));
    MouseButtonDam.style = buttonStyle;
    MouseButtonDam.x = 150;
    MouseButtonDam.y = sceneHeight - 170;
    MouseButtonDam.interactive = true;
    MouseButtonDam.buttonMode = true;
    MouseButtonDam.on("pointerup",mouseDamUpgrade);
    MouseButtonDam.on('pointerover',e=> e.target.alpha = 0.7);
    MouseButtonDam.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(MouseButtonDam);
	
	MouseButtonAOE = new PIXI.Text("Upgrade Cost: " + Math.pow(10,upgrades[7]));
    MouseButtonAOE.style = buttonStyle;
    MouseButtonAOE.x = 550;
    MouseButtonAOE.y = sceneHeight - 170;
    MouseButtonAOE.interactive = true;
    MouseButtonAOE.buttonMode = true;
    MouseButtonAOE.on("pointerup",mouseAOEUpgrade);
    MouseButtonAOE.on('pointerover',e=> e.target.alpha = 0.7);
    MouseButtonAOE.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(MouseButtonAOE);
	
	//Draw Back to Game Button
	let BackToGameButt = new PIXI.Text("Back To Game");
    BackToGameButt.style = buttonStyle;
    BackToGameButt.x = 775;
    BackToGameButt.y = 10;
    BackToGameButt.interactive = true;
    BackToGameButt.buttonMode = true;
    BackToGameButt.on("pointerup",closeStore);
    BackToGameButt.on('pointerover',e=> e.target.alpha = 0.7);
    BackToGameButt.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(BackToGameButt);
}

function spinUpgrade(){
	if(money >= Math.pow(10,upgrades[0])){
		mainShip.rotationDivider/=2;
		increaseScoreBy(-1*Math.pow(10,upgrades[0]));
		upgrades[0]++;
		ShipSpin.text = "Cost: "+Math.pow(10,upgrades[0])
	}
	
}

function fireUpgrade(){
	if(money >= Math.pow(10,upgrades[1])){
		mainShip.ShotsPerSec+=1;
		increaseScoreBy(-1*Math.pow(10,upgrades[1]));
		upgrades[1]++;
		FireButt.text = "Cost: "+Math.pow(10,upgrades[1])
	}
}

function shipDamUpgrade(){
	if(money >= Math.pow(10,upgrades[2])){
		mainShip.bulletDamage+=2;
		increaseScoreBy(-1*Math.pow(10,upgrades[2]));
		upgrades[2]++;
		ShipDamButt.text = "Cost: "+Math.pow(10,upgrades[2])
	}
}

function shipDefUpgrade(){
	if(money >= Math.pow(10,upgrades[3])){
		mainShip.defense+=2;
		increaseScoreBy(-1*Math.pow(10,upgrades[3]));
		upgrades[3]++;
		ShipDefButt.text = "Cost: "+Math.pow(10,upgrades[3])
	}
}

function bulletUpgrade(){
	if(money >= Math.pow(10,upgrades[4])){
		mainShip.ShotsToFire+=1;
		increaseScoreBy(-1*Math.pow(10,upgrades[4]));
		upgrades[4]++;
		BulletButt.text = "Cost: "+Math.pow(10,upgrades[4])
	}
}

function moneyUpgrade(){
	if(money >= Math.pow(10,upgrades[5])){
		moneyMulti*=1.5;
		increaseScoreBy(-1*Math.pow(10,upgrades[5]));
		upgrades[5]++;
		MoneyButt.text = "Cost: "+Math.pow(10,upgrades[5])
	}
}

function mouseDamUpgrade(){
	if(money >= Math.pow(10,upgrades[6])){
		mouseDam+=2;
		increaseScoreBy(-1*Math.pow(10,upgrades[6]));
		upgrades[6]++;
		MouseButtonDam.text = "Upgrade Cost: "+Math.pow(10,upgrades[6])
	}
}

function mouseAOEUpgrade(){
	if(money >= Math.pow(10,upgrades[7])){
		mouseAOE+=2;
		increaseScoreBy(-1*Math.pow(10,upgrades[7]));
		upgrades[7]++;
		MouseButtonAOE.text = "Upgrade Cost: "+Math.pow(10,upgrades[7]);

	}
}

function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Impact"
    });
    
    let startLabel1 = new PIXI.Text("Space Defense!");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 96,
        fontFamily: "Impact",
        stroke:0xFF0000,
        stokeThickness: 6
    });
    startLabel1.x = 200;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    let startButton = new PIXI.Text("Protect your ship!");
    startButton.style = buttonStyle;
    startButton.x = 300;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup",startGame);
    startButton.on('pointerover',e=> e.target.alpha = 0.7);
    startButton.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);
	
	transitionLabel = new PIXI.Text("WAVE COMPLETE!");
    transitionLabel.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 110,
        fontFamily: "Futura",
        stroke:0xFF0000,
        stokeThickness: 6
    });
    transitionLabel.x = 35;
    transitionLabel.y = 350;
	
    
    
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 4
    });
    
    moneyLabel = new PIXI.Text();
    moneyLabel.style = textStyle;
    moneyLabel.x = 5;
    moneyLabel.y = 5;
	shopScene.addChild(moneyLabel);
    increaseScoreBy(0);
	
	lifeLabel = new PIXI.Text();
    lifeLabel.style = textStyle;
    lifeLabel.x = 905;
    lifeLabel.y = 5;
    gameScene.addChild(lifeLabel);
    mainShip.takeDamage(0);

}

function increaseScoreBy(value){
    money+= value;
    moneyLabel.text = `Money: ${money}`;
}


function startGame(){
    startScene.visible = false;
    gameScene.visible = true;
    levelNum = 1;
    money = 0;
    life = 100;
    increaseScoreBy(0);
    mainShip.takeDamage(0);
    startWave();
}

// Spawn in all enemies for the current wave
function startWave(){
	localStorage.setItem("sru4607WaveNumber",levelNum);
	localStorage.setItem("sru4607MoneyCurrent",money);
	gameScene.addChild(moneyLabel);
    while(aliens.length > 0)
    {
        gameScene.removeChild(aliens.shift());
    }
	aliens = [];
    for(let i = 0; i<bullets.length;i++){
		gameScene.removeChild(bullets[i]);
	}
	bullets = [];
    if(waveArray.length < levelNum)
    {
        endGame();
        return;
    }
    // Transfer all wave enemies into the active array
    let loadWave = waveArray[levelNum - 1];
    for(let i = 0; i < loadWave.melee; i++)
    {
        aliens.push(new MeleeEnemy());
    }
    for(let i = 0; i < loadWave.range; i++)
    {
        aliens.push(new RangeEnemy());
    }
    for(let i = 0; i < loadWave.buff; i++)
    {
        // NOTE: BuffEnemy not currently used
        // aliens.push(new BuffEnemy());
    }
    for(let i = 0; i < loadWave.nerf; i++)
    {
        aliens.push(new NerfEnemy());
    }
    
    // Shuffle the order of enemies then set their positions based off their queue
    shuffle(aliens);
    
    let distance = 750;
    let x;
    let y;
    
    // Make enemies spawn with slightly less distance between each enemy (min 20 pixels)
    distMod *= 0.9;
    
    for(let i = 0; i < aliens.length; i++)
    {
        // Get a random direction vector, polarized towards the left and right sides
        y = Math.random();
        x = Math.sqrt(1-Math.pow(y,2));
        if(Math.random() >= 0.5) y *= -1;
        if(Math.random() >= 0.5) x *= -1;
        
        aliens[i].setPosition(x*distance + mainShip.x, y*distance + mainShip.y);
        distance += 20 + Math.random() * distMod;
        
        console.log(distMod);
        
        gameScene.addChild(aliens[i]);
    }
    
	paused = false;
  
}

function endGame(state = "lose"){
    paused = true;
}

// Function called every time the user clicks within the web browser
function clickEvent(e){
    // TODO: Replace with conditions for when a bullet should be fired
    if(true)
    {
        mainShip.Fire(aliens);
        shootSound.play();
    }
	for(let i = 0; i<aliens.length;i++){
		if((((e.clientX - aliens[i].x)*(e.clientX - aliens[i].x)) + ((e.clientY - aliens[i].y)*(e.clientY - aliens[i].y))) < 6000+1000*upgrades[7]){
			aliens[i].takeDamage(mouseDam);
	    }
	}
}
function loadSpriteSheet(textureFile){
    let spriteSheet = PIXI.BaseTexture.fromImage(textureFile);
    let width = 64;
    let height = 64;
    let numFrames= 16;
    let textures = [];
    for(let i = 0; i<numFrames;i++){
        let frame= new PIXI.Texture(spriteSheet, new PIXI.Rectangle(i*width, 64, width, height));
        textures.push(frame);
    }
    return textures;
}
function createExplosion(x,y,frameWidth,frameHeight){
    let w2 = frameWidth/2;
    let h2 = frameHeight/2;
    let expl = new PIXI.extras.AnimatedSprite(explosionTextures);
    expl.x= x - w2;
    expl.y = y - h2;
    expl.animationSpeed = 1/7;
    expl.loop = false;
    expl.onComplete = e => gameScene.removeChild(expl);
    explosions.push(expl);
    gameScene.addChild(expl);
    expl.play();
}
function gameLoop(){
	if (paused) return; // keep this commented out for now
	
	// #1 - Calculate "delta time"
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;

	if(gameScene.visible == true){
		// #4 - Move bullets and enemies
		for (let b of bullets){
			b.move(dt);
		}
		for(let alien of aliens){
			alien.move(dt);
		}
		mainShip.Fire(aliens,dt);

		// #5 - Make enemies attack
		for(let alien of aliens)
		{
			alien.attack(dt);
		}

		for(let c of aliens){
			for(let b of bullets){
				if(rectsIntersect(c,b)){
					fireballSound.play();
					c.takeDamage(b.damage);
					gameScene.removeChild(b);
					b.isAlive = false;
					increaseScoreBy(1);
				}
				if(b.y < -10) b.isAlive = false;
			}
		}

		// #6 - Now do some clean up
		bullets = bullets.filter(b=>b.isAlive);
		for(let i = 0; i < aliens.length; i++)
		{
			if(aliens[i].isAlive == false)
			{
				gameScene.removeChild(aliens[i]);
				aliens.splice(i,1);
			}
		}
		//explosions = explosions.filter(e=>e.playing);

		// #8 - Load next level
		// TODO: Add condition of "if there are no more waves and no aliens exist on the screen, end the game
		if(false){
			endGame("win");
		}
		// TODO: Change this to have a condition that meets clicking on a "Next Level" button
		else if (aliens === undefined || aliens.length == 0){
			if(aliens === undefined)
				console.log(undefined);
			else{
				levelNum ++;
				endWave();

			}
		}
	}
}

function endWave(){
	gameScene.visible = false;
	shopScene.visible = true;
	shopScene.addChild(moneyLabel);
	moneyLabel.text = "Money: "+money;
}

function loadStore(){
	transitionScene.visible = false;
	shopScene.visible = true;
}

function closeStore(){
	shopScene.visible = false;
	gameScene.visible = true;
	startWave();
}
