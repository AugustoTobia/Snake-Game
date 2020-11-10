'use strict';
(function (window, undefined) {


    var gameWindow = undefined,
    gameCtx = undefined,
    lastCommand = undefined,
    keyLeft = 37,
    keyUp = 38,
    keyRight = 39,
    keyDown = 40,
    dir = 1,
    stop = true,
    body = [],
    food = new rectangle(80, 80, 10, 10),
    wall = [],
    score = 0,
    gameOver = false;

    //assets
    var iNeck = new Image(),
    iBody = new Image(),
    iTale = new Image(),
    iApple = new Image(),
    aEat = new Audio(),
    aSpecial = new Audio(),
    aDie = new Audio();

    //FPS calculation
    var lastUpdate = 0,
    FPS = 0,
    frames = 0,
    acumDelta = 0;
        
    //Buffer
    var buffer = null,
    bufferCtx = null,
    bufferScale = 1,
    bufferOffsetX = 0,
    bufferOffsetY = 0;

    //Scenes
    var currentScene = 0,
    scenes = []

    function random(max){
        return ~~(Math.random() * max);
    }

    window.requestAnimationFrame = (function (){
        return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (cb){
            window.setTimeout(callback, 17);
        }
    }());

    function rectangle (x, y, width, height){
        this.x = (x === undefined) ? 0 : x;
        this.y = (y === undefined) ? 0 : y;
        this.width = (width === undefined) ? 0 : width;
        this.height = (height === undefined) ? this.width : height;
    }
    rectangle.prototype.intersect = function (rect) {
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
    }

    rectangle.prototype.fill = function (gameCtx) {
        if (gameCtx === undefined) {
        window.console.warn('Missing parameters on function fill');
        } else {
        gameCtx.fillRect(this.x, this.y, this.width, this.height);
        }
    }   

    rectangle.prototype.drawImage = function (gameCtx, img) {
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
    
    //Rezising the game window
    // function resize(){
    //     var w = window.innerWidth / gameWindow.width,
    //         h = window.innerHeight / gameWindow.height,
    //         scale = Math.min(h, w);
    //         scale = scale * 0.9;
    //     gameWindow.style.width = (gameWindow.width * scale) + 'px';
    //     gameWindow.style.height = (gameWindow.height * scale) + 'px';
    // }
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




    //Comands and actions.
    document.addEventListener('keydown', function (event) {
        lastCommand = event.key || event.keyCode || event.code
        }, false);

    function act(deltaTime) {
        if (!stop){

            //worm Movement
            if (lastCommand === keyUp && dir !== 2 || lastCommand === 'ArrowUp' && dir != 2) {
                dir = 0;
            }
            if (lastCommand === keyRight && dir !== 3 || lastCommand === 'ArrowRight'&& dir !== 3 ) {
                dir = 1;
            }
            if (lastCommand === keyDown && dir !== 0 || lastCommand === 'ArrowDown' && dir !== 0) {
                dir = 2;
            }
            if (lastCommand === keyLeft && dir !== 1 || lastCommand === 'ArrowLeft' && dir !== 1) {
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

            // if (dir === 0) {
            //     body[0].y -= 120 * deltaTime;
            //     }
            // if (dir === 1) {
            //     body[0].x += 120 * deltaTime;
            //     }
            // if (dir === 2) {
            //     body[0].y += 120 * deltaTime;
            //     }
            // if (dir === 3) {
            //     body[0].x -= 120 * deltaTime;
            //     }

            //Pass through walls   
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
            //Pause or Game Over
            if (lastCommand === 13 || lastCommand === 'Enter'){
                stop = !stop;
                if (gameOver){
                    reset();
                }
                lastCommand = null;
            }
            //Objet Colision
            if (body[0].intersect(food)) {
                body.push(new rectangle(0, 0, 10, 10));
                score += 1;
                aEat.play();
                food.x = random(buffer.width / 10 - 1) * 10;
                food.y = random(buffer.height / 10 - 1) * 10;
                }

            for (var i = 0, l = wall.length; i < l; i += 1) {
                if (food.intersect(wall[i])) {
                food.x = random(buffer.width / 10 - 1) * 10;
                food.y = random(buffer.height / 10 - 1) * 10;
                }
                if (body[0].intersect(wall[i])) {
                aDie.play();
                stop = true;
                gameOver = true; 
                }
            }
            for (var i = 2; i < body.length; i += 1) {
                if (body[0].intersect(body[i])) {
                aDie.play();
                gameOver = true;
                stop = true;
                }
            }
            
    }

        //Rendering of the play screen
        function paint(bufferCtx) {
            //Clean canvas
            bufferCtx.fillStyle = '#000';
            bufferCtx.fillRect(0, 0, gameWindow.width, gameWindow.height);
        
            //Draw snake
            for (var i = 0; i < body.length; i++){
                if (i === 0){
                    bufferCtx.fillStyle = '#E7D084'
                    body[i].fill(bufferCtx);
                } else if(i === 1) {
                    body[i].drawImage(bufferCtx, iNeck);
                    // ctx.drawImage(iNeck, body[i].x, body[i].y);
                } else if (i < body.length){
                    body[i].drawImage(bufferCtx, iBody);
                    // ctx.drawImage(iBody, body[i].x, body[i].y);
                } else {
                    body[i].drawImage(bufferCtx, iTale);
                    // ctx.drawImage(iTale, body[i].x, body[i].y);
                }
            }
            // Draw apple
            food.drawImage(bufferCtx, iApple);
            bufferCtx.fillStyle = '#fff'

            //Draw walls
            bufferCtx.fillStyle = '#066'
            for (i = 0; i < wall.length; i++){
                wall[i].fill(bufferCtx);
            }

            //Draw Score
            bufferCtx.fillText('Score: ' + score, 10, 10);
            
            //Draw FPS
            bufferCtx.fillText('FPS: ' + FPS, 250, 10);

            //Draw pause || game over
            bufferCtx.fillStyle = '#fff'
            if (stop) {
                bufferCtx.textAlign = 'center';
                if (gameOver) {
                    bufferCtx.fillText('GAME OVER', 150, 75);
                    bufferCtx.fillText('Press ENTER to restart', 150, 95);
                } else {
                    bufferCtx.fillText('PAUSE', 150, 75);
                }
                bufferCtx.textAlign = 'left';
                }
        }
    
    function repaint() {
            //Fill buffer
            window.requestAnimationFrame(repaint);
            paint(bufferCtx);
            //Clean game Window
            gameCtx.fillStyle = '#000';
            gameCtx.fillRect(0, 0, gameWindow.width, gameWindow.height);
            //Draw buffer into game window
            gameCtx.imageSmoothingEnabled = false;
            gameCtx.webkitImageSmoothingEnabled = false;
            gameCtx.mozImageSmoothingEnabled = false;
            gameCtx.msImageSmoothingEnabled = false;
            gameCtx.oImageSmoothingEnabled = false;
            gameCtx.drawImage(buffer, bufferOffsetX, bufferOffsetY, buffer.width * bufferScale, buffer.height * bufferScale)    }
    
    function run() {
        setTimeout(run, 25)
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
              
        act(deltaTime);
    }

    //Restart the game
    function reset() {
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
        gameOver = false;
        aDie.pause();
        aDie.load();
    }

    function init() {
    // Load buffer
    buffer = document.createElement('canvas');
    bufferCtx = buffer.getContext('2d');
    buffer.width = 300;
    buffer.height = 150;

    gameWindow = document.getElementById('gameWindow');
    gameCtx = gameWindow.getContext('2d');
    gameOver = false;
    stop = true;

    // body.length = 0;
    body.push(new rectangle(40, 40, 10, 10));
    body.push(new rectangle(0, 0, 10, 10));
    body.push(new rectangle(0, 0, 10, 10));

    iNeck.src = 'assets/neck.png';
    iBody.src = 'assets/body.png';
    iTale.src = 'assets/tale.png';
    iApple.src = 'assets/apple.png';
    aEat.src = 'assets/eat.wav';
    aSpecial.src ='assets/special.wav';
    aDie.src = 'assets/death.mp4';
    aEat.volume = 0.2;
    aDie.volume = 0.5;
    aSpecial.volume = 0.5;

    wall.push(new rectangle(100, 50, 10, 10));
    wall.push(new rectangle(100, 100, 10, 10));
    wall.push(new rectangle(200, 50, 10, 10));
    wall.push(new rectangle(200, 100, 10, 10));

    resize();
    run();
    repaint();
    }
    window.addEventListener('resize', resize, false)
    window.addEventListener('load', init, false);


}(window))

