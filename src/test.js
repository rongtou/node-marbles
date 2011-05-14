var x = 400;
var y = 150;
var dx = -4;
var dy = 2;
var dxReset = dx;
var dyReset = dy;
var radius = 10;
var WIDTH;
var HEIGHT;
var SPEED = (1000 / 60);
var ctx = null;
var gameTimer;
var multiplier = 1;
var preloaded = false;
	
//PADDLE
var paddleY;
var paddleX;
var paddleW;
var paddleH;
	
//CONTROLS
var upDown = false;
var downDown = false;
var ballFired = false;
	
var flashUpDown = false;
var flashDownDown = false;
var flashUpCode;
var flashDownCode;
	
var received = false;
var sent = false;
var count = 0;
	
var theirScore = localStorage.getItem('FlashScore');
var yourScore = localStorage.getItem('HTMLScore');
	
var rally = 0;
var highRally = localStorage.getItem('highRally');
var lastRally = localStorage.getItem('lastRally');
	
var gameActive = false;
	
function init(){
    var canvas = document.getElementById('HTMLCanvas');
    if(canvas.getContext){
        ctx = canvas.getContext('2d');
        WIDTH = 400
        HEIGHT = 450
        gameTimer = setInterval(draw, SPEED);
    }
}
	
function initPaddle(){
    paddleY = HEIGHT / 2;
    paddleW = 15;
    paddleH = 100;
}
	
function circle(x, y, r, hex){
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
}
	
function rect(x, y, w, h, hex){
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
}
	
function clear(){
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}
	
function onKeyDown(evt){
		
    var key = evt.keyCode;
    switch(key){
        case 75: 	upDown = true; break;
        case 77: 	downDown = true; break;
        case 65: 	flashUpDown = true;
                            flashUpCode = evt.keyCode; break;
        case 90: 	flashDownDown = true;
                            flashDownCode = evt.keyCode; break;
    }
}
	
function onKeyUp(evt){
		
    var key = evt.keyCode;
		
    switch(key){
        case 75: 	upDown = false; break;
        case 77: 	downDown = false; break;
        case 65: 	flashUpDown = false;
                            flashUpCode = evt.keyCode; break;
        case 90: 	flashDownDown = false;
                            flashDownCode = evt.keyCode; break;
        case 76: 	if(!gameActive && !sent && preloaded){
                                gameActive = true;
                                gameControl = setInterval(gameControler, SPEED); break;
                            }
        case 88: 	window.document.Flash.restartKey(key);
	
    }
		
}
	
function draw (){
    //get previous high score
    clear();
    circle(x, y, radius, '#f2af45');
		
    if(upDown && paddleY > 0){
        paddleY -= 5;
    }else if(downDown && paddleY <= (HEIGHT - paddleH)){
        paddleY += 5;
    }
		
    if(!gameActive){
        x = (WIDTH - paddleW - (paddleW/2+7));
        y = paddleY + (paddleH/2);
        if(upDown && paddleY > 0){
            y -= 5;
        }else if(downDown && paddleY <= (HEIGHT - paddleH)){
            y += 5;
        }
			
    }
		
    if(flashUpDown){
        window.document.Flash.ReceiveKeyboard({press: flashUpDown, key:flashUpCode});
    }else if(flashDownDown){
        window.document.Flash.ReceiveKeyboard({press: flashDownDown, key:flashDownCode});
    }
		
    rect((WIDTH - (paddleW + 1)), paddleY, paddleW, paddleH, '#fff');
}

	
function gameControler(){
        if(!gameActive) return false;
			
        if(x + dx <= 0 && !received){
            //send to flash
            sendToFlash();
            //clearInterval(gameControl);
            var test = x + dx;
            if(test < 0 - radius*2){
                clearInterval(gameControl);
            }else{
                x += dx * multiplier;
                y += dy * multiplier;
            }
        }else{
            if(y + dy > (HEIGHT - radius) || y + dy <= (0 + radius)){
                dy = -dy;
                window.document.Flash.HitWall();
            }

            if(x + dx >= (WIDTH - paddleW) - radius){
                if(y > paddleY && y < paddleY + paddleH){
                    //dy = 8 * ((y-(paddleY + paddleH/2)) / paddleH);
                    dx = -dx
                    multiplier += 0.1;
                    window.document.Flash.ReceivedPong();
                    rally ++;
                    Core.updateRally();

                }else if(x > (WIDTH + radius)){
                    clearInterval(gameTimer);
                    gameActive = false;
                    dx = dxReset;
                    multiplier = 1;
                    gameTimer = setInterval(draw, SPEED);
						
                    clearInterval(gameControl);
                    theirScore ++;
                    Core.updateScore();
                }
            }

            if(x > radius * 3) received = false;
            x += dx * multiplier;
            y += dy * multiplier;
        }
}
//call from flash
    function callFromFlash(receiver){
        sent = false;
        received = true;
        multiplier = receiver.speed;
        y = receiver.yPos;
        x = 0 - Math.abs(receiver.xPos - WIDTH);
        dx = receiver.dx;
        dy = receiver.dy;
        gameControl = setInterval(gameControler, SPEED);
    }

//send call to flash
function sendToFlash(){
    sent = true;
    window.document.Flash.ReceiveJS({speed: multiplier, xPos: x, yPos: y, dx: dx, dy: dy});
}
		
(function($j){
$j(document).keydown(onKeyDown);
$j(document).keyup(onKeyUp);
	
Core = {
		
    flashPaddle: function(){
        rally ++;
        this.updateRally();
    },
		
    getHighScore: function(){
			
        if(!highRally || highRally == undefined || highRally == null){
            highRally = 0
            localStorage.setItem('highRally', highRally);
        }
        $j('em','.best-score').html(localStorage.getItem('highRally'));
			
        if(!lastRally || lastRally == undefined || lastRally == null){
            localStorage.setItem('lastRally', '0');
        }
        $j('em','.last-score').html(localStorage.getItem('lastRally'));
			
    },
		
    updateRally: function(){
			
        highRally = localStorage.getItem('highRally');
			
        if(parseInt(rally) > parseInt(highRally)) localStorage.setItem('highRally', rally);
        $j('em','.best-score').html(localStorage.getItem('highRally'));
        $j('em','.current-score').html(rally);
        lastRally = rally;
    },
		
    updateScore: function(HTMLScore){
        window.document.Flash.ReceiveScore();
        localStorage.setItem('lastRally', lastRally);
        $j('em','.last-score').html(localStorage.getItem('lastRally'));
        rally = 0;
        $j('em','.current-score').html(rally);
        var fader = ('<div class="scored"></div>');
        $j('#Container').append(fader);
            $j('.scored').hide().fadeIn('fast', function(){
                $j(this).fadeOut('fast', function(){
                    $j(this).remove();
                });
        });
			
        if(!HTMLScore){
            localStorage.setItem('FlashScore', theirScore);
            $j('span','#FlashScore').html(localStorage.getItem('FlashScore'));
            rally = 0;
            this.updateRally();
        }else{
            yourScore ++;
            clearInterval(gameControl);
            localStorage.setItem('HTMLScore', yourScore);
            $j('span','#HTMLScore').html(localStorage.getItem('HTMLScore'));
        }
    },
		
    getScores: function(){
			
        var flashScore = localStorage.getItem('FlashScore');
        if(!flashScore || flashScore == undefined){
            flashScore = '0';
        }
        $j('span','#FlashScore').html(flashScore);
			
        var htmlScore = localStorage.getItem('HTMLScore');
        if(!htmlScore || flashScore == undefined){
            htmlScore = '0';
        }
        $j('span','#HTMLScore').html(htmlScore);
			
    },
		
    flashReady: function(){
        preloaded = true;
        init();
        initPaddle();
    },
		
    resetScores: function(){
        var self = this;
        $j('.reset-scores').bind('click', function(){
            localStorage.setItem('FlashScore', '0');
            theirScore = 0;
            yourScore = 0;
            localStorage.setItem('HTMLScore', '0');
				
            self.getScores();
        });
    }
}
	
$j().ready(function(){
    Core.getHighScore();
    Core.getScores();
    Core.resetScores();
});

})(jQuery);
	




