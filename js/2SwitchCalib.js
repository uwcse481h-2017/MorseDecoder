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

// Switch constants 
var DOT = 32
var DASH = 13

// Calibration constants 
var STRING = "HELLO HELLO";

// Calibration/timing variables 
var calibNum;
var spaceTimerRunning = null;
var spaceTimeArr = [];

// Type of space
var es = false;
var cs = false;
var ws = false;

// Keep track of word 
var word = "";

$(document).ready(function(){
	var userId = $('#uid').text().trim()

	calibNum = 0;

	spaceTimer = new Stopwatch();

	/*
	Listens for switch inputs. 
	*/
	document.addEventListener("keydown", function(event) {
		if (spaceTimerRunning != null) {
			var timeOfSpace = spaceTimer.stop().totalMs;
			
			var type = null;
			if (ws) {
				type = "ws";
			} else if (cs) {
				type = "cs";
			} else if (es) {
				type = "es";
			}
			
			var timeObj = {
				time: timeOfSpace,
				type: type
			}
			spaceTimeArr.push(timeObj);

			reset();
		}

		// only translate dots and dashes 
		if (event.which == DOT) {
			word = append(word, ".");
			start();
			es = true;
		} else if (event.which == DASH) {
			word = append(word, "-");
			start();
			es = true;
		} 

		if (STRING.charAt(calibNum) == morseDictionary[word]) {
			$('#translation').append(morseDictionary[word]);
			word = ""
			start();
			calibNum++;

			if (STRING.charAt(calibNum) == " ") {
				$('#text').append("_");
				ws = true;
			} else if (calibNum < STRING.length) {
				$('#text').append("/");
				cs = true;
			}

			if (calibNum == STRING.length) {
				completeCalibration(userId);
			}	
		} else if (STRING.charAt(calibNum) == " ") {
			$('#translation').append(" ");
			calibNum++;
		}
	});

	/*
	Add functions to buttons.
	*/ 
	$('#btn-restart').click(function () {
		restart();
	});

	/*
	Disables textarea default action.
	*/
	$('textarea').on('keydown', function (e) {
	    e.preventDefault();
	});
});

// CALIBRATION FUNCTIONS /////////////////////////////////////////////////

function completeCalibration(userId) {
	alert("Calibration complete!")
	sendToServer(userId, spaceTimeArr);
	var url = '/api/v1/markTrainingCompleted/' + userId;
	$.post(url).then(function() {
		window.location.href = "/switch";
	})
}

function sendToServer(uid, spacetimeArr) {
	for(var i = 0; i < spaceTimeArr.length; i++) {
		var apiCall = 'api/v1/addTrainingInfo/' + uid + '/' + spaceTimeArr[i].time + '/' + spaceTimeArr[i].type;
		$.post(apiCall);
	}
}

// TIMER FUNCTIONS ///////////////////////////////////////////////////////

function start() {
	spaceTimer.start();
	spaceTimerRunning = true;
}

function restart() {
	reset();

	calibNum = 0;
	spaceTimer = new Stopwatch();
	spaceTimerRunning = null;
	spaceTimeArr = [];
	
	$('#text').text('');
	$('#translation').text('');
}

function reset() {
	spaceTimer.reset();
	spaceTimerRunning = null;
	es = false;
	cs = false;
	ws = false;
}

// HELPER FUNCTIONS //////////////////////////////////////////////////////

function append(word, input) {
	$('#text').append(input);
	return word += input;
}