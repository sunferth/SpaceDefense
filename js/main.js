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
add(["images/Spaceship.png","images/SpaceBackground.png","UpgradeImages/AOE.png","UpgradeImages/Box.png","UpgradeImages/Bullets.png","UpgradeImages/ClickDam.png","UpgradeImages/Damage.png","UpgradeImages/Defense.png","UpgradeImages/FireRate.png","UpgradeImages/SpinUpgrade.png","UpgradeImages/Money.png","images/AlienMelee.png","images/AlienRange.png","images/AlienNerf.png"]).
on("progress",e=>{/*console.log(`progress=${e.progress}`)*/}).
load(setup);

// aliases
let stage;

// game variables
let startScene;
let gameScene;
let ship;
let moneyLabel;
let lifeLabel;
let shootSound;
let upgradeSound;
let backgroundMusic;
let transitionLabel;
let transitionScene;
let mouseButtonAOE;
let mouseButtonDam;
let shipSpin;
let fireButt;
let shipDamButt;
let shipDefButt;
let bulletButt;
let moneyButt;
let shopScene;
let mainShip;
let mouseDam = 5;
let moneyMulti = 1;
let mouseAOE = 1;
let bullets = [];
let aliens = [];
let upgrades = [];
let score = 0;
let money = 1000;
let life = 100;
let waveArray = [];
let levelNum = 1;
let paused = true;
let distMod = 400; // Used for determining how far apart enemies will spawn (25 + Math.random(0, distMod));
let loadWave;

//Sets up all necessary variables 
function setup() {
    // Spawn in the main ship
	mainShip = new Ship();
    // Load the waves.txt file containing information on waves
    $.get('waves.txt', function(data) {
    setUpWaves(data)
	}, 'text');
	
    stage = app.stage;
	
    // Create the `start` scene
    startScene = new PIXI.Container();
	startScene.visible = true;
    stage.addChild(startScene);
	
    // Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
	
    // Create the `shop` scene and make it invisible
    shopScene = new PIXI.Container();
	setUpShop();
    shopScene.visible = false;
    stage.addChild(shopScene);

    // Create labels for all 3 scenes
    createLabelsAndButtons();
    
    // Create ship
    gameScene.addChild(mainShip);
    
    // Load sounds
    {
    shootSound = new Howl({
        src: ['sounds/shots.wav']
    });
    upgradeSound = new Howl({
        src: ['sounds/upgrade.wav']
    }); 
    //backgroundMusic 	
	backgroundMusic = new Howl({
        src: ['sounds/space.mp3'],
		loop: true,
		autoplay:true
    });
    }
    
    // Start update loop
    app.ticker.add(gameLoop);
    
    // Start listening for click events on the canvas
    app.view.onclick = clickEvent;
    // Clicking the button calls startGame()
}

// Uses waves.txt and stores all wave-related data in waveArray[...]
function setUpWaves(data){
	 let wavesString = [];
	 wavesString = data.split("\n");
     // Starts at i = 1 to account for the first line being documentation
	 for(let i = 1; i<wavesString.length;i++){
		  let waveString = wavesString[i].split(",");
		  waveArray[i] = new Wave(parseInt(waveString[0].trim()),parseInt(waveString[1].trim()),parseInt(waveString[2].trim()),parseInt(waveString[3].trim()));
	 }
    // Remove empty first element
    waveArray.shift();
}

//Sets up the entire shop scene
function setUpShop(){
	let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 36,
        fontFamily: "Impact"
    });
	
	let resetStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 18,
        fontFamily: "Impact"
    });
	//sets up array
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
	let shipSpinIcon = new PIXI.Sprite.fromImage("UpgradeImages/SpinUpgrade.png");
	shipSpinIcon.width = 100;
	shipSpinIcon.height = 140;
	shipSpinIcon.x = 35;
	shipSpinIcon.y = 220;
	shopScene.addChild(shipSpinIcon);
	let fireRateIcon = new PIXI.Sprite.fromImage("UpgradeImages/FireRate.png");
	fireRateIcon.width = 200;
	fireRateIcon.height = 140;
	fireRateIcon.x = 75;
	fireRateIcon.y = 220;
	shopScene.addChild(fireRateIcon);
	let shipDamIcon = new PIXI.Sprite.fromImage("UpgradeImages/Damage.png");
	shipDamIcon.width = 100;
	shipDamIcon.height = 140;
	shipDamIcon.x = 330;
	shipDamIcon.y = 220;
	shopScene.addChild(shipDamIcon);
	let defIcon = new PIXI.Sprite.fromImage("UpgradeImages/Defense.png");
	defIcon.width = 100;
	defIcon.height = 140;
	defIcon.x = 485;
	defIcon.y = 220;
	shopScene.addChild(defIcon);
	let bullFiredIcon = new PIXI.Sprite.fromImage("UpgradeImages/Bullets.png");
	bullFiredIcon.width = 100;
	bullFiredIcon.height = 140;
	bullFiredIcon.x = 635;
	bullFiredIcon.y = 220;
	shopScene.addChild(bullFiredIcon);
	let moneyMultiIcon = new PIXI.Sprite.fromImage("UpgradeImages/Money.png");
	moneyMultiIcon.width = 100;
	moneyMultiIcon.height = 140;
	moneyMultiIcon.x = 785;
	moneyMultiIcon.y = 220;
	shopScene.addChild(moneyMultiIcon);
	//Draw Buttons
	shipSpin = new PIXI.Text("$" + Math.pow(10,upgrades[0]));
    shipSpin.style = buttonStyle;
    shipSpin.x = 35;
    shipSpin.y = 375;
    shipSpin.interactive = true;
    shipSpin.buttonMode = true;
    shipSpin.on("pointerup",spinUpgrade);
    shipSpin.on('pointerover',e=> e.target.alpha = 0.7);
    shipSpin.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(shipSpin);
	
	fireButt = new PIXI.Text("$" + Math.pow(10,upgrades[0]));
    fireButt.style = buttonStyle;
    fireButt.x = 185;
    fireButt.y = 375;
    fireButt.interactive = true;
    fireButt.buttonMode = true;
    fireButt.on("pointerup",fireUpgrade);
    fireButt.on('pointerover',e=> e.target.alpha = 0.7);
    fireButt.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(fireButt);
	
	shipDamButt = new PIXI.Text("$" + Math.pow(10,upgrades[0]));
    shipDamButt.style = buttonStyle;
    shipDamButt.x = 335;
    shipDamButt.y = 375;
    shipDamButt.interactive = true;
    shipDamButt.buttonMode = true;
    shipDamButt.on("pointerup",shipDamUpgrade);
    shipDamButt.on('pointerover',e=> e.target.alpha = 0.7);
    shipDamButt.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(shipDamButt);
	
	shipDefButt = new PIXI.Text("$" + Math.pow(10,upgrades[0]));
    shipDefButt.style = buttonStyle;
    shipDefButt.x = 485;
    shipDefButt.y = 375;
    shipDefButt.interactive = true;
    shipDefButt.buttonMode = true;
    shipDefButt.on("pointerup",shipDefUpgrade);
    shipDefButt.on('pointerover',e=> e.target.alpha = 0.7);
    shipDefButt.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(shipDefButt);
	
	bulletButt = new PIXI.Text("$" + Math.pow(10,upgrades[0]));
    bulletButt.style = buttonStyle;
    bulletButt.x = 635;
    bulletButt.y = 375;
    bulletButt.interactive = true;
    bulletButt.buttonMode = true;
    bulletButt.on("pointerup",bulletUpgrade);
    bulletButt.on('pointerover',e=> e.target.alpha = 0.7);
    bulletButt.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(bulletButt);
	
	moneyButt = new PIXI.Text("$" + Math.pow(10,upgrades[0]));
    moneyButt.style = buttonStyle;
    moneyButt.x = 785;
    moneyButt.y = 375;
    moneyButt.interactive = true;
    moneyButt.buttonMode = true;
    moneyButt.on("pointerup",moneyUpgrade);
    moneyButt.on('pointerover',e=> e.target.alpha = 0.7);
    moneyButt.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(moneyButt);
	
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
	let mouseDamIcon = new PIXI.Sprite.fromImage("UpgradeImages/ClickDam.png");
	mouseDamIcon.width = 100;
	mouseDamIcon.height = 140;
	mouseDamIcon.x = 35;
	mouseDamIcon.y = 550;
	shopScene.addChild(mouseDamIcon);
	
	let mouseAOEIcon = new PIXI.Sprite.fromImage("UpgradeImages/AOE.png");
	mouseAOEIcon.width = 100;
	mouseAOEIcon.height = 140;
	mouseAOEIcon.x = 435;
	mouseAOEIcon.y = 550;
	shopScene.addChild(mouseAOEIcon);
	
	//Draw 2 Button
	mouseButtonDam = new PIXI.Text("Upgrade: $" + Math.pow(10,upgrades[6]));
    mouseButtonDam.style = buttonStyle;
    mouseButtonDam.x = 150;
    mouseButtonDam.y = sceneHeight - 170;
    mouseButtonDam.interactive = true;
    mouseButtonDam.buttonMode = true;
    mouseButtonDam.on("pointerup",mouseDamUpgrade);
    mouseButtonDam.on('pointerover',e=> e.target.alpha = 0.7);
    mouseButtonDam.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(mouseButtonDam);
	
	mouseButtonAOE = new PIXI.Text("Upgrade: $" + Math.pow(10,upgrades[7]));
    mouseButtonAOE.style = buttonStyle;
    mouseButtonAOE.x = 550;
    mouseButtonAOE.y = sceneHeight - 170;
    mouseButtonAOE.interactive = true;
    mouseButtonAOE.buttonMode = true;
    mouseButtonAOE.on("pointerup",mouseAOEUpgrade);
    mouseButtonAOE.on('pointerover',e=> e.target.alpha = 0.7);
    mouseButtonAOE.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(mouseButtonAOE);
	
	//Draw Back to Game Button
	let backToGameButt = new PIXI.Text("Back To Game");
    backToGameButt.style = buttonStyle;
    backToGameButt.x = 775;
    backToGameButt.y = 10;
    backToGameButt.interactive = true;
    backToGameButt.buttonMode = true;
    backToGameButt.on("pointerup",closeStore);
    backToGameButt.on('pointerover',e=> e.target.alpha = 0.7);
    backToGameButt.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(backToGameButt);
	
	//Draw Back to Game Button
	let resetButton = new PIXI.Text("Reset");
    resetButton.style = resetStyle;
    resetButton.x = 975;
    resetButton.y = 600;
    resetButton.interactive = true;
    resetButton.buttonMode = true;
    resetButton.on("pointerup",reset);
    resetButton.on('pointerover',e=> e.target.alpha = 0.7);
    resetButton.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    shopScene.addChild(resetButton);
}

//Upgrades spin speeds
function spinUpgrade(){
	if(money >= Math.pow(10,upgrades[0])){
		mainShip.rotationDivider/=2;
		increaseScoreBy(-1*Math.pow(10,upgrades[0]));
		upgrades[0]++;
		shipSpin.text = "$"+Math.pow(10,upgrades[0]);
        upgradeSound.play();
	}
}

//Upgrades fire speed
function fireUpgrade(){
	if(money >= Math.pow(10,upgrades[1])){
		mainShip.shotsPerSec+=1;
		increaseScoreBy(-1*Math.pow(10,upgrades[1]));
		upgrades[1]++;
		fireButt.text = "$"+Math.pow(10,upgrades[1]);
        upgradeSound.play();
	}
}

//upgrades ship damage
function shipDamUpgrade(){
	if(money >= Math.pow(10,upgrades[2])){
		mainShip.bulletDamage+=20;
		increaseScoreBy(-1*Math.pow(10,upgrades[2]));
		upgrades[2]++;
		shipDamButt.text = "$"+Math.pow(10,upgrades[2]);
        upgradeSound.play();
	}
}

//upgrades ship def
function shipDefUpgrade(){
	if(money >= Math.pow(10,upgrades[3])){
		mainShip.defense+=2;
		increaseScoreBy(-1*Math.pow(10,upgrades[3]));
		upgrades[3]++;
		shipDefButt.text = "$"+Math.pow(10,upgrades[3]);
        upgradeSound.play();
	}
}

//upgrades bullet amount
function bulletUpgrade(){
	if(money >= Math.pow(10,upgrades[4])){
		mainShip.shotsToFire+=1;
		increaseScoreBy(-1*Math.pow(10,upgrades[4]));
		upgrades[4]++;
		bulletButt.text = "$"+Math.pow(10,upgrades[4]);
        upgradeSound.play();
	}
}

//upgrades money multi
function moneyUpgrade(){
	if(money >= Math.pow(10,upgrades[5])){
		moneyMulti*=1.5;
		increaseScoreBy(-1*Math.pow(10,upgrades[5]));
		upgrades[5]++;
		moneyButt.text = "$"+Math.pow(10,upgrades[5]);
        upgradeSound.play();
	}
}

//Upgrades the mouse Damage
function mouseDamUpgrade(){
	if(money >= Math.pow(10,upgrades[6])){
		mouseDam+=2;
		increaseScoreBy(-1*Math.pow(10,upgrades[6]));
		upgrades[6]++;
		mouseButtonDam.text = "Upgrade: $"+Math.pow(10,upgrades[6]);
        upgradeSound.play();
	}
}

//upgrades mouse range
function mouseAOEUpgrade(){
	if(money >= Math.pow(10,upgrades[7])){
		mouseAOE+=2;
		increaseScoreBy(-1*Math.pow(10,upgrades[7]));
		upgrades[7]++;
		mouseButtonAOE.text = "Upgrade: $"+Math.pow(10,upgrades[7]);
        upgradeSound.play();
	}
}

//creates and implements all labels and buttons 
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

//Edits Money and updates labels
function increaseScoreBy(value){
    money+= value;
    moneyLabel.text = `Money: ${money}`;
}

//loads game from local storage
function loadGame(){
	
	let level = localStorage.getItem("sru4607WaveNumber");
	let prevHealth = localStorage.getItem("sru4607HealthNumber");
	let prevMoney = localStorage.getItem("sru4607MoneyNumber");
	let prevUpgrades = localStorage.getItem("sru4607Upgrades");
	if(levelNum != null && prevHealth != null && prevMoney != null && prevUpgrades != null){
		reset();
		mainShip.health = prevHealth;
		money = 1000000000000000000000;
		for(let i = 0; i<prevUpgrades.length;i++){
			for(let j = 0; j<prevUpgrades[i];j++){
				switch(i){
					case 0:{
						spinUpgrade();
						break;
					}
					case 1:{
						fireUpgrade();
						break;
					}
					case 2:{
						shipDamUpgrade();
						break;
					}
					case 3:{
						shipDefUpgrade();
						break;
					}
					case 4:{
						bulletUpgrade();
						break;
					}
					case 5:{
						moneyUpgrade();
						break;
					}
					case 6:{
						mouseDamUpgrade();
						break;
					}
					case 7:{
						mouseAOEUpgrade();
						break;
					}
						
				}
			}
		}
		money = parseInt(prevMoney);
		moneyLabel.text = "Money: "+money;
		levelNum = parseInt(level);
	}
}

//Resets the fields controlling the game set up
function reset(){
	//resets the fields
	levelNum = 1;
	money = 0;
	upgrades = [0,0,0,0,0,0,0,0];
	mainShip.health = 1000;
	mainShip.rotationDivider = 256;
	mainShip.bulletDamage = 1;
	mainShip.defense = 0;
	mainShip.shotsToFire = 1;
	mainShip.shotsPerSec = 1;
	moneyMulti = 1;
	mouseAOE = 0;
	mouseDam = 5;
	//stores the reset fields
	localStorage.setItem("sru4607WaveNumber",1);
	localStorage.setItem("sru4607MoneyNumber",0);
	localStorage.setItem("sru4607HealthNumber",1000);
	localStorage.setItem("sru4607Upgrades",[0,0,0,0,0,0,0,0]);
	//refreshes the page if need be
	if(shopScene.visible == true){
		window.location.reload(true);
	}
}

//sets the games starting parameters, and starts the first wave
function startGame(){
    startScene.visible = false;
    gameScene.visible = true;
    levelNum = 1;
    money = 0;
    life = 100;
    increaseScoreBy(0);
    mainShip.takeDamage(0);
	loadGame();
    startWave();
}

//Spawn in all enemies for the current wave
function startWave(){
	localStorage.setItem("sru4607WaveNumber",levelNum);
	localStorage.setItem("sru4607MoneyNumber",money);
	localStorage.setItem("sru4607HealthNumber",mainShip.health);
	localStorage.setItem("sru4607Upgrades",upgrades);
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
    // Transfer all wave enemies into the active array
    if(levelNum >= waveArray.length)
    {
        loadWave = waveArray[waveArray.length - 1];
    }
    else
    {
        loadWave = waveArray[levelNum - 1];
    }
    
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
    distMod = distance * Math.pow(0.9, levelNum);
    
    for(let i = 0; i < aliens.length; i++)
    {
        // Get a random direction vector, polarized towards the left and right sides
        y = Math.random();
        x = Math.sqrt(1-Math.pow(y,2));
        if(Math.random() >= 0.5) y *= -1;
        if(Math.random() >= 0.5) x *= -1;
        
        aliens[i].setPosition(x*distance + mainShip.x, y*distance + mainShip.y);
        distance += 5 + Math.random() * distMod;
        
        gameScene.addChild(aliens[i]);
    }
	paused = false;
}

//Ends games and reset it
function endGame(state = "lose"){
    paused = true;
	reset();
	window.location.reload(true);
}

//Function called every time the user clicks within the web browser
function clickEvent(e){
    if(gameScene.visible == true)
    {
        mainShip.fire(aliens);
        shootSound.play();
    }
	for(let i = 0; i<aliens.length;i++){
		if((((e.clientX - aliens[i].x)*(e.clientX - aliens[i].x)) + ((e.clientY - aliens[i].y)*(e.clientY - aliens[i].y))) < 6000+1000*upgrades[7]){
			aliens[i].takeDamage(mouseDam);
	    }
	}
}

//Loads sprite sheets
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

//runs the entire game loop
function gameLoop(){
	if (paused) return;
	
	// Calculate "delta time"
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;

	if(gameScene.visible == true){
		// Move bullets and enemies
		for (let b of bullets){
			b.move(dt);
		}
		for(let alien of aliens){
			alien.move(dt);
		}
		mainShip.fire(aliens,dt);

		// Make enemies attack
		for(let alien of aliens)
		{
			alien.attack(dt);
		}
		for(let eBullet of mainShip.enemyBullets)
		{
		    eBullet.move(dt);
		}

		for(let c of aliens){
			for(let b of bullets){
				if(rectsIntersect(c,b)){
					c.takeDamage(b.damage);
					gameScene.removeChild(b);
					b.isAlive = false;
					increaseScoreBy(1);
				}
				if(b.y < -10) b.isAlive = false;
			}
		}

		// Do some clean up
		bullets = bullets.filter(b=>b.isAlive);
		for(let i = 0; i < mainShip.enemyBullets.length; i++)
		{
		    if(mainShip.enemyBullets[i].isAlive == false)
		    {
		        gameScene.removeChild(mainShip.enemyBullets[i]);
		        mainShip.enemyBullets.splice(i,1);
		        i--;
		    }
		}
		for(let i = 0; i < aliens.length; i++)
		{
			if(aliens[i].isAlive == false)
			{
				gameScene.removeChild(aliens[i]);
				aliens.splice(i,1);
				i--;
			}
		}

		// If there are no aliens left, end the wave and go to the shop
        if (aliens === undefined || aliens.length == 0){
			if(aliens === undefined) {}
			else{
				levelNum ++;
				endWave();
			}
		}
	}
}

//Runs the logic after each enemy is killed
function endWave(){
    while(mainShip.enemyBullets.length > 0)
    {
        gameScene.removeChild(mainShip.enemyBullets[0]);
        mainShip.enemyBullets.splice(0,1);
    }
	gameScene.visible = false;
	shopScene.visible = true;
	shopScene.addChild(moneyLabel);
	moneyLabel.text = "Money: "+money;
}

//Switches to the store
function loadStore(){
	transitionScene.visible = false;
	shopScene.visible = true;
}

//closes the store and returns to the game
function closeStore(){
	shopScene.visible = false;
	gameScene.visible = true;
	startWave();
}
