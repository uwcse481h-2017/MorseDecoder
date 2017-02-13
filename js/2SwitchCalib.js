var morseDictionary = {
	".-": "A",
	"-...": "B",
	"-.-.": "C", 
	"-..": "D",
	".": "E",
	"..-.": "F",
	"--.": "G", 
	"....": "H", 
	".." : "I",
	".---": "J", 
	"-.-": "K",
	".-..": "L",
	"--": "M", 
	"-.": "N",
	"---": "O",
	".--.": "P",
	"--.-": "Q",
	".-.": "R",
	"...": "S",
	"-": "T",
	"..-": "U",
	"...-": "V",
	".--": "W", 
	"-..-": "X", 
	"-.--": "Y",
	"--..": "Z",
	".---": "1", 
	"..---": "2",
	"...--": "3",
	"....-": "4",
	".....": "5",
	"-....": "6",
	"--...": "7",
	"---..": "8",
	"----.": "9",
	"-----": "0"
};


var DOT = 32
var DASH = 13
var MENU = 39

var calibNum;
var spaceTimerRunning = null;
var spaceTimeArr = [];
var es = false;
var cs = false;
var ws = false;
var menuVisible = false;
var menuCurrItem;
var items;

$(document).ready(function(){
	
	menuCurrItem = 0;

	items = document.getElementsByClassName("menuItem");

	var userId = $('#uid').text().trim()


	//visual();

	$('#restart').click(function () {
		restart();
	});

	$('#calibMsg').show();
	calibNum = 0;


	spaceTimer = new Stopwatch();

	/*
	Listens for switch inputs. 
	*/
	var word = "";
	document.addEventListener("keydown", function(event) {


		if(spaceTimerRunning != null) {
			var timeOfSpace = spaceTimer.stop().totalMs;

			var type = null;

			if(ws) {

				type = "ws";
			} else if(cs) {
				type = "cs";

			} else if(es) {

				type = "es";
			}
			
			var timeObj = {

				time: timeOfSpace,
				type: type
			}

			spaceTimeArr.push(timeObj);

			//console.log(spaceTimeArr);
			spaceTimer.reset();
			spaceTimerRunning = null;
			document.getElementById("spaceVisual").style.backgroundColor = "blue";
			es = false;
			cs = false;
			ws = false;
		}


		// only translate dots and dashes 
		if (event.which == DOT) {
			if(menuVisible) {
				//console.log("dot dash menuCurrItem:" + menuCurrItem);
				scroll();
			} else {
				word = appendAndRecord(word, ".");
				spaceTimer.start();
				spaceTimerRunning = true;
				es = true;
			}
			
		} else if (event.which == DASH) {
			if(menuVisible) {
				//console.log("dot dash menuCurrItem:" + menuCurrItem);
				select();
			} else {
				word = appendAndRecord(word, "-");
				spaceTimer.start();
				spaceTimerRunning = true;
				es = true;
			}

		} else if(event.which == MENU) {

			showMenu();

		}


		var string = "HELLO HELLO";
		
		if(morseDictionary[word] == string.charAt(calibNum)) {
			
			$('#translation').append(morseDictionary[word]);
			word = ""
			spaceTimer.start();
			spaceTimerRunning = true;
			document.getElementById("spaceVisual").style.backgroundColor = "green";
			calibNum++;

			if(string.charAt(calibNum) == " ") {
				$('#text').append("  7 ");
				ws = true;

			} else if(calibNum < string.length) {

				$('#text').append("  3 ");
				cs = true;
			}

			if(calibNum == string.length) {
				alert('calibration complete');
				sendToServer(userId, spaceTimeArr);
				var url = '/api/v1/markTrainingCompleted/' + userId;
				$.post(url, function() {
					//console.log("call to " + url + " completed");
				}).then(function() {
					$.get('/')

				})
			}	


		} else if(string.charAt(calibNum) == " ") {
			$('#translation').append(" ");
			calibNum++;

		}

		//console.log("calibNumb: " + calibNum);
		//console.log("string length : " + string.length);

		
	});

	/*
	Disables textarea default action.
	*/
	$('textarea').on('keydown', function (e) {
	    e.preventDefault();
	});
});

/*
Inserts "." or "-" to the textarea

@param morseCode
	String containing either ".", "-", " ", or "/"

@effects 
	Inserts "." or "-" to the textarea

*/
function appendAndRecord(word, input) {

	$('#text').append(input);
	return word += input;
}

function visual() {

	document.getElementById("spaceVisual").style.backgroundColor = "blue";
	document.getElementById("spaceVisual").style.width = "300px";
	document.getElementById("spaceVisual").style.height = "300px";

}


function sendToServer(uid, spacetimeArr) {
	for(var i = 0; i < spaceTimeArr.length; i++) {

		var apiCall = 'api/v1/addTrainingInfo/'+uid+'/'+spaceTimeArr[i].time+'/'+spaceTimeArr[i].type;
		//console.log(apiCall);

		$.post(apiCall, function() {
			//console.log("api call finished");
		});
	}
}

function restart() {

	calibNum = 0;
	spaceTimer = new Stopwatch();
	$('#text').text('');
	$('#translation').text('');
}

/*
Shows the menu. 
*/
function showMenu() {

    if(menuVisible) {
    	document.getElementById("menu").style.visibility = "hidden";
    	menuVisible = false;

    } else {
    	document.getElementById("menu").style.visibility = "visible";
    	
    	menuVisible = true;
    } 
}

/**
 
Scrolls through the menu
*/
function scroll() {

	if(menuCurrItem == items.length) {
		menuCurrItem = 0;
	}

	for(var i = 0; i < items.length; i++) {

		if(menuCurrItem == i) {
			items[menuCurrItem].style.textDecoration = "underline";

			if(menuCurrItem > 0) {
				items[menuCurrItem - 1].style.textDecoration = "none";
 
			} else if(menuCurrItem == 0) {
				items[items.length - 1].style.textDecoration = "none";

			}
		}
	}

	menuCurrItem++;

}

/**
Selects underlined item in the menu.. must be scrolling
*/
function select() {

	console.log("menuCurrItem: " + menuCurrItem);
	items[menuCurrItem - 1].style.backgroundColor = "black";

}



