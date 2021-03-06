'use strict';
(function (window, undefined) {
    //Canvas and buffer
    var gameWindow = undefined,
    gameCtx = undefined,
    buffer = null,
    bufferCtx = null,
    bufferScale = 1,
    bufferOffsetX = 0,
    bufferOffsetY = 0,
    //Hit boxes
    body = [],
    food = new rectangle(80, 80, 10, 10),
    wall = [],
    special = new rectangle(20, 20, 10, 10),
    specialCountdown = 0,
    //Controls
    lastCommand = undefined,
    keyLeft = 37,
    keyUp = 38,
    keyRight = 39,
    keyDown = 40,
    dir = 1,
    prevDir = undefined,
    //Pause
    stop = true,
    gameOver = false,
    //Scores
    score = 0,
    highscores = [],
    posHighscore = 10;

    //assets
    var iHeadUp = new Image(),
    iHeadDown = new Image(),
    iHeadRight = new Image(),
    iHeadLeft = new Image(),
    iNeckUp = new Image(),
    iNeckDown = new Image(),
    iNeckLeft = new Image(),
    iNeckRight = new Image(),
    iBodyVert = new Image(),
    iBodySide = new Image(),
    iTaleRight = new Image(),
    iTaleUp = new Image(),
    iTaleDown = new Image(),
    iTaleLeft = new Image(),
    iApple = new Image(),
    aEat = new Audio(),
    aSpecial = new Audio(),
    aDie = new Audio(),
    iSpecial = new Image();

    //FPS calculation
    var lastUpdate = 0,
    FPS = 0,
    frames = 0,
    acumDelta = 0;
        
    //Scenes
    var currentScene = 0,
        scenes = [];
    var mainScene = undefined,
        gameScene = undefined,
        scoresScene = undefined;
    //Fetch
    var url = 'https://jsonplaceholder.typicode.com/?score=10'
    //Objets and prototypes
    function scene() {
        this.id = scenes.length;
        scenes.push(this);
    }
    
    scene.prototype = {
        constructor: scene,
        load: function () {},
        paint: function (bufferCtx) {},
        act: function () {}
    };

    function loadScene(scene) {
        currentScene = scene.id;
        scenes[currentScene].load();
        }
        
    function rectangle (x, y, width, height){
        this.x = (x === undefined) ? 0 : x;
        this.y = (y === undefined) ? 0 : y;
        this.width = (width === undefined) ? 0 : width;
        this.height = (height === undefined) ? this.width : height;
    }
    rectangle.prototype = {
        constructor: rectangle,
            
        intersect : function (rect) {
            if (rect === undefined){
                window.console.warn('Missing parameters on function intersect')
            } else {
                return (
                    this.x < rect.x + rect.width &&
                    this.x + this.width > rect.x &&
                    this.y < rect.y + rect.height &&
                    this.y + this.height > rect.y
                )
            }
        },

        fill : function (gameCtx) {
            if (gameCtx === undefined) {
            window.console.warn('Missing parameters on function fill');
            } else {
            gameCtx.fillRect(this.x, this.y, this.width, this.height);
            }
        },  

        drawImage : function (gameCtx, img) {
            if (img === undefined) {
            window.console.warn('Missing parameters on function drawImage');
            } else {
                if (img.width) {
                gameCtx.drawImage(img, this.x, this.y);
                } else {
                gameCtx.strokeRect(this.x, this.y, this.width, this.height);
                }
            }
        }
    }
    //Function GET
    
    //Random
    function random(max){
        return ~~(Math.random() * max);
    }
    //Request animation
    window.requestAnimationFrame = (function (){
        return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (cb){
            window.setTimeout(callback, 17);
        }
    }());

    //Rezising the game window
    function resize() {
        gameWindow.width = window.innerWidth * 0.9;
        gameWindow.height = window.innerHeight * 0.9;
        var w = window.innerWidth / buffer.width * 0.9;
        var h = window.innerHeight / buffer.height * 0.9;
        bufferScale = Math.min(h, w);
        bufferScale = bufferScale * 0.9;
        bufferOffsetX = (gameWindow.width - (buffer.width * bufferScale)) / 2;
        bufferOffsetY = (gameWindow.height - (buffer.height * bufferScale)) / 2;
        }

    //Score list
    function addHighscore(score) {
        posHighscore = 0;
        while (highscores[posHighscore] > score && posHighscore < highscores.length) {
            posHighscore += 1;
        }
        highscores.splice(posHighscore, 0, score);
        if (highscores.length > 10) {
            console.log(highscores.length);
            highscores.length = 10;
        }
        localStorage.highscores = highscores.join(',');
    }
    
        
    //Title card.
    mainScene = new scene();
    mainScene.paint = function(bufferCtx){
        //Clean canvas
        bufferCtx.fillStyle = '#030';
        bufferCtx.fillRect(0, 0, buffer.width, buffer.height);
        //Draw title
        bufferCtx.fillStyle = '#fff';
        bufferCtx.textAlign = 'center';
        bufferCtx.fillText('SNAKE', 150, 60);
        bufferCtx.fillText('Press Enter', 150, 90);
    }
    mainScene.act = function(){
        // Load next scene
        if (lastCommand === 13 || lastCommand === 'Enter'){
            loadScene(gameScene);
            lastCommand = null;
        }
    }
    //Game scene
    gameScene = new scene();
    //Controls and comands
    document.addEventListener('keydown', function (event) {
        lastCommand = event.key || event.keyCode || event.code
    }, false);

    gameScene.act = function() {
        if (!stop){

            //worm Movement
            if (lastCommand === keyUp && dir !== 2 || lastCommand === 'ArrowUp' && dir != 2) {
                prevDir = dir;
                dir = 0;
            }
            if (lastCommand === keyRight && dir !== 3 || lastCommand === 'ArrowRight'&& dir !== 3 ) {
                prevDir = dir;
                dir = 1;
            }
            if (lastCommand === keyDown && dir !== 0 || lastCommand === 'ArrowDown' && dir !== 0) {
                prevDir = dir;
                dir = 2;
            }
            if (lastCommand === keyLeft && dir !== 1 || lastCommand === 'ArrowLeft' && dir !== 1) {
                prevDir = dir;
                dir = 3;
            }

            //Body movement
            for (i = body.length - 1; i > 0; i--) {
                body[i].x = body[i - 1].x;
                body[i].y = body[i - 1].y;
            }
            //Head movement
            if (dir === 0) {
                body[0].y -= 10;
                }
            if (dir === 1) {
                body[0].x += 10;
                }
            if (dir === 2) {
                body[0].y += 10;
                }
            if (dir === 3) {
                body[0].x -= 10;
                }

            if (body[0].x > buffer.width) {
                body[0].x = 0;
                }
            if (body[0].y > buffer.height){
                body[0].y = 0
            }
            if (body[0].x < 0) {
                body[0].x = buffer.width;
                }
            if (body[0].y < 0) {
                body[0].y = buffer.height;
                }
            }
            //Pause & Game Over
            if (lastCommand === 13 || lastCommand === 'Enter'){
                stop = !stop;
                if (gameOver){
                    loadScene(scoresScene);
                }
                lastCommand = null;
            }
            //Hit box Colisions
                //food
            if (body[0].intersect(food)) {
                body.push(new rectangle(0, 0, 10, 10));
                score += 1;
                aEat.play();
                if(specialCountdown === 5){
                    special.x = random(buffer.width / 10 - 1) * 10;
                    special.y = random(buffer.height / 10 - 1) * 10;
                    specialCountdown = 0;
                } else {
                    specialCountdown += 1;
                }
                food.x = random(buffer.width / 10 - 1) * 10;
                food.y = random(buffer.height / 10 - 1) * 10;
                    
            }
                //special
                if (food.intersect(special)){
                    food.x = random(buffer.width / 10 - 1) * 10;
                    food.y = random(buffer.height / 10 - 1) * 10;
                }
            if (body[0].intersect(special)) {                
                if(specialCountdown === 5){
                    fetch(url)
                    .then(() => console.log("Score sent succesfully"))
                    .catch(() => console.log("Something went wrong"));
                    score += 10;
                    aSpecial.play();
                    food.x = random(buffer.width / 10 - 1) * 10;
                    food.y = random(buffer.height / 10 - 1) * 10;
                    specialCountdown = 0;
                }
            }
                //Obstacle
            for (var i = 0, l = wall.length; i < l; i += 1) {
                if (food.intersect(wall[i])) {
                    food.x = random(buffer.width / 10 - 1) * 10;
                    food.y = random(buffer.height / 10 - 1) * 10;
                }
                if (special.intersect(wall[i])) {
                    special.x = random(buffer.width / 10 - 1) * 10;
                    special.y = random(buffer.height / 10 - 1) * 10;
                }
                if (body[0].intersect(wall[i])) {
                    aDie.play();
                    stop = true;
                    if(gameOver == false)
                    addHighscore(score);
                    gameOver = true; 
                }
            }
                //Body
            for (var i = 2; i < body.length; i += 1) {
                if (body[0].intersect(body[i])) {
                    aDie.play();
                    gameOver = true;
                    stop = true;
                    addHighscore(score);
                }
            }
            
    }
    
    //Rendering of the playable screen
    gameScene.paint = function(bufferCtx){
        //Clean canvas
        bufferCtx.fillStyle = '#000';
        bufferCtx.fillRect(0, 0, gameWindow.width, gameWindow.height);
    
        //Draw snake
        for (var i = 0; i < body.length; i++){
            var follow = 0
            if (i === 0){
                if(dir === 0 ){
                    body[i].drawImage(bufferCtx, iHeadUp);
                    follow = 1;
                } else if(dir === 1 ){
                    body[i].drawImage(bufferCtx, iHeadRight)
                    follow = 2;
                } else if(dir === 2 ){
                    body[i].drawImage(bufferCtx, iHeadDown)
                } else if(dir === 3 ){
                    body[i].drawImage(bufferCtx, iHeadLeft)
                }
            } else if(i === 1) {
                if(dir === 0 ){
                    body[i].drawImage(bufferCtx, iNeckUp);
                } else if(dir === 1 ){
                    body[i].drawImage(bufferCtx, iNeckRight)
                } else if(dir === 2 ){
                    body[i].drawImage(bufferCtx, iNeckDown)
                } else if(dir === 3 ){
                    body[i].drawImage(bufferCtx, iNeckLeft)
                }
            } else if (i < body.length -1){
                if(dir === 0 || dir === 2 ){
                    body[i].drawImage(bufferCtx, iBodyVert);
                } else if(dir === 1 || dir === 3){
                    body[i].drawImage(bufferCtx, iBodySide)
                }
            } else {
                if(dir === 0 ){
                    body[i].drawImage(bufferCtx, iTaleUp);
                } else if(dir === 1 ){
                    body[i].drawImage(bufferCtx, iTaleRight)
                } else if(dir === 2 ){
                    body[i].drawImage(bufferCtx, iTaleDown)
                } else if(dir === 3 ){
                    body[i].drawImage(bufferCtx, iTaleLeft)
                }
            }
        }
        // Draw apple
        food.drawImage(bufferCtx, iApple);

        //Draw special
        if(specialCountdown === 5){
            special.drawImage(bufferCtx, iSpecial);
        }

        //Draw obstacle
        bufferCtx.fillStyle = '#066'
        for (i = 0; i < wall.length; i++){
            wall[i].fill(bufferCtx);
        }

        //Draw Score
        bufferCtx.fillText('Score: ' + score, 50, 10);
        
        //Draw FPS
        bufferCtx.fillText('FPS: ' + FPS, 250, 10);

        //Draw pause
        bufferCtx.fillStyle = '#fff'
        if (stop) {
            bufferCtx.textAlign = 'center';
            if (gameOver) {
                bufferCtx.fillText('GAME OVER', 150, 75);
                bufferCtx.fillText('Press ENTER to restart', 150, 95);
            } else {
                bufferCtx.fillText('PAUSE', 150, 75);
            }
        }
    }
    //Scores scene
    scoresScene = new scene();
    scoresScene.paint = function(bufferCtx){
        var i = 0,
            l = 0;
        // Clean canvas
        bufferCtx.fillStyle = '#030';
        bufferCtx.fillRect(0, 0, buffer.width, buffer.height);
        // Draw title
        bufferCtx.fillStyle = '#fff';
        bufferCtx.textAlign = 'center';
        bufferCtx.fillText('HIGH SCORES', 150, 30);
        // Draw high scores
        bufferCtx.textAlign = 'right';
        for (i = 0, l = highscores.length; i < l; i += 1) {
            if (i === posHighscore) {
                bufferCtx.fillText('Your score: ' + highscores[i], 180, 40 + i * 10);
            } else {
                bufferCtx.fillText(highscores[i], 180, 40 + i * 10);
            }
        }
    }
    scoresScene.act = function () {
        // Load next scene
        if (lastCommand === 13 || lastCommand === 'Enter'){
            loadScene(gameScene);
            lastCommand = undefined;
        }
    };
        
    //Game Animation
    function repaint() {
        //Render buffer frame
        window.requestAnimationFrame(repaint);
            
        if (scenes.length) {
            scenes[currentScene].paint(bufferCtx);

            //Clean game Window
            gameCtx.fillStyle = '#000';
            gameCtx.fillRect(0, 0, gameWindow.width, gameWindow.height);
            //Draw buffer into game frame
            gameCtx.imageSmoothingEnabled = false;
            gameCtx.webkitImageSmoothingEnabled = false;
            gameCtx.mozImageSmoothingEnabled = false;
            gameCtx.msImageSmoothingEnabled = false;
            gameCtx.oImageSmoothingEnabled = false;
            gameCtx.drawImage(buffer, bufferOffsetX, bufferOffsetY, buffer.width * bufferScale, buffer.height * bufferScale);
        }
    }
    
    function run() {
        setTimeout(run, 40);
        //Get FPS
        var now = Date.now(),
            deltaTime = (now - lastUpdate) / 1000;
        if (deltaTime > 1) {
            deltaTime = 0;
        }
        lastUpdate = now;
        frames += 1;
        acumDelta += deltaTime;

        if (acumDelta > 1) {
            FPS = frames;
            frames = 0;
            acumDelta -= 1;
        }
         //Run game     
        if (scenes.length) {
            scenes[currentScene].act();
        }
    }

    //Restart the game
    gameScene.load = function() {
        score = 0;
        dir = 1;
        body[0].x = 40;
        body[0].y = 40;
        body.length = 0;
        body.push(new rectangle(40, 40, 10, 10));
        body.push(new rectangle(0, 0, 10, 10));
        body.push(new rectangle(0, 0, 10, 10));
        food.x = random(buffer.width / 10 - 1) * 10;
        food.y = random(buffer.height / 10 - 1) * 10;
        special.x = random(buffer.width / 10 - 1) * 10;
        special.y = random(buffer.height / 10 - 1) * 10;
        stop = false;
        gameOver = false;
        specialCountdown = 0;
        aDie.pause();
        aDie.load();
    }

    function init() {
        // Load buffer
        buffer = document.createElement('canvas');
        bufferCtx = buffer.getContext('2d');
        buffer.width = 300;
        buffer.height = 150;
        //Load canvas
        gameWindow = document.getElementById('gameWindow');
        gameCtx = gameWindow.getContext('2d');
        //Set start values
        gameOver = false;
        stop = false;
        //Create player character
        body.push(new rectangle(40, 40, 10, 10));
        body.push(new rectangle(0, 0, 10, 10));
        body.push(new rectangle(0, 0, 10, 10));
        //Create food
        food = new rectangle(80, 80, 10, 10);
        //Create special
        special = new rectangle(20, 20, 10, 10);
        //Create obstacles
        wall.push(new rectangle(100, 50, 10, 10));
        wall.push(new rectangle(200, 50, 10, 10));
        // wall.push(new rectangle(100, 100, 10, 10));
        wall.push(new rectangle(110, 110, 90, 10));
        // wall.push(new rectangle(200, 100, 10, 10));
        //Load assets
        iHeadUp.src = 'assets/head/head-up.png'
        iHeadDown.src = 'assets/head/head-down.png'
        iHeadRight.src = 'assets/head/head-right.png'
        iHeadLeft.src = 'assets/head/head-left.png'
        iNeckUp.src = 'assets/neck/neck-up.png';
        iNeckDown.src = 'assets/neck/neck-down.png';
        iNeckLeft.src = 'assets/neck/neck-left.png';
        iNeckRight.src = 'assets/neck/neck-right.png';
        iBodyVert.src = 'assets/body/body-vert.png';
        iBodySide.src = 'assets/body/body-side.png';
        iTaleUp.src = 'assets/tale/tale-up.png';
        iTaleDown.src = 'assets/tale/tale-down.png';
        iTaleRight.src = 'assets/tale/tale-right.png';
        iTaleLeft.src = 'assets/tale/tale-left.png';
        iApple.src = 'assets/apple.png';
        iSpecial.src = 'assets/special.png'
        aEat.src = 'assets/eat.wav';
        aSpecial.src ='assets/special.wav';
        aDie.src = 'assets/death.mp4';
        aEat.volume = 0.2;
        aDie.volume = 0.5;
        aSpecial.volume = 0.5;
        // Load saved highscores
        if (localStorage.highscores) {
            highscores = localStorage.highscores.split(',');
        }
        //Inicialice game
        resize();
        run();
        repaint();
    }
    window.addEventListener('resize', resize, false)
    window.addEventListener('load', init, false);

    function clearScore(){
        localStorage.highscores = undefined;
    }
}(window))

