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

let bullets = [];
let aliens = [];
let upgrades = [];
let explosionTextures;
let score = 0;
let life = 100;
let levelNum = 1;
let paused = true;

function setup() {
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
    ship = new Ship();
    gameScene.addChild(ship);
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
    explosionTextures = loadSpriteSheet();
    // #8 - Start update loop
    app.ticker.add(gameLoop);
    // #9 - Start listening for click events on the canvas
    app.view.onclick = fireBullet;
    // Now our `startScene` is visible
    // Clicking the button calls startGame()
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
    gameOverScene.visible = false;
    gameScene.visible = true;
    levelNum = 1;
    score = 0;
    life = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);
    ship.x = 300;
    ship.y = 550;
    loadLevel();
}
function increaseScoreBy(value){
    score+= value;
    scoreLabel.text = `Score ${score}`;
}
function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life ${life}%`;
}
function loadLevel(){
	createCircles(levelNum * 5);
	paused = false;
}
function fireBullet(e){
    //let rect = app.view.getBoundingClientRect();
    //let mouseX = e.clientX - rect.x;
    //let mouseY = e.clientY - rect.y;
    //console.log(`${mouseX},${mouseY}`);
    if(paused) return;
    if(score>=5){
    let b1 = new Bullet(0xFFFFFF,ship.x-10,ship.y);
    bullets.push(b1);
    gameScene.addChild(b1);
    let b2 = new Bullet(0xFFFFFF,ship.x+10,ship.y);
    bullets.push(b2);
    gameScene.addChild(b2);
    }
    let b3 = new Bullet(0xFFFFFF,ship.x,ship.y);
    bullets.push(b3);
    gameScene.addChild(b3);
    shootSound.play();
}
function loadSpriteSheet(){
    let spriteSheet = PIXI.BaseTexture.fromImage("images/explosions.png");
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
	// #2 - Move Ship
	let mousePosition = app.renderer.plugins.interaction.mouse.global;
    //ship.position = mousePosition;
    
    let amt = 6*dt;
    let newX = lerp(ship.x,mousePosition.x, amt);
    let newY = lerp(ship.y, mousePosition.y, amt);
    
    let w2 = ship.width/2;
    let h2 = ship.height/2;
    ship.x = clamp(newX,0+w2,sceneWidth - w2);
    ship.y = clamp(newY,0+h2,sceneHeight - h2);
	
	// #3 - Move Circles
	for(let c of circles){
        c.move(dt);
        if(c.x <= c.radius || c.x >= sceneWidth-c.radius){
            c.reflectX();
            c.move(dt);
        }
        
        if(c.y <= c.radius || c.y >= sceneHeight-c.radius){
            c.reflectY();
            c.move(dt);
        }
    }
	
	// #4 - Move Bullets
    for (let b of bullets){
		b.move(dt);
	}
	
	// #5 - Check for Collisions
    for(let c of circles){
        for(let b of bullets){
            if(rectsIntersect(c,b)){
                fireballSound.play();
                createExplosion(c.x,c.y,64,64);
                gameScene.removeChild(c);
                c.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
            }
            if(b.y < -10) b.isAlive = false;
        }
        
        if(c.isAlive && rectsIntersect(c,ship)){
            hitSound.play();
            gameScene.removeChild(c);
            c.isAlive = false;
            decreaseLifeBy(20);
        }
    }
	
	// #6 - Now do some clean up
	bullets = bullets.filter(b=>b.isAlive);
    circles = circles.filter(c=>c.isAlive);
    explosions = explosions.filter(e=>e.playing);
	
	// #7 - Is game over?
	if (life <= 0){
	end();
	return; // return here so we skip #8 below
}
	
	// #8 - Load next level
    if (circles.length == 0){
	levelNum ++;
	loadLevel();
}
}
