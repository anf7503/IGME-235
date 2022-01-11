"use strict";
const app = new PIXI.Application({
    width: 800,
    height: 600
});

document.body.appendChild(app.view);



// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// pre-load the images
app.loader.
    add([
        "images/spaceship.png",
        "images/enemy.png",
        "images/blockade.png"
    ]);
app.loader.onComplete.add(setup);
app.loader.load();

// aliases
let stage;

// game variables
let startScene;
let howToPlayScene;
let levelScene, levelLabel;
let gameScene,ship,scoreLabel,lifeLabel,shootSound,hitSound,fireballSound;
let diffScene,hard,impossible;
let gameOverScene;

let enemies = [];
let bullets = [];
let enemyBullets = [];
let blockades = [];
let invincible = false;
let aliens = [];
let score = 0;
let life = 2;
let lastShotFired;
let lastEnemyShotFired;
let lastHit;
let currentTime;
let levelNum = 0;
let paused = true;
let gameOverScoreLabel;
let keys = {};

// From Professor Chin's Pixi.js tutorial video
// Pixi.js: Sprite Keyboard Movement
window.addEventListener("keydown", keysDown);
window.addEventListener("keyup", keysUp);

function keysDown(e) {
    keys[e.keyCode] = true;
}

function keysUp(e) {
    keys[e.keyCode] = false;
}


// game setup functions

// score function

function increaseScoreBy(value){
    score += value;
    // gain a life every 20 enemies killed
    if (score % 20 == 0 && !impossible) {
        decreaseLifeBy(-1);
    }
    scoreLabel.text = `Score  ${score}`;
}

// life function
function decreaseLifeBy(value){
    life -= value;
    life = parseInt(life);
    lifeLabel.text = `Life     ${life}`;
}

// enemy creator
function createEnemies(enemiesPerRow) {
    // does 4 rows
    for (let i=0; i < 4; i++)
    {
        // and x amount of columns
        for (let j=1; j <= enemiesPerRow; j++)
        {
            // enemies can go at 50 speed in impossible,
            if (impossible) {
                if (levelNum > 15) {
                    let n = new Enemy((5*10));
                    n.x = ((sceneWidth)/enemiesPerRow) * (j-.5);
                    n.y = (sceneHeight - 400) + 25 * i;
                    enemies.push(n);
                    gameScene.addChild(n);
                }
                else if (levelNum > 5) {
                    let n = new Enemy((5*(levelNum*0.5 + 2.5)));
                    n.x = ((sceneWidth)/enemiesPerRow) * (j-.5);
                    n.y = (sceneHeight - 400) + 25 * i;
                    enemies.push(n);
                    gameScene.addChild(n);
                }
                else {
                    let n = new Enemy((5*levelNum));
                    n.x = ((sceneWidth)/enemiesPerRow) * (j-.5);
                    n.y = (sceneHeight - 400) + 25 * i;
                    enemies.push(n);
                    gameScene.addChild(n);
                }
            }
            // 37.5 speed in hard,
            else if (hard) {
                if (levelNum > 10) {
                    let n = new Enemy((5*7.5));
                    n.x = ((sceneWidth)/enemiesPerRow) * (j-.5);
                    n.y = (sceneHeight - 400) + 25 * i;
                    enemies.push(n);
                    gameScene.addChild(n);
                }
                else if (levelNum > 5) {
                    let n = new Enemy((5*(levelNum*0.5 + 2.5)));
                    n.x = ((sceneWidth)/enemiesPerRow) * (j-.5);
                    n.y = (sceneHeight - 400) + 25 * i;
                    enemies.push(n);
                    gameScene.addChild(n);
                }
                else {
                    let n = new Enemy((5*levelNum));
                    n.x = ((sceneWidth)/enemiesPerRow) * (j-.5);
                    n.y = (sceneHeight - 400) + 25 * i;
                    enemies.push(n);
                    gameScene.addChild(n);
                }
            }
            // and 25 in normal
            else {
                if (levelNum > 5) {
                    let n = new Enemy((5*5));
                    n.x = ((sceneWidth)/enemiesPerRow) * (j-.5);
                    n.y = (sceneHeight - 400) + 25 * i;
                    enemies.push(n);
                    gameScene.addChild(n);
                }
                else {
                    let n = new Enemy((5*levelNum));
                    n.x = ((sceneWidth)/enemiesPerRow) * (j-.5);
                    n.y = (sceneHeight - 400) + 25 * i;
                    enemies.push(n);
                    gameScene.addChild(n);
                }
            }
        }
    }
}

// blockade creator
function createBlockades(blockadeNumber)
{
    for (let i=1; i <= blockadeNumber; i++)
    {
        let d = new Blockade();
        d.x = ((sceneWidth)/blockadeNumber) * (i-0.5);
        d.y = sceneHeight - 100;
        blockades.push(d);
        gameScene.addChild(d);
    }
}

// bullet management

// player bullet
function fireBullet() {
    if (paused) return;
    
    let b = new Bullet(0xFFFFFF, ship.x, ship.y);
    bullets.push(b);
    gameScene.addChild(b);
    shootSound.play();
}

// enemy bullet
function enemyBulletFire(enemyNumber) {
    if (paused) return;

    let enemy = Math.floor(Math.random() * enemyNumber);
    let b;
    if(levelNum > 5) b = new Bullet(0xFF0000, enemies[enemy].x, enemies[enemy].y, true, 150);
    else b = new Bullet(0xFF0000, enemies[enemy].x, enemies[enemy].y, true, 100);
    enemyBullets.push(b);
    gameScene.addChild(b);
    shootSound.play();
}

// helper functionm to make buttons and labels

function labelAndButtonMaker(label, x = 0, y = 0, size = 48, button = false, color = 0xFFFFFF) {
    label.x = x;
    label.y = y;

    if (button) {
        label.style = new PIXI.TextStyle({
            fill: color,
            fontSize: size,
            fontFamily: 'Orbitron',
            fontStyle: "italic"
        });
        label.interactive = true;
        label.buttonStyle = true;
    }

    else {
        label.style = new PIXI.TextStyle({
            fill: color,
            fontSize: size,
            fontFamily: 'Orbitron'
        });
    }
}

// set up scenes with buttons and labels
function createLabelsAndButtons() {
    // set up 'startScene'

    // Title label
    let titleLabel = new PIXI.Text("Mr. Galaxy");
    labelAndButtonMaker(titleLabel, 65, 120, 120);
    startScene.addChild(titleLabel);

    // button that takes you to the how to play menu
    let htpButton = new PIXI.Text("How to play");
    labelAndButtonMaker(htpButton, 290, 350 , 32, true);
    htpButton.on("pointerup", htpMenu);
    htpButton.on("pointerover", e => e.target.alpha = 0.7);
    htpButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(htpButton);

    // start game button
    let startButton = new PIXI.Text("Click here to start");
    labelAndButtonMaker(startButton, 200, (sceneHeight - 100), 40, true);
    startButton.on("pointerup", goToDiff);
    startButton.on("pointerover", e => e.target.alpha = 0.7);
    startButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    // set up 'howToPlayScene'
    // instructions basically
    let movementLabel = new PIXI.Text("Use the 'A' and 'D' keys or the left and right\narrows to move the ship left and right");
    labelAndButtonMaker(movementLabel, 20, 30, 30);
    howToPlayScene.addChild(movementLabel);

    let shootLabel = new PIXI.Text("Use the Spacebar to shoot. There is a small\n delay between shots.");
    labelAndButtonMaker(shootLabel, 20, 130, 30);
    howToPlayScene.addChild(shootLabel);

    let blockLabel = new PIXI.Text("You have a few blockades you can shoot\nthrough. They disappear after 3 hits.");
    labelAndButtonMaker(blockLabel, 20, 230, 30);
    howToPlayScene.addChild(blockLabel);

    let invincLabel = new PIXI.Text("When you get hit, you have invincibility\nfor a short time.");
    labelAndButtonMaker(invincLabel, 20, 330, 30);
    howToPlayScene.addChild(invincLabel);

    let loseConditionLabel = new PIXI.Text("If you run out of lives or an enemy makes\nit past you, it's game over!")
    labelAndButtonMaker(loseConditionLabel, 20, 430, 30);
    howToPlayScene.addChild(loseConditionLabel);

    let backButton = new PIXI.Text("Back");
    labelAndButtonMaker(backButton, (sceneWidth/2 - 70), (sceneHeight - 70), 48, true);
    backButton.on("pointerup", backToStart);
    backButton.on("pointerover", e => e.target.alpha = 0.7);
    backButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    howToPlayScene.addChild(backButton);

    // set up difficulty scene
    // normal difficulty
    let normalButton = new PIXI.Text("Normal");
    labelAndButtonMaker(normalButton, 50, 100, 48, true);
    normalButton.on("pointerup", normalSelect);
    normalButton.on("pointerover", e => e.target.alpha = 0.7);
    normalButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    diffScene.addChild(normalButton);

    // hard difficulty
    let hardButton = new PIXI.Text("Hard");
    labelAndButtonMaker(hardButton, (sceneWidth/2 - 100), 250, 48, true);
    hardButton.on("pointerup", hardSelect);
    hardButton.on("pointerover", e => e.target.alpha = 0.7);
    hardButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    diffScene.addChild(hardButton);

    // impossible difficulty
    let impossibleButton = new PIXI.Text("Impossible");
    labelAndButtonMaker(impossibleButton, (sceneWidth/2 + 50), 400, 48, true);
    impossibleButton.on("pointerup", impossibleSelect);
    impossibleButton.on("pointerover", e => e.target.alpha = 0.7);
    impossibleButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    diffScene.addChild(impossibleButton);

    // set up 'levelScene'
    levelLabel = new PIXI.Text();
    labelAndButtonMaker(levelLabel, 235, 150, 100);
    levelScene.addChild(levelLabel);

    let levelNextButton = new PIXI.Text("Click here to start");
    labelAndButtonMaker(levelNextButton, 200, (sceneHeight - 100), 40, true);
    levelNextButton.on("pointerup", enterGame);
    levelNextButton.on("pointerover", e => e.target.alpha = 0.7);
    levelNextButton.on("pointerout", e => e.currentTarget.alpha = 1.0);
    levelScene.addChild(levelNextButton);

    // set up 'gameScene'
    
    // life label
    lifeLabel = new PIXI.Text();
    labelAndButtonMaker(lifeLabel, 5, 26, 18);
    gameScene.addChild(lifeLabel);
    decreaseLifeBy(0);

    // score label
    scoreLabel = new PIXI.Text();
    labelAndButtonMaker(scoreLabel, 5, 5, 18);
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);


    // set up `gameOverScene`
    // game over text
    let gameOverText = new PIXI.Text("Game Over");
    labelAndButtonMaker(gameOverText, 215, (sceneHeight/2 - 160), 64);
    gameOverScene.addChild(gameOverText);

    // final score label
    gameOverScoreLabel = new PIXI.Text();
    labelAndButtonMaker(gameOverScoreLabel, 225, (sceneHeight - 160), 32);
    gameOverScene.addChild(gameOverScoreLabel);

    // "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    labelAndButtonMaker(playAgainButton, 245, (sceneHeight - 100), 48, true);
    playAgainButton.on("pointerup", goToDiff);
    playAgainButton.on('pointerover', e=>e.target.alpha = 0.7);
    playAgainButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(playAgainButton);
}

// scene to scene functions


// start -> how to play
function htpMenu(){
    startScene.visible = false;
    howToPlayScene.visible = true;
}

// how to play -> start
function backToStart(){
    startScene.visible = true;
    howToPlayScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = false;
    levelScene.visible = false;
    diffScene.visible = false;
}

// start -> difficulty select
function goToDiff(){
    startScene.visible = false;
    howToPlayScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = false;
    levelScene.visible = false;
    diffScene.visible = true;
}

// start the game with normal difficulty
function normalSelect() {
    hard = false;
    impossible = false;
    startGame();
}

// start the game with hard difficulty
function hardSelect() {
    hard = true;
    impossible = false;
    startGame();
}

// start the game with impossible difficulty
function impossibleSelect(){
    hard = true;
    impossible = true;
    startGame();
}

// difficulty scene -> first level scene
function startGame(){
    paused = true;
    levelNum = 1;
    score = 0;
    life = 2;
    lastShotFired = new Date();
    lastEnemyShotFired = new Date();
    lastHit = new Date();
    currentTime = new Date();
    increaseScoreBy(0);
    decreaseLifeBy(0);
    createEnemies(8);
    if (impossible) createBlockades(3);
    else createBlockades(5);
    ship.x = 300;
    levelLabel.text = `Belt  ${levelNum}`;
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = false;
    howToPlayScene.visible = false;
    levelScene.visible = true;
    diffScene.visible = false;
}

// level scene -> game scene
function enterGame(){
    paused = false;

    ship.x = 300;
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    howToPlayScene.visible = false;
    levelScene.visible = false;
    diffScene.visible = false;
}

// game scene -> level scene
function loadLevel() {
    paused = true;
    levelNum ++;
    if (levelNum > 10) createEnemies(10);
    else createEnemies(8);
    if (!impossible) createBlockades(5);
    levelLabel.text = `Belt  ${levelNum}`;
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = false;
    howToPlayScene.visible = false;
    levelScene.visible = true;
    diffScene.visible = false;
}

// game scene -> game over scene
function end()
{
    paused = true;
    // clear out level
    enemies.forEach(c=>gameScene.removeChild(c));
    enemies = [];

    bullets.forEach(b=>gameScene.removeChild(b));
    bullets = [];

    blockades.forEach(d=>gameScene.removeChild(d));
    blockades = [];

    // set game over score label
    gameOverScoreLabel.text = `Your final score is ${score}`;

    // show game over scene
    gameOverScene.visible = true;
    gameScene.visible = false;
}


// main gameloop

function gameLoop(){
	if (paused) return;
	
	// Calculate "delta time"
    let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;

    // update the current time
    currentTime = new Date();

    // invincible check
    // 2 seconds for impossible
    if (currentTime - lastHit >= 2000 && impossible) invincible = false;
    // 4 seconds everything else
    else if (currentTime - lastHit >= 4000) invincible = false;

    if (invincible) ship.alpha = 0.6;

    else ship.alpha = 1;

    let moveDown = false;

    // enemy fires a bullet every 3 seconds for levels 1 - 5
    // 3000 since its in milliseconds
    if (levelNum <= 5) {
        if (currentTime - lastEnemyShotFired >= 3000 && !paused) {
            enemyBulletFire(enemies.length);
            lastEnemyShotFired = new Date();
        }
    }
    // every 2 secs 6+ on normal & hard
    else if (!impossible) {
        if (currentTime - lastEnemyShotFired >= 2000 && !paused) {
            enemyBulletFire(enemies.length);
            lastEnemyShotFired = new Date();
        }
    }
    // every 2 secs 6 - 10
    else if (levelNum <= 10) {
        if (currentTime - lastEnemyShotFired >= 2000 && !paused) {
            enemyBulletFire(enemies.length);
            lastEnemyShotFired = new Date();
        }
    }
    // 1 second levels 11+ on impossible
    else {
        if (currentTime - lastEnemyShotFired >= 1000 && !paused) {
            enemyBulletFire(enemies.length);
            lastEnemyShotFired = new Date();
        }
    }
    
	
	// Move Enemies
	for (let n of enemies) 
    {
        n.move(dt);
        // checks if the enemy is at the edge
        if (n.x <= n.width + 15 || n.x >= sceneWidth - 15)
        {
            moveDown = true;
        }
    }

    // moves down when the enemies hit the edge
    if (moveDown) {
        for (let n of enemies) 
        {
            n.reflectX();
            n.y += 10;
            n.move(dt);
        }
    }

    for (let n of enemies) 
    {
        // ends game if enemy makes it past the point where you can attack
        if (n.y >= ship.y)
        {
            end();
            return;
        }
    }
	
	// Move Bullets
	for (let b of bullets)
    {
		b.move(dt);
	}

    for (let b of enemyBullets)
    {
		b.move(dt);
	}

	// Check for Collisions
	for (let n of enemies)
    {
        // enemies & bullets
        for (let b of bullets)
        {
            if (rectsIntersect(n,b))
            {
                fireballSound.play();
                gameScene.removeChild(n);
                n.isAlive = false;
                gameScene.removeChild(b);
                b.isAlive = false;
                increaseScoreBy(1);
            }

            if (b.y < -10) b.isAlive = false;
        }

        // enemies and blockades
        for (let d of blockades)
        {
            if (rectsIntersect(n,d))
            {
                d.decreaseHealth();
                if (d.health <= 0)
                {   
                    gameScene.removeChild(d);
                    d.isAlive = false;
                }
            }
        }

        // enemies & player
        if (n.isAlive && !invincible && rectsIntersect(n,ship))
        {
            hitSound.play();
            gameScene.removeChild(n);
            n.isAlive = false;
            decreaseLifeBy(1);
            invincible = true;
            lastHit = new Date();
        }
    }

    // enemy bullet collision
    for (let b of enemyBullets)
    {
        // bullet with blockade
        for (let d of blockades)
        {
            if (b.isAlive && rectsIntersect(b,d))
            {
                d.decreaseHealth();
                if (d.health <= 0)
                {   
                    gameScene.removeChild(d);
                    d.isAlive = false;
                }
                gameScene.removeChild(b);
                b.isAlive = false;
                
            }
        }

        // bullet with player
        if (b.isAlive && !invincible && rectsIntersect(b, ship))
        {
            hitSound.play();
            gameScene.removeChild(b);
            b.isAlive = false;
            decreaseLifeBy(1);
            invincible = true;
            lastHit = new Date();
        }

        if (b.y > (sceneHeight + 10)) b.isAlive = false;
    }

	// Clean up
	
    // Remove Dead Bullets
    bullets = bullets.filter(b=>b.isAlive);

    // Remove Dead enemies
    enemies = enemies.filter(n=>n.isAlive);

    // Remove Blockades
    blockades = blockades.filter(d=>d.isAlive);

    // keypresses
    // spacebar
    if (keys["32"])
    {
        if (currentTime - lastShotFired >= 750) {
            fireBullet();
            lastShotFired = new Date();
        }
    }

    // left arrow
    if (keys["37"])
    {
        if (impossible){
            if (ship.x > (ship.width/2 + 2)) ship.x -= 2;
        }
        else {
            if (ship.x > (ship.width/2 + 2)) ship.x -= 4;
        }
    }

    // right arrow
    if (keys["39"])
    {
        if (impossible){
            if (ship.x > (ship.width/2 + 2)) ship.x += 2;
        }
        else {
            if (ship.x > (ship.width/2 + 2)) ship.x += 4;
        }
    }

    // 'A'
    if (keys["65"])
    {
        if (hard){
            if (ship.x > (ship.width/2 + 2)) ship.x -= 2;
        }
        else {
            if (ship.x > (ship.width/2 + 2)) ship.x -= 4;
        }
    }

    // 'D'
    if (keys["68"])
    {
        if (hard){
            if (ship.x > (ship.width/2 + 2)) ship.x += 2;
        }
        else {
            if (ship.x > (ship.width/2 + 2)) ship.x += 4;
        }
    }

	
	// game over check
	if (life <= 0)
    {
        end();
        return; // so we don't load a new level
    }
	
	// Load next level
    if (enemies.length == 0)
    {
        paused = true;
        // gets rid of the blockades (unless on impossible)
        if (blockades.length > 0 && !impossible)
        {
            for (let d of blockades)
            {
                gameScene.removeChild(d);
                d.isAlive = false;
            }
            blockades = blockades.filter(d=>d.isAlive);
        }
        loadLevel();
    }

}

// the setup

function setup() {
	stage = app.stage;
	// create all of the scenes

    // start scene
	startScene = new PIXI.Container();
    stage.addChild(startScene);

	// main game scene
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

	// gameOver scene
	gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    // scene that tells you which level you are on
    levelScene = new PIXI.Container();
    levelScene.visible = false;
    stage.addChild(levelScene);

	// How to play scene
	howToPlayScene = new PIXI.Container();
    howToPlayScene.visible = false;
    stage.addChild(howToPlayScene);

    diffScene = new PIXI.Container();
    diffScene.visible = false;
    stage.addChild(diffScene);

	// Create labels for all scenes
	createLabelsAndButtons();

	// Create ship
    ship = new Ship();
    gameScene.addChild(ship);
	
    // #6 - Load Sounds
    shootSound = new Howl({
        src: ['sounds/shoot.ogg']
    });

    hitSound = new Howl({
        src: ['sounds/hit.ogg']
    });

    fireballSound = new Howl({
        src: ['sounds/explosion.ogg']
    });


	// Start update loop
    app.ticker.add(gameLoop);
}
