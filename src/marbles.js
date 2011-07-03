var screenWidth, screenHeight;
var marble, leftBoard, rightBoard;
var ctx;
var gameLoopHandler;
var gameActive = true;
var FPS = 60;
var LOOPINTERVAL = 1000 / FPS;

var leftBoardUp, leftBoardDown;
var rightBoardUp, rightBoardDown;
var RADIUS = 10, BOARD_WIDTH = 15, BOARD_HEIGHT = 80, BOARD_SPEED = 5;

var dx = 5, dy = 2;

$(window).ready(function() {
    initGameEnv();
    initEventHandlers();
    initSpirites();
    initPosition();
});

function initEventHandlers() {
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
    $('#btnRestart').click(function(e){
        ctx.clearRect(0, 0, screenWidth, screenHeight);
        initPosition();
    });
}

function initGameEnv() {
    ctx = document.getElementById('marbleTable').getContext('2d');
    screenWidth = parseInt($("#marbleTable").attr("width"));
    screenHeight = parseInt($("#marbleTable").attr("height"));
}

function initSpirites() {
    marble = new Marble(10, "#FFFF00");
    leftBoard = new Board(BOARD_WIDTH, BOARD_HEIGHT, "#00FF00");
    rightBoard = new Board(BOARD_WIDTH, BOARD_HEIGHT, '#00FF00');
}

function initPosition(){
    marble.move(BOARD_WIDTH + RADIUS, (screenHeight - RADIUS)/2);
    marble.draw();
    leftBoard.move(0, (screenHeight - BOARD_HEIGHT)/2);
    leftBoard.draw();
    rightBoard.move(screenWidth - BOARD_WIDTH, (screenHeight - BOARD_HEIGHT)/2);
    rightBoard.draw();
}

function Spirit() {
    this.x = 0;
    this.y = 0;
    this.color = "#000000";
}

function Marble(radius, color) {
    this.radius = radius;
    this.color = color;
}

Marble.prototype = new Spirit();
Marble.prototype.move = function(x, y) {
    this.x = x;
    this.y = y;
};

Marble.prototype.draw = function() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
};

function Board(width, height, color) {
    this.width = width;
    this.height = height;
    this.color = color;
}

Board.prototype = new Spirit();
Board.prototype.move = function(x, y) {
    this.x = x;
    this.y = y;
};

Board.prototype.draw = function() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.closePath();
    ctx.fill();
};

function gameLoop() {
    if(!gameActive){
        clearInterval(gameLoopHandler);
        return;
    }
    
    ctx.clearRect(0, 0, screenWidth, screenHeight);
    ctx.save();
    moveBoard();
    moveMarble();
    ctx.restore();

    checkMarbleHitEdge();
    checkMarbleBoardHitTest();
}

function moveMarble(){
    marble.move(marble.x + dx, marble.y + dy);
    marble.draw();
}

function moveBoard() {
    if (leftBoardUp) {
        leftBoard.y -= BOARD_SPEED;
    }
    else if (leftBoardDown) {
        leftBoard.y += BOARD_SPEED;
    }

    if (rightBoardUp) {
        rightBoard.y -= BOARD_SPEED;
    }
    else if (rightBoardDown) {
        rightBoard.y += BOARD_SPEED;
    }

    leftBoard.y = Math.max(0, Math.min(screenHeight - leftBoard.height, leftBoard.y));
    rightBoard.y = Math.max(0, Math.min(screenHeight - rightBoard.height, rightBoard.y));

    leftBoard.draw();
    rightBoard.draw();
}

function checkMarbleHitEdge(){
    if(marble.x > screenWidth - marble.radius){
        if(dx > 0){
            gameActive = false;
            alert("LEFT WIN");
        }
    }
    else if(marble.x < marble.radius){
        if(dx < 0){
            gameActive = false;
            alert("RIGHT WIN");
        }
    }
    else if(marble.y < marble.radius){
        dy = -dy;
    }
    else if(marble.y > screenHeight - marble.radius){
        dy = -dy;
    }
}

function checkMarbleBoardHitTest(){
    //先当形状都为矩形来检测碰撞
    if(checkIntersect(marble, leftBoard)){
        dx = -dx;
    }
    else if(checkIntersect(marble, rightBoard)){
        dx = -dx;
    }

}

function checkIntersect(marble, board){
    var marbleCenterX = marble.x;
    var marbleCenterY = marble.y;
    var boardCenterX = board.x + BOARD_WIDTH / 2;
    var boardCenterY = board.y + BOARD_HEIGHT / 2;

    if(Math.abs(marbleCenterX - boardCenterX) < RADIUS + BOARD_WIDTH / 2 &&
            Math.abs(marbleCenterY - boardCenterY) < RADIUS + BOARD_HEIGHT / 2)
        return true;
    else
        return false;
}

function onKeyDown(evt) {
    var key = evt.keyCode;
    switch (key) {
        case 83:
            leftBoardUp = true;
            break;
        case 88:
            leftBoardDown = true;
            break;
        case 75:
            rightBoardUp = true;
            break;
        case 77:
            rightBoardDown = true;
            break;
    }
}

function onKeyUp(evt) {
    var key = evt.keyCode;
    switch (key) {
        case 83://s
            leftBoardUp = false;break;
        case 88://x
            leftBoardDown = false;break;
        case 65://A
            start();break;

        case 75://k
            rightBoardUp = false;break;
        case 77://m
            rightBoardDown = false;break;
        case 76://L
            start();break;

        default:
            break;
    }
}

function start(){
    gameActive = true;
    clearInterval(gameLoopHandler);
    gameLoopHandler = setInterval(gameLoop, LOOPINTERVAL);
}