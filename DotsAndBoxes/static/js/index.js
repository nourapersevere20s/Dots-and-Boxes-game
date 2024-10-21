/**
This javascript file handles the drawing of dots and boxes
and click events, it coordinates with backend Python flask
framework through ajax calls and makes the AI player moves
to be reflected in the UI
**/

let totalDots = 0;
//GENERAL CONSTANTS OF THE GAME
var CIRCLE_RADIUS = 6;
var CIRCLE_DIAMETER = CIRCLE_RADIUS * 2;
var INTER_SPACING = 45;
var TOTAL_PADDING = INTER_SPACING / 2;
var DRAG_DISTANCE = 15;

//variables associated with the game
let dotsList = [];
let squaresList = [];
let linksList = [];
let startingDot = null;
let c = null;

let playerColors = { p1: null, p2: null };
let currentScores = { p1: 0, p2: 0 };
let turn = 'p1';
let computerTurn = false;

//Circle class to represent the dot in the game
// it contains x,y coordinate in the UI, radius , and gx,gy for
//array values
function Circle(xPos, yPos, radius, gx, gy) {
  //assign the values to instance variables
  this.x = xPos;
  this.y = yPos;
  this.radius = radius;
  this.gx = gx;
  this.gy = gy;
  //declare the draw function to be called
  // during each click or refresh of the board
  this.draw = function() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
    c.fillStyle = 'white';
    c.fill();
  }
  //This function is called when the grid size of the
  //board is changed
  this.update = function() {
    //deterine whether the click position falls within the circle coordinates
    if ((mouse.x - this.x < DRAG_DISTANCE && mouse.x - this.x > -DRAG_DISTANCE &&
        mouse.y - this.y < DRAG_DISTANCE && mouse.y - this.y > -DRAG_DISTANCE) ||
        startingDot === this) {
      //we will hover the circle on mouse placed over it
      this.radius = CIRCLE_RADIUS * 1.5;
    } else {
      this.radius = CIRCLE_RADIUS;
    }
    // this block of code will handle the click event of the circles or dots
    //if the click positions falls within the circles position, then make
    // a link between starting and ending circles
    if (click.x < this.x + this.radius && click.x > this.x - this.radius &&
        click.y < this.y + this.radius && click.y > this.y - this.radius) {
        // if already exists, then check for valid move
      if (startingDot) {
      //in case the drag is valid , then drawline between two circles
        if (isValidMove(this)) {
          drawLine(this);
        } else {
          startingDot = null;
        }
      } else {
        startingDot = this;
      }
      //reassign to default values
      click.x = undefined;
      click.y = undefined;
    }
    //draw the dot finally after creation
    this.draw();
  }
}

function start_game() {
    totalDots = document.getElementById("board_size");
     $.ajaxSetup({async: false});
        $.ajax({
				url: '/game',
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({ 'size':  totalDots}),
				success: function(response) {
                },
				error: function(error) {
					console.log(error);
				}
		});
	$.ajaxSetup({async: true});
    init();
}

/**
This function is used to pass the player move to backend python flask frammework
and get back the computer move
**/
function player_move(start_x, start_y, end_x, end_y) {
    var link = start_x +"," + start_y + "," + end_x + ","+ end_y;
    $.ajaxSetup({async: false});

		$.ajax({
				url: '/player_move',
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify({ 'link':  link}),
				success: function(response) {
                },
				error: function(error) {
					console.log(error);
				}
		});
	//	console.log("Returning from player move ajax:");
		$.ajaxSetup({async: true});
		return "";
}

/**
This function is used to pass the player move to backend python flask frammework
and get back the computer move
**/
function computer_move() {
    $.ajaxSetup({async: false});
	    const comp_moves = [];
		$.ajax({
				url: '/computer_move',
				type: 'POST',
				contentType: 'application/json',
				success: function(response) {
                    var result_links = response.split(",");
                    comp_moves.push(result_links[0]);
                    comp_moves.push(result_links[1]);
                    comp_moves.push(result_links[2]);
                    comp_moves.push(result_links[3]);
                },
				error: function(error) {
					console.log(error);
				}
		});
		//console.log("Returning from ajax comp moves:"+ comp_moves.length);
		$.ajaxSetup({async: true});
		var result = comp_moves[0] + "," + comp_moves[1] + "," + comp_moves[2] + "," +comp_moves[3];
		return result;
}

/*
CLass used to represent the link between two dots
*/
function Link(start, end) {
  //console.log("------------------------------------");
 // console.log("Creating link start x:" +start.gx + " y:" +start.gy);
////  console.log(" End gx:" +end.gx + " gy:" +end.gy);
//  console.log("------------------------------------");
  //check whether same row
  if (start.gy === end.gy) {
        //left to right movement
		if (start.gx < end.gx) {
			this.start = start;
			this.end = end;
		} else {//right to left movement
			this.start = end;
			this.end = start;
		}
	} else { //check whether between columns
		if (start.gy < end.gy) { //top to bottom
			this.start = start;
			this.end = end;
		} else { //bottom to top
			this.start = end;
			this.end = start;
		}
	}

 // FUnction to draw the link
  this.draw = function() {
    c.beginPath();
    c.lineWidth = 5;
    c.moveTo(this.start.x, this.start.y);
    c.lineTo(this.end.x, this.end.y);
    c.strokeStyle = '#0000FF';
    c.stroke();
  }
}

//Class used to represent the completed square in game
function Square(startX, startY, endX, endY, colour) {
    //set the variables
	this.sX = startX;
	this.sY = startY;
	this.eX = endX;
	this.eY = endY;
	this.colour = colour;
	//update score and draw function
	updateScores();
	this.draw = function() {
		c.fillStyle = this.colour;
		c.fillRect(this.sX, this.sY, this.eX, this.eY);
	}
}


function drawCurrentLinks() {
  c.beginPath();
  c.lineWidth = 5;
  c.shadowBlur = 0;
  c.moveTo(startingDot.x, startingDot.y);
  c.lineTo(mouse.x, mouse.y);
  c.strokeStyle = '#0000FF';
  c.stroke();
}

function isValidMove(target) {
	if (linksList.find(link =>
		(startingDot.gx === link.start.gx && startingDot.gy === link.start.gy
		&& target.gx === link.end.gx && target.gy === link.end.gy) ||
		(startingDot.gx === link.end.gx && startingDot.gy === link.end.gy
		&& target.gx === link.start.gx && target.gy === link.start.gy)
	)) return false;

	linksList.find(link =>
		startingDot.gx === link.start.gx && startingDot.gy === link.start.gy
		&& target.gx === link.end.gx && target.gy === link.end.gy
	)

	if (((startingDot.gx === target.gx - 1 || startingDot.gx === target.gx + 1) && startingDot.gy === target.gy) || // x-move
		  ((startingDot.gy === target.gy - 1 || startingDot.gy === target.gy + 1) && startingDot.gx === target.gx)) { // y-move
		return true;
	}

	return false;
}

function drawLine(target) {
var p1Score = document.getElementById("p1Score").innerHTML;
	        var p2Score = document.getElementById("p2Score").innerHTML;
	         console.log("P1:" + p1Score + ",P2:" +p2Score);
   var newLink = new Link(startingDot, target);
   linksList.push(newLink);
    start = startingDot;
    end = target;
	let squareCount = squaresList.length;
	checkForBox(newLink);
    startingDot = null;
    console.log ("Human Played:" + start.gx + "," + start.gy + "," +end.gx + "," + end.gy);
    player_move(start.gx, start.gy, end.gx, end.gy);
    console.log ("Updated to Backend");
	if (squareCount === squaresList.length) {
		turn = turn === 'p1' ? 'p2' : 'p1';
		//document.querySelector('#turn').classList.toggle('p2-turn');
		console.log("1 NEXT TURN : Computer" );
		computerTurn = true;
		add_overlay();
		//makeComputerMove();
	}
	else{
	    checkGameOver();
	    console.log("1 NEXT TURN : HUMAN" );
	}


}

function makeComputerMove() {
    var comp_move = computer_move();
    console.log ("Computer MOved over:" + comp_move);
    var coords = comp_move.split(",");
    var x1 = parseInt(coords[0]);
    var y1 = parseInt(coords[1]);
    var x2 = parseInt(coords[2]);
    var y2 = parseInt(coords[3]);

    var startDot = getDotObject(x1,y1);
    var endDot = getDotObject(x2,y2);

    var newLink = new Link(startDot, endDot);
    linksList.push(newLink);
	let squareCount = squaresList.length;
	checkForBox(newLink);

	if (squareCount === squaresList.length) {
		console.log("2 NEXT TURN : HUMAN" );
		turn = turn === 'p1' ? 'p2' : 'p1';
		//document.querySelector('#turn').classList.toggle('p2-turn');
		remove_overlay();
	}
	else{
	    if (!isGameOver()) {
	        makeComputerMove();
	        console.log("2 NEXT TURN : Computer" );
	    }
	    else{
	        remove_overlay();
	        checkGameOver();
	    }
	  //document.getElementById("playerText").value = "computer";
	}
}

function checkGameOver() {
            var p1Score = document.getElementById("p1Score").innerHTML;
	        var p2Score = document.getElementById("p2Score").innerHTML;
	        console.log("P1:" + p1Score + ",P2:" +p2Score);
  	    if (isGameOver()) {

	        if (p1Score < p2Score) {
	            alert("Computer Won the Game!");
	        }
	        else if (p1Score > p2Score) {
	            alert("You Won the Game!");
	        }
	        else{
	            alert("Game Drawn");
	        }
	        init();
	        init_game();
	        document.getElementById("p1Score").innerHTML = 0;
            document.getElementById("p2Score").innerHTML = 0;
	    }
	    else{
	       console.log("Game not over!");
	    }
}

function isGameOver() {
        $.ajaxSetup({async: false});
	    var result = false;
		$.ajax({
				url: '/is_gameOver',
				type: 'POST',
				contentType: 'application/json',
				success: function(response) {
                    if (response === "true") {
                        result = true;
                    }
                    else{
                    result = false;
                    }
                },
				error: function(error) {
					console.log(error);
				}
		});

		$.ajaxSetup({async: true});
        return result;
}


function getDotsCount() {
        $.ajaxSetup({async: false});
	    var result = 0;
		$.ajax({
				url: '/getSize',
				type: 'POST',
				contentType: 'application/json',
				success: function(response) {
                    result = parseInt(response);
                },
				error: function(error) {
					console.log(error);
				}
		});
		$.ajaxSetup({async: true});
        return result;
}




/**
Function used to check whether a box is formed
**/
function checkForBox(link) {
	if (link.start.gy === link.end.gy) {
		if (link.start.gy !== 0) {
			const upperLeft = linksList.find(l => l.start.gy === link.start.gy - 1 && l.end.gy === link.start.gy && l.start.gx === link.start.gx);
			const upperTop = linksList.find(l => l.start.gx === link.start.gx && l.end.gx === link.end.gx && l.start.gy === link.start.gy - 1);
			const upperRight = linksList.find(l => l.start.gy === link.start.gy - 1 && l.end.gy === link.start.gy && l.start.gx === link.end.gx);

			if (upperLeft && upperTop && upperRight) {
				squaresList.push(new Square(upperTop.start.x, upperTop.start.y, INTER_SPACING, INTER_SPACING, playerColors[turn]));
			}
		}

		if (link.start.gy !== totalDots - 1) {
			const lowerLeft = linksList.find(l => l.start.gy === link.start.gy && l.end.gy === link.start.gy + 1 && l.start.gx === link.start.gx);
			const lowerBottom = linksList.find(l => l.start.gx === link.start.gx && l.end.gx === link.end.gx && l.start.gy === link.start.gy + 1);
			const lowerRight = linksList.find(l => l.start.gy === link.end.gy && l.end.gy === link.end.gy + 1 && l.start.gx === link.end.gx);

			if (lowerLeft && lowerBottom && lowerRight) {
				squaresList.push(new Square(lowerLeft.start.x, lowerLeft.start.y, INTER_SPACING, INTER_SPACING, playerColors[turn]));
			}
		}
	}
	else {
		if (link.start.gx !== 0) {
			const leftTop = linksList.find(l => l.start.gx === link.start.gx - 1 && l.end.gx === link.start.gx && l.start.gy === link.start.gy);
			const leftLeft = linksList.find(l => l.start.gy === link.start.gy && l.end.gy === link.end.gy && l.start.gx === link.start.gx - 1);
			const leftBottom = linksList.find(l => l.start.gx === link.end.gx - 1 && l.end.gx === link.end.gx && l.start.gy === link.end.gy);

			if (leftTop && leftLeft && leftBottom) {
				squaresList.push(new Square(leftTop.start.x, leftTop.start.y, INTER_SPACING, INTER_SPACING, playerColors[turn]));
			}
		}

		if (link.start.gx !== 0) {
			const rightTop = linksList.find(l => l.start.gx === link.start.gx && l.end.gx === link.start.gx + 1 && l.start.gy === link.start.gy);
			const rightRight = linksList.find(l => l.start.gy === link.start.gy && l.end.gy === link.end.gy && l.start.gx === link.start.gx + 1);
			const rightBottom = linksList.find(l => l.start.gx === link.end.gx && l.end.gx === link.end.gx + 1 && l.start.gy === link.end.gy);

			if (rightTop && rightRight && rightBottom) {
				squaresList.push(new Square(rightTop.start.x, rightTop.start.y, INTER_SPACING, INTER_SPACING, playerColors[turn]));
			}
		}
	}
}

//ddeclare the mouse coosrinated
var mouse = {
  x: undefined,
  y: undefined
};

window.addEventListener('mousemove', function(e) {
  var canvas = document.querySelector('canvas');
  var square = canvas.getBoundingClientRect();
  mouse.x = e.x - square.left;
  mouse.y = e.y - square.top;
});

//declare the click coordinate variable
var click = {
  x: undefined,
  y: undefined
};

// add event listener for the window
window.addEventListener('mousedown', function(e) {
var canvas = document.querySelector('canvas');
  var square = canvas.getBoundingClientRect();
  click.x = e.x - square.left;
  click.y = e.y - square.top;
});


//var c = canvas.getContext('2d');
//init();

/**
Function used to initialize the board constants
**/
function init() {
var canvas = document.querySelector('canvas');
c = canvas.getContext('2d');

dotsList = [];
squaresList = [];
linksList = [];
startingDot = null;

playerColors = { p1: null, p2: null };
currentScores = { p1: 0, p2: 0 };
turn = 'p1';
computerTurn = false;


document.getElementById("playing").style.display = "none";
//add event listeners for size adjust slider
document.querySelector('#p1Colour').addEventListener('change', function(e) {
	updateColor(e, 1);
});

document.querySelector('#p2Colour').addEventListener('change', function(e) {
	updateColor(e, 2);
});


totalDots = getDotsCount();
console.log("init function  in index js called..." + totalDots);
	playerColors.p1 = document.querySelector('#p1Colour').value;
	playerColors.p2 = document.querySelector('#p2Colour').value;
   document.getElementById("p1Score").innerHTML = 0;
   document.getElementById("p2Score").innerHTML = 0;
  var size = TOTAL_PADDING * 2
    + ((CIRCLE_RADIUS * 2) * totalDots)
    + ((INTER_SPACING - CIRCLE_DIAMETER) * (totalDots - 1));

  canvas.width = size;
  canvas.height = size;

	squaresList = [];
	linksList = [];
	dotsList = [];
  drawCircles(totalDots);

  animate();
}

/**
This function is used to initialize the backend game configurations
when the grid size is changedin front end
**/
function init_game(totalDots) {
    $.ajaxSetup({async: false});
    $.ajax({
		url: '/init_game',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify({ 'count':  totalDots}),
		success: function(response) {
    },
	error: function(error) {
		console.log(error);
	}
	});

	$.ajaxSetup({async: true});
	return "";
}

/**
This function is used to draw the dots in the game UI
**/
function drawCircles(totalDots) {
  for (var i = 0; i < totalDots; i++) {
    for (var j = 0; j < totalDots; j++) {
      dotsList.push(new Circle(
				i * INTER_SPACING + (TOTAL_PADDING + CIRCLE_RADIUS),
        j * INTER_SPACING + (TOTAL_PADDING + CIRCLE_RADIUS),
        CIRCLE_RADIUS, i, j)
			);
    }
  }
}

/**
    This function is used to get the dot for given coordinate
**/
function getDotObject(i,j) {
    for (var k =0 ; k < dotsList.length; k++) {
        var d  = dotsList[k];
        if (d.gx === i) {
            if (d.gy === j) {
                return d;
            }
        }
    }
    return null;
}

/**
This function is used to perform the animation while creating the link
**/
function animate() {
var canvas = document.querySelector('canvas');

  requestAnimationFrame(animate);
  c.clearRect(0, 0, innerWidth, innerHeight);
	for (var i = 0; i < squaresList.length; i++) {
		squaresList[i].draw();
	}
	for (var i = 0; i < linksList.length; i++) {
		linksList[i].draw();
	}
	if (startingDot) {
		drawCurrentLinks();
	}
	for (var i = 0; i < dotsList.length; i++) {
    dotsList[i].update();
  }

}

/** Update colors of the squares */
function updateColor(e, name) {
	const oldColor = playerColors[`p${name}`];
	const newColor = e.target.value;
	currentPlayerBoxes = squaresList.filter(square => square.colour === oldColor);
	currentPlayerBoxes.forEach(square => square.colour = newColor);
	playerColors[`p${name}`] = newColor;
}

/** Update scores of the players **/
function updateScores() {
	currentScores[turn] = currentScores[turn] + 1;
	document.querySelector(`#${turn}Score`).innerHTML = currentScores[turn];
}

function add_overlay() {
   // console.log("Add clicked");
   document.getElementById("shade").style.display = "block";
   document.getElementById("playing").style.display = "block";

}

function remove_overlay() {
   // console.log("Add clicked");
   document.getElementById("shade").style.display = "none";
   document.getElementById("playing").style.display = "none";

}

function triggerComputerMove() {
    if (computerTurn) {
        computerTurn = false;
        makeComputerMove();
    }
}


setInterval(triggerComputerMove, 1000);
