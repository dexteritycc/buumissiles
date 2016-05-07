var theCanvas = document.getElementById("mainCanvas");
var theCanvasHeight = theCanvas.height; 
var theCanvasWidth = theCanvas.width;
var context = theCanvas.getContext("2d");
context.translate(theCanvasWidth/2,theCanvasHeight/2);
var flightImage = new Image();
var myFlightImage = new Image();
var backgroundImage = new Image();
var missileImage = new Image();
var missileSignImage = new Image();

var socket = io();
var socketId;
var localData = {};
var SSPS = [];
var mousePos = {};
var currentPos = {};
var myFlight;
var flights = [];
var missiles = [];
var groundWidth = 600;
var groundHeight = 600;
var currenthp = 0;

function init(){
	var username = prompt("What's your name?", "Guest");
	if(username == undefined){
		return;
	}
	theCanvas.style.display = "block";
	myFlight = new Flight(0, 0, myFlightImage, 0, 0, "");
	// mySSP = new SimpleSquareParticle(squareX, squareY);
	socket.on('getSocketId', function(data){
		socketId = data;
		// console.log(socketId);
		socket.emit('update_username',{socketId: socketId, username: username});
	});
	
	addListeners();


	socket.on('timeTick', function(data){
		localData = JSON.parse(data);
		// console.log(data);
		if(localData.users[socketId] != undefined ){
			currentPos = {x: localData.users[socketId].posX, y: localData.users[socketId].posY};
			currenthp = localData.users[socketId].hp;
		}
	});
	timer = setInterval(onTimerTick, 1000/30);
	
}


function inputDownListener(touchX, touchY){
	// socket.emit('pos',{socketId: socketId, x:touchX, y:touchY});
	console.log(localData);
}

function inputMoveListener(touchX, touchY){
	touchX-= theCanvasWidth/2;
	touchY-= theCanvasHeight/2;
	mousePos = {x:touchX , y:touchY};
}

function inputUpListener(touchX, touchY){
	
}

function drawFlights() {
	// flights = [];
	for(var k in localData.users) {
		if(k!= socketId)
		{
			var user = localData.users[k];
			// flights.push(new Flight(user.posX- currentPos.x
			// , user.posY- currentPos.y
			// , flightImage, user.angle, user.hp, user.username));
			var oflight = new Flight(user.posX- currentPos.x
			, user.posY- currentPos.y
			, flightImage, user.angle, user.hp, user.username);
			oflight.drawToContext(context, user.hp);
		}
	}

	// for(var i = 0; i < flights.length; ++i){
	// 	flights[i].drawToContext(context);
	// }
	
}

function drawMissiles() {
	// missiles = [];
	var i;
	for(i = 0; i < localData.missiles.length; ++i) {
		var missileData = localData.missiles[i];
		if(i < missiles.length){
			missiles[i].set(missileData.posX - currentPos.x
								, missileData.posY - currentPos.y
								, missileData.angle
								, missileData.isExploding
								, missileData.explodingTimer);
		}else{
			missiles.push(new Missile(missileData.posX - currentPos.x
								, missileData.posY - currentPos.y
								, missileData.angle
								, missileImage, missileSignImage
								, missileData.isExploding
								, missileData.explodingTimer));
		}
	}
	if(i < missiles.length){
		missiles.splice(i, missiles.length - localData.missiles.length);
	}


	for(i = 0; i < missiles.length; ++i){
		missiles[i].drawToContext(context);
	}
	
}

function drawFlight() {
	// console.log(mousePos);
	myFlight.rotateToward(mousePos.x, mousePos.y);
	// myFlight.x = currentPos.x;
	// myFlight.y = currentPos.y;
	myFlight.drawToContext(context, currenthp);
}



function drawScreen() {
	context.fillStyle = "#FFFFFF";
	context.fillRect(-theCanvasWidth/2,-theCanvasHeight/2
					,theCanvasWidth,theCanvasHeight);
	context.strokeStyle="#000099";
	context.strokeRect(-currentPos.x,-currentPos.y,groundWidth,groundHeight);
	// context.drawImage(backgroundImage
	// 						, -currentPos.x, -currentPos.y
	// 						, backgroundImage.width
	// 						, backgroundImage.height);
	// for(var i = 0; i < SSPS.length; ++i){
	// 	SSPS[i].drawToContext(context);
	// }
}




function onTimerTick(){
	drawScreen();
	// SSPS = [];
	// for(var k in localData){
	// 	SSPS.push(new SimpleSquareParticle(localData[k].posX, localData[k].posY));
	// }
	drawFlights();
	drawFlight();
	drawMissiles();
	socket.emit('flight_turn',{socketId: socketId, angle: myFlight.getDegree()});
}


function addListeners(){
	theCanvas.addEventListener('mousedown', mouseDownListener, false);
	theCanvas.addEventListener('touchstart', touchDownListener, false);
	window.addEventListener('mousemove', mouseMoveListener, false);
	window.addEventListener('touchmove', touchMoveListener, false);
	window.addEventListener('mouseup', mouseUpListener, false);
	window.addEventListener('touchend', touchUpListener, false);
}



function mouseDownListener(evt){
	var bRect = theCanvas.getBoundingClientRect();
	touchX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
	touchY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
	inputDownListener(touchX, touchY);
}

function touchDownListener(evt){
	evt.preventDefault();	evt.stopPropagation();
	var bRect = theCanvas.getBoundingClientRect();
	var touches = evt.changedTouches;
	touchX = (touches[0].pageX - bRect.left)*(theCanvas.width/bRect.width);
	touchY = (touches[0].pageY - bRect.top)*(theCanvas.height/bRect.height);
	inputDownListener(touchX, touchY);
}

function mouseMoveListener(evt){
	var bRect = theCanvas.getBoundingClientRect();
	touchX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
	touchY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
	inputMoveListener(touchX, touchY);
}

function touchMoveListener(evt){
	evt.preventDefault();	evt.stopPropagation();
	var bRect = theCanvas.getBoundingClientRect();
	var touches = evt.changedTouches;
	touchX = (touches[0].pageX - bRect.left)*(theCanvas.width/bRect.width);
	touchY = (touches[0].pageY - bRect.top)*(theCanvas.height/bRect.height);
	inputMoveListener(touchX, touchY);
}

function mouseUpListener(evt){
	var bRect = theCanvas.getBoundingClientRect();
	touchX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
	touchY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
	inputUpListener(touchX, touchY);
}

function touchUpListener(evt){
	evt.preventDefault();	evt.stopPropagation();
	var bRect = theCanvas.getBoundingClientRect();
	var touches = evt.changedTouches;
	touchX = (touches[0].pageX - bRect.left)*(theCanvas.width/bRect.width);
	touchY = (touches[0].pageY - bRect.top)*(theCanvas.height/bRect.height);
	inputUpListener(touchX, touchY);
}

function loadImage(image, src) {
	image.src = src;
	return new Promise(function(resolve, reject){
		image.onload = resolve;
		image.onerror = reject;
	});
}


var loadPromises = [
	loadImage(missileImage, "shapes/img/missileIcon.png"),
	loadImage(missileSignImage, "shapes/img/missile-sign.png"),
	loadImage(flightImage, "shapes/img/flightIcon.png"),
	loadImage(myFlightImage, "shapes/img/myFlightIcon.png"),
	loadImage(backgroundImage, "shapes/img/background.png"),
	// loadImage(gasImage, "shapes/img/gasIcon.png"),
	// loadImage(gasSignImage, "shapes/img/gasIcon-sign.png")
];



Promise.all(loadPromises).then(init());
