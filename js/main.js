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
add(["images/Spaceship.png","images/explosions.png"]).
on("progress",e=>{console.log(`progress=${e.progress}`)}).
load(setup);

// aliases
let stage;

// game variables
let startScene;
let gameScene,ship,scoreLabel,lifeLabel,shootSound,hitSound,fireballSound;
let shopScreen;
let mainShip;
let bullets = [];
let aliens = [];
let upgrades = [];
let explosionTextures;
let score = 0;
let life = 100;
let waveArray = [];
let levelNum = 1;
let paused = true;

function setup() {
	
    $.get('../waves.txt', function(data) {
    SetUpWaves(data)
	}, 'text');
	
    stage = app.stage;
    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);
    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
    // #3 - Create the main `game` scene and make it invisible
    shopScreen = new PIXI.Container();
    shopScreen.visible = false;
    stage.addChild(shopScreen);
    // #4 - Create labels for all 3 scenes
    createLabelsAndButtons();
    // #5 - Create ship
    mainShip = new Ship();
    gameScene.addChild(mainShip);
	let enemy = new Enemy();
	aliens[0] = enemy;
	aliens[0].x = 100;
	aliens[0].y = 420;
	gameScene.addChild(enemy);
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
    app.view.onclick = fireBullet;
    // Now our `startScene` is visible
    // Clicking the button calls startGame()
}
function SetUpWaves(data){
	 let wavesString = [];
	 wavesString = data.split("\n");
	 console.log(wavesString);
     // Starts at i = 1 to account for the first line being documentation
	 for(let i = 1; i<wavesString.length;i++){
		  let waveString = wavesString[i].split(",");
		  waveArray[i] = new Wave(parseInt(waveString[0].trim()),parseInt(waveString[1].trim()),parseInt(waveString[2].trim()),parseInt(waveString[3].trim()));
		  console.log(waveArray[i]);
	 }
}
function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 48,
        fontFamily: "Futura"
    });
    
    let startLabel1 = new PIXI.Text("Circle Blast!");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 96,
        fontFamily: "Futura",
        stroke:0xFF0000,
        stokeThickness: 6
    });
    startLabel1.x = 50;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);

    let startButton = new PIXI.Text("Enter, ... if you dare!");
    startButton.style = buttonStyle;
    startButton.x = 80;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup",startGame);
    startButton.on('pointerover',e=> e.target.alpha = 0.7);
    startButton.on('pointerout',e=> e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);
    
    let textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 4
    });
    
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

}
function startGame(){
    startScene.visible = false;
    gameScene.visible = true;
    levelNum = 1;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    startWave();
}
function increaseScoreBy(value){
    score+= value;
    scoreLabel.text = `Score ${score}`;
}
function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    //lifeLabel.text = `Life ${life}%`;
}
function startWave(){
	//createCircles(levelNum * 5);
	paused = false;
}
function fireBullet(e){
    mainShip.Fire(aliens);
    shootSound.play();
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

	// #4 - Move Bullets
    for (let b of bullets){
		b.move(dt);
	}
	// #6 - Now do some clean up
	bullets = bullets.filter(b=>b.isAlive);
    //circles = circles.filter(c=>c.isAlive);
    //explosions = explosions.filter(e=>e.playing);
}
	
	// #8 - Load next level
    	if (aliens.length == 0){
	levelNum ++;
	startWave();
}
//}
