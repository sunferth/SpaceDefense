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
let finiteState = "mainMenu";
let distMod = 400; // Used for determining how far apart enemies will spawn (25 + Math.random(0, distMod));

function setup() {
	
    finiteState = "mainMenu";
    
    $.get('waves.txt', function(data) {
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

function increaseScoreBy(value){
    score+= value;
    scoreLabel.text = `Score ${score}`;
}

function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    //lifeLabel.text = `Life ${life}%`;
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

// Spawn in all enemies for the current wave
function startWave(){
    while(aliens.length > 0)
    {
        gameScene.removeChild(aliens.shift());
    }
	aliens = [];
    
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
        aliens.push(new BuffEnemy());
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
    finiteState = "waveActive";
}

function endGame(state = "lose"){
    finiteState = "endGame";
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
		if((((e.clientX - aliens[i].x)*(e.clientX - aliens[i].x)) + ((e.clientY - aliens[i].y)*(e.clientY - aliens[i].y))) < 2000){
			aliens[i].takeDamage(100);
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

	// #4 - Move bullets and enemies
    for (let b of bullets){
		b.move(dt);
	}
    for(let alien of aliens){
        alien.move(dt);
    }
	mainShip.Fire(aliens);
    
    // #5 - Make enemies attack
    for(let alien of aliens)
    {
        alien.attack();
    }
	
	for(let c of aliens){
        for(let b of bullets){
            if(rectsIntersect(c,b)){
                fireballSound.play();
                gameScene.removeChild(c);
                c.isAlive = false;
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
        else
            console.log(aliens.length);
        levelNum ++;
        startWave();
    }
}

// Helper methods
// Shuffles the contents of an array
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
