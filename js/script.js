'use strict';
(function (window, undefined) {


    var canvas = undefined,
    ctx = undefined,
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

        rectangle.prototype.fill = function (ctx) {
            if (ctx === undefined) {
            window.console.warn('Missing parameters on function fill');
            } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }   

        rectangle.prototype.drawImage = function (ctx, img) {
            if (img === undefined) {
            window.console.warn('Missing parameters on function drawImage');
            } else {
                if (img.width) {
                ctx.drawImage(img, this.x, this.y);
                } else {
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                }
            }
        }
    

    //Rendering of the play screen
    function paint(ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        
        for (var i = 0; i < body.length; i++){
            if (i === 0){
                ctx.fillStyle = '#E7D084'
                body[i].fill(ctx);
            } else if(i === 1) {
                body[i].drawImage(ctx, iNeck);
                // ctx.drawImage(iNeck, body[i].x, body[i].y);
            } else if (i < body.length){
                body[i].drawImage(ctx, iBody);
                // ctx.drawImage(iBody, body[i].x, body[i].y);
            } else {
                body[i].drawImage(ctx, iTale);
                // ctx.drawImage(iTale, body[i].x, body[i].y);
            }
        }
        food.drawImage(ctx, iApple);
        ctx.fillStyle = '#fff'
        ctx.fillText('Score: ' + score, 0, 10);    

        ctx.fillStyle = '#066'
        for (i = 0; i < wall.length; i++){
            wall[i].fill(ctx);
        }

        ctx.fillStyle = '#fff'
        if (stop) {
            ctx.textAlign = 'center';
            if (gameOver) {
                ctx.fillText('GAME OVER', 150, 75);
            ctx.fillText('Press ENTER to restart', 150, 95);
            } else {
            ctx.fillText('PAUSE', 150, 75);
            }
            ctx.textAlign = 'left';
            }
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
        food.x = random(canvas.width / 10 - 1) * 10;
        food.y = random(canvas.height / 10 - 1) * 10;
        gameOver = false;
        aDie.pause();
        aDie.load();
    }
    //Comands and actions.
    document.addEventListener('keydown', function (event) {
        lastCommand = event.key || event.keyCode || event.code
        }, false);


    function act() {
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
            for (i = body.length - 1; i > 0; i -= 1) {
                body[i].x = body[i - 1].x;
                body[i].y = body[i - 1].y;
                }
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
            if (body[0].x > canvas.width) {
                body[0].x = 0;
                }
            if (body[0].y > canvas.height){
                body[0].y = 0
            }
            if (body[0].x < 0) {
                body[0].x = canvas.width;
                }
            if (body[0].y < 0) {
                body[0].y = canvas.height ;
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

            if (body[0].intersect(food)) {
                body.push(new rectangle(0, 0, 10, 10));
                score += 1;
                aEat.play();
                food.x = random(canvas.width / 10 - 1) * 10;
                food.y = random(canvas.height / 10 - 1) * 10;
                }

            for (var i = 0, l = wall.length; i < l; i += 1) {
                if (food.intersect(wall[i])) {
                food.x = random(canvas.width / 10 - 1) * 10;
                food.y = random(canvas.height / 10 - 1) * 10;
                }
                if (body[0].intersect(wall[i])) {
                aDie.play();
                stop = true;
                gameOver = true; 
                }
            }
            for (i = 2; i < body.length; i ++) {
                if (body[0].intersect(body[i])) {
                aDie.play();
                gameOver = true;
                stop = true;
                }
            }
            
    }

    function repaint() {
        window.requestAnimationFrame(repaint);
        paint(ctx);
    }

    function run() {
        setTimeout(run, 50);
        act();
    }

    function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    gameOver = false;
    stop = true;

    body.length = 0;
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

    run();
    repaint();
    }

    window.addEventListener('load', init, false);


}(window))

